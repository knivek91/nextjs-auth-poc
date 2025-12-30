"use server";

import { createAuthSession, destroySession } from "@/lib/auth";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createUser, getUserByEmail } from "@/lib/user";
import { redirect } from "next/navigation";

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

  const hashedPassword = hashUserPassword(password);

  try {
    const userId = createUser(email, hashedPassword);
    await createAuthSession(userId);
    redirect("/training");
  } catch (error) {
    if ((error.code = "SQLITE_CONSTRAINT_UNIQUE")) {
      errors.email = "Email already exists.";
      return { errors };
    }

    throw error;
  }
}

export async function login(_prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const existingUser = getUserByEmail(email);
  if (!existingUser) {
    return {
      errors: {
        email: "Could not authenticate user.",
      },
    };
  }

  const isValidPassword = verifyPassword(existingUser.password, password);
  if (!isValidPassword) {
    return {
      errors: {
        password: "Could not authenticate user.",
      },
    };
  }

  await createAuthSession(existingUser.id);
  redirect("/training");
}

export async function auth(mode, prevState, formData) {
  if (mode === "signup") {
    return signup(prevState, formData);
  }

  return login(prevState, formData);
}

export async function logout() {
  await destroySession();
  redirect("/");
}
