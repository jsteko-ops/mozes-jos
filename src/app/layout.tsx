import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import AuthGuard from "@/components/auth/AuthGuard";
import localFont from "next/font/local";

const dejavu = localFont({
  src: [
    {
      path: "../fonts/DejaVuSans.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/DejaVuSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-dejavu",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={dejavu.variable}>
        <AuthProvider>
          <AuthGuard>{children}</AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}