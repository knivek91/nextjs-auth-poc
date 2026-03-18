"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signup(_prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const errors = {};

  if (!email.includes("@")) {
    errors.email = "Enter a valid email.";
  }

  if (password.trim().length < 8) {
    errors.password = "Cannot be less than 8 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: email.split("@")[0],
      },
      headers: await headers(),
    });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.message?.includes("already exists")) {
      errors.email = "Email already exists.";
      return { errors };
    }

    throw error;
  }

  redirect("/training");
}

export async function login(_prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });
  } catch (error) {
    console.error("Login error:", error);
    return {
      errors: {
        email: "Invalid credentials.",
      },
    };
  }

  redirect("/training");
}

export async function handleAuth(mode, prevState, formData) {
  if (mode === "signup") {
    return signup(prevState, formData);
  }

  return login(prevState, formData);
}

export async function logout() {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/");
}
