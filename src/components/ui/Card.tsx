"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        bg-white
        border
        rounded-xl
        p-5
        shadow-sm
        ${className}
      `}
    >
      {children}
    </div>
  );
}