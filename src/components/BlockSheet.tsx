import { useState } from "react";
import { BLOCKS, FLOORS, type FloorKey } from "@/data/campus";

type Props = {
  blockId: string;
  onClose: () => void;
  onNavigate: (blockId: string, floor: FloorKey, room: string) => void;
  initialFloor?: FloorKey;
};

export default function BlockSheet({ blockId, onClose, onNavigate, initialFloor }: Props) {
  const block = BLOCKS.find((b) => b.id === blockId)!;
  const [floor, setFloor] = useState<FloorKey>(initialFloor ?? "ground");

  return (
    <div className="panel flex max-h-[70vh] flex-col overflow-hidden md:max-h-full">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.2em] text-accent">Indoor directory</p>
          <h2 className="truncate font-display text-lg font-bold text-foreground">{block.name}</h2>
        </div>
        <button onClick={onClose} className="btn-ghost shrink-0" aria-label="Close">
          ✕
        </button>
      </div>

      <div className="flex gap-2 px-4 py-3">
        {FLOORS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFloor(f.key)}
            className={floor === f.key ? "chip chip-active" : "chip"}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="flex-1 space-y-1.5 overflow-y-auto px-4 pb-4">
        {block.floors[floor].map((room) => (
          <li key={room}>
            <button
              onClick={() => onNavigate(block.id, floor, room)}
              className="room-row"
            >
              <span className="min-w-0 truncate">{room}</span>
              <span className="shrink-0 text-xs text-accent">Navigate →</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
