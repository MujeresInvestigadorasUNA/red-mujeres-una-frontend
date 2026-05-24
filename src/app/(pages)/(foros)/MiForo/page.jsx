"use client";
import { useUser } from "@/app/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MiForo() {
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (user?.id) {
            router.replace(`/Foros/${user.id}`);
        } else if (user === null) {
            router.replace("/IniciarSesion");
        }
    }, [user, router]);

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#E7473C]/30 border-t-[#E7473C] rounded-full animate-spin" />
        </main>
    );
}
