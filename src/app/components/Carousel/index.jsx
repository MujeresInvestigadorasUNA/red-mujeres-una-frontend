"use client";
import { useRef } from "react";
import Card from "../Card";

export default function Carousel({
  cards = [],
  scrollButtonsColor = "#E7473C",
  scrollButtonsBgColor = "#F0F0F0"
}) {
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
        className={`text-[${scrollButtonsColor}] bg-${scrollButtonsBgColor} h-30 p-2   
        rounded-full shadow-md hover:outline-3 hover:shadow-lg hover:scale-101 
        shadow transition-shadow duration-300 ease-in-out cursor-pointer
        hover:bg-gray-300 transition-transform transform`}
        style={{ backgroundColor: scrollButtonsBgColor, color: scrollButtonsColor }}
      >
        {"<"}
      </button>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-hidden scroll-smooth w-full px-2 hide-scrollbar rounded"
      >
        {cards.map((card) => (
          <div key={card.id} className="min-w-[60%] sm:min-w-[49.9%]">
            <Card
              cardImage={card.image}
              cardTitle={card.title}
              cardDescription={card.description}
              cardURL={card.url}
              cardBgColor={card.bgColor}
              cardTitleTextColor={card.titleTextColor}
              cardTextColor={card.textColor}
              cardWithImage={card.withImage}
            />
          </div>
        ))}
      </div>

      {/* Right button */}
      <button
        onClick={() => scroll("right")}
        className={`text-[${scrollButtonsColor}] bg-${scrollButtonsBgColor} h-30 p-2   
        rounded-full shadow-md hover:outline-3 hover:shadow-lg hover:scale-101 
        shadow transition-shadow duration-300 ease-in-out cursor-pointer
        hover:bg-gray-300 transition-transform transform`}
        style={{ backgroundColor: scrollButtonsBgColor, color: scrollButtonsColor }}
      >
        {">"}
      </button>
    </div>
  );
}
