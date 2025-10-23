import Card from "@/app/components/Card";
import { iconClockwise, iconSearch } from "@/app/assets/icons";

const FORUMS_CARDS = [{
    id: 1,
    image: "/images/jinette.png",
    title: "Jinette Naranjo",
    description:
      "Jinette Naranjo es catedrática de Fisiología y doctora en Farmacia con una amplia trayectoria docente e investigadora.",
    url: "/Foros/jinette-naranjo"
}, {
    id: 2,
    image: "/images/kattia.png",
    title: "Kattia Vasconcelos ",
    description:
      "Kattia Vasconcelos es psicóloga graduada de la Universidad de Costa Rica, doctora por la Universidad Nacional Autónoma de México (UNAM).",
    url: "/Foros/kattia-vasconcelos"
}, {
    id: 3,
    image: "/images/mildred.png",
    title: "Mildred Arguedas",
    description:
      "Bioeticista con amplia experiencia en ética de la investigación y la atención en salud.",
    url: "/Foros/mildred-arguedas"
}, {
    id: 4,
    image: "/images/anayudel.png",
    title: "Anayudel Gutierrez",
    description:
      "Investigadora del CIEM con un enfoque en estudios de género y políticas públicas.",
    url: "/Foros/anayudel-gutierrez"
}, {
    id: 5,
    image: "/images/brenda.png",
    title: "Brenda Jiménez",
    description:
      "Investigadora con experiencia en ciencias sociales y desarrollo comunitario.",
    url: "/Foros/brenda-jimenez"
}];

export default function Foros() {
    return (
        <main className="flex-grow px-20 py-10 h-[100%] toolsSection">
            <h1 className="text-2xl font-bold">Foros</h1>
            <p className="mt-3 mb-5">
                Encuentra aquí los foros de cada una de las integrantes de la 
                Red de Mujeres Académicas, con su información más relevante, sus logros 
                y sus investigaciones.
            </p>
            <div className="flex items-stretch gap-3 mb-3">
                <button className="bg-[#E7473C] text-white p-2 rounded text-nowrap px-4
                hover:cursor-pointer hover:bg-[#b0352c] font-semibold">
                    Mi Foro
                </button>
                <span>
                    <select
                        defaultValue=""
                        className="bg-[#ffffff] py-2 px-2 rounded h-full border border-gray-300"
                    >
                        <option value="" disabled>Filtrar Por</option>
                        <option value="temas">Temas</option>
                    </select>
                </span>
                <span className="flex w-full">
                    <input
                        type="search"
                        placeholder="Buscar..."
                        className="bg-[#ffffff] py-2 px-3 rounded-l w-full border border-gray-300"
                    />
                    <button className="bg-[#E7473C] text-white py-2 px-3 rounded-r text-sm 
                    hover:cursor-pointer hover:bg-[#b0352c] font-semibold">
                        {iconSearch({})}
                    </button>
                </span>
                <button className="bg-[#E7473C] text-white py-2 px-3 rounded
                hover:cursor-pointer hover:bg-[#b0352c] font-semibold">
                    {iconClockwise({})}
                </button>
            </div>
            <div className="flex gap-5 flex-wrap mt-5">
                {FORUMS_CARDS.map((card) => (
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