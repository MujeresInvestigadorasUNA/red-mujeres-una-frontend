import Card from "@/app/components/Card";

const RESEARCHES_CARDS = [{
    id: 1,
    image: "/images/curso6.png",
    title: "Investigación 1",
    description: "Descripción de la investigación 1.",
    url: "/Investigaciones/investigacion-1"
}, {
    id: 2,
    image: "/images/investigacion2.png",
    title: "Investigación 2",
    description: "Descripción de la investigación 2.",
    url: "/Investigaciones/investigacion-2"
}, {
    id: 3,
    image: "/images/curso1.png",
    title: "Investigación 3",
    description: "Descripción de la investigación 3.",
    url: "/Investigaciones/investigacion-3"
}, {
    id: 4,
    image: "/images/curso5.png",
    title: "Investigación 4",
    description: "Descripción de la investigación 4.",
    url: "/Investigaciones/investigacion-4"
}, {
    id: 5,
    image: "/images/curso2.png",
    title: "Investigación 5",
    description: "Descripción de la investigación 5.",
    url: "/Investigaciones/investigacion-5"
}, {
    id: 6,
    image: "/images/curso4.png",
    title: "Investigación 6",
    description: "Descripción de la investigación 6.",
    url: "/Investigaciones/investigacion-6"
}];

export default function Investigaciones() {
    return (
        <main className="flex-grow px-20 py-10 h-[100%] toolsSection">
            <h1 className="text-2xl font-bold">Investigaciones</h1>
            <p className="mt-3">
                Encuentra aquí todas las investigaciones realizadas por cada una de las 
                integrantes de la Red de Mujeres Académicas, con su información más relevante.
            </p>
            <div className="flex gap-4 mt-5">
                <div className="w-full">
                    <label htmlFor="filtro-investigaciones" className="font-semibold">Filtrar Investigaciones:</label>
                    <input type="text" id="filtro-investigaciones" placeholder="Buscar..." className="rounded border border-gray-300 px-3 py-2 w-full mt-2" />
                </div>
                <div className="w-70">
                    <label htmlFor="filtro-investigaciones" className="font-semibold">Filtrar Por:</label>
                    <select id="filtro-investigaciones" className="rounded border border-gray-300 px-3 py-2 w-full mt-2">
                        <option value="todos">Todos</option>
                        <option value="temas">Temas</option>
                        <option value="autoras">Autoras</option>
                    </select>
                </div>
            </div>
            <div className="flex gap-5 flex-wrap mt-5">
                {RESEARCHES_CARDS.map((card) => (
                    <div key={card.id} className="flex-fill flex-grow flex-shrink basis-[30%] min-w-[250px]">
                        <Card
                            cardImage={card.image}
                            cardTitle={card.title}
                            cardDescription={card.description}
                            cardURL={card.url}
                            cardBgColor="#E7473C"
                            cardTitleTextColor="#F0F0F0"
                            cardTextColor="#F0F0F0"
                        />
                    </div>
                ))}
            </div>
        </main>
    );
}