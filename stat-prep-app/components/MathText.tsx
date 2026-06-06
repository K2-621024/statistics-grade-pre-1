"use client";
import { InlineMath, BlockMath } from "react-katex";

type Props = { text: string; block?: boolean };

export default function MathText({ text, block = false }: Props) {
  if (block) {
    return <BlockMath math={text} />;
  }

  // Split on $$...$$ first (block), then $...$ (inline)
  const parts: React.ReactNode[] = [];
  const tokens = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g);

  tokens.forEach((token, i) => {
    if (token.startsWith("$$") && token.endsWith("$$")) {
      parts.push(<BlockMath key={i} math={token.slice(2, -2)} />);
    } else if (token.startsWith("$") && token.endsWith("$") && token.length > 2) {
      parts.push(<InlineMath key={i} math={token.slice(1, -1)} />);
    } else {
      // Plain text — preserve newlines
      token.split("\n").forEach((line, j) => {
        if (j > 0) parts.push(<br key={`${i}-br-${j}`} />);
        if (line) parts.push(<span key={`${i}-${j}`}>{line}</span>);
      });
    }
  });

  return <>{parts}</>;
}
