import InlineMarkdown from "./InlineMarkdown";
import Callout from "./Callout";

// Renders the typed content-block arrays used throughout DOMAIN_DEEPDIVE
// (and similar) data: {type:"p"|"bullets"|"code"|"callout", ...}. This is
// NOT a markdown-string parser (unlike the Stock AI reference's Markdown
// component) — the source content is already structured, so we just map
// each typed block to its element.
export default function ContentBlocks({ blocks }) {
  if (!blocks || !blocks.length) return null;
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        if (b.type === "p") {
          return (
            <p key={i} className="text-[15px] leading-relaxed text-ink-muted">
              <InlineMarkdown text={b.text} />
            </p>
          );
        }
        if (b.type === "bullets") {
          return (
            <ul key={i} className="list-disc pl-5 space-y-2">
              {b.items.map((item, j) => (
                <li key={j} className="text-[15px] leading-relaxed text-ink-muted">
                  <InlineMarkdown text={item} />
                </li>
              ))}
            </ul>
          );
        }
        if (b.type === "code") {
          return (
            <pre
              key={i}
              className="bg-[#0f172a] text-[#e2e8f0] rounded-lg p-4 overflow-x-auto text-[13px] leading-relaxed font-mono"
            >
              <code>{b.body}</code>
            </pre>
          );
        }
        if (b.type === "callout") {
          return (
            <Callout key={i} kind={b.kind || "tip"}>
              <InlineMarkdown text={b.text} />
            </Callout>
          );
        }
        return null;
      })}
    </div>
  );
}
