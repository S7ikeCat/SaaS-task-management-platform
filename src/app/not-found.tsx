import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-gray-500">Page not found</p>
        <Link
          href="/dashboard"
          className="inline-flex rounded-lg border px-4 py-2 hover:bg-white/5"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}