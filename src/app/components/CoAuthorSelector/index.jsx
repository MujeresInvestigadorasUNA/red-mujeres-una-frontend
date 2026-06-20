"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, UserPlus } from "lucide-react";
import { getResearchers } from "@/lib/api/forums";

export default function CoAuthorSelector({ selectedAuthors = [], onAdd, onRemove, excludeUserId = null }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [allResearchers, setAllResearchers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef(null);
    const hasFetchedRef = useRef(false);

    const selectedIds = new Set(selectedAuthors.map((a) => a.id));

    const fetchResearchers = useCallback(async () => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;
        setLoading(true);
        try {
            const data = await getResearchers(100);
            setAllResearchers(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFocus = () => {
        setShowDropdown(true);
        fetchResearchers();
    };

    const filtered = allResearchers.filter((r) => {
        if (r.id === excludeUserId) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const fullName = `${r.first_name ?? ""} ${r.last_name ?? ""}`.toLowerCase();
        return fullName.includes(q) || (r.email ?? "").toLowerCase().includes(q);
    });

    const handleSelect = (researcher) => {
        if (!selectedIds.has(researcher.id)) {
            onAdd(researcher);
        }
        setSearchQuery("");
        setShowDropdown(false);
    };

    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Co-autoras</span>

            {selectedAuthors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedAuthors.map((author) => (
                        <span
                            key={author.id}
                            className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-800 rounded-full px-3 py-1 text-sm"
                        >
                            {author.first_name} {author.last_name}
                            <button
                                type="button"
                                onClick={() => onRemove(author.id)}
                                className="ml-1 hover:text-red-600 transition-colors"
                                aria-label={`Quitar a ${author.first_name} ${author.last_name}`}
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div className="relative" ref={containerRef}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={handleFocus}
                        placeholder="Buscar investigadora por nombre..."
                        className="pl-9"
                    />
                </div>

                {showDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                        {loading ? (
                            <div className="px-4 py-3 text-sm text-gray-500">Cargando...</div>
                        ) : filtered.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500">
                                {searchQuery.trim() ? "No se encontraron resultados" : "No hay investigadoras disponibles"}
                            </div>
                        ) : (
                            filtered.map((researcher) => {
                                const isSelected = selectedIds.has(researcher.id);
                                return (
                                    <button
                                        key={researcher.id}
                                        type="button"
                                        disabled={isSelected}
                                        onClick={() => handleSelect(researcher)}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 ${
                                            isSelected
                                                ? "bg-gray-50 text-gray-400 cursor-default"
                                                : "hover:bg-red-50 hover:text-red-800 cursor-pointer"
                                        }`}
                                    >
                                        <span className="truncate">
                                            {researcher.first_name} {researcher.last_name}
                                        </span>
                                        {isSelected ? (
                                            <span className="text-xs text-gray-400 shrink-0">Agregada</span>
                                        ) : (
                                            <UserPlus size={14} className="text-gray-400 shrink-0" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
