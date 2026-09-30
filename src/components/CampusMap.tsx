import { useCallback, useEffect, useRef, useState } from "react";
import { NODES } from "@/data/campus";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;

type Props = {
  routePath: string[] | null;
  activeBlock: string | null;
  onSelectBlock: (id: string) => void;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export default function CampusMap({ routePath, activeBlock, onSelectBlock }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ z: 1, x: 0, y: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const drag = useRef<{ id: number; sx: number; sy: number; ox: number; oy: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; z: number; cx: number; cy: number; ox: number; oy: number } | null>(
    null,
  );

  const zoomAt = useCallback((px: number, py: number, factor: number) => {
    setView((v) => {
      const next = clamp(v.z * factor, MIN_ZOOM, MAX_ZOOM);
      const k = next / v.z;
      return { z: next, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });
  }, []);

  const wheelRef = useRef((e: WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-dy * 0.0015));
  });
  wheelRef.current = (e: WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-dy * 0.0015));
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      drag.current = {
        id: e.pointerId,
        sx: e.clientX,
        sy: e.clientY,
        ox: viewRef.current.x,
        oy: viewRef.current.y,
      };
    } else if (pointers.current.size === 2) {
      drag.current = null;
      const [a, b] = [...pointers.current.values()];
      const rect = containerRef.current!.getBoundingClientRect();
      pinch.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        z: viewRef.current.z,
        cx: (a.x + b.x) / 2 - rect.left,
        cy: (a.y + b.y) / 2 - rect.top,
        ox: viewRef.current.x,
        oy: viewRef.current.y,
      };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const p = pinch.current;
      const next = clamp((p.z * dist) / p.dist, MIN_ZOOM, MAX_ZOOM);
      const k = next / p.z;
      setView({ z: next, x: p.cx - (p.cx - p.ox) * k, y: p.cy - (p.cy - p.oy) * k });
      return;
    }
    const d = drag.current;
    if (d && d.id === e.pointerId) {
      setView((v) => ({ ...v, x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) }));
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (drag.current?.id === e.pointerId) drag.current = null;
  };

  const reset = () => setView({ z: 1, x: 0, y: 0 });

  const routePoints = routePath
    ? routePath.map((n) => `${NODES[n].x},${NODES[n].y}`).join(" ")
    : "";

  const blockProps = (id: string) => ({
    onClick: () => onSelectBlock(id),
    className: `cursor-pointer transition-opacity ${
      activeBlock && activeBlock !== id ? "opacity-60" : "opacity-100"
    }`,
  });

  const buildingFill = (id: string) =>
    activeBlock === id ? "var(--map-building-active)" : "var(--map-building)";

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      className="relative h-full w-full touch-none overflow-hidden bg-map-bg select-none"
    >
      <div
        className="h-full w-full origin-top-left"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})` }}
      >
        <svg viewBox="0 0 1000 1400" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="routeGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="9" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M50 0H0V50" fill="none" stroke="var(--map-grid)" strokeWidth="1" />
            </pattern>
          </defs>

          <rect width="1000" height="1400" fill="var(--map-bg)" />
          <rect width="1000" height="1400" fill="url(#grid)" />

          {/* roads */}
          <g
            stroke="var(--map-road)"
            strokeWidth="30"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <path d="M760 1385 V1000 L810 880" />
            <path d="M760 1160 H600 V1095" />
            <path d="M760 1160 H555 V1180" />
            <path d="M810 880 H390 V240 H810 V880" />
            <path d="M600 880 V240" />
            <path d="M810 650 H900" />
          </g>
          <g
            stroke="var(--map-road-line)"
            strokeWidth="2"
            strokeDasharray="14 16"
            fill="none"
            opacity="0.5"
          >
            <path d="M760 1385 V1000 L810 880" />
            <path d="M810 880 H390 V240 H810 V880" />
            <path d="M600 880 V240" />
          </g>

          {/* plots */}
          <g fill="var(--map-plot)" stroke="var(--map-plot-stroke)" strokeWidth="2">
            <rect x="415" y="265" width="160" height="270" rx="10" />
            <rect x="625" y="265" width="160" height="270" rx="10" />
            <rect x="415" y="565" width="160" height="270" rx="10" />
            <rect x="625" y="565" width="160" height="270" rx="10" />
          </g>

          {/* playground + hostel + proposed road */}
          <path d="M300 300 V1050" stroke="var(--map-road)" strokeWidth="18" fill="none" opacity="0.55" strokeLinecap="round" />
          <rect x="185" y="320" width="70" height="560" rx="35" fill="var(--map-water)" opacity="0.5" />
          <text x="220" y="600" className="map-label-sm" transform="rotate(-90 220 600)">
            PROPOSED PLAY GROUND
          </text>
          <rect x="130" y="230" width="90" height="34" rx="6" fill="var(--map-amber)" opacity="0.6" />
          <text x="175" y="252" className="map-label-sm">LADIES HOSTEL</text>

          {/* main blocks */}
          <g {...blockProps("ecei")}>
            <rect x="445" y="300" width="100" height="200" rx="12" fill={buildingFill("ecei")} />
            <text x="495" y="395" className="map-label">EC/EI</text>
            <text x="495" y="420" className="map-label-sm">BLOCK</text>
          </g>
          <g {...blockProps("ceeee")}>
            <rect x="655" y="300" width="100" height="200" rx="12" fill={buildingFill("ceeee")} />
            <text x="705" y="395" className="map-label">CE/EEE</text>
            <text x="705" y="420" className="map-label-sm">BLOCK</text>
          </g>
          <g {...blockProps("mca")}>
            <rect x="445" y="600" width="100" height="200" rx="12" fill={buildingFill("mca")} />
            <text x="495" y="695" className="map-label">MCA</text>
            <text x="495" y="720" className="map-label-sm">BLOCK</text>
          </g>
          <g {...blockProps("csit")}>
            <rect x="655" y="600" width="100" height="200" rx="12" fill={buildingFill("csit")} />
            <text x="705" y="695" className="map-label">CS/IT</text>
            <text x="705" y="720" className="map-label-sm">BLOCK</text>
          </g>
          <g {...blockProps("admin")}>
            <path
              d="M470 930 H730 V1090 H660 V1050 H540 V1090 H470 Z"
              rx="10"
              fill={activeBlock === "admin" ? "var(--map-admin-active)" : "var(--map-admin)"}
            />
            <text x="600" y="990" className="map-label">ADMINISTRATION</text>
            <text x="600" y="1015" className="map-label-sm">BLOCK</text>
          </g>

          {/* facilities */}
          <g>
            <rect x="855" y="600" width="95" height="100" rx="8" fill="var(--map-violet)" />
            <text x="902" y="655" className="map-label-sm">CANTEEN</text>
            <rect x="855" y="735" width="95" height="90" rx="8" fill="var(--map-amber)" />
            <text x="902" y="785" className="map-label-sm">SUB STN</text>
            <rect x="840" y="120" width="70" height="60" rx="8" fill="var(--map-mint)" />
            <text x="875" y="155" className="map-label-sm">FM LAB</text>
            <rect x="840" y="210" width="70" height="60" rx="8" fill="var(--map-pink)" />
            <text x="875" y="245" className="map-label-sm">CIVIL LAB</text>
            <rect x="840" y="430" width="70" height="55" rx="8" fill="var(--map-sky)" />
            <text x="875" y="462" className="map-label-sm">MECH W/S</text>
            <rect x="840" y="505" width="70" height="55" rx="8" fill="var(--map-mint)" />
            <text x="875" y="537" className="map-label-sm">ELECT W/S</text>
            <rect x="640" y="110" width="80" height="70" rx="8" fill="var(--map-sky)" />
            <text x="680" y="150" className="map-label-sm">VOLLEYBALL</text>
            <circle cx="520" cy="150" r="26" fill="var(--map-water)" />
            <text x="520" y="200" className="map-label-sm">O.H TANK</text>

            <rect x="430" y="1155" width="130" height="34" rx="6" fill="var(--map-pink)" opacity="0.8" />
            <text x="495" y="1177" className="map-label-sm">CAR PARKING</text>
            <rect x="620" y="1150" width="75" height="70" rx="6" fill="var(--map-amber)" opacity="0.85" />
            <text x="657" y="1190" className="map-label-sm">2-WHEELER</text>
            <rect x="620" y="1235" width="80" height="60" rx="6" fill="var(--map-sky)" />
            <text x="660" y="1270" className="map-label-sm">BASKETBALL</text>
            <rect x="620" y="1310" width="80" height="60" rx="6" fill="var(--map-mint)" />
            <text x="660" y="1345" className="map-label-sm">AUDITORIUM</text>
            <rect x="820" y="1330" width="60" height="34" rx="6" fill="var(--map-amber)" opacity="0.8" />
            <text x="850" y="1352" className="map-label-sm">SECURITY</text>
            <rect x="715" y="1378" width="90" height="14" rx="4" fill="var(--map-gate)" />
            <text x="760" y="1372" className="map-label-sm">MAIN GATE</text>
          </g>

          {/* north arrow */}
          <g>
            <path d="M400 120 L415 165 L400 155 L385 165 Z" fill="var(--map-amber)" />
            <text x="400" y="105" className="map-label-sm">N</text>
          </g>

          {/* route */}
          {routePath && routePath.length > 1 && (
            <g filter="url(#routeGlow)">
              <polyline
                points={routePoints}
                fill="none"
                stroke="var(--route)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.35"
              />
              <polyline
                points={routePoints}
                fill="none"
                stroke="var(--route)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="26 22"
                className="route-dash"
              />
              <circle cx={NODES[routePath[0]].x} cy={NODES[routePath[0]].y} r="14" fill="var(--route)" />
              <circle
                cx={NODES[routePath[routePath.length - 1]].x}
                cy={NODES[routePath[routePath.length - 1]].y}
                r="16"
                fill="none"
                stroke="var(--route)"
                strokeWidth="7"
                className="route-pulse"
              />
            </g>
          )}
        </svg>
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          aria-label="Zoom in"
          onClick={() => {
            const r = containerRef.current!.getBoundingClientRect();
            zoomAt(r.width / 2, r.height / 2, 1.3);
          }}
          className="map-ctrl"
        >
          +
        </button>
        <button
          aria-label="Zoom out"
          onClick={() => {
            const r = containerRef.current!.getBoundingClientRect();
            zoomAt(r.width / 2, r.height / 2, 1 / 1.3);
          }}
          className="map-ctrl"
        >
          −
        </button>
        <button aria-label="Reset view" onClick={reset} className="map-ctrl text-xs">
          ⟳
        </button>
      </div>
    </div>
  );
}
