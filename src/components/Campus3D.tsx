import { useRef, useState, type CSSProperties } from "react";
import { BLOCKS, EDGES, FLOORS, NODES, type FloorKey } from "@/data/campus";

type Rect = { x: number; y: number; w: number; d: number };

const FOOTPRINTS: Record<string, Rect[]> = {
  ecei: [{ x: 445, y: 300, w: 100, d: 200 }],
  ceeee: [{ x: 655, y: 300, w: 100, d: 200 }],
  mca: [{ x: 445, y: 600, w: 100, d: 200 }],
  csit: [{ x: 655, y: 600, w: 100, d: 200 }],
  admin: [
    { x: 470, y: 930, w: 260, d: 120 },
    { x: 470, y: 1050, w: 70, d: 40 },
    { x: 660, y: 1050, w: 70, d: 40 },
  ],
};

const FLOOR_H = 34;

function Box({
  r,
  z,
  h,
  color,
  top,
  onClick,
  onEnter,
  onLeave,
}: {
  r: Rect;
  z: number;
  h: number;
  color: string;
  top?: React.ReactNode;
  onClick?: () => void;
  onEnter?: () => void;
  onLeave?: () => void;
}) {
  const face: CSSProperties = { position: "absolute", transformStyle: "preserve-3d" };
  const side = `color-mix(in oklab, ${color} 62%, black)`;
  const side2 = `color-mix(in oklab, ${color} 45%, black)`;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.d,
        transformStyle: "preserve-3d",
        transform: `translateZ(${z}px)`,
        cursor: onClick ? "pointer" : undefined,
      }}
    >
      {/* sides */}
      <div style={{ ...face, left: 0, top: 0, width: r.w, height: h, background: side2, transformOrigin: "top", transform: "rotateX(90deg)" }} />
      <div style={{ ...face, left: 0, top: r.d, width: r.w, height: h, background: side, transformOrigin: "top", transform: "rotateX(90deg)" }} />
      <div style={{ ...face, left: 0, top: 0, width: h, height: r.d, background: side2, transformOrigin: "left", transform: "rotateY(-90deg)" }} />
      <div style={{ ...face, left: r.w, top: 0, width: h, height: r.d, background: side, transformOrigin: "left", transform: "rotateY(-90deg)" }} />
      {/* top */}
      <div
        style={{
          ...face,
          inset: 0,
          background: color,
          transform: `translateZ(${h}px)`,
          display: "grid",
          placeItems: "center",
          border: "1px solid color-mix(in oklab, white 25%, transparent)",
          borderRadius: 4,
        }}
      >
        {top}
      </div>
    </div>
  );
}

