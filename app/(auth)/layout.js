import "../globals.css";
import { logout } from "@/actions/auth-actions";

export const metadata = {
  title: "Next Auth",
  description: "Next.js Authentication",
};

export default function AuthRootLayout({ children }) {
  return (
    <>
      <header id="auth-header">
        <p>Welcome Back!</p>
        <form action={logout}>
          <button type="submit">Logout</button>
        </form>
      </header>
      {children}
    </>
  );
}
