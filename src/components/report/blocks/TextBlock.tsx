import { BlockCard } from "@/components/report/blocks/BlockCard";
import type { TextBlock as TextBlockType } from "@/types/report";

export function TextBlock({ block }: { block: TextBlockType }) {
  const paragraphs = block.body.split(/\n{2,}/).filter(Boolean);

  return (
    <BlockCard title={block.title}>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-foreground">
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)
        ) : (
          <p className="text-muted-foreground">{block.body}</p>
        )}
      </div>
    </BlockCard>
  );
}
