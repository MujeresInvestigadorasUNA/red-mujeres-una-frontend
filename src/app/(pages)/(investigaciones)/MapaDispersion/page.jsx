"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getEmbeddingMap } from "@/lib/api/research";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Map as MapIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_TOP_K = 5;
const DEFAULT_MIN_SCORE = 0.6;

const CW = 1000;
const CH = 720;
const PL = 64, PR = 44, PT = 44, PB = 54;

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

const edgeColor = (w) => (w >= 0.72 ? "#10b981" : w >= 0.52 ? "#f59e0b" : "#94a3b8");

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

function ScatterPlot({ points, edges, selectedId, onSelect, clusterIdx }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const vbRef = useRef({ x: 0, y: 0, w: CW, h: CH });
  const dragRef = useRef(null);
  const didDrag = useRef(false);
  const [vb, setVb] = useState({ x: 0, y: 0, w: CW, h: CH });
  const [tooltip, setTooltip] = useState(null);

  const applyVb = useCallback((next) => { vbRef.current = next; setVb(next); }, []);
  const resetView = useCallback(() => applyVb({ x: 0, y: 0, w: CW, h: CH }), [applyVb]);

  const plotW = CW - PL - PR;
  const plotH = CH - PT - PB;

  const { eMinX, eMaxX, eMinY, eMaxY } = useMemo(() => {
    if (!points.length) return { eMinX: -1, eMaxX: 1, eMinY: -1, eMaxY: 1 };
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const mnx = Math.min(...xs), mxx = Math.max(...xs);
    const mny = Math.min(...ys), mxy = Math.max(...ys);
    const px = (mxx - mnx) * 0.14 || 0.15;
    const py = (mxy - mny) * 0.14 || 0.15;
    return { eMinX: mnx - px, eMaxX: mxx + px, eMinY: mny - py, eMaxY: mxy + py };
  }, [points]);

  const rX = eMaxX - eMinX;
  const rY = eMaxY - eMinY;

  const sx = useCallback((x) => PL + ((x - eMinX) / rX) * plotW, [eMinX, rX, plotW]);
  const sy = useCallback((y) => PT + plotH - ((y - eMinY) / rY) * plotH, [eMinY, rY, plotH]);

  const xTicks = useMemo(
    () => Array.from({ length: 5 }, (_, i) => eMinX + (rX / 4) * i),
    [eMinX, rX]
  );
  const yTicks = useMemo(
    () => Array.from({ length: 5 }, (_, i) => eMinY + (rY / 4) * i),
    [eMinY, rY]
  );

  const ptMap = useMemo(
    () => Object.fromEntries(points.map((p) => [p.id, p])),
    [points]
  );

  // Wheel zoom (needs passive:false)
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const f = e.deltaY > 0 ? 1.13 : 0.89;
      const rect = el.getBoundingClientRect();
      const v = vbRef.current;
      const mx = ((e.clientX - rect.left) / rect.width) * v.w + v.x;
      const my = ((e.clientY - rect.top) / rect.height) * v.h + v.y;
      applyVb({
        x: mx - (mx - v.x) * f,
        y: my - (my - v.y) * f,
        w: Math.max(80, Math.min(CW * 3, v.w * f)),
        h: Math.max(60, Math.min(CH * 3, v.h * f)),
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [applyVb]);

  const onMD = useCallback((e) => {
    if (e.button !== 0) return;
    didDrag.current = false;
    dragRef.current = { sx: e.clientX, sy: e.clientY, vb: { ...vbRef.current } };
  }, []);

  const onMM = useCallback((e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.sx;
    const dy = e.clientY - dragRef.current.sy;
    if (!didDrag.current && Math.abs(dx) + Math.abs(dy) > 4) didDrag.current = true;
    if (!didDrag.current) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const v = dragRef.current.vb;
    applyVb({ ...v, x: v.x - (dx / rect.width) * v.w, y: v.y - (dy / rect.height) * v.h });
  }, [applyVb]);

  const onMU = useCallback(() => { dragRef.current = null; }, []);

  const zoomCenter = useCallback((factor) => {
    const v = vbRef.current;
    const cx = v.x + v.w / 2, cy = v.y + v.h / 2;
    applyVb({
      x: cx - (v.w * factor) / 2,
      y: cy - (v.h * factor) / 2,
      w: Math.max(80, Math.min(CW * 3, v.w * factor)),
      h: Math.max(60, Math.min(CH * 3, v.h * factor)),
    });
  }, [applyVb]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        className="w-full h-full select-none"
        style={{ cursor: dragRef.current ? "grabbing" : "grab" }}
        onMouseDown={onMD}
        onMouseMove={onMM}
        onMouseUp={onMU}
        onMouseLeave={() => { onMU(); setTooltip(null); }}
        onClick={() => { if (!didDrag.current) onSelect(null); }}
      >
        {/* Background */}
        <rect width={CW} height={CH} fill="#0f172a" />

        {/* Grid */}
        {xTicks.map((t) => (
          <line key={`gx${t}`} x1={sx(t)} y1={PT} x2={sx(t)} y2={CH - PB}
            stroke="#1e293b" strokeWidth="1" strokeDasharray="4 3" />
        ))}
        {yTicks.map((t) => (
          <line key={`gy${t}`} x1={PL} y1={sy(t)} x2={CW - PR} y2={sy(t)}
            stroke="#1e293b" strokeWidth="1" strokeDasharray="4 3" />
        ))}

        {/* Axes */}
        <line x1={PL} y1={PT} x2={PL} y2={CH - PB} stroke="#334155" strokeWidth="1.5" />
        <line x1={PL} y1={CH - PB} x2={CW - PR} y2={CH - PB} stroke="#334155" strokeWidth="1.5" />

        {/* Tick labels X */}
        {xTicks.map((t) => (
          <text key={`xt${t}`} x={sx(t)} y={CH - PB + 18}
            textAnchor="middle" fontSize="11" fill="#94a3b8">
            {t.toFixed(2)}
          </text>
        ))}

        {/* Tick labels Y */}
        {yTicks.map((t) => (
          <text key={`yt${t}`} x={PL - 8} y={sy(t) + 4}
            textAnchor="end" fontSize="11" fill="#94a3b8">
            {t.toFixed(2)}
          </text>
        ))}

        {/* Axis titles */}
        <text x={PL + plotW / 2} y={CH - 10}
          textAnchor="middle" fontSize="12" fill="#94a3b8" fontWeight="500">
          Dimensión PCA 1
        </text>
        <text x={16} y={PT + plotH / 2}
          textAnchor="middle" fontSize="12" fill="#94a3b8" fontWeight="500"
          transform={`rotate(-90, 16, ${PT + plotH / 2})`}>
          Dimensión PCA 2
        </text>

        {/* Edges */}
        {edges.map((edge) => {
          const s = ptMap[edge.source], t = ptMap[edge.target];
          if (!s || !t) return null;
          const active = selectedId != null && (edge.source === selectedId || edge.target === selectedId);
          const stroke = active ? "#f43f5e" : edgeColor(edge.weight);
          const opacity = active ? 0.9 : Math.min(0.65, 0.18 + edge.weight * 0.75);
          const sw = active ? 2.8 : Math.max(0.8, edge.weight * 2.5);
          const mx = (sx(s.x) + sx(t.x)) / 2;
          const my = (sy(s.y) + sy(t.y)) / 2;
          return (
            <g key={`e${edge.source}-${edge.target}`}>
              <line
                x1={sx(s.x)} y1={sy(s.y)} x2={sx(t.x)} y2={sy(t.y)}
                stroke={stroke} strokeWidth={sw} opacity={opacity}
                strokeDasharray={active ? "none" : "6 4"}
              />
              {active && (
                <text x={mx} y={my - 7} textAnchor="middle" fontSize="11"
                  fill="#f43f5e" fontWeight="700"
                  style={{ filter: "drop-shadow(0 1px 3px #0f172a)" }}>
                  {edge.weight.toFixed(3)}
                </text>
              )}
            </g>
          );
        })}

        {/* Points */}
        {(() => {
          const neighborWeights = {};
          if (selectedId != null) {
            edges.forEach((e) => {
              if (e.source === selectedId) neighborWeights[e.target] = e.weight;
              else if (e.target === selectedId) neighborWeights[e.source] = e.weight;
            });
          }
          const hasSelection = selectedId != null;
          return points.map((pt) => {
          const cx = sx(pt.x), cy = sy(pt.y);
          const isSel = pt.id === selectedId;
          const nw = neighborWeights[pt.id];
          const isNeighbor = nw != null;
          const clr = isSel
            ? "#f43f5e"
            : isNeighbor
              ? edgeColor(nw)
              : CLUSTER_COLORS[(clusterIdx[pt.id] ?? 0) % CLUSTER_COLORS.length];
          const r = isSel ? 14 : isNeighbor ? 11 : 9;
          const pointOpacity = hasSelection && !isSel && !isNeighbor ? 0.22 : 1;
          const lbl = pt.title.length > 16 ? `${pt.title.slice(0, 16)}…` : pt.title;
          return (
            <g key={pt.id} opacity={pointOpacity}>
              {(isSel || isNeighbor) && (
                <circle cx={cx} cy={cy} r={r + (isSel ? 9 : 6)} fill={clr} opacity={isSel ? 0.13 : 0.12} />
              )}
              {/* Drop shadow */}
              <circle cx={cx + 1.5} cy={cy + 1.5} r={r} fill="#ffffff08" />
              <circle
                cx={cx} cy={cy} r={r}
                fill={clr} stroke="#0f172a" strokeWidth={1.5}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!didDrag.current) onSelect(pt.id === selectedId ? null : pt.id);
                }}
                onMouseEnter={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, pt });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
              <text
                x={cx} y={cy + r + 14}
                textAnchor="middle" fontSize="10"
                fill={isSel ? "#f43f5e" : isNeighbor ? clr : "#94a3b8"}
                fontWeight={isSel || isNeighbor ? "700" : "500"}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {lbl}
              </text>
            </g>
          );
        });
        })()}
      </svg>

      {/* Rich HTML Tooltip */}
      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none bg-white border border-slate-200 shadow-2xl rounded-xl p-3.5 w-60"
          style={{
            left: Math.min(tooltip.x + 16, (containerRef.current?.clientWidth ?? 600) - 252),
            top: Math.max(tooltip.y - 90, 8),
          }}
        >
          <p className="font-semibold text-sm text-slate-800 leading-snug line-clamp-2">
            {tooltip.pt.title}
          </p>
          {tooltip.pt.description && (
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
              {tooltip.pt.description}
            </p>
          )}
          <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1 text-[10px] text-slate-400 font-mono">
            <span>x: {tooltip.pt.x.toFixed(4)}</span>
            <span>y: {tooltip.pt.y.toFixed(4)}</span>
          </div>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute right-3 bottom-3 flex flex-col gap-1.5">
        {[
          { label: "+", factor: 0.78, title: "Acercar" },
          { label: "−", factor: 1.28, title: "Alejar" },
        ].map(({ label, factor, title }) => (
          <button
            key={label}
            type="button"
            title={title}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 shadow text-slate-600 text-base font-bold hover:bg-slate-50 transition-colors"
            onClick={(e) => { e.stopPropagation(); zoomCenter(factor); }}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          title="Resetear vista"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 shadow text-slate-500 text-sm hover:bg-slate-50 transition-colors"
          onClick={(e) => { e.stopPropagation(); resetView(); }}
        >
          ↺
        </button>
      </div>
    </div>
  );
}

export default function MapaDispersion() {
  const [topKInput, setTopKInput] = useState(String(DEFAULT_TOP_K));
  const [minScoreInput, setMinScoreInput] = useState(String(DEFAULT_MIN_SCORE));
  const [params, setParams] = useState({ top_k: DEFAULT_TOP_K, min_score: DEFAULT_MIN_SCORE });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapData, setMapData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      const d = await getEmbeddingMap({ dim: 2, top_k: params.top_k, min_score: params.min_score });
      if (!d) {
        setError("No se pudo cargar el mapa de dispersión.");
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

  const selPoint = selectedId != null ? ptMap[selectedId] : null;
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
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 text-center max-w-sm">
              {/* Spinner */}
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#2563eb] animate-spin" />
                <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-[#0891b2] animate-spin" style={{ animationDuration: "1.4s", animationDirection: "reverse" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-[#2563eb]/20 animate-pulse" />
                </div>
              </div>

              {/* Texto */}
              <div className="flex flex-col gap-2">
                <h2 className="text-base font-semibold text-slate-800">Generando mapa 2D</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Calculando reducción PCA de embeddings semánticos...
                </p>
              </div>

              {/* Dots de cluster */}
              <div className="flex items-center gap-3">
                {[["#2563eb", "0s"], ["#d97706", "0.2s"], ["#059669", "0.4s"], ["#7c3aed", "0.6s"], ["#0891b2", "0.8s"]].map(([color, delay], i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full animate-bounce"
                    style={{ backgroundColor: color, animationDelay: delay, animationDuration: "1.1s" }}
                  />
                ))}
              </div>

              {/* Skeleton lines */}
              <div className="w-full flex flex-col gap-2">
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-2 w-4/5 rounded-full" />
                <Skeleton className="h-2 w-3/5 rounded-full" />
              </div>
            </div>
          </div>
        ) : error ? (
          <Card className="p-6">
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        ) : (
          <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1fr)_284px]">
            {/* ── Scatter plot ── */}
            <Card className="flex h-full flex-col p-4 overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-2 shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Mapa de Dispersión Semántico
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Rueda del mouse para zoom · Arrastra para mover · Click en un punto para detalles
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/MapaDispersion3D"
                    className="text-xs text-[#831d16] hover:underline shrink-0"
                  >
                    Ver en 3D →
                  </Link>
                  {selectedId != null && (
                    <Button variant="outline" size="sm" type="button" onClick={() => setSelectedId(null)}>
                      Limpiar selección
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-3 flex-1 rounded-xl border border-slate-700 overflow-hidden min-h-0 bg-slate-900">
                {points.length > 0 ? (
                  <ScatterPlot
                    points={points}
                    edges={edges}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    clusterIdx={clusterIdx}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500 bg-slate-900">
                    No hay datos disponibles
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 shrink-0">
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
                <span className="ml-2 pl-3 border-l border-slate-200 flex items-center gap-1.5">
                  <span className="w-5 h-0.75 rounded bg-emerald-500 shrink-0" />
                  similitud ≥ 0.72
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-0.75 rounded bg-amber-400 shrink-0" />
                  ≥ 0.52
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-0 shrink-0 border-t-2 border-dashed border-slate-400" />
                  baja
                </span>
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
                                CLUSTER_COLORS[(clusterIdx[selPoint.id] ?? 0) % CLUSTER_COLORS.length],
                            }}
                          />
                          {(clusterIdx[selPoint.id] ?? 0) + 1}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-slate-400 mb-0.5">Coordenadas PCA</p>
                        <p className="font-mono font-medium text-[11px]">
                          ({selPoint.x.toFixed(4)}, {selPoint.y.toFixed(4)})
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
                          El score es la similitud <strong>real</strong> en el espacio original.
                          Un score alto no garantiza proximidad en el mapa (limitación del PCA).
                        </p>
                        <div className="space-y-1">
                          {selEdges.map((edge) => {
                            const otherId =
                              edge.source === selectedId ? edge.target : edge.source;
                            const other = ptMap[otherId];
                            if (!other) return null;
                            const c = edgeColor(edge.weight);
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

              {/* How it works */}
              <Card className="p-4 shrink-0">
                <details open className="group">
                  <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-700 list-none [&::-webkit-details-marker]:hidden">
                    <span>¿Por qué están ahí?</span>
                    <span className="text-slate-400 transition-transform duration-200 group-open:rotate-90">
                      &gt;
                    </span>
                  </summary>
                  <div className="mt-3 space-y-2.5 text-[11.5px] text-slate-500 leading-relaxed">
                    <p>
                      Cada investigación se convierte en un vector de{" "}
                      <strong className="text-slate-700">alta dimensión</strong> (miles de números)
                      usando el modelo{" "}
                      <strong className="text-slate-700">
                        {mapData?.meta?.embedding_model ?? "text-embedding-3-small"}
                      </strong>
                      , capturando el significado semántico completo del texto.
                    </p>
                    <p>
                      <strong className="text-slate-700">PCA</strong> comprime esos vectores a
                      solo 2 dimensiones para poder visualizarlos. Al hacer esa compresión,{" "}
                      <strong className="text-slate-700">
                        preserva la mayor varianza global
                      </strong>{" "}
                      del conjunto, pero inevitablemente pierde información.
                    </p>

                    {/* Case 1: close but no edge */}
                    <div className="rounded-lg bg-violet-50 border border-violet-200 px-3 py-2.5 space-y-1">
                      <p className="font-semibold text-violet-800 text-[11px] uppercase tracking-wide">
                        Puntos cercanos sin arista
                      </p>
                      <p className="text-violet-700 text-[11px] leading-relaxed">
                        Dos puntos pueden aparecer <strong>cerca en el mapa</strong> pero{" "}
                        <strong>sin arista</strong>. Esto significa que su similitud coseno
                        real en el espacio original está <strong>por debajo del min_score</strong>{" "}
                        o fuera del <strong>top K</strong>, aunque la proyección PCA los ubique
                        juntos por compartir varianza en esas 2 dimensiones.
                      </p>
                      <p className="text-violet-700 text-[11px] leading-relaxed">
                        Solución: baja el <strong>min_score</strong> o sube el{" "}
                        <strong>Top K</strong> en los filtros para ver más conexiones.
                      </p>
                    </div>

                    {/* Case 2: far but high score */}
                    <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 space-y-1">
                      <p className="font-semibold text-amber-800 text-[11px] uppercase tracking-wide">
                        Arista alta pero puntos lejos
                      </p>
                      <p className="text-amber-700 text-[11px] leading-relaxed">
                        También puede ocurrir lo contrario: una arista con{" "}
                        <strong>score alto</strong> entre puntos que aparecen{" "}
                        <strong>alejados</strong>. Su similitud vive en dimensiones que PCA
                        descartó al comprimir a 2D.
                      </p>
                      <p className="text-amber-700 text-[11px] leading-relaxed">
                        <strong>Las aristas son siempre la fuente de verdad.</strong>{" "}
                        La posición es una aproximación visual.
                      </p>
                    </div>

                    <p>
                      Las aristas conectan pares con similitud coseno superior a{" "}
                      <strong className="text-slate-700">
                        {mapData?.meta?.min_score ?? DEFAULT_MIN_SCORE}
                      </strong>{" "}
                      dentro de los <strong className="text-slate-700">top {mapData?.meta?.top_k ?? DEFAULT_TOP_K}</strong> vecinos.
                      Su <strong className="text-slate-700">grosor y color</strong> muestran
                      la similitud real:{" "}
                      <span className="text-emerald-600 font-semibold">verde = alta</span>,{" "}
                      <span className="text-amber-500 font-semibold">amarillo = media</span>,{" "}
                      <span className="text-slate-400 font-semibold">gris = baja</span>.
                    </p>
                    <p>
                      Los <strong className="text-slate-700">colores de los puntos</strong>{" "}
                      agrupan investigaciones del mismo cluster de conectividad (componente
                      conexo del grafo de similitud).
                    </p>
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
