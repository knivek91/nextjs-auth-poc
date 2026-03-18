# Better-Auth Next.js - Project Guide

Authentication library for Next.js with better-auth, optimized for this project.

## Quick Reference

### Configuración Base (`lib/auth.js`)
```javascript
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "training.db");
const db = new Database(dbPath);

export const auth = betterAuth({
  database: db,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(), // CRÍTICO: Establece cookies en Server Actions
  ],
});
```

### Server Actions Pattern
```javascript
"use server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

// Login
await auth.api.signInEmail({
  body: { email, password },
  headers: await headers(),
});

// Signup
await auth.api.signUpEmail({
  body: { email, password, name },
  headers: await headers(),
});

// Logout
await auth.api.signOut({
  headers: await headers(),
});
```

### Middleware/Proxy Pattern (`proxy.js`)
```javascript
import { NextResponse } from "next/server";

const SESSION_COOKIE = "better-auth.session_token";

export default function proxy(request) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE);

  if (!sessionCookie && request.nextUrl.pathname.startsWith("/training")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (sessionCookie && request.nextUrl.pathname === "/") {
    const mode = request.nextUrl.searchParams.get("mode");
    if (!mode || mode === "login") {
      return NextResponse.redirect(new URL("/training", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/training/:path*"],
};
```

---

## 1. Prerequisites

### Dependencias Requeridas
```bash
npm install better-auth better-sqlite3
```

### Variables de Entorno
```bash
# .env.local
BETTER_AUTH_SECRET=tu-secret-seguro-aqui
BETTER_AUTH_URL=http://localhost:3000
```

### Schema de Base de Datos
Better-auth crea automáticamente las tablas necesarias:
- `user` - Usuarios
- `session` - Sesiones
- `account` - Cuentas OAuth
- `verification` - Verificación de emails

---

## 2. Setup & Configuration

### Archivo: `lib/auth.js`

**CRÍTICO: Usar `nextCookies()` como último plugin**

Sin este plugin, las cookies no se establecen en Server Actions y el login falla silenciosamente.

**Configuración completa:**
```javascript
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "training.db");
const db = new Database(dbPath);

export const auth = betterAuth({
  database: db,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  
  // Email/Password
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Cambiar a true en producción
    password: {
      minLength: 8,
      maxLength: 128,
    },
  },
  
  // Sesiones
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24, // Actualizar cada 24 horas
    cookie: {
      name: "better-auth.session_token",
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  },
  
  // Plugins (CRÍTICO)
  plugins: [
    nextCookies(), // Siempre al final
  ],
});
```

---

## 3. Server Actions Pattern

### Login
```javascript
"use server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function login(_prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
    
    redirect("/training");
  } catch (error) {
    console.error("Login error:", error);
    return {
      errors: { email: "Invalid credentials." },
    };
  }
}
```

### Signup
```javascript
"use server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signup(_prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // Validación
  if (!email.includes("@")) {
    return { errors: { email: "Invalid email." } };
  }
  
  if (password.length < 8) {
    return { errors: { password: "Password must be at least 8 characters." } };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: email.split("@")[0], // O nombre del formulario
      },
      headers: await headers(),
    });
    
    redirect("/training");
  } catch (error) {
    console.error("Signup error:", error);
    
    if (error.message?.includes("already exists")) {
      return { errors: { email: "Email already exists." } };
    }
    
    return { errors: { email: "Signup failed. Please try again." } };
  }
}
```

### Logout
```javascript
"use server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function logout() {
  await auth.api.signOut({
    headers: await headers(),
  });
  
  redirect("/");
}
```

---

## 4. Middleware/Proxy Pattern

### Archivo: `proxy.js` (NO middleware.js)

**En Next.js 16+, usar `proxy.js` en lugar de `middleware.js`**

