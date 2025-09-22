import Image from "next/image";
import Link from "next/link";

export default function Card({ 
    cardImage = "/images/pilar.png", 
    cardTitle = "Card Title", 
    cardDescription = "Card Description",
    cardURL = "/",
    cardMinWidth = "50%",
    cardBgColor = "#F0F0F0",
    cardTitleTextColor = "#831d16",
    cardTextColor = "#E7473C"
}) {
    return (
        <Link href={cardURL}>
            <div 
                className={`bg-[${cardBgColor}] text-[${cardTextColor}] rounded 
                hover:brightness-80 duration-400 ease-in-out cursor-pointer
                shadow-md h-full`}
                style={{ minWidth: "33%" }}
            >
                <Image
                    src={cardImage}
                    alt={cardTitle}
                    width={1920}
                    height={1316}
                    className="h-70 object-cover rounded-t object-top"
                />
                <div className="mt-3 px-5 pb-5">
                    <h5 
                        className="mb-2 font-bold" 
                        style={{ color: cardTitleTextColor }}
                    >
                        {cardTitle}
                    </h5>
                    <p 
                        className="text-sm font-normal" 
                        style={{ color: cardTextColor }}
                    >
                        {cardDescription}
                    </p>
                </div>
            </div>
        </Link>
    )
}