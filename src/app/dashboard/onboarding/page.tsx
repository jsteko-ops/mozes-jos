"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const next = () => setStep((s) => s + 1);

  const finish = () => {
    router.push("/dashboard");
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <h1>Welcome 👋</h1>

        {step === 1 && (
          <>
            <h2>What are you using this for?</h2>
            <button className="btn btn-secondary" onClick={next}>
              Personal training
            </button>
            <button className="btn btn-secondary" onClick={next}>
              Business / Clients
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Set your goal</h2>
            <button className="btn btn-secondary" onClick={finish}>
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const wrap = {
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f7f7f8",
};

const card = {
  background: "white",
  padding: 30,
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  width: 420,
};