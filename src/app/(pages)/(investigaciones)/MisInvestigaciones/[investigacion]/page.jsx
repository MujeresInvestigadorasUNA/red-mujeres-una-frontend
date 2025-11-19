"use client";
import RichEditor from "@/app/components/RichEditor";
import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRef, useState } from "react";
import { iconEye, iconEyeSlash, iconTrash } from "@/app/assets/icons";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Investigacion() {
    const photoInputRef = useRef(null);

    const [isPublicLabel, setIsPublicLabel] = useState("Investigación Privada");
    const [isPublicIcon, setIsPublicIcon] = useState(iconEyeSlash({ color: "#999" }));
    const handleOnPublicChange = (checked) => {
        if (checked) {
            setIsPublicLabel("Investigación Pública");
            setIsPublicIcon(iconEye({ color: "#E7473C" }));
        } else {
            setIsPublicLabel("Investigación Privada");
            setIsPublicIcon(iconEyeSlash({ color: "#999" }));
        }
    };

    const handlePhotoClick = () => {
        photoInputRef.current.click(); // trigger hidden input
    };

    return (
        <main className="flex-grow px-20 py-10 h-[100%]">
            <div className="flex items-center justify-between gap-2 mb-5">
                <span className="flex items-center space-x-2">
                    <Switch
                        id="isPublic"
                        name="isPublic"
                        onCheckedChange={handleOnPublicChange}
                    />
                    <Label htmlFor="isPublic">
                        {isPublicLabel}
                        {isPublicIcon}
                    </Label>
                </span>
                <button className="bg-[#E7473C] p-2 rounded text-white 
                hover:brightness-90 hover:cursor-pointer">
                    {iconTrash({})}
                </button>
            </div>
            <input 
                type="text" 
                placeholder="Título de la Investigación" 
                className="w-full text-2xl font-bold border-0 
                focus:ring-0 focus:outline-none"
            />
            <Textarea className="p-0 mt-3 h-40 resize-none"/>
            <div className="mt-5 w-full flex bg-gray-100">
                <Input
                    id="photo"
                    name="photo"
                    type="file"
                    accept="image/*"
                    ref={photoInputRef}
                    className="hidden"
                />
                <div className="relative inline-block w-full group">
                    <Image
                        onClick={handlePhotoClick}
                        src={"/images/curso1.png"}
                        alt="Foto de perfil"
                        width={3000}
                        height={3000}
                        className="w-full h-80 rounded object-cover
                        hover:cursor-pointer hover:brightness-95
                        transition-all duration-200 corner-img"
                    />
                    {/* Hidden until hover */}
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 rounded-full w-6 h-6 p-1 shadow-md 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        hover:cursor-pointer hover:brightness-90"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <Textarea className="p-0 mt-3 h-50 resize-none mx-20 my-8 w-8/9" />
            <div className="flex gap-3">
                <div className="mt-5 w-full flex bg-gray-100">
                    <Input
                        id="photo"
                        name="photo"
                        type="file"
                        accept="image/*"
                        ref={photoInputRef}
                        className="hidden"
                    />
                    <div className="relative inline-block w-full group">
                        <Image
                            onClick={handlePhotoClick}
                            src={"/images/curso2.png"}
                            alt="Foto de perfil"
                            width={3000}
                            height={3000}
                            className="w-full h-80 rounded object-cover
                            hover:cursor-pointer hover:brightness-95
                            transition-all duration-200 corner-img"
                        />
                        {/* Hidden until hover */}
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 rounded-full w-6 h-6 p-1 shadow-md 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200
                            hover:cursor-pointer hover:brightness-90"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div className="mt-5 w-full flex bg-gray-100">
                    <Input
                        id="photo"
                        name="photo"
                        type="file"
                        accept="image/*"
                        ref={photoInputRef}
                        className="hidden"
                    />
                    <div className="relative inline-block w-full group">
                        <Image
                            onClick={handlePhotoClick}
                            src={"/images/curso3.png"}
                            alt="Foto de perfil"
                            width={3000}
                            height={3000}
                            className="w-full h-80 rounded object-cover
                            hover:cursor-pointer hover:brightness-95
                            transition-all duration-200 corner-img"
                        />
                        {/* Hidden until hover */}
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 rounded-full w-6 h-6 p-1 shadow-md 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200
                            hover:cursor-pointer hover:brightness-90"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
            <Textarea className="p-0 mt-3 h-40 resize-none mx-20 my-8 w-8/9" />
            <Button className="bg-[#E7473C] text-white w-full hover:bg-[#cf4035]
            hover:cursor-pointer">
                Guardar Cambios
            </Button>
        </main>
    );
}