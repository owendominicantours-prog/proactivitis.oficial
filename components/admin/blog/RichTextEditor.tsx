"use client";

import { useEffect, useRef } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const TOOLBAR: Array<{ label: string; command: string; value?: string }> = [
  { label: "B", command: "bold" },
  { label: "I", command: "italic" },
  { label: "U", command: "underline" },
  { label: "H2", command: "formatBlock", value: "h2" },
  { label: "H3", command: "formatBlock", value: "h3" },
  { label: "P", command: "formatBlock", value: "p" },
  { label: "•", command: "insertUnorderedList" },
  { label: "1.", command: "insertOrderedList" },
  { label: "❝", command: "formatBlock", value: "blockquote" }
];

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastValueRef = useRef<string>(value);

  useEffect(() => {
    if (!editorRef.current) return;
    if (value !== lastValueRef.current) {
      editorRef.current.innerHTML = value || "";
      lastValueRef.current = value;
    }
  }, [value]);

  const handleCommand = (command: string, commandValue?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, commandValue ?? undefined);
    const html = editorRef.current.innerHTML;
    lastValueRef.current = html;
    onChange(html);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    lastValueRef.current = html;
    onChange(html);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2">
        {TOOLBAR.map((tool) => (
          <button
            key={`${tool.command}-${tool.label}`}
            type="button"
            onClick={() => handleCommand(tool.command, tool.value)}
            className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            {tool.label}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        className="min-h-[260px] whitespace-pre-wrap px-4 py-3 text-sm text-slate-700 outline-none"
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder ?? ""}
        suppressContentEditableWarning
      />
    </div>
  );
}
