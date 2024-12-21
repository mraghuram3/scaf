"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserProfile } from "@/components/user-profile";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { API } from "@/client/api";

export function SiteHeader() {
  const [hamburgerMenuIsOpen, setHamburgerMenuIsOpen] = useState(false);
  const { user, getIdToken } = useAuth();

  const createTemplate = async () => {
    try {
      const token = await getIdToken();
      const result = await API.createTemplate(
        {
          _id: "itsparser/newv9",
          name: "testing template",
        },
        token
      );

      if (result.error) {
        console.error("Failed to create template:", result.error);
        return;
      }

      console.log("Template created:", result.data);
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  useEffect(() => {
    const html = document.querySelector("html");
    if (html) html.classList.toggle("overflow-hidden", hamburgerMenuIsOpen);
  }, [hamburgerMenuIsOpen]);

  useEffect(() => {
    const closeHamburgerNavigation = () => setHamburgerMenuIsOpen(false);
    window.addEventListener("orientationchange", closeHamburgerNavigation);
    window.addEventListener("resize", closeHamburgerNavigation);

    return () => {
      window.removeEventListener("orientationchange", closeHamburgerNavigation);
      window.removeEventListener("resize", closeHamburgerNavigation);
    };
  }, [setHamburgerMenuIsOpen]);

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full border-b  backdrop-blur-[12px]">
        <div className="container flex h-[3.5rem] items-center justify-between">
          <Link className="text-md flex items-center" href="/">
            <b>Scaf</b>
          </Link>

          <div className="ml-auto flex h-full items-center">
            <Link className="mr-6 text-sm" href="/templates">
              Browse Templates
            </Link>
            {/*{user && (*/}
            {/*  <Button*/}
            {/*    onClick={createTemplate}*/}
            {/*    variant="outline"*/}
            {/*    size="sm"*/}
            {/*    className="mr-6"*/}
            {/*  >*/}
            {/*    Create Template*/}
            {/*  </Button>*/}
            {/*)}*/}
            <ThemeToggle className="mr-6 text-sm" />
            <UserProfile />
          </div>
        </div>
      </header>
    </>
  );
}
