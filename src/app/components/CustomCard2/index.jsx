import Image from "next/image";
import { iconEye, iconHeart, iconUsers } from "@/app/assets/icons";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, Share2, EyeOff } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";

export default function CustomCard2({
    cardHref,
    cardTitle,
    cardDescription,
    cardImage,
    cardId,
    user,
    isLiked,
    onLike,
    onShare,
}) {
    const HREF = cardHref ?? "/";
    const TITLE = cardTitle ?? "Card Title";
    const DESCRIPTION = cardDescription ?? "Card Description";
    const IMAGE = cardImage ?? "/images/defaultCourse.webp";

    return (
        <Link href={HREF} className="grow">
            <Card className="p-0 overflow-hidden rounded-lg hover:brightness-80
            hover:cursor-pointer shadow border-none min-w-[300px]">
                <CardHeader className="px-6 pt-7">
                    <div className="flex items-center justify-between flex-wrap 
                    gap-2">
                        <CardTitle className="text-nowrap">
                            {TITLE}
                        </CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* More options icon (three dots) */}
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 8c1.1 0 2-0.9 2-2s-0.9-2-2-2-2 0.9-2 2 0.9 2 2 2zm0 2c-1.1 0-2 0.9-2 2s0.9 2 2 2 2-0.9 2-2-0.9-2-2-2zm0 6c-1.1 0-2 0.9-2 2s0.9 2 2 2 2-0.9 2-2-0.9-2-2-2z" />
                                    </svg>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {user && (
                                    <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        onLike?.(cardId);
                                    }}>
                                        <Heart 
                                            className={`w-4 h-4 mr-2 ${isLiked ? "fill-current text-red-500" : ""}`}
                                        />
                                        {isLiked ? "Quitar Like" : "Me Gusta"}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    onShare?.(cardId);
                                }}>
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Compartir
                                </DropdownMenuItem>
                                {user && user.user_type_id === 3 && (
                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                        <EyeOff className="w-4 h-4 mr-2" />
                                        Esconder
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <CardDescription>
                        {DESCRIPTION.length > 400
                            ? DESCRIPTION.slice(0, 150) + '…'
                            : DESCRIPTION
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="relative p-0 rounded">
                    <Image
                        src={IMAGE}
                        alt="Investigación"
                        width={3000}
                        height={3000}
                        className="object-cover brightness-80 max-h-60 w-full"
                    />
                    {/* Overlay with likes, visualizaciones and badges */}
                    <div className="absolute bottom-5 left-4 right-4 flex gap-3 items-center justify-between">
                        <div className="flex gap-3">
                            <span
                                className="flex items-center gap-1 text-white text-sm font-medium bg-black/40 px-2 py-1 rounded"
                            >
                                {iconHeart({ size: 14 })}
                                0
                            </span>
                            <span
                                className="flex items-center gap-1 text-white text-sm font-medium bg-black/40 px-2 py-1 rounded"
                            >
                                {iconEye({ size: 14 })}
                                0
                            </span>
                            <span
                                className="flex items-center gap-1 text-white text-sm font-medium bg-black/40 px-2 py-1 rounded"
                            >
                                {iconUsers({ size: 14 })}
                                0 / 50
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}