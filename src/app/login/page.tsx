"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");

  const login = async () => {
    const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ userId }),
});

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Login</h1>

      <input
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />

      <button onClick={login} style={{ marginLeft: 10 }}>
        Login
      </button>
    </div>
  );
}