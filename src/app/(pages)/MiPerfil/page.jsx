"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { iconEye, iconEyeSlash } from "@/app/assets/icons";
import { getUserInfo, updateUser } from "@/lib/api/auth";
import { useUser } from "@/app/contexts/UserContext";
import { toast } from "sonner";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput
} from "@/components/ui/input-group";

export default function MiPerfil() {
    const { user, setUserData } = useUser();

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        profession: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const togglePassword = () => setShowPassword(!showPassword);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic form validation
        if (!form.firstName || !form.lastName || !form.email || !form.profession || !form.password || !form.confirmPassword) {
            toast.error("Please fill in all required fields");
            return;
        }
        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const response = await updateUser({
                id: user.id,
                first_name: form.firstName,
                last_name: form.lastName,
                profession: form.profession,
                email: form.email,
                password: form.password,
                user_type_id: user.user_type_id
            });

            if (!response.ok) {
                const data = await response.json();
                return toast.warning(data.detail?.[0]?.msg || "Error al guardar los cambios");
            }

            setUserData({
                id: user.id,
                first_name: form.firstName,
                last_name: form.lastName,
                profession: form.profession,
                email: form.email,
                user_type_id: user.user_type_id
            });
            toast.success("Perfil actualizado correctamente");
        } catch (err) {
            console.error(err);
            toast.warning("Error de conexión");
        }
    };

    const fetchUserInfo = async () => {
        try {
            const response = await getUserInfo({ user_id: user.id });
            const data = await response.json();
            if (!response.ok) {
                toast.warning(data.detail?.[0]?.msg || "Error al obtener la información del usuario");
                return;
            }
            setForm({
                firstName: data.first_name || "",
                lastName: data.last_name || "",
                profession: data.profession || "",
                email: data.email || "",
                password: data.password || "",
                confirmPassword: data.password || ""
            });
        } catch (err) {
            toast.warning("Error de conexión");
        }
    };

    useEffect(() => {
        console.log(user);
        if (!user?.id) return;
        fetchUserInfo();
    }, [user]);

    return (
        <main className="flex mainSection pb-20 pt-10">
            <form className="flex flex-col gap-4 w-1/2 m-auto" onSubmit={handleSubmit}>
                <div className="flex gap-4">
                    <div className="grid w-full gap-3">
                        <Label htmlFor="firstName" className="font-semibold text-white text-md">
                            Nombre
                        </Label>
                        <Input
                            id="firstName"
                            name="firstName"
                            placeholder="Nombre"
                            type="text"
                            value={form.firstName}
                            onChange={onChange}
                            required
                            className="bg-white h-12 rounded"
                            style={{ fontSize: "1rem" }}
                        />
                    </div>
                    <div className="grid w-full items-center gap-3">
                        <Label htmlFor="firstName" className="font-semibold text-white text-md">
                            Apellidos
                        </Label>
                        <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Apellidos"
                            type="text"
                            value={form.lastName}
                            onChange={onChange}
                            required
                            className="bg-white h-12 rounded"
                            style={{ fontSize: "1rem" }}
                        />
                    </div>
                </div>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="firstName" className="font-semibold text-white text-md">
                        Profesión
                    </Label>
                    <Input
                        id="profession"
                        name="profession"
                        placeholder="Profesión"
                        type="text"
                        value={form.profession}
                        onChange={onChange}
                        required
                        className="bg-white h-12 rounded"
                        style={{ fontSize: "1rem" }}
                    />
                </div>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="email" className="font-semibold text-white text-md">
                        Correo Electrónico
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        placeholder="Correo Electrónico"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        required
                        className="bg-white h-12 rounded"
                        style={{ fontSize: "1rem" }}
                    />
                </div>
                <div className="flex gap-4">
                    <div className="grid w-full items-center gap-3">
                        <Label htmlFor="email" className="font-semibold text-white text-md">
                            Contraseña
                        </Label>
                        <InputGroup className="bg-white h-12 rounded">
                            <InputGroupInput
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña"
                                value={form.password}
                                onChange={onChange}
                                style={{ fontSize: "1rem" }}
                            />
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                    type="button"
                                    onClick={togglePassword}
                                >
                                    {showPassword ?
                                        iconEyeSlash({ size: 16, color: "#8A192A" }) :
                                        iconEye({ size: 16, color: "#8A192A" })
                                    }
                                </InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                    <div className="grid w-full items-center gap-3">
                        <Label htmlFor="email" className="font-semibold text-white text-md">
                            Confirmar Contraseña
                        </Label>
                        <InputGroup className="bg-white h-12 rounded">
                            <InputGroupInput
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirmar Contraseña"
                                value={form.confirmPassword}
                                onChange={onChange}
                                style={{ fontSize: "1rem" }}
                            />
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                    type="button"
                                    onClick={toggleConfirmPassword}
                                >
                                    {showConfirmPassword
                                        ? iconEyeSlash({ size: 16, color: "#8A192A" })
                                        : iconEye({ size: 16, color: "#8A192A" })}
                                </InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                </div>
                <Button type="submit" className="bg-[#b62116] text-white hover:bg-red-700
                transition hover:cursor-pointer">
                    Guardar Cambios
                </Button>
            </form>
        </main>
    );
}