import Link from "next/link";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <nav className="mx-auto max-w-2xl px-6 pt-6">
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          &larr; Back
        </Link>
      </nav>
      {children}
    </div>
  );
}
