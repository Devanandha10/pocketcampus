import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import CampusMap from "@/components/CampusMap";
import NavPanel from "@/components/NavPanel";
import BlockSheet from "@/components/BlockSheet";
import {
  BLOCKS,
  FLOORS,
  NODE_LABELS,
  buildDestinations,
  findPath,
  walkMinutes,
  type Destination,
  type FloorKey,
} from "@/data/campus";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus Navigator — Interactive College Map & Room Finder" },
      {
        name: "description",
        content:
          "Find any classroom, lab or office on campus: interactive zoomable map, walking routes from the main gate, and floor-by-floor indoor directories for all five blocks.",
      },
      { property: "og:title", content: "Campus Navigator — Interactive College Map" },
      {
        property: "og:description",
        content:
          "Zoomable campus map with animated walking routes and indoor room directories for Administration, CS/IT, MCA, EC/EI and CE/EEE blocks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function floorLabel(f: FloorKey) {
  return FLOORS.find((x) => x.key === f)!.label;
}

function outdoorSteps(path: string[], destLabel: string): string[] {
  const steps: string[] = [];
  const start = NODE_LABELS[path[0]!] ?? "your start";
  const mins = walkMinutes(path);
  const waypoints = path
    .slice(1, -1)
    .map((n) => NODE_LABELS[n])
    .filter(Boolean);
  steps.push(`Start at ${start} and follow the service road.`);
  if (waypoints.length) {
    const trimmed = waypoints.filter((_, i) => i % 2 === 0).slice(0, 3);
    steps.push(`Continue past ${trimmed.join(", then ")}.`);
  }
  steps.push(`Arrive at ${destLabel} (about ${mins} min walk).`);
  return steps;
}

function Index() {
  const destinations = useMemo<Destination[]>(() => buildDestinations(), []);
  const [start, setStart] = useState("out:gate");
  const [end, setEnd] = useState("");
  const [routePath, setRoutePath] = useState<string[] | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openBlock, setOpenBlock] = useState<string | null>(null);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);

  const byValue = (v: string) => destinations.find((d) => d.value === v);

  const computeRoute = (startVal: string, endVal: string) => {
    const a = byValue(startVal);
    const b = byValue(endVal);
    if (!a || !b) {
      setError("Pick both a start and an end location.");
      return;
    }
    if (a.node === b.node && !b.room) {
      setError("Start and destination are the same place.");
      return;
    }
    const path = findPath(a.node, b.node);
    if (!path) {
      setError("No walking route found between those points.");
      return;
    }
    setError(null);
    setRoutePath(path);
    setMinutes(walkMinutes(path));
    setActiveBlock(b.blockId ?? null);

    const block = b.blockId ? BLOCKS.find((x) => x.id === b.blockId) : undefined;
    if (block && b.room && b.floor) {
      const list = block.floors[b.floor];
      const idx = list.indexOf(b.room);
      const neighbour = idx > 0 ? list[idx - 1] : list[Math.min(1, list.length - 1)];
      const inside =
        b.floor === "ground"
          ? `Enter the building and stay on the Ground Floor.`
          : `Enter the building and take the stairs up to the ${floorLabel(b.floor)}.`;
      setSteps([
        `Walk from ${NODE_LABELS[a.node] ?? a.label} along the road to the ${block.name} entrance (${walkMinutes(path)} mins).`,
        inside,
        neighbour && neighbour !== b.room
          ? `Walk past the ${neighbour} to reach the ${b.room}.`
          : `The ${b.room} is straight ahead.`,
      ]);
    } else {
      setSteps(outdoorSteps(path, b.label));
    }
  };

  const clear = () => {
    setRoutePath(null);
    setSteps([]);
    setMinutes(null);
    setError(null);
    setActiveBlock(null);
    setEnd("");
  };

  const navigateToRoom = (blockId: string, floor: FloorKey, room: string) => {
    const value = `room:${blockId}:${floor}:${room}`;
    setEnd(value);
    setOpenBlock(null);
    computeRoute(start || "out:gate", value);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary font-display text-lg font-black text-primary-foreground">
            C
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-bold text-foreground">
              Campus Navigator
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              Tap a block to explore floors and rooms
            </p>
          </div>
        </div>
        <span className="badge shrink-0">Live map</span>
      </header>

      <main className="relative flex flex-1 flex-col-reverse md:flex-row">
        <div className="z-10 w-full space-y-3 p-3 md:absolute md:inset-y-0 md:left-0 md:w-[360px] md:overflow-y-auto md:p-4">
          <NavPanel
            destinations={destinations}
            start={start}
            end={end}
            onStart={setStart}
            onEnd={setEnd}
            onFind={() => computeRoute(start, end)}
            onClear={clear}
            steps={steps}
            minutes={minutes}
            error={error}
          />
          {openBlock && (
            <BlockSheet
              blockId={openBlock}
              onClose={() => setOpenBlock(null)}
              onNavigate={navigateToRoom}
            />
          )}
          {!openBlock && (
            <div className="panel p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-accent">Directory</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {BLOCKS.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setOpenBlock(b.id);
                      setActiveBlock(b.id);
                    }}
                    className="chip w-full justify-center"
                  >
                    {b.short}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-[55vh] w-full md:h-auto md:min-h-[calc(100vh-64px)] md:flex-1">
          <CampusMap
            routePath={routePath}
            activeBlock={activeBlock}
            onSelectBlock={(id) => {
              setOpenBlock(id);
              setActiveBlock(id);
            }}
          />
        </div>
      </main>
    </div>
  );
}
