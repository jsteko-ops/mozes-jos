"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "./AuthProvider";


export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {

  const {
    user,
    loading,
  } = useAuth();


  const router = useRouter();
  const pathname = usePathname();


  const publicRoutes = [
    "/login",
    "/signup",
    "/auth",
  ];


  const isPublicRoute =
    publicRoutes.includes(pathname);



  useEffect(() => {

    if (
      !loading &&
      !user &&
      !isPublicRoute
    ) {
      router.replace("/login");
    }


  }, [
    user,
    loading,
    isPublicRoute,
    router,
  ]);




  if (loading) {

    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading...
        </p>
      </div>
    );

  }



  if (
    !user &&
    !isPublicRoute
  ) {
    return null;
  }



  return (
    <>
      {children}
    </>
  );
}