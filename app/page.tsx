import Link from "next/link";
import fs from "fs";
import path from "path";

type SubmissionMeta = {
  id: string;
  name: string;
  description: string;
  focus: string;
};

function getSubmissions(): SubmissionMeta[] {
  const dir = path.join(process.cwd(), "app/games/submissions");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((d) => {
      const metaPath = path.join(dir, d, "meta.json");
      return fs.existsSync(metaPath);
    })
    .map((d) => {
      const raw = fs.readFileSync(path.join(dir, d, "meta.json"), "utf-8");
      return JSON.parse(raw) as SubmissionMeta;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function Home() {
  const submissions = getSubmissions();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Crab Game
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Game prototyping sandbox.
        </p>

        {submissions.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Submissions ({submissions.length})
            </h2>
            <div className="flex flex-col gap-2">
              {submissions.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/games/submissions/${sub.id}`}
                  className="group flex items-baseline justify-between rounded-lg border border-zinc-200 bg-white px-5 py-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
                >
                  <div className="min-w-0">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {sub.name}
                    </span>
                    <span className="ml-3 text-sm text-zinc-400 dark:text-zinc-500">
                      {sub.description}
                    </span>
                  </div>
                  <span className="ml-4 shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                    {sub.focus}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {submissions.length === 0 && (
          <div className="mt-12 rounded-lg border-2 border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
            <p className="text-zinc-400 dark:text-zinc-500">
              No submissions yet. Run an agent to create one.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
