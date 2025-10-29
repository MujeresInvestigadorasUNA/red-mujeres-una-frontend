"use client";
import Image from "next/image";
import Link from "next/link";
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(
  () => import('@/app/components/RichTextEditor'),
  { ssr: false } // This ensures it only renders on the client
);

export default function Investigacion() {

    return (
        <main className="flex-grow px-20 py-10 h-[100%]">
            <h1 className="text-2xl font-bold">Fisiología Digestiva y Nutrición</h1>
            <p className="mt-3">
                La Fisiología Digestiva y Nutrición estudia cómo el cuerpo descompone los alimentos,
                absorbe nutrientes y los utiliza para mantener sus funciones vitales. El sistema
                digestivo transforma los alimentos en moléculas más simples, permitiendo la obtención
                de energía y la reparación de tejidos.
            </p>
            
            <RichTextEditor />

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
                    <div className="flex-grow">
                        <Image
                            src="/images/investigacion1.png"
                            alt="Investigación 1"
                            width={300}
                            height={200}
                            className="object-cover rounded w-full h-100 mt-5 min-w-100 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/investigaciones/investigacion-1" className="text-md font-bold">Impacto de la nutrición en la salud digestiva</Link>
                        <p className="text-gray-600">Resumen de la investigación 1.</p>
                    </div>
                    <div className="flex-grow">
                        <Image
                            src="/images/investigacion1.png"
                            alt="Investigación 1"
                            width={300}
                            height={200}
                            className="object-cover rounded w-full h-100 mt-5 min-w-100 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/investigaciones/investigacion-1" className="text-md font-bold">Impacto de la nutrición en la salud digestiva</Link>
                        <p className="text-gray-600">Resumen de la investigación 1.</p>
                    </div>
                    <div className="flex-grow">
                        <Image
                            src="/images/investigacion1.png"
                            alt="Investigación 1"
                            width={300}
                            height={200}
                            className="object-cover rounded w-full h-100 mt-5 min-w-100 max-h-[200px] min-h-[200px] mb-3"
                        />
                        <Link href="/investigaciones/investigacion-1" className="text-md font-bold">Impacto de la nutrición en la salud digestiva</Link>
                        <p className="text-gray-600">Resumen de la investigación 1.</p>
                    </div>
                </div>
            </section>
        </main>
    );
}