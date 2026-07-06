"use client"
import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import Image from "next/image"
import { useUser } from "@/app/contexts/UserContext"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { getResearchById } from "@/lib/api/research"
import { getProfilePictureUrl } from "@/lib/api/auth"
import {
    getNotifications,
    getUnreadNotificationsCount,
    markAllNotificationsRead,
    markNotificationRead,
    notificationsUpdateEventName,
    updateNotificationStatus
} from "@/lib/notifications"
import { normalizeMediaUrl } from "@/lib/utils"

export function CustomNavigationMenu() {
    const { user, logout } = useUser();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [desktopMenuValue, setDesktopMenuValue] = React.useState("");
    const [notificationsOpen, setNotificationsOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [userPhotoUrl, setUserPhotoUrl] = React.useState(null);

    React.useEffect(() => {
        if (!user?.id) {
            setUserPhotoUrl(null);
            return;
        }
        getProfilePictureUrl({ user_id: user.id })
            .then((res) => res.ok ? res.json() : null)
            .then((data) => setUserPhotoUrl(normalizeMediaUrl(data)))
            .catch(() => setUserPhotoUrl(null));
    }, [user?.id]);

    const refreshNotifications = React.useCallback(() => {
        setNotifications(getNotifications());
        setUnreadCount(getUnreadNotificationsCount());
    }, []);

    const statusConfig = React.useMemo(
        () => ({
            processing: {
                label: "Procesando",
                badgeClass: "bg-amber-100 text-amber-800 border border-amber-200"
            },
            ready: {
                label: "Lista",
                badgeClass: "bg-emerald-100 text-emerald-800 border border-emerald-200"
            },
            failed: {
                label: "Error",
                badgeClass: "bg-red-100 text-red-700 border border-red-200"
            }
        }),
        []
    );

    const formatRelativeTime = (timestamp) => {
        if (!timestamp) return "";
        const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
        if (minutes < 60) return `Hace ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Hace ${hours} h`;
        const days = Math.floor(hours / 24);
        return `Hace ${days} d`;
    };

    const getResearchStatus = (researchData) => {
        if (!researchData) return "processing";
        const status = String(researchData.status || "").toLowerCase();
        if (status === "ready") return "ready";
        if (status === "failed" || status === "error") return "failed";
        if (status === "processing") return "processing";
        return "processing";
    };

    const getStatusMessage = (status, title) => {
        if (status === "ready") return `La investigación \"${title}\" ya está lista.`;
        if (status === "failed") return `Hubo un problema procesando \"${title}\".`;
        return `La investigación \"${title}\" se está procesando.`;
    };

    const DesktopMenuItem = ({ href, title, description }) => (
        <li>
            <NavigationMenuLink
                render={
                    <Link href={href} onClick={closeDesktopMenu}>
                        <div className="font-medium">{title}</div>
                        <div className="text-muted-foreground">{description}</div>
                    </Link>
                }
            />
        </li>
    );

    React.useEffect(() => {
        refreshNotifications();
    }, [refreshNotifications]);

    React.useEffect(() => {
        const eventName = notificationsUpdateEventName();
        const onUpdate = () => refreshNotifications();
        window.addEventListener(eventName, onUpdate);
        window.addEventListener("storage", onUpdate);
        return () => {
            window.removeEventListener(eventName, onUpdate);
            window.removeEventListener("storage", onUpdate);
        };
    }, [refreshNotifications]);

    React.useEffect(() => {
        const processingNotifications = notifications.filter(
            (item) => item.type === "research" && item.status === "processing" && item.researchId
        );

        if (!processingNotifications.length) return;

        const pollStatus = async () => {
            for (const item of processingNotifications) {
                const researchData = await getResearchById(item.researchId);
                if (!researchData) continue;

                const nextStatus = getResearchStatus(researchData);
                if (nextStatus !== item.status) {
                    updateNotificationStatus(
                        item.id,
                        nextStatus,
                        getStatusMessage(nextStatus, item.title)
                    );
                }
            }
        };

        pollStatus();
        const intervalId = window.setInterval(pollStatus, 5000);
        return () => window.clearInterval(intervalId);
    }, [notifications]);

    React.useEffect(() => {
        if (!notificationsOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") setNotificationsOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [notificationsOpen]);

    const logoutButtonHandler = () => {
        logout("/IniciarSesion");
        setMobileMenuOpen(false);
    }

    const closeDesktopMenu = React.useCallback(() => {
        setDesktopMenuValue("");
    }, []);

    return (
        <nav className="sticky top-0 z-10 px-4 py-2 text-gray-800 bg-white border-b border-gray-200 shadow-sm md:px-5">
            <div className="flex items-center justify-between gap-3">
                <Link href="/" className="font-bold">
                    <div className="h-9 overflow-hidden flex items-start">
                        <Image
                            src="/images/Logo-Red-De-Mujeres-notext.png"
                            alt="Logo"
                            width={200}
                            height={200}
                            className="h-14 w-auto object-contain object-top"
                        />
                    </div>
                </Link>

                {user ? (
                    <NavigationMenu
                        className="hidden md:flex"
                        viewport={false}
                        value={desktopMenuValue}
                        onValueChange={setDesktopMenuValue}
                    >
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger
                                    className="bg-transparent text-gray-700 hover:text-[#C0392B]"
                                    onClick={(event) => event.preventDefault()}
                                >
                                    Foros
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-96 gap-2">
                                        <DesktopMenuItem
                                            href="/Foros"
                                            title="Explorar Foros"
                                            description="Explora todos los foros publicados por la comunidad."
                                        />
                                        <DesktopMenuItem
                                            href="/MiForo"
                                            title="Mi Foro"
                                            description="Accede a tu foro personal con tus investigaciones y eventos."
                                        />
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuTrigger
                                    className="bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent text-gray-700 hover:text-[#C0392B]"
                                    onClick={(event) => event.preventDefault()}
                                >
                                    Investigaciones
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-96 gap-2">
                                        <DesktopMenuItem
                                            href="/Investigaciones"
                                            title="Explorar Investigaciones"
                                            description="Explora todas las investigaciones publicadas por la comunidad."
                                        />
                                        <DesktopMenuItem
                                            href="/MisInvestigaciones"
                                            title="Mis Investigaciones"
                                            description="Accede a tus investigaciones personales y gestiona tus publicaciones."
                                        />
                                        <DesktopMenuItem
                                            href="/MapaDispersion"
                                            title="Mapa de Dispersión 2D"
                                            description="Gráfico de dispersión por similitud semántica con zoom y pan."
                                        />
                                        <DesktopMenuItem
                                            href="/MapaDispersion3D"
                                            title="Mapa de Dispersión 3D"
                                            description="Vista 3D interactiva con mayor fidelidad semántica (3 componentes PCA)."
                                        />
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuTrigger
                                    className="bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent text-gray-700 hover:text-[#C0392B]"
                                    onClick={(event) => event.preventDefault()}
                                >
                                    Eventos
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-96 gap-2">
                                        <DesktopMenuItem
                                            href="/Eventos"
                                            title="Explorar Eventos"
                                            description="Explora todos los eventos organizados por la comunidad."
                                        />
                                        <DesktopMenuItem
                                            href="/MisEventos"
                                            title="Mis Eventos"
                                            description="Crea y gestiona tus eventos."
                                        />
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>

                            {user?.user_type_id === 3 && (
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger
                                        className="bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent text-gray-700 hover:text-[#C0392B]"
                                        onClick={(event) => event.preventDefault()}
                                    >
                                        Administración
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid w-75 gap-2">
                                            <DesktopMenuItem
                                                href="/Usuarios"
                                                title="Usuarios"
                                                description="Gestiona todos los usuarios de la plataforma."
                                            />
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            )}
                        </NavigationMenuList>
                    </NavigationMenu>
                ) : (
                    <div className="hidden md:flex items-center gap-6 text-gray-700">
                        <Link href="/Foros" className="hover:text-[#C0392B] transition">
                            Foros
                        </Link>
                        <Link href="/Investigaciones" className="hover:text-[#C0392B] transition">
                            Investigaciones
                        </Link>
                        <Link href="/Eventos" className="hover:text-[#C0392B] transition">
                            Eventos
                        </Link>
                    </div>
                )}

                <div className="flex items-center justify-end gap-2 min-w-40">
                    <button
                        type="button"
                        className="rounded bg-[#b62116] px-3 py-1 text-sm font-medium shadow md:hidden"
                        onClick={() => setMobileMenuOpen((previous) => !previous)}
                        aria-label="Abrir menú"
                        aria-expanded={mobileMenuOpen}
                    >
                        Menú
                    </button>

                    {user ? (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    setNotificationsOpen(true);
                                    markAllNotificationsRead();
                                }}
                                aria-label="Abrir notificaciones"
                                className="hidden md:inline-flex relative items-center justify-center rounded-full w-10 h-10 p-0 bg-gray-100 text-gray-600 hover:bg-gray-200 transition transform hover:scale-105 mr-3 shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="feather feather-bell">
                                    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] leading-5 font-semibold text-center ring-2 ring-white">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="hidden bg-[#b62116] text-white hover:bg-red-700 transition hover:cursor-pointer rounded-full w-10 h-10 p-0 md:flex overflow-hidden">
                                        {userPhotoUrl ? (
                                            <img
                                                src={userPhotoUrl}
                                                alt="Foto de perfil"
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : (
                                            user.first_name ? user.first_name[0].toUpperCase() : "U"
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-60 max-w-[calc(100vw-2rem)] mr-5" align="end" variant="dark">
                                    <DropdownMenuLabel className="font-normal px-3 py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#b62116] flex items-center justify-center">
                                                {userPhotoUrl ? (
                                                    <img
                                                        src={userPhotoUrl}
                                                        alt="Foto de perfil"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-white font-semibold text-sm">
                                                        {user.first_name ? user.first_name[0].toUpperCase() : "U"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-medium text-slate-800 truncate">
                                                    {user.first_name} {user.last_name}
                                                </span>
                                                <span className="text-xs text-slate-400 truncate">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/MiPerfil" className="flex w-full cursor-pointer">
                                            Mi Perfil
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <button
                                            type="button"
                                            onClick={logoutButtonHandler}
                                            className="flex w-full cursor-pointer text-left"
                                        >
                                            Cerrar sesión
                                        </button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Link
                            href="/IniciarSesion"
                            className="hidden bg-[#b62116] text-white px-3 py-1 rounded shadow md:inline-flex"
                        >
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="mt-3 grid gap-2 rounded bg-[#C0392B] p-3 text-sm shadow text-white md:hidden">
                    {user ? (
                        <>
                            <Link href="/Foros" onClick={() => setMobileMenuOpen(false)}>Explorar Foros</Link>
                            <Link href="/MiForo" onClick={() => setMobileMenuOpen(false)}>Mi Foro</Link>
                            <Link href="/Investigaciones" onClick={() => setMobileMenuOpen(false)}>Explorar Investigaciones</Link>
                            <Link href="/MisInvestigaciones" onClick={() => setMobileMenuOpen(false)}>Mis Investigaciones</Link>
                            <Link href="/MapaDispersion" onClick={() => setMobileMenuOpen(false)}>Mapa Dispersión 2D</Link>
                            <Link href="/MapaDispersion3D" onClick={() => setMobileMenuOpen(false)}>Mapa Dispersión 3D</Link>
                            <Link href="/Eventos" onClick={() => setMobileMenuOpen(false)}>Explorar Eventos</Link>
                            <Link href="/MisEventos" onClick={() => setMobileMenuOpen(false)}>Mis Eventos</Link>
                            {user?.user_type_id === 3 && (
                                <Link href="/Usuarios" onClick={() => setMobileMenuOpen(false)}>Usuarios</Link>
                            )}
                        </>
                    ) : (
                        <>
                            <Link href="/Foros" onClick={() => setMobileMenuOpen(false)}>Foros</Link>
                            <Link href="/Investigaciones" onClick={() => setMobileMenuOpen(false)}>Investigaciones</Link>
                            <Link href="/Eventos" onClick={() => setMobileMenuOpen(false)}>Eventos</Link>
                        </>
                    )}

                    <div className="mt-2 border-t border-white/30 pt-2">
                        {user ? (
                            <div className="grid gap-2">
                                <div className="text-xs text-white/80">{user.email}</div>
                                <Link href="/MiPerfil" onClick={() => setMobileMenuOpen(false)}>Mi Perfil</Link>
                                <button
                                    type="button"
                                    className="text-left"
                                    onClick={logoutButtonHandler}
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        ) : (
                            <Link href="/IniciarSesion" onClick={() => setMobileMenuOpen(false)}>
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {notificationsOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/40"
                        onClick={() => setNotificationsOpen(false)}
                        aria-hidden
                    />
                    <aside className="fixed right-0 top-0 z-50 h-full w-96 max-w-full bg-white shadow-lg p-4 text-black">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                            <div>
                                <h3 className="text-lg font-medium">Notificaciones</h3>
                                <p className="text-xs text-gray-500">
                                    {notifications.length} {notifications.length === 1 ? "elemento" : "elementos"}
                                </p>
                            </div>
                            <button
                                aria-label="Cerrar notificaciones"
                                onClick={() => setNotificationsOpen(false)}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={markAllNotificationsRead}
                                className="text-xs text-[#831d16] hover:underline"
                            >
                                Marcar todo como leído
                            </button>
                        </div>

                        <div className="mt-3 text-sm text-gray-700 max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
                            {notifications.length === 0 ? (
                                <div className="py-10 text-center text-gray-500">No hay notificaciones</div>
                            ) : (
                                <div className="space-y-2">
                                    {notifications.map((item) => {
                                        const config = statusConfig[item.status] || statusConfig.processing;
                                        const canNavigate = item.type === "research" && item.researchId && item.status === "ready";

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => {
                                                    markNotificationRead(item.id);
                                                    if (canNavigate) {
                                                        setNotificationsOpen(false);
                                                        router.push(`/MisInvestigaciones/${item.researchId}`);
                                                    }
                                                }}
                                                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-medium text-sm">{item.title || "Investigación"}</p>
                                                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${config.badgeClass}`}>
                                                        {config.label}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">{item.message}</p>
                                                <p className="text-[11px] text-gray-400 mt-1">
                                                    {formatRelativeTime(item.updatedAt || item.createdAt)}
                                                </p>
                                                {canNavigate && (
                                                    <p className="text-[11px] text-[#831d16] mt-1">Abrir investigación</p>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </aside>
                </>
            )}
        </nav>
    );
}
