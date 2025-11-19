"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";

export default function RichEditor() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false }),
    ],
    content: "<p>Start writing...</p>",
    immediatelyRender: false,
  });

  if (!isMounted || !editor) return null;

  // Image upload handler
  const addImage = () => {
    const url = window.prompt("Paste image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="p-4 border rounded bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className="btn">
          Bold
        </button>

        <button onClick={() => editor.chain().focus().toggleItalic().run()} className="btn">
          Italic
        </button>

        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="btn">
          Underline
        </button>

        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="btn">
          H1
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="btn">
          H2
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="btn">
          H3
        </button>

        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="btn">
          • List
        </button>

        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className="btn">
          1. List
        </button>

        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className="btn">
          ❝ Quote
        </button>

        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="btn">
          Code
        </button>

        <button onClick={addImage} className="btn">
          🖼 Image
        </button>

        <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="btn">
          ― HR
        </button>

        <button onClick={() => editor.chain().focus().undo().run()} className="btn">
          Undo
        </button>

        <button onClick={() => editor.chain().focus().redo().run()} className="btn">
          Redo
        </button>
      </div>

      {/* Editor */}
      <div className="border rounded p-4 min-h-[200px]">
        <EditorContent editor={editor} />
      </div>

      <style jsx>{`
        .btn {
          padding: 6px 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: #f9f9f9;
          cursor: pointer;
          font-size: 14px;
        }
        .btn:hover {
          background: #eee;
        }
      `}</style>
    </div>
  );
}