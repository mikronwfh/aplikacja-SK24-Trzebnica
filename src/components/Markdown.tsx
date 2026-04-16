import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
      <ReactMarkdown
        components={{
          h1: ({ node, ...p }) => <h1 className="text-2xl font-bold mt-4 mb-2" {...p} />,
          h2: ({ node, ...p }) => <h2 className="text-xl font-semibold mt-3 mb-2" {...p} />,
          ul: ({ node, ...p }) => <ul className="list-disc pl-6 my-2" {...p} />,
          ol: ({ node, ...p }) => <ol className="list-decimal pl-6 my-2" {...p} />,
          a: ({ node, ...p }) => <a className="text-primary underline" target="_blank" rel="noreferrer" {...p} />,
          p: ({ node, ...p }) => <p className="my-2 leading-relaxed" {...p} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
