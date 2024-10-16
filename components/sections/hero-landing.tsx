import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart,
  CheckCircle,
  CircleDollarSign,
  Code,
  Globe,
  Lock,
  Mail,
  Send,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/shared/icons";

export default function Component() {
  // const { data: session, status } = useSession();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-44">
          <video
            autoPlay
            muted
            loop
            className="absolute left-0 top-[-400px] z-[-1] h-full rotate-180 object-cover sm:top-[-350px] sm:block"
          >
            <source src="/blackhole.webm" type="video/webm" />
          </video>
          <div className="container px-4 pt-32 sm:pt-28 md:px-6 md:pt-20 lg:pt-14 xl:pt-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="mb-6 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Your Email, Your Way
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                  Take Control of Your Email Sending by using your own
                  infrastructure with our BYOD model for seamless integration
                  and reliability.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Button size="lg" className="text-md w-full font-semibold">
                  <Link href="/login">Get Started</Link>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Start sending emails in minutes. No payment required.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full bg-gray-100 py-12 dark:bg-zinc-800 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <Lock className="h-10 w-10 text-purple-600" />
                <h2 className="text-xl font-bold">Control & Security</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Maintain full control over your email infrastructure and
                  ensure data security by using your own mail servers.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <CircleDollarSign className="h-10 w-10 text-purple-600" />
                <h2 className="text-xl font-bold">Cost Efficiency</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Avoid unnecessary costs associated with third-party email
                  services by leveraging your existing infrastructure.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <TrendingUp className="h-10 w-10 text-purple-600" />
                <h2 className="text-xl font-bold">Scalability & Flexibility</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Easily scale your email sending capabilities and customize
                  settings to suit your specific needs.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                How it works?
              </h2>
              <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our email API is designed to be simple yet powerful. Here's how
                you can get started in just a few steps:
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <Code className="h-10 w-10 text-purple-600" />
                <h3 className="text-xl font-bold">
                  1. Configure Your Mail Servers
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Easily set up your mail servers in our user-friendly
                  dashboard.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <Send className="h-10 w-10 text-purple-600" />
                <h3 className="text-xl font-bold">2. Integrate Our API</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Use our API to send emails through your configured servers.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <BarChart className="h-10 w-10 text-purple-600" />
                <h3 className="text-xl font-bold">3. Monitor and Optimize</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Use our analytics tools to monitor performance and optimize
                  your email campaigns.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full bg-gray-100 py-12 dark:bg-zinc-800 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Ready to get started?
                </h2>
                <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of developers who trust Resend for their email
                  needs. Sign up now and start sending emails in minutes.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Button size="lg" className="text-md w-full font-semibold">
                  <Link href="/login">Try now</Link>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <Image
          alt="Freesend"
          src="/freesend-logo-black.png"
          width={90}
          height={31}
          className="block dark:hidden"
        />
        <Image
          alt="Freesend"
          src="/freesend-logo-white.png"
          width={90}
          height={31}
          className="hidden dark:block"
        />
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link
            className="inline-flex items-center text-xs underline-offset-4 hover:underline"
            href="https://github.com/mokshablr/Freesend"
          >
            <Icons.gitHub className="mr-1 h-4 w-4" />
            GitHub
          </Link>
        </nav>
      </footer>
    </div>
  );
}
