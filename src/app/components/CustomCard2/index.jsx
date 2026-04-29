import Image from "next/image";
import { iconEye, iconHeart, iconUsers } from "@/app/assets/icons";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
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
                        <div
                            className="flex gap-5 text-sm text-gray-600 text-nowrap"
                            style={{ fontSize: "0.8rem" }}
                        >
                            <span className="flex items-center gap-1">
                                {iconHeart({ size: 12 })}
                                100
                            </span>
                            <span className="flex items-center gap-1">
                                {iconEye({ size: 12 })}
                                100
                            </span>
                            <span className="flex items-center gap-1">
                                {iconUsers({ size: 12 })}
                                20 / 50
                            </span>
                        </div>
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
                    {/* Overlay badges */}
                    <div className="absolute bottom-5 left-4 flex gap-1">
                        <Badge variant="secondary">Badge</Badge>
                        <Badge variant="secondary">Badge</Badge>
                        <Badge variant="secondary">Badge</Badge>
                        <Badge variant="secondary">Badge</Badge>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}