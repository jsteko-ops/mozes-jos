"use client";

export default function StripeButton({
  plan,
}: {
  plan: "pro" | "business";
}) {
  const upgrade = async () => {
    try {
      console.log("CLICK:", plan);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "test-user-123",
          plan,
        }),
      });

      const data = await res.json();

      console.log("RESPONSE:", data);

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Stripe error: no URL returned");
      }
    } catch (err) {
      console.error(err);
      alert("Checkout failed");
    }
  };

  return (
    <button onClick={upgrade}>
      Upgrade to {plan}
    </button>
  );
}