"use client";
import { useRouter } from "next/navigation";

export default function AuthorLinks({ authors = [], fallback = "Investigadora", className = "" }) {
    const router = useRouter();

    if (!authors || authors.length === 0) {
        return <span className={`text-xs text-slate-500 truncate ${className}`}>{fallback}</span>;
    }

    return (
        <span className={`text-xs text-slate-500 truncate ${className}`}>
            {authors.map((author, i) => {
                const handleClick = (e) => {
                    e.stopPropagation();
                    router.push(`/Foros/${author.id}`);
                };

                const handleKeyDown = (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/Foros/${author.id}`);
                    }
                };

                return (
                    <span key={author.id ?? i}>
                        {i > 0 && ", "}
                        <span
                            role="link"
                            tabIndex={0}
                            onClick={handleClick}
                            onKeyDown={handleKeyDown}
                            className="hover:text-[#C0392B] hover:underline transition-colors cursor-pointer"
                        >
                            {author.name}
                        </span>
                    </span>
                );
            })}
        </span>
    );
}
