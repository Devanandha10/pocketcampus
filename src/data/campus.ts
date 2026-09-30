export type FloorKey = "ground" | "first" | "second";

export const FLOORS: { key: FloorKey; label: string; short: string }[] = [
  { key: "ground", label: "Ground Floor", short: "G" },
  { key: "first", label: "First Floor", short: "1" },
  { key: "second", label: "Second Floor", short: "2" },
];

export type Block = {
  id: string;
  name: string;
  short: string;
  node: string;
  floors: Record<FloorKey, string[]>;
};

export const BLOCKS: Block[] = [
  {
    id: "admin",
    name: "Administration Block",
    short: "ADMIN",
    node: "adminDoor",
    floors: {
      ground: [
        "Reception",
        "Library",
        "Store",
        "S1/S2 CSE Classroom",
        "S1/S2 Civil Classroom",
        "Electrical Room",
        "Washroom",
      ],
      first: [
        "Main Office",
        "Computer Centre",
        "Engineering Unit",
        "SDPK-ASAP Lab",
        "Electrical Room",
        "Washroom",
      ],
      second: [
        "Mini Auditorium",
        "Examination Control Room",
        "KTU Centralised Valuation Camp",
        "Programming Lab",
        "S1/S2 ECE Classroom",
        "S1/S2 IT Classroom",
        "Electrical Room",
        "Washroom (Males)",
      ],
    },
  },
  {
    id: "csit",
    name: "CS/IT Block",
    short: "CS/IT",
    node: "csDoor",
    floors: {
      ground: [
        "CS Department Office",
        "HOD Office",
        "Systems Lab 1",
        "S3 CSE-A",
        "S3 CSE-B",
        "Washroom",
      ],
      first: [
        "Hardware Lab",
        "Faculty Cabins",
        "Server Room",
        "S5 CSE-A",
        "S5 CSE-B",
        "S3 IT Classroom",
      ],
      second: [
        "Project Lab",
        "Network Security Lab",
        "Department Library",
        "S7 CSE",
        "S5 IT",
        "S7 IT",
      ],
    },
  },
  {
    id: "mca",
    name: "MCA Block",
    short: "MCA",
    node: "mcaDoor",
    floors: {
      ground: ["MCA Office", "Seminar Hall", "Data Structures Lab", "S1 MCA Classroom", "Washroom"],
      first: ["Research Lab", "Faculty Rooms", "Tutorial Room", "S2 MCA Classroom", "S3 MCA Classroom"],
      second: ["Web Technology Lab", "Placement Cell Interview Room", "Lounge", "Washroom"],
    },
  },
  {
    id: "ecei",
    name: "EC/EI Block",
    short: "EC/EI",
    node: "ecDoor",
    floors: {
      ground: ["ECE HOD Office", "Electronics Circuits Lab", "S3 ECE-A", "S3 ECE-B", "Washroom"],
      first: [
        "Digital Electronics Lab",
        "Microprocessor Lab",
        "Faculty Rooms",
        "S5 ECE-A",
        "S5 ECE-B",
      ],
      second: [
        "VLSI & Embedded Systems Lab",
        "Communication Lab",
        "S7 ECE",
        "S3 EI Classroom",
        "S5 EI Classroom",
      ],
    },
  },
  {
    id: "ceeee",
    name: "CE/EEE Block",
    short: "CE/EEE",
    node: "ceDoor",
    floors: {
      ground: [
        "Civil & EEE Workshop",
        "Concrete Lab",
        "Electrical Machines Lab",
        "HOD Office",
        "Washroom",
      ],
      first: ["Survey Lab", "Power Electronics Lab", "Faculty Lounge", "S3 Civil", "S3 EEE"],
      second: ["CAD Lab", "Seminar Room", "S5 Civil", "S7 Civil", "S5 EEE", "S7 EEE"],
    },
  },
];

export const OUTDOOR: { id: string; name: string; node: string }[] = [
  { id: "gate", name: "Main Gate", node: "gate" },
  { id: "canteen", name: "Canteen", node: "canteen" },
  { id: "parking", name: "Parking (Staff & Students)", node: "parking" },
  { id: "auditorium", name: "Proposed Auditorium", node: "auditorium" },
  { id: "basketball", name: "Basketball Court", node: "basketball" },
  { id: "substation", name: "Sub Station", node: "substation" },
];

/* ---------- road graph (map coordinate space: 1000 x 1400) ---------- */

