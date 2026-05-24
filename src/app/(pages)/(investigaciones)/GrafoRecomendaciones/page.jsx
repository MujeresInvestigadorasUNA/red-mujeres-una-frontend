"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useUser } from "@/app/contexts/UserContext";
import { getRecommendationGraph, getResearchPdfUrl } from "@/lib/api/research";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_LIMIT = 15;
const DEFAULT_MIN_SCORE = 0.0;
const NODE_RADIUS = 0.16;
const EDGE_POINTS = 18;

const toSafeInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const toSafeFloat = (value, fallback) => {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
};

const formatValue = (value) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
};

const typeBadgeClass = (type) => {
  switch (type) {
    case "user":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "source":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    case "recommended":
      return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
};

const typeFillColor = (type) => {
  switch (type) {
    case "user":
      return "#2563eb";
    case "source":
      return "#d97706";
    case "recommended":
      return "#059669";
    default:
      return "#64748b";
  }
};

const relationStroke = (relation) => {
  if (relation === "interaction") return "#f59e0b";
  if (relation === "recommendation") return "#10b981";
  return "#94a3b8";
};

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const jitterFromHash = (hash, range) => ((hash % 1000) / 1000 - 0.5) * range;

const buildRadialLayout = (items, centerX, centerY, centerZ, radius, startAngle, endAngle) => {
  if (!items.length) return {};
  const layout = {};
  const span = endAngle - startAngle;
  const step = items.length === 1 ? 0 : span / (items.length - 1);
  items.forEach((item, index) => {
    const hash = hashString(item.id);
    const angle = startAngle + step * index;
    layout[item.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle) + jitterFromHash(hash, radius * 0.25),
      z: centerZ + jitterFromHash(Math.floor(hash / 10), radius * 0.35),
    };
  });
  return layout;
};

const buildInitialLayout = (nodes) => {
  const layout = {};
  if (!nodes.length) return layout;

  const centerX = 0;
  const centerY = 0;
  const centerZ = 0;

  const userNode = nodes.find((node) => node.type === "user") || nodes[0];
  layout[userNode.id] = { x: centerX, y: centerY, z: centerZ };

  const sources = nodes.filter((node) => node.type === "source");
  const recommended = nodes.filter((node) => node.type === "recommended");
  const other = nodes.filter(
    (node) => node.type !== "user" && node.type !== "source" && node.type !== "recommended"
  );

  Object.assign(
    layout,
    buildRadialLayout(
      sources,
      centerX - 2.1,
      centerY + 0.1,
      centerZ - 0.6,
      1.7,
      -Math.PI * 0.55,
      Math.PI * 0.55
    )
  );

  Object.assign(
    layout,
    buildRadialLayout(
      recommended,
      centerX + 2.1,
      centerY - 0.1,
      centerZ + 0.6,
      1.7,
      -Math.PI * 0.55,
      Math.PI * 0.55
    )
  );

  Object.assign(
    layout,
    buildRadialLayout(other, centerX, centerY - 2.2, centerZ, 1.25, Math.PI * 0.1, Math.PI * 1.9)
  );

  return layout;
};

