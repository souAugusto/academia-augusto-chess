import { initials } from "@/lib/profile/nickname";

// Foto do aluno ou, sem foto, as iniciais do apelido num círculo.
export function Avatar({
  url,
  name,
  size = 64,
}: {
  url: string | null;
  name: string;
  size?: number;
}) {
  const style = { width: size, height: size };
  if (url)
    return (
      // eslint-disable-next-line @next/next/no-img-element -- foto pequena, já em 256x256 webp
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        style={style}
        className="shrink-0 rounded-full border border-border object-cover"
      />
    );
  return (
    <span
      aria-hidden="true"
      style={{ ...style, fontSize: size * 0.38 }}
      className="flex shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 font-display font-semibold text-accent-text"
    >
      {initials(name)}
    </span>
  );
}
