"use client";
import Link from "next/link";

export default function AuthorLinks({ authors = [], fallback = "Investigadora", className = "" }) {
    if (!authors || authors.length === 0) {
        return <span className={`text-xs text-slate-500 truncate ${className}`}>{fallback}</span>;
    }

    return (
        <span className={`text-xs text-slate-500 truncate ${className}`}>
            {authors.map((author, i) => (
                <span key={author.id ?? i}>
                    {i > 0 && ", "}
                    <Link
                        href={`/Foros/${author.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-[#C0392B] hover:underline transition-colors"
                    >
                        {author.name}
                    </Link>
                </span>
            ))}
        </span>
    );
}