export default function Campus3D({
  routePath,
  activeBlock,
  onSelectFloor,
}: {
  routePath: string[] | null;
  activeBlock: string | null;
  onSelectFloor: (blockId: string, floor: FloorKey) => void;
}) {
  const [rot, setRot] = useState(-30);
  const [tilt, setTilt] = useState(55);
  const [zoom, setZoom] = useState(0.55);
  const [explode, setExplode] = useState(false);
  const [hover, setHover] = useState<{ b: string; f: FloorKey } | null>(null);
  const drag = useRef<{ x: number; y: number; r: number; t: number } | null>(null);

  const gap = explode ? 46 : 2;
  const hoverBlock = hover ? BLOCKS.find((b) => b.id === hover.b) : undefined;

  const routePts = routePath
    ?.map((n) => NODES[n])
    .filter(Boolean)
    .map((p) => `${p!.x},${p!.y}`)
    .join(" ");

  return (
    <div
      className="relative h-full w-full touch-none select-none overflow-hidden bg-[var(--map-bg)]"
      style={{ perspective: 1800 }}
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, y: e.clientY, r: rot, t: tilt };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        setRot(d.r + (e.clientX - d.x) * 0.4);
        setTilt(Math.min(80, Math.max(0, d.t - (e.clientY - d.y) * 0.3)));
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onWheel={(e) => setZoom((z) => Math.min(1.6, Math.max(0.3, z * Math.exp(-e.deltaY * 0.0015))))}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1000,
          height: 1400,
          marginLeft: -500,
          marginTop: -700,
          transformStyle: "preserve-3d",
          transform: `scale(${zoom}) rotateX(${tilt}deg) rotateZ(${rot}deg)`,
          transition: drag.current ? "none" : "transform 0.2s ease-out",
        }}
      >
        {/* ground */}
        <svg width="1000" height="1400" style={{ position: "absolute", inset: 0 }}>
          <rect width="1000" height="1400" rx="30" fill="var(--map-bg)" stroke="var(--border)" strokeWidth="4" />
          <rect x="130" y="930" width="220" height="300" rx="20" fill="var(--map-grass)" opacity="0.5" />
          <rect x="185" y="320" width="70" height="560" rx="35" fill="var(--map-water)" opacity="0.5" />
          {EDGES.map(([a, b]) => {
            const p = NODES[a];
            const q = NODES[b];
            if (!p || !q) return null;
            return (
              <line key={a + b} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="var(--map-road)" strokeWidth="26" strokeLinecap="round" />
            );
          })}
          {routePts && (
            <polyline points={routePts} fill="none" stroke="var(--primary)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" className="route-line" />
          )}
        </svg>

        {/* facilities */}
        <Box r={{ x: 855, y: 600, w: 95, d: 100 }} z={0} h={20} color="var(--map-violet)" top={<span className="text-[14px] font-bold text-foreground">CANTEEN</span>} />
        <Box r={{ x: 855, y: 735, w: 95, d: 90 }} z={0} h={20} color="var(--map-amber)" />

        {/* blocks with floors */}
        {BLOCKS.map((b) => {
          const rects = FOOTPRINTS[b.id] ?? [];
          const isActive = activeBlock === b.id;
          return FLOORS.map((f, i) => {
            const isHover = hover?.b === b.id && hover.f === f.key;
            const color = isHover
              ? "var(--primary)"
              : isActive
                ? "var(--map-admin-active)"
                : b.id === "admin"
                  ? "var(--map-admin)"
                  : "var(--map-building)";
            return rects.map((r, ri) => (
              <Box
                key={`${b.id}-${f.key}-${ri}`}
                r={r}
                z={i * (FLOOR_H + gap)}
                h={FLOOR_H}
                color={color}
                onClick={() => onSelectFloor(b.id, f.key)}
                onEnter={() => setHover({ b: b.id, f: f.key })}
                onLeave={() => setHover(null)}
                top={
                  ri === 0 && (i === FLOORS.length - 1 || explode) ? (
                    <span
                      className="text-center font-display font-bold text-foreground"
                      style={{ fontSize: 18, transform: `rotate(${-rot}deg)` }}
                    >
                      {b.short}
                      <br />
                      <span style={{ fontSize: 13, opacity: 0.8 }}>{f.label}</span>
                    </span>
                  ) : null
                }
              />
            ));
          });
        })}
      </div>

      {/* controls */}
      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button className="chip justify-center" onClick={() => setExplode((v) => !v)}>
          {explode ? "Stack floors" : "Separate floors"}
        </button>
        <button className="chip justify-center" onClick={() => setZoom((z) => Math.min(1.6, z * 1.2))}>Zoom +</button>
        <button className="chip justify-center" onClick={() => setZoom((z) => Math.max(0.3, z / 1.2))}>Zoom −</button>
        <button className="chip justify-center" onClick={() => { setRot(-30); setTilt(55); setZoom(0.55); }}>Reset view</button>
      </div>

      {hoverBlock && hover && (
        <div className="panel pointer-events-none absolute bottom-3 right-3 max-w-[260px] p-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-accent">
            {hoverBlock.short} · {FLOORS.find((f) => f.key === hover.f)!.label}
          </p>
          <ul className="mt-1 space-y-0.5 text-xs text-foreground">
            {hoverBlock.floors[hover.f].map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="pointer-events-none absolute bottom-3 left-3 text-xs text-muted-foreground">
        Drag to rotate · tap a floor to see its rooms
      </p>
    </div>
  );
}
