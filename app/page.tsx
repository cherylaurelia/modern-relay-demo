import { cappedCaches, defaultCaches, scenarios, type Sample } from "./measurements";

const ISSUE = "https://github.com/ModernRelay/omnigraph/issues/702";
const BRANCH = "https://github.com/cherylaurelia/omnigraph/tree/fix/lance-data-cache-bytes";
const DEMO_REPO = "https://github.com/cherylaurelia/modern-relay-demo";

const WIDTH = 720;
const HEIGHT = 280;
const LEFT = 48;
const RIGHT = 150;
const TOP = 12;
const BOTTOM = 34;
const MIN_MB = 600;
const MAX_MB = 1400;
const MAX_SECONDS = 240;

function x(seconds: number): number {
  return LEFT + (seconds / MAX_SECONDS) * (WIDTH - LEFT - RIGHT);
}

function y(megabytes: number): number {
  return TOP + ((MAX_MB - megabytes) / (MAX_MB - MIN_MB)) * (HEIGHT - TOP - BOTTOM);
}

function Series({ samples, color, label }: { samples: readonly Sample[]; color: string; label: string }) {
  const points = samples.map(([seconds, mb]) => `${x(seconds)},${y(mb)}`).join(" ");
  const [lastSeconds, lastMb] = samples[samples.length - 1];

  return (
    <g>
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {samples.map(([seconds, mb]) => (
        <circle key={seconds} cx={x(seconds)} cy={y(mb)} r={6} fill="transparent">
          <title>{`${label}: ${mb} MB at ${seconds} s`}</title>
        </circle>
      ))}
      <text x={x(lastSeconds) + 8} y={y(lastMb) + 4} fontSize={12} fill="#1b1b1f">
        {label}
      </text>
    </g>
  );
}

function RssChart() {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Server RSS over 240 seconds. Default caches climb from about 1060 to 1258 MB, then fall to 1137. Capped caches stay between 723 and 1034 MB."
      className="w-full"
    >
      {[600, 800, 1000, 1200, 1400].map((mb) => (
        <g key={mb}>
          <line x1={LEFT} x2={WIDTH - RIGHT} y1={y(mb)} y2={y(mb)} stroke="#d4d4da" strokeWidth={1} />
          <text x={LEFT - 8} y={y(mb) + 4} fontSize={11} textAnchor="end" fill="#55555c">
            {mb}
          </text>
        </g>
      ))}
      {[30, 90, 150, 210].map((seconds) => (
        <text key={seconds} x={x(seconds)} y={HEIGHT - 12} fontSize={11} textAnchor="middle" fill="#55555c">
          {seconds} s
        </text>
      ))}
      <Series samples={defaultCaches} color="#c2410c" label="Default caches" />
      <Series samples={cappedCaches} color="#0044ff" label="256 + 64 MiB" />
    </svg>
  );
}

