"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

import {
  useAuth,
} from "@/components/auth/AuthProvider";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    user,
  } = useAuth();


  return (
    <div
      className="
        min-h-screen
        bg-[#F4F6F2]
        text-[#15171A]
      "
    >
      <div className="flex min-h-screen">

        <Sidebar />


        <div
          className="
            flex
            min-w-0
            flex-1
            flex-col
          "
        >

          <Topbar
            user={user}
          />


          <main
            className="
              flex-1
              bg-[#F4F6F2]
              p-4
              sm:p-6
              lg:p-8
            "
          >
            <div
              className="
                mx-auto
                w-full
                max-w-[1600px]
              "
            >
              {children}
            </div>
          </main>

        </div>

      </div>
    </div>
  );
}