import { auth } from "~/auth";
import { redirect } from "next/navigation";
import ClientPage from "~/app/ClientPage";

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return <ClientPage />;
}
