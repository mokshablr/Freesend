import { Suspense } from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { UserAuthForm } from "@/components/forms/user-auth-form";
import { Icons } from "@/components/shared/icons";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "absolute left-4 top-4 md:left-8 md:top-8",
        )}
      >
        <>
          <Icons.chevronLeft className="mr-2 size-4" />
          Back
        </>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Image
            alt="Freesend"
            src="/freesend-icon.png"
            width={40}
            height={40}
            className="m-4"
          />
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to Freesend
          </h1>
          {
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in to your account
            </p>
          }
        </div>

        <Suspense>
          <UserAuthForm />
        </Suspense>
      </div>
    </div>
  );
}
