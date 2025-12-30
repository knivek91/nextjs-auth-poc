# Next.js Auth Proof of Concept

This repo showcases a proof of concept for authentication in Next.js.

The **master** branch implements authentication using **Lucia** with the `@lucia-auth/adapter-sqlite`, exploring how to manage cookies, sessions, and validation using an SQLite database for testing and learning purposes. Lucia docs: https://v2.lucia-auth.com/database

This project exists to understand auth flows and cookies in practice.

The code in the **master** branch uses Lucia, but another branch will contain code using **Better Auth** — a modern, full-featured authentication framework for TypeScript/Next.js with more features and flexibility. Better Auth docs: https://www.better-auth.com/

While Lucia was a test following a video tutorial and helped me get comfortable with the process, I consider **Better Auth** the better option overall.

Feel free to explore both branches and compare the approaches!
