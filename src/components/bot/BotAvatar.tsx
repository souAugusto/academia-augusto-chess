import { EXPRESSIONS, type Expression } from "@/lib/bot/types";

// Desenho do personagem. As quatro expressões ficam carregadas e só a atual
// aparece, para a troca ser instantânea. Arquivos em public/personagens/<id>/.
export function BotAvatar({
  id,
  name,
  expression = "normal",
  size = 64,
  className = "",
  grayscale = false,
}: {
  id: string;
  name: string;
  expression?: Expression;
  size?: number;
  className?: string;
  grayscale?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label={name}
      className={`relative inline-block shrink-0 overflow-hidden rounded-full ${grayscale ? "opacity-60 grayscale" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      {EXPRESSIONS.map((item) => (
        // eslint-disable-next-line @next/next/no-img-element -- SVG estático pequeno
        <img
          key={item}
          src={`/personagens/${id}/${item}.svg`}
          alt=""
          width={size}
          height={size}
          loading={item === "normal" ? "eager" : "lazy"}
          className={`absolute inset-0 size-full transition-opacity duration-200 motion-reduce:transition-none ${item === expression ? "opacity-100" : "opacity-0"}`}
        />
      ))}
    </span>
  );
}