### Verificación Simple (Sin DB)
```javascript
import { NextResponse } from "next/server";

const SESSION_COOKIE = "better-auth.session_token";

export default function proxy(request) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  const pathname = request.nextUrl.pathname;

  // Proteger rutas
  const protectedRoutes = ["/training", "/dashboard", "/settings"];
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (!sessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirigir si ya está logueado
  if (sessionCookie && pathname === "/") {
    const mode = request.nextUrl.searchParams.get("mode");
    if (!mode || mode === "login") {
      return NextResponse.redirect(new URL("/training", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/training/:path*",
    "/dashboard/:path*",
    "/settings/:path*",
  ],
};
```

### Verificación Completa (Con DB)
```javascript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default async function proxy(request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const pathname = request.nextUrl.pathname;
  const protectedRoutes = ["/training", "/dashboard"];
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (session && pathname === "/") {
    const mode = request.nextUrl.searchParams.get("mode");
    if (!mode || mode === "login") {
      return NextResponse.redirect(new URL("/training", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/training/:path*"],
};
```

---

## 5. Production Checklist

### Variables de Entorno
```bash
# Requeridas
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://tu-dominio.com

# Para OAuth (opcional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Configuración de Producción
```javascript
export const auth = betterAuth({
  // ...
  advanced: {
    useSecureCookies: true,
    cookiePrefix: "tu-app",
  },
  session: {
    cookie: {
      secure: true, // Solo en HTTPS
      sameSite: "strict", // Más seguro en producción
      domain: ".tu-dominio.com", // Para subdominios
    },
  },
});
```

### Headers de Seguridad
En `next.config.js` o en un middleware adicional:
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};
```

### Rate Limiting (Opcional)
Para proteger contra ataques de fuerza bruta:
- Usar Vercel KV o Redis para contar intentos
- Limitar a 5 intentos de login por IP en 15 minutos
- Implementar en Server Actions o API routes

---

## 6. Troubleshooting Guide

### Error: Cookies no se establecen

**Síntoma:** Login parece funcionar pero el usuario no queda autenticado.

**Causa:** Falta el plugin `nextCookies()`.

**Solución:**
```javascript
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  // ...
  plugins: [
    nextCookies(), // CRÍTICO: Al final
  ],
});
```

---

### Error: Login falla silenciosamente

**Síntoma:** No hay error, pero no redirige a la página protegida.

**Causa:** No se pasan headers a `signInEmail()`.

**Solución:**
```javascript
await auth.api.signInEmail({
  body: { email, password },
  headers: await headers(), // CRÍTICO
});
```

---

### Error: Middleware falla en Edge Runtime

**Síntoma:** Error "Node.js module is loaded which is not supported in Edge Runtime"

**Causa:** Usaste `middleware.js` en lugar de `proxy.js`, o importaste módulos Node.js.

**Solución:**
```bash
mv middleware.js proxy.js
```

Y en el archivo, usar verificación de cookie simple:
```javascript
import { NextResponse } from "next/server";

export default function proxy(request) {
  const sessionCookie = request.cookies.get("better-auth.session_token");
  // ...
}
```

---

### Error: Session expira inmediatamente

**Síntoma:** El usuario tiene que hacer login constantemente.

**Causa:** Configuración incorrecta de sesión.

**Solución:**
```javascript
session: {
  expiresIn: 60 * 60 * 24 * 7, // 7 días en segundos
  updateAge: 60 * 60 * 24, // Actualizar cada 24 horas
}
```

---

### Error: "Invalid credentials" con password correcto

**Síntoma:** El password es correcto pero siempre dice credenciales inválidas.

**Causas posibles:**
1. Password hasheado incorrectamente en DB (si migraste de otro sistema)
2. Problema con el secret

**Solución:**
- Verificar que `BETTER_AUTH_SECRET` sea consistente
- Si migraste usuarios, re-hashear passwords o usar OAuth

---

### Error: CORS en producción

**Síntoma:** Funciona en local pero falla en producción.

**Solución:**
```javascript
advanced: {
  trustedOrigins: ["https://tu-dominio.com"],
  useSecureCookies: true,
}
```

