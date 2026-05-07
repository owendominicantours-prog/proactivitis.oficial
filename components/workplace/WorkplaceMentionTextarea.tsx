"use client";

import { useMemo, useRef, useState } from "react";
import { AtSign, Building2, UserRound } from "lucide-react";

export type WorkplaceMentionOption = {
  id: string;
  type: "department" | "employee";
  label: string;
  token: string;
  subtitle?: string | null;
  avatarUrl?: string | null;
};

type Props = {
  options: WorkplaceMentionOption[];
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9@_-]+/g, " ")
    .trim();

const initials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "P";

export default function WorkplaceMentionTextarea({ options }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [body, setBody] = useState("");
  const [cursor, setCursor] = useState(0);

  const mentionMatch = useMemo(() => {
    const beforeCursor = body.slice(0, cursor);
    const match = beforeCursor.match(/(^|\s)@([\p{L}\p{N}_-]*)$/u);
    if (!match || match.index === undefined) return null;
    return {
      start: match.index + match[1].length,
      query: match[2] ?? ""
    };
  }, [body, cursor]);

  const suggestions = useMemo(() => {
    if (!mentionMatch) return [];
    const query = normalize(mentionMatch.query);
    return options
      .filter((option) => {
        if (!query) return true;
        return normalize(`${option.label} ${option.token} ${option.subtitle ?? ""}`).includes(query);
      })
      .slice(0, 8);
  }, [mentionMatch, options]);

  const updateCursor = () => {
    const nextCursor = textareaRef.current?.selectionStart ?? 0;
    setCursor(nextCursor);
  };

  const selectMention = (option: WorkplaceMentionOption) => {
    if (!mentionMatch) return;
    const mentionText = `@${option.token}`;
    const nextBody = `${body.slice(0, mentionMatch.start)}${mentionText} ${body.slice(cursor)}`;
    const nextCursor = mentionMatch.start + mentionText.length + 1;
    setBody(nextBody);
    setCursor(nextCursor);
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  return (
    <div className="relative">
      {suggestions.length ? (
        <div className="absolute bottom-[calc(100%+0.5rem)] left-0 right-0 z-30 overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#0b1728] shadow-2xl shadow-slate-950/50">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
              <AtSign className="h-4 w-4" aria-hidden />
              Mencionar
            </p>
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {suggestions.map((option) => {
              const Icon = option.type === "department" ? Building2 : UserRound;
              return (
                <button
                  key={`${option.type}-${option.id}`}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectMention(option);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-cyan-300/10"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-cyan-300/10 text-cyan-100">
                    {option.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={option.avatarUrl} alt={option.label} className="h-full w-full object-cover" />
                    ) : option.type === "employee" ? (
                      <span className="text-xs font-black">{initials(option.label)}</span>
                    ) : (
                      <Icon className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-white">@{option.token}</span>
                    <span className="block truncate text-xs text-slate-400">{option.label}{option.subtitle ? ` - ${option.subtitle}` : ""}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <textarea
        ref={textareaRef}
        name="body"
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
          setCursor(event.target.selectionStart);
        }}
        onClick={updateCursor}
        onKeyUp={updateCursor}
        placeholder="Escribe tu mensaje. Usa @ para mencionar departamentos o personas..."
        className="min-h-24 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
      />
    </div>
  );
}
