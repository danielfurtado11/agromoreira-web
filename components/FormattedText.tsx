import type { ReactNode } from "react";

/**
 * Renders admin-entered text with a tiny, predictable subset of formatting:
 * **bold** via double asterisks, with line breaks preserved by the caller's
 * `whitespace-pre-line`.
 *
 * Deliberately not a full Markdown engine — the text is written by a
 * non-technical admin in a plain textarea, so a lone "#" or "-" should stay
 * literal, not silently become a heading or a list.
 *
 * Safe by construction: bold runs become real <strong> elements and the rest
 * stays a plain string, so React escapes it — no dangerouslySetInnerHTML.
 */
export function FormattedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return <div className={className}>{renderInlineBold(text)}</div>;
}

function renderInlineBold(text: string): ReactNode[] {
  // Split on **...** while keeping the delimiters (capturing group), so the
  // pieces alternate between plain text and bold runs. `.+?` is non-greedy so
  // several bold spans on one line don't merge into one, and it requires at
  // least one character, so "****" stays literal.
  return text.split(/(\*\*.+?\*\*)/g).map((part, index) => {
    const match = /^\*\*(.+?)\*\*$/.exec(part);
    return match ? <strong key={index}>{match[1]}</strong> : part;
  });
}
