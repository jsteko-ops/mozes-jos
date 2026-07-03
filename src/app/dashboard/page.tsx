import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const user = cookieStore.get("user");

  if (!user) {
    redirect("/login");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>

      <p>User ID: {user.value}</p>

      <hr />

      <h3>Upgrade to Premium</h3>

      <button>Upgrade (Stripe)</button>

      <br /><br />

      <LogoutButton />
    </div>
  );
}