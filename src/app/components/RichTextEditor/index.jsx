'use client';
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Import Quill styles

const RichTextEditor = forwardRef((_, ref) => {
    const editorRef = useRef(null);
    const quillRef = useRef(null);

    useEffect(() => {
        if (editorRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ header: [1, 2, false] }],
                        ['bold', 'italic', 'underline'],
                        ['link', 'image'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['clean']
                    ]
                }
            });
        }

        return () => {
            if (quillRef.current) {
                quillRef.current = null;
            }
        };
    }, []);

    // Expose the getContent function to the parent component
    useImperativeHandle(ref, () => ({
        getContent: () => {
            if (quillRef.current) {
                return quillRef.current.root.innerHTML; // Return the HTML content
            }
            return '';
        },
    }));

    return <div ref={editorRef} style={{ height: '300px' }} />;
});

RichTextEditor.displayName = 'RichTextEditor';
export default RichTextEditor;