"use client";
import { useRef } from "react";
import Card from "../Card";

const FORUMS_CARDS = [
  {
    id: 1,
    image: "/images/pilar.png",
    title: "Pilar Aranda",
    description:
      "Pilar Aranda Ramírez es catedrática de Fisiología y doctora en Farmacia con una amplia trayectoria docente e investigadora.",
    url: "/Foros"
  },
  {
    id: 2,
    image: "/images/tatiana.png",
    title: "Tatiana López",
    description:
      "Aguiar es psicóloga graduada de la Universidad de Costa Rica, doctora por la Universidad Nacional Autónoma de México (UNAM).",
  
    url: "/Foros"
  },
  {
    id: 3,
    image: "/images/tatiana.png",
    title: "Tatiana López",
    description:
      "Aguiar es psicóloga graduada de la Universidad de Costa Rica, doctora por la Universidad Nacional Autónoma de México (UNAM).",
    url: "/Foros"
  },
  {
    id: 4,
    image: "/images/tatiana.png",
    title: "Tatiana López",
    description:
      "Aguiar es psicóloga graduada de la Universidad de Costa Rica, doctora por la Universidad Nacional Autónoma de México (UNAM).",
    url: "/Foros"
  },{
    id: 5,
    image: "/images/tatiana.png",
    title: "Tatiana López",
    description:
      "Aguiar es psicóloga graduada de la Universidad de Costa Rica, doctora por la Universidad Nacional Autónoma de México (UNAM).",
  },{
    id: 6,
    image: "/images/tatiana.png",
    title: "Tatiana López",
    description:
      "Aguiar es psicóloga graduada de la Universidad de Costa Rica, doctora por la Universidad Nacional Autónoma de México (UNAM).",
    url: "/Foros"
  },{
    id: 7,
    image: "/images/tatiana.png",
    title: "Tatiana López",
    description:
      "Aguiar es psicóloga graduada de la Universidad de Costa Rica, doctora por la Universidad Nacional Autónoma de México (UNAM).",
    url: "/Foros"
  },
];

export default function Carousel() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -clientWidth : clientWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex gap-2 w-full items-center">
      {/* Left button */}
      <button
        onClick={() => scroll("left")}
        className="h-30 p-2 bg-gray-200 rounded-full shadow hover:bg-gray-300 text-[#E7473C]
        shadow-md hover:outline-3 hover:shadow-lg hover:scale-101 
        transition-shadow duration-300 ease-in-out cursor-pointer
        transition-transform transform"
      >
        {"<"}
      </button>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-hidden scroll-smooth w-full px-2 hide-scrollbar rounded"
      >
        {FORUMS_CARDS.map((card) => (
          <div key={card.id} className="min-w-[60%] sm:min-w-[49.9%]">
            <Card
              cardImage={card.image}
              cardTitle={card.title}
              cardDescription={card.description}
              cardURL={card.url}
            />
          </div>
        ))}
      </div>

      {/* Right button */}
      <button
        onClick={() => scroll("right")}
        className="h-30 p-2 bg-gray-200 rounded-full shadow hover:bg-gray-300 text-[#E7473C]
        shadow-md hover:outline-3 hover:shadow-lg hover:scale-101 
        transition-shadow duration-300 ease-in-out cursor-pointer
        transition-transform transform"
      >
        {">"}
      </button>
    </div>
  );
}
