"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { withBase } from "@/lib/base-path";

interface DiagramProps {
  name: string;
  title: string;
  aspectRatio: string;
}

export const Diagram = ({ name, title, aspectRatio }: DiagramProps) => {
  const { resolvedTheme } = useTheme();
  const [theme, setTheme] = useState<string | undefined>(undefined);

  useEffect(() => {
    setTheme(resolvedTheme === "light" ? "light" : "dark");
  }, [resolvedTheme]);

  const src = withBase(`/desktop/diagrams/${name}/index.html${theme ? `?theme=${theme}` : ""}`);

  return (
    <figure className="not-prose my-6">
      <iframe
        className="block w-full border-0 bg-transparent"
        loading="lazy"
        src={src}
        style={{ aspectRatio, colorScheme: theme ?? "normal" }}
        title={title}
      />
    </figure>
  );
};
