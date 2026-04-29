"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { iconClockwise } from "@/app/assets/icons";

export default function Investigacion() {
    const [relatedResearch, setRelatedResearch] = useState([
        {
            id: 1,
            title: "Impacto de la nutrición en la salud digestiva",
            description: "Resumen de la investigación 1.",
            image: "/images/investigacion1.png",
            author: "Dra. García"
        },
        {
            id: 2,
            title: "Impacto de la nutrición en la salud digestiva",
            description: "Resumen de la investigación 1.",
            image: "/images/investigacion1.png",
            author: "Dra. García"
        },
        {
            id: 3,
            title: "Impacto de la nutrición en la salud digestiva",
            description: "Resumen de la investigación 1.",
            image: "/images/investigacion1.png",
            author: "Dra. García"
        }
    ]);
    const [displayedResearch, setDisplayedResearch] = useState(relatedResearch);
    const [filterType, setFilterType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const applyFilter = (research, query) => {
        if (!query.trim()) {
            return research;
        }
        
        const lowerQuery = query.toLowerCase();
        
        return research.filter((item) => {
            switch (filterType) {
                case "investigador":
                    return item.author?.toLowerCase().includes(lowerQuery) || false;
                case "titulo":
                    return item.title?.toLowerCase().includes(lowerQuery) || false;
                default:
                    return true;
            }
        });
    };

    const handleSearch = () => {
        const filtered = applyFilter(relatedResearch, searchQuery);
        setDisplayedResearch(filtered);
    };

    const handleFilterChange = (value) => {
        setFilterType(value);
        setSearchQuery("");
        setDisplayedResearch(relatedResearch);
    };

    useEffect(() => {
        setDisplayedResearch(relatedResearch);
    }, []);

    return (
        <main className="flex-grow px-20 py-10 h-[100%]">
            <h1 className="text-2xl font-bold">Fisiología Digestiva y Nutrición</h1>
            <p className="mt-3">
                La Fisiología Digestiva y Nutrición estudia cómo el cuerpo descompone los alimentos, 
                absorbe nutrientes y los utiliza para mantener sus funciones vitales. El sistema 
                digestivo transforma los alimentos en moléculas más simples, permitiendo la obtención 
                de energía y la reparación de tejidos.
            </p>
            <Image
                src="/images/curso1.png"
                alt="Fisiología Digestiva y Nutrición"
                width={600}
                height={400}
                className="object-cover rounded mt-5 w-full max-h-[400px]"
            />
            <p className="px-20 my-8">
                La digestión inicia en la boca, donde los dientes trituran los alimentos y las 
                enzimas de la saliva comienzan su descomposición. Luego, el bolo alimenticio viaja 
                por el esófago hasta el estómago, donde los ácidos y enzimas continúan el proceso de 
                degradación. El quimo resultante pasa al intestino delgado, donde se lleva a cabo la 
                absorción de la mayoría de los nutrientes gracias a la acción de la bilis, las enzimas 
                pancreáticas y la microbiota intestinal. <br /><br />

                Los nutrientes esenciales incluyen carbohidratos, proteínas, grasas, vitaminas y 
                minerales. Cada uno desempeña un papel específico: los carbohidratos proporcionan 
                energía, las proteínas ayudan en la reparación de tejidos, las grasas almacenan 
                energía y regulan funciones celulares, mientras que las vitaminas y minerales son 
                clave para procesos metabólicos y la función del sistema inmune.<br /><br />

                Diferentes factores pueden influir en la eficiencia del sistema digestivo, 
                como la edad, la dieta, el estrés y enfermedades digestivas. Una alimentación 
                equilibrada, rica en fibra y agua, favorece el tránsito intestinal y la absorción de nutrientes. 
            </p>
            <div className="flex gap-3">
                <Image
                    src="/images/curso2.png"
                    alt="Fisiología Digestiva y Nutrición"
                    width={600}
                    height={400}
                    className="object-cover rounded mt-5 w-full max-h-[400px]"
                />
                <Image
                    src="/images/curso3.png"
                    alt="Fisiología Digestiva y Nutrición"
                    width={600}
                    height={400}
                    className="object-cover rounded mt-5 w-full max-h-[400px]"
                />
            </div>
            <p className="px-20 my-8">
                Comprender la fisiología digestiva y la nutrición es clave para mejorar la salud 
                y prevenir enfermedades. Una alimentación equilibrada, junto con hábitos saludables, 
                garantiza que el cuerpo reciba los nutrientes necesarios para su correcto funcionamiento. 
                Cuidar el sistema digestivo no solo mejora la absorción de nutrientes, sino 
                que también tiene un impacto positivo en el bienestar general del organismo.
            </p>
            <section>
                <h2 className="text-2xl font-bold mt-10 mb-5">Investigaciones Relacionadas</h2>
                <div className="flex gap-3 mb-5 mt-5">
                    <Select value={filterType} onValueChange={handleFilterChange}>
                        <SelectTrigger className="w-[180px] bg-[#fff] rounded">
                            <SelectValue placeholder="Filtrar Por" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="investigador">Investigador</SelectItem>
                                <SelectItem value="titulo">Titulo</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <ButtonGroup className="rounded bg-[#fff] w-full">
                        <Input
                            className="rounded"
                            placeholder="Buscar..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <Button
                            onClick={handleSearch}
                            className="bg-[#E7473C] hover:bg-[#831d16] rounded text-white
                            hover:text-white hover:cursor-pointer"
                            variant="outline"
                            aria-label="Search"
                        >
                            <SearchIcon />
                        </Button>
                    </ButtonGroup>
                    <Button
                        onClick={() => {
                            setSearchQuery("");
                            setFilterType("");
                            setDisplayedResearch(relatedResearch);
                        }}
                        className="bg-[#fff] hover:bg-[#f0f0f0] rounded text-[#831d16]
                        hover:text-[#831d16] hover:cursor-pointer shadow"
                    >
                        {iconClockwise({})}
                    </Button>
                </div>
                <div className="flex gap-5 flex-wrap mt-5">
                    {displayedResearch.length > 0 ? (
                        displayedResearch.map((research) => (
                            <div key={research.id} className="flex-grow">
                                <Image
                                    src={research.image}
                                    alt={research.title}
                                    width={300}
                                    height={200}
                                    className="object-cover rounded w-full h-100 mt-5 min-w-full max-h-[200px] min-h-[200px] mb-3"
                                />
                                <Link href={`/investigaciones/investigacion-${research.id}`} className="text-md font-bold">{research.title}</Link>
                                <p className="text-gray-600">{research.description}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600 w-full text-center py-5">No hay investigaciones relacionadas disponibles.</p>
                    )}
                </div>
            </section>
        </main>
    );
}