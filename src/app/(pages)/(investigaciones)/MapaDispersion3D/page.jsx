"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { getEmbeddingMap } from "@/lib/api/research";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Box } from "lucide-react";

const DEFAULT_TOP_K = 5;
const DEFAULT_MIN_SCORE = 0.4;
const NODE_R = 0.13;

const CLUSTER_COLORS = [
  "#2563eb",
  "#d97706",
  "#059669",
  "#7c3aed",
  "#db2777",
  "#0891b2",
  "#c2410c",
  "#4d7c0f",
];

const toSafeInt = (v, fb) => { const n = parseInt(v, 10); return isFinite(n) && n > 0 ? n : fb; };
const toSafeFloat = (v, fb) => { const n = parseFloat(v); return isFinite(n) && n >= 0 ? n : fb; };
const fmtVal = (v) => (v == null ? "-" : String(v));
const edgeClr = (w) => (w >= 0.72 ? "#10b981" : w >= 0.52 ? "#f59e0b" : "#94a3b8");

function buildClusters(points, edges) {
  const parent = {};
  points.forEach((p) => (parent[p.id] = p.id));
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const union = (a, b) => { parent[find(a)] = find(b); };
  edges.forEach((e) => union(e.source, e.target));
  const rootMap = {};
  let idx = 0;
  const result = {};
  points.forEach((p) => {
    const r = find(p.id);
    if (!(r in rootMap)) rootMap[r] = idx++;
    result[p.id] = rootMap[r];
  });
  return result;
}

function buildPositions(points) {
  if (!points.length) return {};
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const zs = points.map((p) => p.z ?? 0);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  const maxR =
    Math.max(
      Math.max(...xs) - Math.min(...xs),
      Math.max(...ys) - Math.min(...ys),
      Math.max(...zs) - Math.min(...zs)
    ) || 1;
  const s = 6 / maxR;
  const out = {};
  points.forEach((p) => {
    out[p.id] = {
      x: (p.x - cx) * s,
      y: (p.y - cy) * s,
      z: ((p.z ?? 0) - cz) * s,
    };
  });
  return out;
}

function NodeMesh({ id, position, color, isSelected, isNeighbor, isDimmed, onSelect, onHover }) {
  const groupRef = useRef(null);
  const coreMatRef = useRef(null);
  const glowMatRef = useRef(null);
  const seed = useMemo(() => Math.abs((id * 1234567) % 997), [id]);
  const phase = useMemo(() => (seed / 997) * Math.PI * 2, [seed]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const freq = 0.45 + (seed % 7) * 0.07;
    const amp = isSelected ? 0.055 : isNeighbor ? 0.035 : 0.025;
    if (groupRef.current) {
      groupRef.current.position.y = position.y + Math.sin(t * freq + phase) * amp;
    }
    if (coreMatRef.current) {
      coreMatRef.current.emissiveIntensity = isDimmed
        ? 0.04
        : isSelected
          ? 0.6 + 0.1 * Math.sin(t * 1.6 + phase)
          : isNeighbor
            ? 0.45 + 0.1 * Math.sin(t * 1.6 + phase)
            : 0.22 + 0.1 * Math.sin(t * 1.6 + phase);
    }
    if (glowMatRef.current) {
      glowMatRef.current.opacity = isDimmed
        ? 0.01
        : (isSelected ? 0.2 : isNeighbor ? 0.15 : 0.08) + 0.04 * Math.sin(t * 1.2 + phase);
    }
  });

  const r = isSelected ? NODE_R * 1.5 : isNeighbor ? NODE_R * 1.2 : NODE_R;

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      {isSelected && (
        <mesh>
          <sphereGeometry args={[r * 2.4, 20, 20]} />
          <meshBasicMaterial color={color} transparent opacity={0.09} />
        </mesh>
      )}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[r, 32, 32]} />
        <meshStandardMaterial
          ref={coreMatRef}
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.55 : 0.22}
          metalness={0.2}
          roughness={0.22}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[r * 1.75, 20, 20]} />
        <meshBasicMaterial ref={glowMatRef} color={color} transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

