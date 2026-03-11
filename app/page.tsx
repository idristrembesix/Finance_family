import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-10 py-6">
        <h1 className="text-xl font-bold">FinanceFamily</h1>

        <div className="flex gap-8 text-sm text-zinc-300">
          <Link href="/" className="hover:text-indigo-500">
            Product
          </Link>

          <Link href="/" className="hover:text-indigo-500">
            Features
          </Link>

          <Link href="/" className="hover:text-indigo-500">
            Pricing
          </Link>

          <Link href="/" className="hover:text-indigo-500">
            Resources
          </Link>
        </div>

        <div className="flex gap-4">
          <Link
            href="/auth/Login"
            className="text-sm text-zinc-300 hover:text-indigo-500"
          >
            Login
          </Link>

          <Link
            href="/"
            className="bg-indigo-600 px-5 py-2 rounded-full text-sm hover:bg-indigo-500"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-10 pt-20 pb-28 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-5xl font-bold leading-tight">
            Manage Your <br />
            <span className="text-indigo-500">Family Finance</span> <br />
            Smarter
          </h1>

          <p className="mt-6 text-zinc-400 max-w-md">
            Track income, expenses and savings with a modern dashboard.
            Built for families who want better financial planning.
          </p>

          <div className="mt-8 flex gap-4">
            <button className="bg-indigo-600 px-6 py-3 rounded-full hover:bg-indigo-500">
              Get Started
            </button>

            <button className="border border-zinc-700 px-6 py-3 rounded-full hover:bg-zinc-800">
              Learn More
            </button>
          </div>
        </div>

        {/* HERO IMAGE */}
        <div className="relative">
          <div className="absolute blur-3xl bg-indigo-600 w-72 h-72 opacity-30 rounded-full"></div>

          <Image
            src="/dashboard.png"
            alt="finance dashboard"
            width={600}
            height={400}
            className="relative rounded-2xl shadow-2xl"
          />
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-10 py-24 bg-zinc-900">
        <h2 className="text-center text-3xl font-bold mb-16">
          Powerful Finance Tools
        </h2>

        <div className="grid md:grid-cols-4 gap-8">
          <div className="p-6 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition">
            <h3 className="text-lg font-semibold">Expense Tracking</h3>
            <p className="text-sm text-zinc-400 mt-2">
              Record all your daily expenses easily.
            </p>
          </div>

          <div className="p-6 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition">
            <h3 className="text-lg font-semibold">Income Management</h3>
            <p className="text-sm text-zinc-400 mt-2">
              Track salary and all income sources.
            </p>
          </div>

          <div className="p-6 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition">
            <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
            <p className="text-sm text-zinc-400 mt-2">
              Visualize your finance with charts.
            </p>
          </div>

          <div className="p-6 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition">
            <h3 className="text-lg font-semibold">Family Sharing</h3>
            <p className="text-sm text-zinc-400 mt-2">
              Manage finance together with family.
            </p>
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="px-10 py-28 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Smart Financial Dashboard
        </h2>

        <p className="text-zinc-400 max-w-xl mx-auto mb-12">
          See your money flow, spending habits and saving progress
          in one beautiful dashboard.
        </p>

        <div className="flex justify-center">
          <Image
            src="/dashboard.png"
            alt="finance dashboard"
            width={900}
            height={500}
            className="rounded-2xl shadow-2xl"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="px-10 py-24 bg-indigo-600 text-center">
        <h2 className="text-3xl font-bold">
          Start Managing Your Family Finance today
        </h2>

        <p className="mt-4 text-indigo-100">
          Simple, powerful and secure financial management.
        </p>

        <button className="mt-8 bg-white text-indigo-600 px-8 py-3 rounded-full font-medium hover:bg-zinc-200">
          Create Free Account
        </button>
      </section>

      {/* FOOTER */}
      <footer className="px-10 py-10 text-center text-zinc-500 text-sm">
        © {new Date().getFullYear()} FinanceFamily. All rights reserved.
      </footer>
    </div>
  );
}