const NodeMesh = ({ node, position, isActive, onSelect }) => {
  const color = typeFillColor(node.type);
  const scale = isActive ? 1.25 : 1;
  const radius = node.type === "user" ? NODE_RADIUS * 1.55 : NODE_RADIUS * 1.2;
  const glowRadius = radius * 1.9;
  const groupRef = useRef(null);
  const ringRef = useRef(null);
  const shellRef = useRef(null);
  const coreMaterialRef = useRef(null);
  const glowMaterialRef = useRef(null);
  const seed = useMemo(() => hashString(node.id), [node.id]);
  const phase = useMemo(() => (seed % 1000) / 1000 * Math.PI * 2, [seed]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const floatSpeed = 0.6 + (seed % 7) * 0.08;
    const floatAmp = isActive ? 0.14 : 0.08;
    const wobble = Math.sin(t * floatSpeed + phase);
    const wobble2 = Math.cos(t * floatSpeed * 0.7 + phase);

    if (groupRef.current) {
      groupRef.current.position.x = position.x + wobble2 * floatAmp * 0.6;
      groupRef.current.position.y = position.y + wobble * floatAmp;
      groupRef.current.position.z = position.z + Math.sin(t * floatSpeed * 0.85 + phase) * floatAmp * 0.5;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.6 + phase;
      ringRef.current.rotation.x = t * 0.35 + phase * 0.3;
    }

    if (shellRef.current) {
      const shellScale = 1 + 0.04 * Math.sin(t * 1.4 + phase);
      shellRef.current.scale.set(shellScale, shellScale, shellScale);
    }

    if (coreMaterialRef.current) {
      coreMaterialRef.current.emissiveIntensity =
        (isActive ? 0.55 : 0.35) + 0.15 * Math.sin(t * 1.6 + phase);
    }

    if (glowMaterialRef.current) {
      glowMaterialRef.current.opacity =
        (isActive ? 0.18 : 0.12) + 0.04 * Math.sin(t * 1.3 + phase);
    }
  });

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <mesh
        scale={[scale, scale, scale]}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(node.id);
        }}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          ref={coreMaterialRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.45}
          metalness={0.3}
          roughness={0.18}
        />
      </mesh>
      <mesh ref={shellRef} scale={[scale, scale, scale]}>
        <sphereGeometry args={[glowRadius, 32, 32]} />
        <meshBasicMaterial ref={glowMaterialRef} color={color} transparent opacity={0.14} />
      </mesh>
      <mesh ref={ringRef} scale={[scale, scale, scale]}>
        <torusGeometry args={[radius + 0.22, 0.03, 12, 64]} />
        <meshStandardMaterial color={color} transparent opacity={0.35} />
      </mesh>
      {isActive ? (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius + 0.08, 0.02, 12, 48]} />
            <meshStandardMaterial color={color} transparent opacity={0.35} />
          </mesh>
        </>
      ) : null}
    </group>
  );
};

