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

    return (
        <nav className="flex justify-between items-center px-5 py-2 sticky 
        top-0 text-white z-10 mainSection">
            <Link href="/" className="font-bold">
                <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={60}
                    height={60}
                    className="border-[#8A192A] border-3 rounded-full shadow"
                />
            </Link>
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem className="hidden md:block">
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
                    <NavigationMenuItem className="hidden md:block">
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
                    <NavigationMenuItem className="hidden md:block">
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
            <div className="flex items-center gap-3 min-w-[160px] justify-end">
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="bg-[#b62116] text-white hover:bg-red-700
                            transition hover:cursor-pointer rounded-full w-10 h-10 p-0">
                                {user.first_name ? user.first_name[0].toUpperCase() : "U"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-40 mr-5" align="start" variant="dark">
                            <DropdownMenuLabel className="font-normal text-sm text-gray-500 text-center">
                                {user.email}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <Link href="/MiPerfil">Mi Perfil</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <button onClick={logout}>Cerrar sesión</button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Link
                        href="/IniciarSesion"
                        className="bg-[#b62116] text-white px-3 py-1 rounded shadow"
                    >
                        Iniciar Sesión
                    </Link>
                )}
            </div>
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