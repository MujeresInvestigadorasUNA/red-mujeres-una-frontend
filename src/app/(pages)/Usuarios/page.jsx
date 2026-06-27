"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useUser } from "@/app/contexts/UserContext";
import { listUsers, deleteUser, updateUser, updateUserType } from "@/lib/api/users";
import { getProfilePictureUrl } from "@/lib/api/auth";
import { Trash2, Edit2, Loader2, Search, RefreshCw, Shield, X } from "lucide-react";

const USER_TYPES = {
  1: "Usuario Regular",
  2: "Profesional",
  3: "Administrador"
};

const AVATAR_GRADIENTS = [
  ["#831d16", "#E7473C"],
  ["#1e3a8a", "#3b82f6"],
  ["#065f46", "#10b981"],
  ["#4c1d95", "#8b5cf6"],
  ["#92400e", "#f59e0b"],
  ["#0e7490", "#06b6d4"],
];

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
}

const ITEMS_PER_PAGE = 12;

export default function Usuarios() {
  const { user } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingUserId, setIsDeletingUserId] = useState(null);
  const [photoUrls, setPhotoUrls] = useState({});

  useEffect(() => {
    if (user?.user_type_id !== 3) {
      router.push("/");
      return;
    }
    fetchUsers();
  }, [user?.user_type_id, router]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await listUsers();
      if (!response.ok) {
        toast.error("Error al cargar los usuarios");
        return;
      }
      const data = await response.json();
      const usersList = Array.isArray(data) ? data : [];
      setUsers(usersList);

      const photos = {};
      await Promise.all(
        usersList
          .filter((u) => u.photo)
          .map(async (u) => {
            try {
              const res = await getProfilePictureUrl({ user_id: u.id });
              if (res.ok) {
                const result = await res.json();
                photos[u.id] = result?.url || result?.signed_url || result || null;
              }
            } catch {}
          })
      );
      setPhotoUrls(photos);
    } catch (error) {
      toast.error("Error al conectar con el servidor");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (userData) => {
    setEditingUserId(userData.id);
    setEditForm({
      first_name: userData.first_name || "",
      last_name: userData.last_name || "",
      email: userData.email || "",
      user_profession: userData.user_profession || "",
      user_description: userData.user_description || "",
      user_type_id: userData.user_type_id || 1
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.first_name || !editForm.last_name || !editForm.email) {
      toast.error("Por favor, complete los campos requeridos");
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateUser(editingUserId, editForm);
      if (!response.ok) {
        const data = await response.json();
        toast.error(data.detail || "Error al actualizar el usuario");
        return;
      }

      setUsers(users.map(u => u.id === editingUserId ? { ...u, ...editForm } : u));
      setEditingUserId(null);
      toast.success("Usuario actualizado correctamente");
    } catch (error) {
      toast.error("Error al guardar cambios");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    if (userId === user?.id) {
      toast.error("No puedes eliminar tu propia cuenta");
      return;
    }

    if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsDeletingUserId(userId);
    try {
      const response = await deleteUser(userId);
      if (!response.ok) {
        toast.error("Error al eliminar el usuario");
        return;
      }

      setUsers(users.filter(u => u.id !== userId));
      toast.success("Usuario eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar el usuario");
      console.error(error);
    } finally {
      setIsDeletingUserId(null);
    }
  };

  const handleTypeChange = async (userId, newTypeId) => {
    if (userId === user?.id) {
      toast.error("No puedes cambiar tu propio tipo de usuario");
      return;
    }
    try {
      const res = await updateUserType(userId, newTypeId);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.detail || "Error al cambiar el tipo de usuario");
        return;
      }
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, user_type_id: newTypeId } : u));
      toast.success("Tipo de usuario actualizado");
    } catch {
      toast.error("Error de conexión");
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditForm({});
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setDisplayCount(ITEMS_PER_PAGE);
  };

  const handleClear = () => {
    setSearchTerm("");
    setDisplayCount(ITEMS_PER_PAGE);
  };

  const q = searchTerm.toLowerCase().trim();
  const filtered = users.filter(
    (u) =>
      !q ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.user_profession?.toLowerCase().includes(q)
  );
  const displayed = filtered.slice(0, displayCount);
  const hasMore = filtered.length > displayCount;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ── Header ─────────────────────────────────────────── */}
      <section
        className="px-6 md:px-16 xl:px-20 py-8"
        style={{ background: "linear-gradient(135deg, #831d16, #E7473C)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-white/80" />
          <span className="text-white/80 text-xs font-medium uppercase tracking-wide">
            Panel de Administración
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
        <p className="text-white/80 text-sm mt-1 max-w-xl leading-relaxed">
          Administra los usuarios de la plataforma, edita información y gestiona permisos.
        </p>
      </section>

      {/* ── Search + Grid ──────────────────────────────────── */}
      <section className="px-6 md:px-16 xl:px-20 py-8 max-w-7xl mx-auto">
        {/* Barra de búsqueda */}
        <div className="flex gap-2 mb-5 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9 h-9 text-sm bg-white border-slate-200"
            />
          </div>
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-9 w-9 text-slate-400 hover:text-slate-600"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* Contador */}
        {!isLoading && (
          <p className="text-xs text-slate-400 mb-5">
            {filtered.length} usuario{filtered.length !== 1 ? "s" : ""}
            {searchTerm && ` para "${searchTerm}"`}
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-4 border border-slate-100 flex items-start gap-3">
                <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                <div className="flex flex-col gap-2 flex-1 pt-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-full mt-1" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </Card>
            ))}
          </div>
        ) : displayed.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayed.map((userData, i) => {
                const fullName = `${userData.first_name} ${userData.last_name}`;
                const [gradFrom, gradTo] = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];

                return editingUserId === userData.id ? (
                  <Card key={userData.id} className="p-4 border border-slate-100 flex flex-col gap-3 col-span-1 sm:col-span-2 lg:col-span-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-800">Editando usuario</span>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold text-slate-600 mb-1 block">Nombre *</Label>
                        <Input
                          value={editForm.first_name}
                          onChange={(e) => handleInputChange("first_name", e.target.value)}
                          placeholder="Nombre"
                          className="border-slate-200 rounded text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-600 mb-1 block">Apellido *</Label>
                        <Input
                          value={editForm.last_name}
                          onChange={(e) => handleInputChange("last_name", e.target.value)}
                          placeholder="Apellido"
                          className="border-slate-200 rounded text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs font-semibold text-slate-600 mb-1 block">Correo</Label>
                        <Input
                          value={editForm.email}
                          type="email"
                          disabled
                          className="border-slate-200 rounded text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-600 mb-1 block">Profesión</Label>
                        <Input
                          value={editForm.user_profession}
                          onChange={(e) => handleInputChange("user_profession", e.target.value)}
                          placeholder="Profesión"
                          className="border-slate-200 rounded text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-600 mb-1 block">Tipo de Usuario</Label>
                        <select
                          value={editForm.user_type_id}
                          onChange={(e) => handleInputChange("user_type_id", parseInt(e.target.value))}
                          className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm bg-white text-slate-900"
                        >
                          {Object.entries(USER_TYPES).map(([id, label]) => (
                            <option key={id} value={id}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs font-semibold text-slate-600 mb-1 block">Descripción</Label>
                        <textarea
                          value={editForm.user_description}
                          onChange={(e) => handleInputChange("user_description", e.target.value)}
                          placeholder="Descripción"
                          className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm bg-white text-slate-900"
                          rows="2"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="border-slate-200 h-8 text-xs"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                        className="bg-[#E7473C] hover:bg-[#c83d30] h-8 text-xs text-white"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          "Guardar"
                        )}
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card
                    key={userData.id}
                    className="p-4 border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all duration-200 group h-full flex flex-col gap-3"
                  >
                    {/* Avatar + nombre */}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-11 h-11 rounded-full shrink-0 overflow-hidden flex items-center justify-center shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
                      >
                        {photoUrls[userData.id] ? (
                          <img
                            src={photoUrls[userData.id]}
                            alt={fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold text-sm">
                            {getInitials(userData.first_name, userData.last_name)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-[#555] transition-colors duration-200">
                          {fullName}
                        </span>
                        {userData.email && (
                          <span className="text-xs text-slate-400 truncate">
                            {userData.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tipo + Profesión */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={userData.user_type_id}
                        onChange={(e) => handleTypeChange(userData.id, parseInt(e.target.value))}
                        disabled={userData.id === user?.id}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-full cursor-pointer border-0 appearance-auto ${
                          userData.user_type_id === 3
                            ? "bg-purple-100 text-purple-700"
                            : userData.user_type_id === 2
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        } ${userData.id === user?.id ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {Object.entries(USER_TYPES).map(([id, label]) => (
                          <option key={id} value={id}>{label}</option>
                        ))}
                      </select>
                      {userData.user_profession && (
                        <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                          {userData.user_profession}
                        </span>
                      )}
                    </div>

                    {/* Descripción */}
                    <p className={`text-xs leading-relaxed line-clamp-2 flex-1 ${userData.user_description ? "text-slate-500" : "text-slate-400 italic"}`}>
                      {userData.user_description || "Sin descripción"}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-slate-100 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(userData)}
                        className="flex-1 h-8 text-xs border-slate-200"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(userData.id)}
                        disabled={isDeletingUserId === userData.id}
                        className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700"
                      >
                        {isDeletingUserId === userData.id ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Eliminando...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3 h-3 mr-1" />
                            Eliminar
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDisplayCount(displayCount + ITEMS_PER_PAGE)}
                  className="border-slate-200"
                >
                  Cargar más
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">
              {searchTerm ? "No se encontraron usuarios" : "No hay usuarios"}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