export default function GrafoRecomendaciones() {
  const { user } = useUser();
  const userId = useMemo(() => user?.id ?? user?.user_id ?? null, [user]);

  const [limitInput, setLimitInput] = useState(String(DEFAULT_LIMIT));
  const [minScoreInput, setMinScoreInput] = useState(String(DEFAULT_MIN_SCORE));
  const [params, setParams] = useState({
    limit: DEFAULT_LIMIT,
    minScore: DEFAULT_MIN_SCORE,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [graphData, setGraphData] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    const fetchGraph = async () => {
      if (!userId) return;

      setLoading(true);
      setErrorMessage("");

      const data = await getRecommendationGraph({
        user_id: userId,
        limit: params.limit,
        min_score: params.minScore,
      });

      if (!data) {
        setErrorMessage("No se pudo cargar el grafo de recomendacion.");
        setGraphData(null);
        setLoading(false);
        return;
      }

      setGraphData(data);
      setSelectedNodeId(null);
      setLoading(false);
    };

    fetchGraph();
  }, [params.limit, params.minScore, userId]);

  const handleApplyFilters = (event) => {
    event.preventDefault();
    setParams({
      limit: toSafeInt(limitInput, DEFAULT_LIMIT),
      minScore: toSafeFloat(minScoreInput, DEFAULT_MIN_SCORE),
    });
  };

  const handleOpenDocument = async (researchId) => {
    if (!researchId) {
      return;
    }

    try {
      const result = await getResearchPdfUrl(researchId);
      if (!result?.inlineUrl) {
        console.error("No PDF url available for research", researchId);
        return;
      }

      window.open(result.inlineUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error fetching research PDF url:", error);
    }
  };

  const metaEntries = graphData?.meta ? Object.entries(graphData.meta) : [];
  const nodes = graphData?.nodes ?? [];
  const edges = graphData?.edges ?? [];
  const nodeMap = useMemo(
    () => Object.fromEntries(nodes.map((node) => [node.id, node])),
    [nodes]
  );
  const nodePositions = useMemo(() => buildInitialLayout(nodes), [nodes]);
  const edgeLines = useMemo(() => {
    return edges
      .map((edge) => {
        const start = nodePositions[edge.source];
        const end = nodePositions[edge.target];
        if (!start || !end) return null;
        const startVec = new THREE.Vector3(start.x, start.y, start.z);
        const endVec = new THREE.Vector3(end.x, end.y, end.z);
        const mid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(endVec, startVec).normalize();
        let perp = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));
        if (perp.lengthSq() < 0.001) {
          perp = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 0, 1));
        }
        perp.normalize();
        const weight = Number(edge.weight) || 1;
        const hash = hashString(`${edge.source}-${edge.target}-${edge.relation}`);
        const sign = hash % 2 === 0 ? 1 : -1;
        const offset = 0.25 + Math.min(0.5, weight * 0.08);
        mid.addScaledVector(perp, offset * sign);
        mid.z += edge.relation === "recommendation" ? 0.35 : -0.2;
        const curve = new THREE.CatmullRomCurve3([startVec, mid, endVec]);
        const points = curve.getPoints(EDGE_POINTS);
        const isActive =
          selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);

        return {
          key: `${edge.source}-${edge.target}-${edge.relation}`,
          points,
          relation: edge.relation,
          weight,
          isActive,
        };
      })
      .filter(Boolean);
  }, [edges, nodePositions, selectedNodeId]);

  return (
    <main className="flex-grow bg-slate-50/30">
      {!userId ? (
        <div className="px-6 py-10 md:px-10">
          <Card className="p-6">
            <p className="text-sm text-slate-600">Inicia sesion para ver tu grafo.</p>
          </Card>
        </div>
      ) : (
        <div className="h-[calc(100vh-80px)] overflow-hidden px-4 py-4 md:px-6">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-6 text-center max-w-sm">
                {/* Spinner 3D */}
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#E7473C] animate-spin" />
                  <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-[#831d16] animate-spin" style={{ animationDuration: "1.4s", animationDirection: "reverse" }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-[#E7473C]/20 animate-pulse" />
                  </div>
                </div>

                {/* Texto */}
                <div className="flex flex-col gap-2">
                  <h2 className="text-base font-semibold text-slate-800">Generando grafo IA</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Analizando investigaciones y calculando conexiones semánticas...
                  </p>
                </div>

                {/* Nodos animados simulando el grafo */}
                <div className="flex items-center gap-3">
                  {[["#2563eb", "0s"], ["#d97706", "0.2s"], ["#059669", "0.4s"], ["#E7473C", "0.6s"], ["#8b5cf6", "0.8s"]].map(([color, delay], i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full animate-bounce"
                      style={{ backgroundColor: color, animationDelay: delay, animationDuration: "1.1s" }}
                    />
                  ))}
                </div>

                {/* Líneas de skeleton */}
                <div className="w-full flex flex-col gap-2">
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-2 w-4/5 rounded-full" />
                  <Skeleton className="h-2 w-3/5 rounded-full" />
                </div>
              </div>
            </div>
          ) : errorMessage ? (
            <Card className="p-6">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </Card>
          ) : (
            <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <Card className="flex h-full flex-col p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-800">Grafo 3D</h2>
                    <span className="text-xs text-slate-500">Click para seleccionar, arrastra para rotar.</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedNodeId(null)}
                  >
                    Limpiar seleccion
                  </Button>
                </div>
                <div className="mt-4 flex-1 rounded-xl border border-slate-200 bg-white">
                  <div className="relative h-full w-full overflow-hidden">
                    <Canvas
                      camera={{ position: [0, 0.2, 7], fov: 48, near: 0.1, far: 50 }}
                      dpr={[1, 1.5]}
                      onPointerMissed={() => setSelectedNodeId(null)}
                      gl={{ antialias: true }}
                    >
                      <color attach="background" args={["#f8fafc"]} />
                      <fog attach="fog" args={["#f8fafc", 6, 14]} />
                      <ambientLight intensity={0.7} />
                      <pointLight position={[6, 6, 6]} intensity={1} />
                      <pointLight position={[-6, -4, -6]} intensity={0.6} />
                      <hemisphereLight args={["#ffffff", "#cbd5f5", 0.35]} />
                      <OrbitControls
                        enablePan
                        enableZoom
                        enableRotate
                        enableDamping
                        dampingFactor={0.12}
                        minDistance={3}
                        maxDistance={8}
                      />

                      {edgeLines.map((edge) => (
                        <Line
                          key={edge.key}
                          points={edge.points}
                          color={relationStroke(edge.relation)}
                          lineWidth={edge.isActive ? 2.4 : 1.3}
                          transparent
                          opacity={edge.isActive ? 0.9 : 0.35}
                        />
                      ))}

                      {nodes.map((node) => {
                        const position = nodePositions[node.id];
                        if (!position) return null;

                        return (
                          <NodeMesh
                            key={node.id}
                            node={node}
                            position={position}
                            isActive={node.id === selectedNodeId}
                            onSelect={setSelectedNodeId}
                          />
                        );
                      })}
                    </Canvas>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#2563eb]"></span>
                    Usuario
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#d97706]"></span>
                    Fuente
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#059669]"></span>
                    Recomendacion
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-[2px] w-6 bg-[#f59e0b]"></span>
                    Interaccion
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-[2px] w-6 bg-[#10b981]"></span>
                    Score
                  </span>
                </div>
              </Card>

              <div className="flex h-full flex-col gap-3 overflow-hidden">
                <Card className="p-4">
                  <details open className="group">
                    <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-800 list-none [&::-webkit-details-marker]:hidden">
                      <span>Detalle</span>
                      <span className="text-xs text-slate-400 transition-transform duration-200 group-open:rotate-90">
                        &gt;
                      </span>
                    </summary>
                    <div className="mt-3 space-y-2">
                      <div className="mb-3">
                        <p className="text-xs text-slate-500">
                          Grafo de recomendacion por usuario.
                        </p>
                      </div>
                      {selectedNodeId ? (
                        <div className="space-y-2 text-sm text-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase text-slate-500">Tipo</span>
                            <Badge className={typeBadgeClass(nodeMap[selectedNodeId]?.type)}>
                              {nodeMap[selectedNodeId]?.type || "-"}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-slate-500">Label</p>
                            <p className="text-sm font-medium text-slate-800">
                              {nodeMap[selectedNodeId]?.label || "-"}
                            </p>
                          </div>
                          <div className="grid gap-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Research</span>
                              {nodeMap[selectedNodeId]?.research_id ? (
                                <Link
                                  className="text-[#831d16] hover:underline"
                                  href={`/Investigaciones/${nodeMap[selectedNodeId].research_id}`}
                                >
                                  {nodeMap[selectedNodeId].research_id}
                                </Link>
                              ) : (
                                <span>-</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Status</span>
                              <span>{formatValue(nodeMap[selectedNodeId]?.status)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Likes</span>
                              <span>{formatValue(nodeMap[selectedNodeId]?.likes_count)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Liked</span>
                              <span>{formatValue(nodeMap[selectedNodeId]?.is_liked)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 pt-2">
                            {nodeMap[selectedNodeId]?.research_link ? (
                              <button
                                type="button"
                                className="text-xs text-[#831d16] hover:underline text-left"
                                onClick={() => handleOpenDocument(nodeMap[selectedNodeId]?.research_id)}
                              >
                                Abrir documento
                              </button>
                            ) : null}
                            {nodeMap[selectedNodeId]?.vector_link ? (
                              <a
                                className="text-xs text-[#831d16] hover:underline"
                                href={nodeMap[selectedNodeId].vector_link}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Ver vector
                              </a>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">
                          Selecciona un nodo para ver sus detalles.
                        </p>
                      )}
                    </div>
                  </details>
                </Card>

                <Card className="p-3">
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-700 list-none [&::-webkit-details-marker]:hidden">
                      <span>Filtros</span>
                      <span className="text-[11px] text-slate-400 transition-transform duration-200 group-open:rotate-90">
                        &gt;
                      </span>
                    </summary>
                    <form
                      onSubmit={handleApplyFilters}
                      className="mt-3 flex flex-col gap-3"
                    >
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-medium text-slate-600">Limit</label>
                        <Input
                          type="number"
                          min={1}
                          value={limitInput}
                          onChange={(event) => setLimitInput(event.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-medium text-slate-600">Min score</label>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={minScoreInput}
                          onChange={(event) => setMinScoreInput(event.target.value)}
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Actualizar
                      </Button>
                    </form>
                  </details>
                </Card>

                <Card className="p-3">
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-700 list-none [&::-webkit-details-marker]:hidden">
                      <span>Meta</span>
                      <span className="text-[11px] text-slate-400 transition-transform duration-200 group-open:rotate-90">
                        &gt;
                      </span>
                    </summary>
                    <div className="mt-3 space-y-2 text-xs text-slate-600">
                      {metaEntries.map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between gap-2">
                          <span className="uppercase text-[11px] tracking-wide text-slate-500">{key}</span>
                          <span className="font-medium text-slate-700">{formatValue(value)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
