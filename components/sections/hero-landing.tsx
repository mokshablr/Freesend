"use client";

import Link from "next/link";
import {
  CheckCircle,
  Settings,
  Plug,
  Shield,
  FlaskConical,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";

export default function Component() {

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section - Two Column Layout */}
        <section className="relative w-full py-12 md:py-16 lg:py-20">
          <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              {/* Left Column - Content */}
              <div className="flex flex-col space-y-6">
                {/* Eyebrow Badge */}
                <div className="inline-flex items-center gap-2 self-start">
                  <Badge variant="secondary" className="gap-1.5 bg-green-500/20 border-green-500/40 text-green-200 shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                    <CheckCircle className="h-3 w-3" />
                    Self-host or cloud
                  </Badge>
                  <span className="text-sm text-muted-foreground">Fully open source, MIT licensed</span>
                </div>

                {/* Hero Title */}
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Email delivery{" "}
                  <span className="relative inline-block">
                    <span 
                      className="bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                      style={{
                        background: "linear-gradient(to right, #e0f2fe 0, #a5f3fc 35%, #6ee7b7 70%, #f97316 100%)",
                        WebkitBackgroundClip: "text",
                      }}
                    >
                      you can fork,
                    </span>
                  </span>
                  <br />
                  <span>scale & trust.</span>
                </h1>

                {/* Hero Subtitle */}
                <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Freesend is an open source email sending platform for product teams and infra-minded
                  developers. Ship reliable transactional and marketing email with a modern API,
                  auditable email logs, and a UI your whole team can use.
                  Plug it into your stack in minutes with{" "}
                  <code className="rounded border border-teal-700/60 bg-slate-900/80 px-1.5 py-0.5 text-sm font-mono text-cyan-100">
                    POST /api/send-email
                  </code>.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-2 shadow-lg shadow-white/20 hover:shadow-xl hover:shadow-white/30 transition-shadow">
                      Start sending in 5 minutes
                    </Button>
                  </Link>
                  <Link href="https://github.com/mokshablr/Freesend" target="_blank">
                    <Button size="lg" variant="outline" className="gap-2 border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.1)] hover:shadow-[0_0_12px_rgba(255,255,255,0.2)] transition-shadow">
                      <Icons.gitHub className="h-4 w-4" />
                      View on GitHub
                    </Button>
                  </Link>
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-foreground shadow-[0_0_0_4px_rgba(255,255,255,0.3)]"></span>
                    <span>No usage caps or vendor lock-in</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/40 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.2)]">
                    Use your own Gmail, Zoho, or custom SMTP
                  </Badge>
                </div>
              </div>

              {/* Right Column - Code Example & Metrics Card */}
              <div className="relative">
                <Card className="p-5 shadow-xl shadow-white/10 border-white/20 relative overflow-hidden">
                  {/* Subtle glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none rounded-lg"></div>
                  
                  {/* Card Header */}
                  <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
                    <Badge variant="secondary" className="gap-2 bg-green-500/20 border-green-500/40 text-green-200 shadow-[0_0_8px_rgba(34,197,94,0.3)]">
                      <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_4px_rgba(34,197,94,0.6)]"></span>
                      TypeScript SDK live now!
                    </Badge>
                    <div className="text-right text-xs">
                      <div className="text-muted-foreground">Last 60 minutes</div>
                      <div className="text-sm font-semibold">99.997% delivered</div>
                    </div>
                  </div>

                  {/* Card Body - Grid */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 relative z-10 items-stretch">
                    {/* Code Block */}
                    <Card className="col-span-1 md:col-span-2 lg:col-span-1 p-4 bg-muted/50 border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.1)] h-full">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">TypeScript SDK example</span>
                      </div>
                      <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-white font-bold">npm install @freesend/sdk</span>
                      </div>

                      <div className="font-mono text-xs leading-relaxed space-y-1 mt-5">
                        <div>
                          <span className="text-purple-400">import</span>{" "}
                          &#123; <span className="text-cyan-300">Freesend</span> &#125;{" "}
                          <span className="text-purple-400">from</span>{" "}
                          <span className="text-amber-400">'@freesend/sdk'</span>;
                        </div>
                        <div>&nbsp;</div>
                        <div>
                          <span className="text-purple-400">const</span>{" "}
                          <span className="text-cyan-300">freesend</span> ={" "}
                          <span className="text-purple-400">new</span>{" "}
                          <span className="text-cyan-300">Freesend</span>(&#123;
                        </div>
                        <div>&nbsp;&nbsp;apiKey: <span className="text-amber-400">'your-api-key-here'</span></div>
                        <div>&#125;);</div>
                        <div>&nbsp;</div>
                        <div>
                          <span className="text-purple-400">const</span> result ={" "}
                          <span className="text-purple-400">await</span>{" "}
                          freesend.<span className="text-cyan-400">sendEmail</span>(&#123;
                        </div>
                        <div>&nbsp;&nbsp;fromName: <span className="text-amber-400">'Freesend Team'</span>,</div>
                        <div>&nbsp;&nbsp;fromEmail: <span className="text-amber-400">'team@freesend.io'</span>,</div>
                        <div>&nbsp;&nbsp;to: <span className="text-amber-400">'user@customer.xyz'</span>,</div>
                        <div>&nbsp;&nbsp;subject: <span className="text-amber-400">'Welcome to Freesend'</span>,</div>
                        <div>&nbsp;&nbsp;html: <span className="text-amber-400">'&lt;h1&gt;Hey there 👋&lt;/h1&gt;'</span></div>
                        <div>&#125;);</div>
                      </div>
                    </Card>

                    {/* Metrics */}
                    <div className="flex flex-col space-y-3 h-full">
                      <Card className="p-3 border-white/20 shadow-[0_0_4px_rgba(255,255,255,0.05)]">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-muted-foreground">Delivery</div>
                            <div className="text-sm font-semibold">Direct SMTP.</div>
                          </div>
                          <Badge variant="secondary" className="text-xs bg-emerald-500/20 border-emerald-500/40 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                            Your own servers.
                          </Badge>
                        </div>
                      </Card>

                      <Card className="p-3 border-white/20 shadow-[0_0_4px_rgba(255,255,255,0.05)]">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-muted-foreground">Rate limits</div>
                            <div className="text-sm font-semibold">None enforced.</div>
                          </div>
                          <Badge variant="outline" className="text-xs bg-orange-500/20 border-orange-500/40 text-orange-200 shadow-[0_0_8px_rgba(249,115,22,0.3)]">
                            No limits.
                          </Badge>
                        </div>
                      </Card>

                      <Card className="p-3 border-white/20 shadow-[0_0_4px_rgba(255,255,255,0.05)]">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-muted-foreground">Provider lock-in</div>
                            <div className="text-sm font-semibold">None.</div>
                          </div>
                          <Badge variant="secondary" className="text-xs bg-emerald-500/20 border-emerald-500/40 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                            No vendor lock-in.
                          </Badge>
                        </div>
                      </Card>

                      {/* Terminal Card */}
                      <Card className="p-3 border-white/20 shadow-[0_0_4px_rgba(255,255,255,0.05)] bg-muted/50 flex-1 flex flex-col">
                        <div className="mb-2">
                          <div className="text-xs text-muted-foreground">Live Delivery</div>
                          <div className="text-xs font-semibold text-foreground">SMTP Relay Status</div>
                        </div>
                        <div className="font-mono text-xs leading-relaxed space-y-1 mt-3 flex-1">
                          <div className="text-white">
                            &gt; Connecting to your SMTP server...
                          </div>
                          <div className="text-white">
                            &gt; SMTP handshake complete
                          </div>
                          <div className="text-green-400">
                            &gt; [200] Accepted
                          </div>
                          <div className="text-white">
                            &gt; Pricing tier: <span className="text-amber-400">yours</span>
                          </div>
                          <div className="text-cyan-300">
                            &gt; Scale when you want
                          </div>
                          <div className="text-white">
                            &gt; _
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="mt-4 inline-flex items-center gap-2 relative z-10">
                    <Badge variant="secondary" className="gap-2 bg-cyan-500/20 border-cyan-500/40 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4),0_0_24px_rgba(6,182,212,0.2)]">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_0_4px_rgba(6,182,212,0.4)]"></span>
                      Built on your infrastructure
                    </Badge>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-16 md:py-24 lg:py-32">
          <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            {/* Section Header */}
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between">
              <div>
                <Badge variant="secondary" className="mb-4 gap-2 bg-indigo-500/20 border-indigo-500/40 text-indigo-200 shadow-[0_0_8px_rgba(99,102,241,0.3)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_4px_rgba(99,102,241,0.6)]"></span>
                  Affordable email sending for small teams & builders
                </Badge>
                <h2 className="text-lg font-semibold md:text-xl lg:text-2xl">
                  Everything you expect from a modern email provider.
                </h2>
              </div>
              <p className="max-w-lg text-sm text-muted-foreground md:text-base">
                Freesend provides everything you need to send emails reliably: email history tracking,
                tenant isolation, attachment support, and a clean dashboard UI—all using your own SMTP server.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <Card className="p-5 border-white/20 shadow-lg shadow-white/5 hover:shadow-xl hover:shadow-white/10 transition-shadow relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg"></div>
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-lg relative z-10 shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                  ⚡
                </div>
                <CardTitle className="mb-2 text-base relative z-10">Simple REST API</CardTitle>
                <p className="mb-3 text-sm text-muted-foreground relative z-10">
                  Send emails with a single POST request. Clean, intuitive API design with full
                  TypeScript support and a JavaScript SDK for better developer experience.
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs relative z-10">
                  <Badge variant="secondary" className="text-xs bg-blue-500/20 border-blue-500/40 text-blue-200 shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                    REST API
                  </Badge>
                  <span className="text-muted-foreground">TypeScript SDK</span>
                </div>
              </Card>

              {/* Feature 2 */}
              <Card className="p-5 border-white/20 shadow-lg shadow-white/5 hover:shadow-xl hover:shadow-white/10 transition-shadow relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg"></div>
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-lg relative z-10 shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                  📬
                </div>
                <CardTitle className="mb-2 text-base relative z-10">Bring your own SMTP</CardTitle>
                <p className="mb-3 text-sm text-muted-foreground relative z-10">
                  Use your existing SMTP server—Gmail, Zoho, Outlook, or any custom SMTP provider.
                  Full control over your email infrastructure with encrypted credential storage.
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs relative z-10">
                  <Badge variant="secondary" className="text-xs bg-purple-500/20 border-purple-500/40 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                    Any SMTP provider
                  </Badge>
                  <span className="text-muted-foreground">Encrypted credentials</span>
                </div>
              </Card>

              {/* Feature 3 */}
              <Card className="p-5 border-white/20 shadow-lg shadow-white/5 hover:shadow-xl hover:shadow-white/10 transition-shadow relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg"></div>
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-lg relative z-10 shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                  📊
                </div>
                <CardTitle className="mb-2 text-base relative z-10">Email history & dashboard</CardTitle>
                <p className="mb-3 text-sm text-muted-foreground relative z-10">
                  Track every email you send with a clean dashboard. View sending history, monitor
                  activity, and analyze trends with visual charts and detailed logs.
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs relative z-10">
                  <Badge variant="secondary" className="text-xs bg-cyan-500/20 border-cyan-500/40 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                    Real-time dashboard
                  </Badge>
                  <span className="text-muted-foreground">Complete email logs</span>
                </div>
              </Card>

              {/* Feature 4 */}
              <Card className="p-5 border-white/20 shadow-lg shadow-white/5 hover:shadow-xl hover:shadow-white/10 transition-shadow relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg"></div>
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-lg relative z-10 shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                  📎
                </div>
                <CardTitle className="mb-2 text-base relative z-10">Attachment support</CardTitle>
                <p className="mb-3 text-sm text-muted-foreground relative z-10">
                  Send emails with attachments effortlessly. Support for base64-encoded files or
                  remote URLs, perfect for invoices, reports, and documents.
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs relative z-10">
                  <Badge variant="secondary" className="text-xs bg-pink-500/20 border-pink-500/40 text-pink-200 shadow-[0_0_8px_rgba(236,72,153,0.3)]">
                    Base64 & URL support
                  </Badge>
                  <span className="text-muted-foreground">Multiple attachments</span>
                </div>
              </Card>

              {/* Feature 5 */}
              <Card className="p-5 border-white/20 shadow-lg shadow-white/5 hover:shadow-xl hover:shadow-white/10 transition-shadow relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg"></div>
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-lg relative z-10 shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                  🏢
                </div>
                <CardTitle className="mb-2 text-base relative z-10">Tenant isolation</CardTitle>
                <p className="mb-3 text-sm text-muted-foreground relative z-10">
                  Built-in multi-tenancy with complete data isolation. Each tenant has separate API
                  keys, SMTP configurations, and email logs for secure, organized operations.
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs relative z-10">
                  <Badge variant="secondary" className="text-xs bg-indigo-500/20 border-indigo-500/40 text-indigo-200 shadow-[0_0_8px_rgba(99,102,241,0.3)]">
                    Multi-tenant ready
                  </Badge>
                  <span className="text-muted-foreground">Scoped API keys</span>
                </div>
              </Card>

              {/* Feature 6 */}
              <Card className="p-5 border-white/20 shadow-lg shadow-white/5 hover:shadow-xl hover:shadow-white/10 transition-shadow relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg"></div>
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-lg relative z-10 shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                  🔓
                </div>
                <CardTitle className="mb-2 text-base relative z-10">Open source & self-hostable</CardTitle>
                <p className="mb-3 text-sm text-muted-foreground relative z-10">
                  Fully open source with MIT license. Self-host on your infrastructure or use our
                  hosted service. No vendor lock-in, no usage caps, complete transparency.
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs relative z-10">
                  <Badge variant="secondary" className="text-xs bg-emerald-500/20 border-emerald-500/40 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                    MIT licensed
                  </Badge>
                  <span className="text-muted-foreground">Self-host or cloud</span>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-16 md:py-24 lg:py-32">
          <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            {/* Section Header */}
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between">
              <div>
                <Badge variant="secondary" className="mb-4 gap-2 bg-teal-500/20 border-teal-500/40 text-teal-200 shadow-[0_0_8px_rgba(20,184,166,0.3)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_4px_rgba(20,184,166,0.6)]"></span>
                  Pricing? What's that?
                </Badge>
                <h2 className="text-lg font-semibold md:text-xl lg:text-2xl">
                  100% free. No hidden costs.
                </h2>
              </div>
              <p className="max-w-lg text-sm text-muted-foreground md:text-base">
                Freesend is 100% free and open source. You bring your own SMTP server, so there are no
                usage limits, no per-email fees, and no surprise bills. Just pure email sending freedom.
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Free Card */}
              <Card className="p-6 md:p-8 border-white/30 shadow-[0_22px_50px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1),0_0_30px_rgba(255,255,255,0.2)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10 pointer-events-none rounded-lg"></div>
                <CardHeader className="p-0 pb-4 relative z-10">
                  <div className="mb-2 text-sm text-muted-foreground">Everything included</div>
                  <CardTitle className="mb-2 flex items-baseline gap-2 text-3xl md:text-4xl">
                    $0
                    <span className="text-base font-normal text-muted-foreground">MIT license • Self-host</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 relative z-10">
                  <p className="mb-4 text-sm md:text-base text-muted-foreground">
                    All features are free. Self-host on your infrastructure or use our hosted service.
                    No feature gates, no usage caps, no credit card required.
                  </p>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <Link href="/dashboard">
                      <Button className="shadow-lg shadow-white/20 hover:shadow-xl hover:shadow-white/30 transition-shadow">
                        Get started free
                      </Button>
                    </Link>
                    <Link href="/docs">
                      <Button variant="outline" className="border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.1)] hover:shadow-[0_0_12px_rgba(255,255,255,0.2)] transition-shadow">
                        Read documentation
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-foreground flex-shrink-0" />
                      <span>Unlimited emails</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-foreground flex-shrink-0" />
                      <span>Full REST API & dashboard</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-foreground flex-shrink-0" />
                      <span>Bring your own SMTP</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-foreground flex-shrink-0" />
                      <span>TypeScript SDK included</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-foreground flex-shrink-0" />
                      <span>Email history & logs</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-foreground flex-shrink-0" />
                      <span>Attachment support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* How It Works Card */}
              <Card className="p-6 md:p-8 border-white/20 shadow-lg shadow-white/5">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div>
                      <strong className="text-foreground">You bring your own SMTP</strong>
                      <br />
                      Use Gmail, Zoho, Outlook, or any SMTP provider you already have. Freesend is just
                      the API layer—you control the delivery infrastructure.
                    </div>
                    <div>
                      <strong className="text-foreground">No email costs</strong>
                      <br />
                      Since you're using your own SMTP server, you only pay what your provider charges
                      (often free for small volumes). Freesend adds zero markup.
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs bg-violet-500/10 border-violet-500/40 text-violet-200 shadow-[0_0_4px_rgba(139,92,246,0.2)]">
                      Self-host or use our service
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/40 text-green-200 shadow-[0_0_4px_rgba(34,197,94,0.2)]">
                      No usage limits
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-yellow-500/10 border-yellow-500/40 text-yellow-200 shadow-[0_0_4px_rgba(234,179,8,0.2)]">
                      No credit card needed
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div>
                      <strong className="text-foreground">Docs & SDKs</strong>
                      <br />
                      Complete API documentation, TypeScript SDK, and example code to get you sending
                      emails in minutes.
                    </div>
                    <div>
                      <strong className="text-foreground">Open source community</strong>
                      <br />
                      Built in the open on GitHub. File issues, send PRs, or fork and customize for
                      your needs. Community-driven development.
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
