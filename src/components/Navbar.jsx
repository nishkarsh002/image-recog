"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="absolute top-0 left-0 right-0 z-10 bg-indigo-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-white text-xl font-bold">🎯 AI Vision</span>
          </div>
          <div className="flex gap-4">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg transition-colors ${
                pathname === "/"
                  ? "bg-white text-indigo-600 font-semibold"
                  : "text-white hover:bg-indigo-500"
              }`}
            >
              Real-time Detection
            </Link>
            <Link
              href="/recog"
              className={`px-4 py-2 rounded-lg transition-colors ${
                pathname === "/recog"
                  ? "bg-white text-indigo-600 font-semibold"
                  : "text-white hover:bg-indigo-500"
              }`}
            >
              Image Upload
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
