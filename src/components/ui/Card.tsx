type CardProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "article" | "section" | "li";
  highlight?: boolean; // borda dourada (ex.: plano em destaque)
};

export function Card({
  children,
  className = "",
  as: Tag = "div",
  highlight = false,
}: CardProps) {
  return (
    <Tag
      className={`rounded-card border bg-surface p-6 shadow-card ${
        highlight ? "border-accent" : "border-border"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
