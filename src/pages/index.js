import Head from "next/head";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  CalendarClock,
  CheckCircle2,
  FileText,
  LineChart,
} from "lucide-react";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://careerops.pranshu.dev";

const features = [
  {
    title: "Application pipeline",
    description:
      "Track every role from applied to offer, rejection, ghosted, or accepted.",
    icon: FileText,
  },
  {
    title: "Interview rounds",
    description:
      "Manage scheduled interviews, results, next rounds, and final outcomes.",
    icon: CalendarClock,
  },
  {
    title: "Follow-up reminders",
    description:
      "Stay on top of recruiter follow-ups and stale opportunities.",
    icon: Bell,
  },
  {
    title: "Analytics dashboard",
    description:
      "Review funnel conversion, sources, timelines, and time-to-outcome metrics.",
    icon: BarChart3,
  },
];

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CareerOps",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web",
  url: APP_URL,
  description:
    "CareerOps is a job application tracker for managing applications, interviews, follow-ups, offers, and job search analytics.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>CareerOps - Job Application Tracker</title>
        <meta
          name="description"
          content="Track job applications, interviews, follow-ups, offers, and hiring pipeline analytics in one organized dashboard."
        />
        <meta
          name="keywords"
          content="job application tracker, job search tracker, interview tracker, follow-up reminders, job pipeline tracker"
        />
        <meta property="og:title" content="CareerOps - Job Application Tracker" />
        <meta
          property="og:description"
          content="Organize job applications, interviews, follow-ups, offers, and analytics in one dashboard."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={APP_URL} />
        <meta property="og:image" content={`${APP_URL}/og-image.png`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CareerOps - Job Application Tracker" />
        <meta
          name="twitter:description"
          content="Track job applications, interviews, follow-ups, and hiring pipeline progress."
        />
        <meta name="twitter:image" content={`${APP_URL}/og-image.png`} />
        <link rel="canonical" href={APP_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      </Head>

      <main className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                CO
              </div>
              <span className="text-base font-bold tracking-tight text-slate-800">
                CareerOps
              </span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-100 transition-colors hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </nav>
          </div>
        </header>

        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Job search operations
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Track every application, interview, follow-up, and offer in one dashboard.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              CareerOps helps candidates manage their job search pipeline with
              structured application tracking, interview rounds, follow-up
              reminders, and analytics built for real hiring workflows.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-100 transition-colors hover:bg-indigo-700"
              >
                Start tracking
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Pipeline snapshot
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Application performance at a glance
                </p>
              </div>
              <LineChart className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Applications", "42"],
                ["Interviews", "13"],
                ["Offers", "4"],
                ["Follow-ups", "8"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              {["Applied", "Shortlisted", "Interviewing", "Offered"].map(
                (stage, index) => (
                  <div key={stage}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">
                        {stage}
                      </span>
                      <span className="text-slate-400">
                        {[100, 64, 31, 10][index]}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${[100, 64, 31, 10][index]}%` }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-sm font-semibold text-slate-800">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Built for active job seekers
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Replace spreadsheets with a focused workspace for repeated
                  job search actions: status updates, interview rounds,
                  reminders, and progress analytics.
                </p>
              </div>
              <Link
                href="/signup"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Create account
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
