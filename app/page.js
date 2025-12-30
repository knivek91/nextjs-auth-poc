import AuthForm from "@/components/auth-form";

export default async function Home({ searchParams }) {
  const formMode = (await searchParams).mode || "login";
  return <AuthForm mode={formMode} />;
}
