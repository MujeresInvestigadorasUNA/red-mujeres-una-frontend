"use client"
import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport
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

export function CustomNavigationMenu() {
    const { user, logout } = useUser();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [notificationsOpen, setNotificationsOpen] = React.useState(false);

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

    return (
        <nav className="sticky top-0 z-10 px-4 py-2 text-white mainSection md:px-5">
            <div className="flex items-center justify-between gap-3">
                <Link href="/" className="font-bold">
                    <Image
                        src="/images/logo.png"
                        alt="Logo"
                        width={60}
                        height={60}
                        className="border-[#8A192A] border-3 rounded-full shadow"
                    />
                </Link>
                {user ? (
                    <NavigationMenu className="hidden md:flex">
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger
                                    className="bg-transparent text-white"
                                >
                                    Foros
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[300px] gap-4">
                                        <li>
                                            <NavigationMenuLink asChild>
                                                <Link href="/Foros">
                                                    <div className="font-medium">Explorar Foros</div>
                                                    <div className="text-muted-foreground">
                                                        Explora todos los foros publicados por la comunidad.
                                                    </div>
                                                </Link>
                                            </NavigationMenuLink>
                                            <NavigationMenuLink asChild>
                                                <Link href="/MiForo">
                                                    <div className="font-medium">Mi Foro</div>
                                                    <div className="text-muted-foreground">
                                                        Accede a tu foro personal y gestiona tus publicaciones.
                                                    </div>
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger
                                    className="bg-transparent hover:bg-transparent
                                focus:bg-transparent active:bg-transparent text-white"
                                >
                                    Investigaciones
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[300px] gap-4">
                                        <li>
                                            <NavigationMenuLink asChild>
                                                <Link href="/Investigaciones">
                                                    <div className="font-medium">Explorar Investigaciones</div>
                                                    <div className="text-muted-foreground">
                                                        Explora todas las investigaciones publicadas por la comunidad.
                                                    </div>
                                                </Link>
                                            </NavigationMenuLink>
                                            <NavigationMenuLink asChild>
                                                <Link href="/MisInvestigaciones">
                                                    <div className="font-medium">Mis Investigaciones</div>
                                                    <div className="text-muted-foreground">
                                                        Accede a tus investigaciones personales y gestiona tus publicaciones.
                                                    </div>
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger
                                    className="bg-transparent hover:bg-transparent
                                focus:bg-transparent active:bg-transparent text-white"
                                >
                                    Cursos
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[300px] gap-4">
                                        <li>
                                            <NavigationMenuLink asChild>
                                                <Link href="/Cursos">
                                                    <div className="font-medium">Explorar Cursos</div>
                                                    <div className="text-muted-foreground">
                                                        Explora todos los cursos disponibles en la plataforma.
                                                    </div>
                                                </Link>
                                            </NavigationMenuLink>
                                            <NavigationMenuLink asChild>
                                                <Link href="/MisCursos">
                                                    <div className="font-medium">Mis Cursos</div>
                                                    <div className="text-muted-foreground">
                                                        Accede a tus cursos personales y gestiona tus inscripciones.
                                                    </div>
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                        <NavigationMenuViewport />
                    </NavigationMenu>
                ) : (
                    <div className="hidden md:flex items-center gap-6 text-white">
                        <Link href="/Foros" className="hover:text-red-300 transition">
                            Foros
                        </Link>
                        <Link href="/Investigaciones" className="hover:text-red-300 transition">
                            Investigaciones
                        </Link>
                        <Link href="/Cursos" className="hover:text-red-300 transition">
                            Cursos
                        </Link>
                    </div>
                )}
                <div className="flex items-center justify-end gap-2 min-w-[160px]">
                    <button
                        type="button"
                        className="rounded bg-[#b62116] px-3 py-1 text-sm font-medium shadow md:hidden"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        aria-label="Abrir menú"
                        aria-expanded={mobileMenuOpen}
                    >
                        Menú
                    </button>
                    {user ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setNotificationsOpen(true)}
                                aria-label="Abrir notificaciones"
                                className="hidden md:inline-flex relative items-center justify-center rounded-full w-10 h-10 p-0 bg-white/10 text-white hover:bg-white/20 transition transform hover:scale-105 mr-3 shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="feather feather-bell">
                                    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                                </svg>
                                <span className="absolute top-1 right-1 inline-block w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                            </button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="hidden bg-[#b62116] text-white hover:bg-red-700
                                transition hover:cursor-pointer rounded-full w-10 h-10 p-0 md:flex">
                                        {user.first_name ? user.first_name[0].toUpperCase() : "U"}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 max-w-[calc(100vw-2rem)] mr-5" align="start" variant="dark">
                                    <DropdownMenuLabel className="font-normal text-sm text-gray-500 text-center whitespace-normal break-all leading-tight px-1">
                                        {user.email}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Link href="/MiPerfil">Mi Perfil</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <button onClick={logoutButtonHandler}>Cerrar sesión</button>
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
                <div className="mt-3 grid gap-2 rounded bg-[#b62116] p-3 text-sm shadow md:hidden">
                    {user ? (
                        <>
                            <Link href="/Foros" onClick={() => setMobileMenuOpen(false)}>Explorar Foros</Link>
                            <Link href="/MiForo" onClick={() => setMobileMenuOpen(false)}>Mi Foro</Link>
                            <Link href="/Investigaciones" onClick={() => setMobileMenuOpen(false)}>Explorar Investigaciones</Link>
                            <Link href="/MisInvestigaciones" onClick={() => setMobileMenuOpen(false)}>Mis Investigaciones</Link>
                            <Link href="/Cursos" onClick={() => setMobileMenuOpen(false)}>Explorar Cursos</Link>
                            <Link href="/MisCursos" onClick={() => setMobileMenuOpen(false)}>Mis Cursos</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/Foros" onClick={() => setMobileMenuOpen(false)}>Foros</Link>
                            <Link href="/Investigaciones" onClick={() => setMobileMenuOpen(false)}>Investigaciones</Link>
                            <Link href="/Cursos" onClick={() => setMobileMenuOpen(false)}>Cursos</Link>
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
                    <aside className="fixed right-0 top-0 z-50 h-full w-80 max-w-full bg-white dark:bg-gray-800 shadow-lg p-4">
                        <div className="flex items-center justify-between pb-2 text-black">
                            <h3 className="text-lg font-medium">Notificaciones</h3>
                            <button
                                aria-label="Cerrar notificaciones"
                                onClick={() => setNotificationsOpen(false)}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-300"
                            >
                                ×
                            </button>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="py-6 text-center text-gray-500">No hay notificaciones</div>
                        </div>
                    </aside>
                </>
            )}
        </nav>
    )
}

function ListItem({
    title,
    children,
    href,
    ...props
}) {
    return (
        <li {...props}>
            <NavigationMenuLink asChild>
                <Link href={href}>
                    <div className="text-sm leading-none font-medium">{title}</div>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    )
}