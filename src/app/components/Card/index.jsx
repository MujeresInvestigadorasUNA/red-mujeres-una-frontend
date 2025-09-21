import Image from "next/image";
import Link from "next/link";

export default function Card({ 
    cardImage = "/images/pilar.png", 
    cardTitle = "Card Title", 
    cardDescription = "Card Description"
}) {
    return (
        <Link href="/Foros">
            <div className="bg-[#F0F0F0] text-[#E7473C] rounded w-full
            hover:brightness-80 duration-400 ease-in-out cursor-pointer">
                <Image
                    src={cardImage}
                    alt={cardTitle}
                    width={1920}
                    height={1316}
                    className="w-full h-70 object-cover rounded-t object-top"
                />
                <div className="mt-3 px-5 pb-5">
                    <h5 className="text-[#831d16]">{cardTitle}</h5>
                    <p className="text-[#E7473C] text-sm font-normal">{cardDescription}</p>
                </div>
            </div>
        </Link>
    )
}