export const NODES: Record<string, { x: number; y: number }> = {
  gate: { x: 760, y: 1350 },
  fork: { x: 760, y: 1160 },
  plaza: { x: 760, y: 1000 },
  parking: { x: 555, y: 1180 },
  basketball: { x: 690, y: 1265 },
  auditorium: { x: 690, y: 1340 },
  adminFront: { x: 600, y: 1160 },
  adminDoor: { x: 600, y: 1095 },
  ringBR: { x: 810, y: 880 },
  ringBC: { x: 600, y: 880 },
  ringBL: { x: 390, y: 880 },
  ringML: { x: 390, y: 550 },
  ringTL: { x: 390, y: 240 },
  ringTC: { x: 600, y: 240 },
  ringTR: { x: 810, y: 240 },
  ringRT: { x: 810, y: 400 },
  ringRM: { x: 810, y: 650 },
  midA: { x: 600, y: 400 },
  midM: { x: 600, y: 550 },
  midB: { x: 600, y: 700 },
  ecDoor: { x: 560, y: 400 },
  ceDoor: { x: 640, y: 400 },
  mcaDoor: { x: 560, y: 700 },
  csDoor: { x: 640, y: 700 },
  canteen: { x: 900, y: 650 },
  substation: { x: 900, y: 780 },
};

export const EDGES: [string, string][] = [
  ["gate", "auditorium"],
  ["gate", "fork"],
  ["fork", "basketball"],
  ["fork", "parking"],
  ["fork", "adminFront"],
  ["adminFront", "adminDoor"],
  ["fork", "plaza"],
  ["plaza", "ringBR"],
  ["plaza", "ringBC"],
  ["ringBR", "ringBC"],
  ["ringBC", "ringBL"],
  ["ringBL", "ringML"],
  ["ringML", "ringTL"],
  ["ringTL", "ringTC"],
  ["ringTC", "ringTR"],
  ["ringTR", "ringRT"],
  ["ringRT", "ringRM"],
  ["ringRM", "ringBR"],
  ["ringRM", "canteen"],
  ["ringRM", "substation"],
  ["ringTC", "midA"],
  ["midA", "midM"],
  ["midM", "midB"],
  ["midB", "ringBC"],
  ["midA", "ecDoor"],
  ["midA", "ceDoor"],
  ["midB", "mcaDoor"],
  ["midB", "csDoor"],
];

export type Destination = {
  value: string;
  label: string;
  node: string;
  blockId?: string;
  floor?: FloorKey;
  room?: string;
};

export function buildDestinations(): Destination[] {
  const list: Destination[] = [];
  for (const o of OUTDOOR) list.push({ value: `out:${o.id}`, label: o.name, node: o.node });
  for (const b of BLOCKS) {
    list.push({ value: `block:${b.id}`, label: b.name, node: b.node, blockId: b.id });
    for (const f of FLOORS) {
      for (const room of b.floors[f.key]) {
        list.push({
          value: `room:${b.id}:${f.key}:${room}`,
          label: `${b.short} → ${room}`,
          node: b.node,
          blockId: b.id,
          floor: f.key,
          room,
        });
      }
    }
  }
  return list;
}

export function findPath(from: string, to: string): string[] | null {
  if (from === to) return [from];
  const adj: Record<string, string[]> = {};
  for (const [a, b] of EDGES) {
    (adj[a] ||= []).push(b);
    (adj[b] ||= []).push(a);
  }
  const queue = [from];
  const prev: Record<string, string | null> = { [from]: null };
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === to) break;
    for (const next of adj[cur] ?? []) {
      if (!(next in prev)) {
        prev[next] = cur;
        queue.push(next);
      }
    }
  }
  if (!(to in prev)) return null;
  const path: string[] = [];
  let cur: string | null = to;
  while (cur) {
    path.unshift(cur);
    cur = prev[cur];
  }
  return path;
}

export function pathLength(path: string[]): number {
  let d = 0;
  for (let i = 1; i < path.length; i++) {
    const a = NODES[path[i - 1]];
    const b = NODES[path[i]];
    d += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return d;
}

export function walkMinutes(path: string[]): number {
  // ~150 map units ≈ 1 minute of walking
  return Math.max(1, Math.round(pathLength(path) / 150));
}

export const NODE_LABELS: Record<string, string> = {
  gate: "Main Gate",
  fork: "the road split past the security cabin",
  plaza: "the Administration forecourt",
  parking: "the staff car parking",
  basketball: "the Basketball Court",
  auditorium: "the Proposed Auditorium",
  adminFront: "the Administration approach road",
  adminDoor: "the Administration Block entrance",
  ringBR: "the south-east service road corner",
  ringBC: "the south service road",
  ringBL: "the south-west service road corner",
  ringML: "the west service road",
  ringTL: "the north-west corner",
  ringTC: "the north service road",
  ringTR: "the north-east corner",
  ringRT: "the east service road",
  ringRM: "the east service road (near the Sub Station)",
  midA: "the upper internal road",
  midM: "the central internal road",
  midB: "the lower internal road",
  ecDoor: "the EC/EI Block entrance",
  ceDoor: "the CE/EEE Block entrance",
  mcaDoor: "the MCA Block entrance",
  csDoor: "the CS/IT Block entrance",
  canteen: "the Canteen",
  substation: "the Sub Station",
};
