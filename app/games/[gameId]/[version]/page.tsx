import { games } from "../../config";
import { notFound } from "next/navigation";

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string; version: string }>;
}) {
  const { gameId, version } = await params;
  const game = games.find((g) => g.id === gameId);

  if (!game) return notFound();

  const versionInfo = game.versions.find((v) => v.version === version);
  if (!versionInfo) return notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {game.name}
        </h1>
        <span className="font-mono text-sm text-zinc-400 dark:text-zinc-500">
          {version}
        </span>
      </div>
      <p className="mt-1 text-zinc-500 dark:text-zinc-400">
        {game.description}
      </p>
      <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
        Idea #{game.idea} &middot; {versionInfo.date} &middot; {versionInfo.notes}
      </p>

      <div className="mt-12 flex items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-white p-16 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-center text-zinc-400 dark:text-zinc-500">
          Game canvas goes here
        </p>
      </div>

      {game.versions.length > 1 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Other versions
          </h2>
          <div className="mt-2 flex gap-2">
            {game.versions
              .filter((v) => v.version !== version)
              .map((v) => (
                <a
                  key={v.version}
                  href={`/games/${gameId}/${v.version}`}
                  className="rounded border border-zinc-200 px-3 py-1 font-mono text-xs text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
                >
                  {v.version}
                </a>
              ))}
          </div>
        </div>
      )}
    </main>
  );
}
