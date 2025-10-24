import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function CustomCard({ 
    cardImage = "/images/jinette.png", 
    cardTitle = "Card Title", 
    cardDescription = "Card Description",
    cardURL = "/",
    cardBgColor = "#F0F0F0",
    cardTitleTextColor = "#831d16",
    cardTextColor = "#E7473C",
    cardWithImage = true
}) {
    return (
        <Link href={cardURL}>
            <Card className={`p-0 overflow-hidden rounded-md border-0 shadow-lg
            hover:brightness-80 transition-all duration-200 h-full
            bg-[${cardBgColor}] text-[${cardTextColor}]`}>
                <CardContent className="p-0 flex flex-col">
                {cardWithImage && (
                    <Image
                        src={cardImage}
                        alt={cardTitle}
                        width={3000}
                        height={3000}
                        className="object-cover h-70"
                    />
                )}
                <div className={`${cardWithImage ? 'px-6 py-5' : 'p-5'} bg-[${cardBgColor}] flex flex-col gap-1`}>
                    <span className={`text-lg font-semibold text-[${cardTitleTextColor}]`}>
                        {cardTitle}
                    </span>
                    <p className={`text-sm text-[${cardTextColor}]`}>{cardDescription}</p>
                </div>
                </CardContent>
            </Card>
        </Link>
    )
}