"use client";

import Navbar from "../components/Navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import LoadingPage from "@/components/LoadingPage";
import { redirect } from "next/navigation";

export default function Home() {
  const { data, status } = useSession();

  if (status == "loading") {
    return <LoadingPage message="Please wait..." />;
  }

  if (status == "authenticated") {
    // go to dashboard
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="min-h-screen relative text-gray-800 py-20 flex items-center justify-center overflow-hidden moving-grid-background">
        {/* Optional: Keep the subtle SVG grid pattern if desired, or remove if redundant */}
        {/* <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5"></div> */}

        {/* Content */}
        <div className="relative text-center z-10 max-w-3xl px-6">
          <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Welcome to TaskMaster
          </h1>
          <p className="text-xl mb-8 text-gray-700">
            Manage your tasks efficiently and collaborate seamlessly.
          </p>
          <Link href="/register">
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-blue-300 hover:shadow-xl"
            >
              Get Started
            </Button>
          </Link>
        </div>

        <style jsx global>{`
          @keyframes moveGrid {
            0% {
              background-position: 0 0;
            }
            100% {
              background-position: 50px 50px;
            } /* Controls how far the pattern moves */
          }

          .moving-grid-background {
            background-color: #f0faff; /* Light background */
            background-image: radial-gradient(
              circle,
              rgba(0, 0, 0, 0.08) 2px,
              transparent 2.5px
            ); /* Increased dot size to 2px */
            background-size: 40px 40px; /* Increased background size */
            animation: moveGrid 5s linear infinite; /* Adjust time for speed (e.g., 10s for slower) */
          }
        `}</style>
      </section>
      {/* Footer */}
      <footer className="py-8 bg-white border-t border-blue-100 text-gray-700 text-center">
        <p>&copy; 2025 TaskMaster. All rights reserved.</p>
        <div className="mt-4">
          <Link href="/about">
            <span className="text-blue-600 hover:text-blue-800 mx-4 transition-colors duration-300">
              About Us
            </span>
          </Link>
          <Link href="/contact">
            <span className="text-blue-600 hover:text-blue-800 mx-4 transition-colors duration-300">
              Contact
            </span>
          </Link>
          <Link href="/privacy">
            <span className="text-blue-600 hover:text-blue-800 mx-4 transition-colors duration-300">
              Privacy Policy
            </span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