---

### Error: Cookie no se comparte entre subdominios

**Solución:**
```javascript
session: {
  cookie: {
    domain: ".tu-dominio.com", // Con punto al inicio
  },
}
```

---

## 7. OAuth Setup

### GitHub OAuth

#### 1. Crear OAuth App en GitHub
1. Ve a: https://github.com/settings/developers
2. New OAuth App
3. Configurar:
   - Application name: Tu App
   - Homepage URL: `https://tu-dominio.com`
   - Authorization callback URL: `https://tu-dominio.com/api/auth/callback/github`

#### 2. Configurar variables de entorno
```bash
GITHUB_CLIENT_ID=tu_client_id
GITHUB_CLIENT_SECRET=tu_client_secret
```

#### 3. Actualizar `lib/auth.js`
```javascript
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { github } from "better-auth/providers/github";

export const auth = betterAuth({
  database: db,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
  
  plugins: [
    nextCookies(),
  ],
});
```

#### 4. Server Action para OAuth
```javascript
"use server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signInWithGithub() {
  try {
    const session = await auth.api.signInOAuth({
      body: {
        provider: "github",
        callbackURL: "/training",
      },
      headers: await headers(),
    });
    
    if (session.url) {
      redirect(session.url);
    }
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    redirect("/?error=oauth_failed");
  }
}
```

#### 5. Botón de Login con GitHub
```jsx
<form action={signInWithGithub}>
  <button type="submit">
    Sign in with GitHub
  </button>
</form>
```

---

### Google OAuth

#### 1. Crear OAuth App en Google Cloud
1. Ve a: https://console.cloud.google.com/apis/credentials
2. Create credentials > OAuth client ID
3. Application type: Web application
4. Authorized redirect URIs: `https://tu-dominio.com/api/auth/callback/google`

#### 2. Configurar variables de entorno
```bash
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
```

#### 3. Actualizar `lib/auth.js`
```javascript
import { google } from "better-auth/providers/google";

export const auth = betterAuth({
  // ...
  socialProviders: {
    github: { /* ... */ },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
});
```

#### 4. Server Action para Google
```javascript
export async function signInWithGoogle() {
  try {
    const session = await auth.api.signInOAuth({
      body: {
        provider: "google",
        callbackURL: "/training",
      },
      headers: await headers(),
    });
    
    if (session.url) {
      redirect(session.url);
    }
  } catch (error) {
    console.error("Google OAuth error:", error);
    redirect("/?error=oauth_failed");
  }
}
```

---

### Multiple OAuth Providers

```javascript
import { github } from "better-auth/providers/github";
import { google } from "better-auth/providers/google";

export const auth = betterAuth({
  // ...
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
});
```

---

## 8. Resources

### Documentación Oficial
- **Main Docs**: https://better-auth.com/docs
- **OAuth Provider**: https://better-auth.com/docs/plugins/oauth-provider
- **Email/Password**: https://better-auth.com/docs/authentication/email-password
- **Session Management**: https://better-auth.com/docs/authentication/sessions

### Troubleshooting
- **Common Errors**: https://better-auth.com/docs/guides/common-errors
- **Database Adapters**: https://better-auth.com/docs/adapters/sqlite
- **Next.js Integration**: https://better-auth.com/docs/integrations/next-js

### Herramientas
- **Secret Generator**: `openssl rand -base64 32`
- **Cookie Testing**: Browser DevTools > Application > Cookies

---

## Usage Instructions

### Para consultar este skill:
Revisar el archivo `.skills/better-auth.md` cuando sea necesario.

### Patrón de trabajo recomendado:
1. Consultar este skill para setup básico
2. Usar recursos oficiales para detalles específicos
3. Troubleshooting guide para resolver problemas
4. Production checklist antes de deploy

---

## Changelog

- **2024-03-18**: Versión inicial con email/password y OAuth (GitHub, Google)
- **Nota**: Actualizar cuando se agreguen nuevas funcionalidades