const linkClass =
  "rounded-md px-4 py-2 font-mono text-sm uppercase tracking-wide border border-ink/20 hover:bg-panel";

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 md:px-8">
      <section className="rounded-xl bg-panel p-6 md:p-8">
        <p className="font-mono text-xs uppercase tracking-wide text-muted">[Issue 702, second ask]</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-medium leading-tight md:text-4xl">
          No setting limits how much memory the Lance caches may keep: 6 GiB + 1 GiB per graph.
        </h1>
        <p className="mt-4 max-w-3xl text-lg">
          This unmerged branch adds two environment variables that set both sizes, and the defaults stay
          as they are. They help when the hot vector partitions fit in the cache, and hurt badly when they don&apos;t.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a className={`${linkClass} border-ink bg-ink text-page hover:bg-ink`} href={BRANCH}>
            The fix (branch)
          </a>
          <a className={linkClass} href={ISSUE}>
            Issue 702
          </a>
          <a className={linkClass} href={DEMO_REPO}>
            This page&apos;s repo
          </a>
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-ink/10 p-5">
          <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Before</h2>
          <p className="mt-2">The sizes are fixed at Lance&apos;s defaults, whatever the instance&apos;s memory.</p>
          <pre className="mt-3 overflow-x-auto rounded-md bg-ink p-3 font-mono text-xs text-page">
            {"Session::new(\n  DEFAULT_INDEX_CACHE_SIZE,\n  DEFAULT_METADATA_CACHE_SIZE,\n  ..\n)"}
          </pre>
        </div>
        <div className="min-w-0 rounded-xl border border-ink/10 p-5">
          <h2 className="font-mono text-xs uppercase tracking-wide text-muted">After</h2>
          <p className="mt-2">Read when a graph opens. If unset, behavior doesn&apos;t change. These values only suit vector properties under 256 MiB, and the total is the cap times the open graphs.</p>
          <pre className="mt-3 overflow-x-auto rounded-md bg-ink p-3 font-mono text-xs text-page">
            {"OMNIGRAPH_LANCE_INDEX_CACHE_BYTES=268435456\nOMNIGRAPH_LANCE_METADATA_CACHE_BYTES=67108864"}
          </pre>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-medium">Server memory with reads and 20 rows/s appended</h2>
        <p className="mt-2 max-w-3xl text-muted">
          RSS in MB, sampled every 10 s, from 30 s on. Default caches climbed for three minutes and then
          fell; the capped run moved around a lower level. One run each, so this is not a long-uptime result, and this is the best case: lower caps on other workloads went the other way, below.
        </p>
        <div className="mt-3 flex flex-wrap gap-4 font-mono text-xs">
          <span className="flex items-center gap-2">
            <span className="inline-block h-0.5 w-5 bg-default-series" /> Default caches
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-0.5 w-5 bg-accent" /> 256 MiB index + 64 MiB metadata
          </span>
        </div>
        <div className="mt-3 overflow-x-auto" tabIndex={0} role="group" aria-label="RSS chart, scrolls sideways on small screens">
          <div className="min-w-[560px]">
            <RssChart />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-medium">When a cap helps, and when it hurts</h2>
        <p className="mt-2 max-w-3xl text-muted">
          The engine builds one vector partition, so a whole vector column is one cache entry. If it
          doesn&apos;t fit, every <code className="font-mono text-sm">nearest</code> reads it again.
        </p>
        <div className="mt-4 overflow-x-auto" tabIndex={0} role="group" aria-label="Measurements table, scrolls sideways on small screens">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="font-mono text-xs uppercase text-muted">
              <tr className="border-b border-ink/20">
                <th className="py-2 pr-4 font-normal">Workload</th>
                <th className="py-2 pr-4 font-normal">Cap (index + metadata)</th>
                <th className="py-2 pr-4 font-normal">Median RSS, default → capped</th>
                <th className="py-2 pr-4 font-normal">Requests</th>
                <th className="py-2 font-normal">Result</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => (
                <tr key={scenario.name} className="border-b border-ink/10">
                  <td className="py-3 pr-4">{scenario.name}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{scenario.cap}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{scenario.rss}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{scenario.requests}</td>
                  <td className="py-3 font-medium">{scenario.verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 rounded-xl bg-panel p-6">
        <h2 className="text-2xl font-medium">What this doesn&apos;t show</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>It is a setting, not the OOM fix. It bounds the caches, not process RSS, and the other asks in issue 702 stay open.</li>
          <li>Synthetic data: 150k random 1536-dim vectors, four readers, release build on one Mac, 2 to 4 minutes per run.{" "}
            <a className="underline" href={`${DEMO_REPO}/tree/main/measurements`}>Scripts and raw samples</a>.</li>
          <li>Not run: Linux, S3, a real container OOM or a long uptime. No outside user has reported this cap helping.</li>
        </ul>
      </section>

      <footer className="mt-10 border-t border-ink/10 pt-5 font-mono text-xs text-muted">
        Unofficial demo by Cheryl Aurelia: not affiliated with Modern Relay
      </footer>
    </main>
  );
}