export default function MapaDispersion3D() {
  useEffect(() => {
    const pb = document.body.style.overflow;
    const ph = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = pb;
      document.documentElement.style.overflow = ph;
      document.body.style.cursor = "auto";
    };
  }, []);

  const [topKInput, setTopKInput] = useState(String(DEFAULT_TOP_K));
  const [minScoreInput, setMinScoreInput] = useState(String(DEFAULT_MIN_SCORE));
  const [params, setParams] = useState({ top_k: DEFAULT_TOP_K, min_score: DEFAULT_MIN_SCORE });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapData, setMapData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      const d = await getEmbeddingMap({ dim: 3, top_k: params.top_k, min_score: params.min_score });
      if (!d) {
        setError("No se pudo cargar el mapa 3D.");
        setMapData(null);
      } else {
        setMapData(d);
        setSelectedId(null);
      }
      setLoading(false);
    })();
  }, [params]);

  const handleApply = (e) => {
    e.preventDefault();
    setParams({
      top_k: toSafeInt(topKInput, DEFAULT_TOP_K),
      min_score: toSafeFloat(minScoreInput, DEFAULT_MIN_SCORE),
    });
  };

  const points = mapData?.points ?? [];
  const edges = mapData?.edges ?? [];
  const metaEntries = mapData?.meta ? Object.entries(mapData.meta) : [];

  const ptMap = useMemo(() => Object.fromEntries(points.map((p) => [p.id, p])), [points]);
  const clusterIdx = useMemo(() => buildClusters(points, edges), [points, edges]);
  const positions = useMemo(() => buildPositions(points), [points]);

  const selPoint = selectedId != null ? ptMap[selectedId] : null;
  const hoverPoint = hoveredId != null ? ptMap[hoveredId] : null;

  const selEdges = useMemo(() => {
    if (selectedId == null) return [];
    return edges
      .filter((e) => e.source === selectedId || e.target === selectedId)
      .sort((a, b) => b.weight - a.weight);
  }, [edges, selectedId]);

  const clusterGroups = useMemo(() => {
    const g = {};
    points.forEach((p) => {
      const i = clusterIdx[p.id] ?? 0;
      if (!g[i]) g[i] = [];
      g[i].push(p);
    });
    return Object.entries(g).map(([i, pts]) => ({
      idx: Number(i),
      color: CLUSTER_COLORS[Number(i) % CLUSTER_COLORS.length],
      pts,
    }));
  }, [points, clusterIdx]);

  return (
    <main className="grow bg-slate-50/30">
      <div className="h-[calc(100vh-80px)] overflow-hidden px-4 py-4 md:px-6">
        {loading ? (
          <div className="h-full w-full flex flex-col items-center justify-center rounded-xl gap-6 relative overflow-hidden bg-slate-900">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(30,41,59,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(30,41,59,0.6) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
            <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
              {[
                { cx: "22%", cy: "38%", r: 5, c: "#2563eb", dur: "3s" },
                { cx: "48%", cy: "22%", r: 4, c: "#059669", dur: "2.6s" },
                { cx: "72%", cy: "42%", r: 6, c: "#7c3aed", dur: "3.4s" },
                { cx: "32%", cy: "64%", r: 4, c: "#d97706", dur: "2.9s" },
                { cx: "62%", cy: "68%", r: 5, c: "#db2777", dur: "3.1s" },
                { cx: "82%", cy: "52%", r: 3, c: "#0891b2", dur: "2.7s" },
                { cx: "55%", cy: "48%", r: 4, c: "#4d7c0f", dur: "3.6s" },
              ].map((d, i) => (
                <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.c}>
                  <animate attributeName="opacity" values="0.2;0.7;0.2" dur={d.dur} repeatCount="indefinite" />
                  <animate attributeName="r" values={`${d.r};${d.r * 1.5};${d.r}`} dur={d.dur} repeatCount="indefinite" />
                </circle>
              ))}
              {[
                ["22%", "38%", "48%", "22%"],
                ["48%", "22%", "72%", "42%"],
                ["72%", "42%", "62%", "68%"],
                ["32%", "64%", "55%", "48%"],
                ["55%", "48%", "82%", "52%"],
                ["22%", "38%", "32%", "64%"],
              ].map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth="1" strokeDasharray="5 5">
                  <animate attributeName="opacity" values="0;0.35;0" dur={`${2.8 + i * 0.3}s`} repeatCount="indefinite" />
                </line>
              ))}
            </svg>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Box className="w-8 h-8 text-purple-400" />
                </div>
                <div className="absolute inset-0 rounded-full border border-purple-500/40 animate-ping" />
              </div>
              <div className="text-center">
                <p className="text-white text-lg font-semibold">Generando mapa 3D</p>
                <p className="text-slate-400 text-sm mt-1.5">
                  Calculando reducción PCA de embeddings semánticos
                </p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <Card className="p-6">
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        ) : (
          <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1fr)_284px]">
            {/* ── 3D Canvas card ── */}
            <Card className="flex h-full flex-col p-4 overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-2 shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Mapa de Dispersión 3D
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Arrastra para rotar · Rueda para zoom · Click en un punto
                  </p>
                </div>
                <Link
                  href="/MapaDispersion"
                  className="text-xs text-[#831d16] hover:underline shrink-0"
                >
                  ← Ver en 2D
                </Link>
              </div>

              <div className="relative mt-3 flex-1 rounded-xl border border-slate-200 overflow-hidden min-h-0">
                {/* Hover label overlay */}
                {hoverPoint && !selPoint && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-black/65 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full pointer-events-none max-w-70 truncate text-center">
                    {hoverPoint.title}
                  </div>
                )}

                {points.length > 0 ? (
                  <Canvas
                    camera={{ position: [0, 3, 13], fov: 50, near: 0.1, far: 80 }}
                    dpr={[1, 1.5]}
                    onPointerMissed={() => setSelectedId(null)}
                    gl={{ antialias: true }}
                  >
                    <color attach="background" args={["#0f172a"]} />
                    <fog attach="fog" args={["#0f172a", 14, 34]} />

                    <ambientLight intensity={0.65} />
                    <pointLight position={[9, 9, 9]} intensity={1.2} />
                    <pointLight position={[-9, -6, -9]} intensity={0.5} color="#818cf8" />
                    <hemisphereLight args={["#1e293b", "#0f172a", 0.4]} />

                    <OrbitControls
                      enablePan
                      enableZoom
                      enableRotate
                      enableDamping
                      dampingFactor={0.1}
                      minDistance={4}
                      maxDistance={22}
                    />

                    {/* PCA axis guides */}
                    <Line points={[[-5.5, 0, 0], [5.5, 0, 0]]} color="#facc15" lineWidth={0.8} transparent opacity={0.35} />
                    <Line points={[[0, -5.5, 0], [0, 5.5, 0]]} color="#e879f9" lineWidth={0.8} transparent opacity={0.35} />
                    <Line points={[[0, 0, -5.5], [0, 0, 5.5]]} color="#38bdf8" lineWidth={0.8} transparent opacity={0.35} />

                    {/* Axis tip markers */}
                    {[
                      { pos: [5.5, 0, 0], c: "#facc15" },
                      { pos: [0, 5.5, 0], c: "#e879f9" },
                      { pos: [0, 0, 5.5], c: "#38bdf8" },
                    ].map(({ pos, c }) => (
                      <mesh key={c} position={pos}>
                        <sphereGeometry args={[0.07, 10, 10]} />
                        <meshBasicMaterial color={c} />
                      </mesh>
                    ))}

                    {/* Floor grid */}
                    <gridHelper args={[14, 20, "#1e293b", "#1e293b"]} position={[0, -4.5, 0]} />

                    {/* Edges */}
                    {edges.map((edge) => {
                      const s = positions[edge.source];
                      const t = positions[edge.target];
                      if (!s || !t) return null;
                      const active =
                        selectedId === edge.source || selectedId === edge.target;
                      return (
                        <Line
                          key={`${edge.source}-${edge.target}`}
                          points={[
                            [s.x, s.y, s.z],
                            [t.x, t.y, t.z],
                          ]}
                          color={active ? "#f43f5e" : edgeClr(edge.weight)}
                          lineWidth={active ? 2.8 : Math.max(0.5, edge.weight * 2)}
                          transparent
                          opacity={active ? 0.95 : 0.18 + edge.weight * 0.45}
                        />
                      );
                    })}

                    {/* Nodes */}
                    {(() => {
                      const neighborWeights = {};
                      if (selectedId != null) {
                        edges.forEach((e) => {
                          if (e.source === selectedId) neighborWeights[e.target] = e.weight;
                          else if (e.target === selectedId) neighborWeights[e.source] = e.weight;
                        });
                      }
                      return points.map((pt) => {
                        const pos = positions[pt.id];
                        if (!pos) return null;
                        const nw = neighborWeights[pt.id];
                        const isNeighbor = nw != null;
                        const isDimmed = selectedId != null && pt.id !== selectedId && !isNeighbor;
                        const clr = pt.id === selectedId
                          ? "#f43f5e"
                          : isNeighbor
                            ? edgeClr(nw)
                            : CLUSTER_COLORS[(clusterIdx[pt.id] ?? 0) % CLUSTER_COLORS.length];
                        return (
                          <NodeMesh
                            key={pt.id}
                            id={pt.id}
                            position={pos}
                            color={clr}
                            isSelected={pt.id === selectedId}
                            isNeighbor={isNeighbor}
                            isDimmed={isDimmed}
                            onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
                            onHover={setHoveredId}
                          />
                        );
                      });
                    })()}
                  </Canvas>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    No hay datos disponibles
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-red-400 opacity-70 shrink-0" />
                  PCA 1 (X)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-green-400 opacity-70 shrink-0" />
                  PCA 2 (Y)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-blue-400 opacity-70 shrink-0" />
                  PCA 3 (Z)
                </span>
                {clusterGroups.map((g) => (
                  <span key={g.idx} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: g.color }}
                    />
                    Cluster {g.idx + 1}
                    <span className="text-slate-400">({g.pts.length})</span>
                  </span>
                ))}
              </div>
            </Card>

            {/* ── Right panel ── */}
            <div className="flex h-full flex-col gap-3 overflow-y-auto">
              {/* Detail */}
              <Card className="p-4 shrink-0">
                <h3 className="text-sm font-semibold text-slate-800 mb-2.5">Detalle</h3>
                {selPoint ? (
                  <div className="space-y-3 text-sm">
                    <p className="font-medium text-slate-800 leading-snug">{selPoint.title}</p>
                    {selPoint.description && (
                      <p className="text-[11.5px] text-slate-500 line-clamp-4 leading-relaxed">
                        {selPoint.description}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-400 mb-0.5">ID</p>
                        <p className="font-medium">{selPoint.id}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 mb-0.5">Cluster</p>
                        <p className="font-medium flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full inline-block shrink-0"
                            style={{
                              background:
                                CLUSTER_COLORS[
                                  (clusterIdx[selPoint.id] ?? 0) % CLUSTER_COLORS.length
                                ],
                            }}
                          />
                          {(clusterIdx[selPoint.id] ?? 0) + 1}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-slate-400 mb-0.5">Coordenadas PCA (x, y, z)</p>
                        <p className="font-mono text-[10.5px] font-medium">
                          ({selPoint.x.toFixed(3)}, {selPoint.y.toFixed(3)},{" "}
                          {(selPoint.z ?? 0).toFixed(3)})
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                      <Link
                        href={`/Investigaciones/${selPoint.id}`}
                        className="text-xs text-[#831d16] hover:underline"
                      >
                        Ver investigación →
                      </Link>
                      {selPoint.research_link && (
                        <a
                          href={selPoint.research_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#831d16] hover:underline"
                        >
                          Abrir PDF →
                        </a>
                      )}
                    </div>
                    {selEdges.length > 0 && (
                      <div>
                        <p className="text-[10.5px] uppercase tracking-wide text-slate-400 mb-2">
                          Investigaciones similares
                        </p>
                        <p className="text-[10.5px] text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5 mb-2 leading-snug">
                          El score es la similitud <strong>real</strong>. En 3D se preserva más
                          varianza, pero sigue siendo una aproximación.
                        </p>
                        <div className="space-y-1">
                          {selEdges.map((edge) => {
                            const otherId =
                              edge.source === selectedId ? edge.target : edge.source;
                            const other = ptMap[otherId];
                            if (!other) return null;
                            const c = edgeClr(edge.weight);
                            return (
                              <button
                                key={`${edge.source}-${edge.target}`}
                                type="button"
                                onClick={() => setSelectedId(otherId)}
                                className="w-full flex items-center justify-between gap-2 text-xs rounded-lg bg-slate-50 px-2.5 py-2 hover:bg-slate-100 transition-colors text-left"
                              >
                                <span className="text-slate-700 truncate">{other.title}</span>
                                <span
                                  className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold"
                                  style={{ background: `${c}22`, color: c }}
                                >
                                  {edge.weight.toFixed(3)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Selecciona un punto para ver sus detalles.
                  </p>
                )}
              </Card>

              {/* 3D advantage explanation */}
              <Card className="p-4 shrink-0">
                <details open className="group">
                  <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-700 list-none [&::-webkit-details-marker]:hidden">
                    <span>¿Por qué 3D es mejor?</span>
                    <span className="text-slate-400 transition-transform duration-200 group-open:rotate-90">
                      &gt;
                    </span>
                  </summary>
                  <div className="mt-3 space-y-2.5 text-[11.5px] text-slate-500 leading-relaxed">
                    <p>
                      En la vista 2D, PCA comprime el espacio de alta dimensión a solo{" "}
                      <strong className="text-slate-700">2 ejes</strong>. La tercera dimensión
                      de varianza (PCA 3) se pierde, lo que puede hacer que puntos similares
                      aparezcan lejos.
                    </p>
                    <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2.5 space-y-1">
                      <p className="font-semibold text-blue-800 text-[11px] uppercase tracking-wide">
                        3D captura más información
                      </p>
                      <p className="text-blue-700 text-[11px] leading-relaxed">
                        Al agregar el eje Z (PCA 3), el mapa preserva{" "}
                        <strong>más varianza del embedding original</strong>. Investigaciones
                        que parecían alejadas en 2D pueden estar más cerca en 3D porque su
                        similitud vivía en esa tercera componente.
                      </p>
                    </div>
                    <p>
                      Los <strong className="text-slate-700">ejes de color</strong> en la
                      escena marcan las 3 dimensiones PCA:{" "}
                      <span className="text-yellow-500 font-semibold">amarillo = PCA1</span>,{" "}
                      <span className="text-fuchsia-500 font-semibold">fucsia = PCA2</span>,{" "}
                      <span className="text-sky-400 font-semibold">celeste = PCA3</span>.
                      Cada eje representa una "dirección temática" independiente en el espacio
                      semántico.
                    </p>
                    {/* Case 1 */}
                    <div className="rounded-lg bg-violet-50 border border-violet-200 px-3 py-2.5 space-y-1">
                      <p className="font-semibold text-violet-800 text-[11px] uppercase tracking-wide">
                        Puntos cercanos sin arista
                      </p>
                      <p className="text-violet-700 text-[11px] leading-relaxed">
                        Si dos puntos están cerca en la escena pero no tienen arista, su
                        similitud coseno real está <strong>por debajo del min_score</strong>{" "}
                        o fuera del <strong>top K</strong>. La proximidad en 3D no garantiza
                        similitud alta.
                      </p>
                      <p className="text-violet-700 text-[11px] leading-relaxed">
                        Baja el <strong>min_score</strong> o sube el <strong>Top K</strong>{" "}
                        en filtros para revelar esas conexiones.
                      </p>
                    </div>

                    {/* Case 2 */}
                    <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 space-y-1">
                      <p className="font-semibold text-amber-800 text-[11px] uppercase tracking-wide">
                        Arista alta pero puntos lejos
                      </p>
                      <p className="text-amber-700 text-[11px] leading-relaxed">
                        Incluso en 3D puede haber aristas de score alto entre puntos alejados,
                        porque la similitud vive en dimensiones más allá de PCA3.{" "}
                        <strong>Las aristas son siempre la fuente de verdad.</strong>
                      </p>
                    </div>
                  </div>
                </details>
              </Card>

              {/* Filters */}
              <Card className="p-4 shrink-0">
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-700 list-none [&::-webkit-details-marker]:hidden">
                    <span>Filtros</span>
                    <span className="text-slate-400 transition-transform duration-200 group-open:rotate-90">
                      &gt;
                    </span>
                  </summary>
                  <form onSubmit={handleApply} className="mt-3 flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-medium text-slate-600">Top K</label>
                      <Input
                        type="number"
                        min={1}
                        value={topKInput}
                        onChange={(e) => setTopKInput(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-medium text-slate-600">Min score</label>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        max={1}
                        value={minScoreInput}
                        onChange={(e) => setMinScoreInput(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Actualizar
                    </Button>
                  </form>
                </details>
              </Card>

              {/* Meta */}
              {metaEntries.length > 0 && (
                <Card className="p-4 shrink-0">
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-700 list-none [&::-webkit-details-marker]:hidden">
                      <span>Meta</span>
                      <span className="text-slate-400 transition-transform duration-200 group-open:rotate-90">
                        &gt;
                      </span>
                    </summary>
                    <div className="mt-3 space-y-1.5 text-[11.5px] text-slate-600">
                      {metaEntries.map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-2">
                          <span className="uppercase tracking-wide text-[10.5px] text-slate-400">
                            {k}
                          </span>
                          <span className="font-medium">{fmtVal(v)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
