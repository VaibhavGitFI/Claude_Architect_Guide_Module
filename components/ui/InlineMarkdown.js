import { Fragment } from "react";

// Minimal inline markdown: **bold**, *italic*, `code` — matches the subset
// v1/app.js's renderInline() supported. No block-level parsing here; the
// deep-dive/study content already arrives as typed blocks (see ContentBlocks).
export default function InlineMarkdown({ text }) {
  if (!text) return null;
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="font-mono text-[0.92em] bg-accent-soft text-accent-700 px-1.5 py-0.5 rounded">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
