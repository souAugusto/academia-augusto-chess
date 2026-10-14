import {
  APELIDOS_RESERVADOS,
  PALAVRAS_PROIBIDAS,
  TRECHOS_RESERVADOS,
} from "@/content/apelidos-proibidos";

// Regras do apelido (nome de exibição): 3 a 20 caracteres, letras sem acento,
// números, "_", "." e "-". Único sem diferenciar maiúsculas (citext no banco).
export const NICKNAME_RE = /^[A-Za-z0-9_.-]{3,20}$/;
export const NICKNAME_CHANGE_DAYS = 30;

const LEET: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "@": "a",
  $: "s",
};

// Minúsculas, sem acento e sem trocas de letra por número.
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[01345789@$]/g, (char) => LEET[char] ?? char);
}

export type NicknameProblem = "formato" | "proibido" | "reservado";

export function nicknameProblem(nickname: string): NicknameProblem | null {
  if (!NICKNAME_RE.test(nickname)) return "formato";
  const clean = normalize(nickname);
  const parts = clean.split(/[_.-]+/).filter(Boolean);
  const joined = parts.join("");
  if (
    (APELIDOS_RESERVADOS as readonly string[]).includes(joined) ||
    TRECHOS_RESERVADOS.some((word) => joined.includes(word))
  )
    return "reservado";
  // Palavra proibida no começo de qualquer parte ou do apelido inteiro. Assim
  // "computador" passa (o "puta" está no meio), mas "putaria" e "x_puta" não.
  const starts = [joined, ...parts];
  if (PALAVRAS_PROIBIDAS.some((word) => starts.some((p) => p.startsWith(word))))
    return "proibido";
  return null;
}

export const NICKNAME_MESSAGES: Record<NicknameProblem | "em-uso", string> = {
  formato: "Use de 3 a 20 caracteres: letras sem acento, números, _, . ou -.",
  proibido: "Esse apelido não é permitido. Escolha outro.",
  reservado: "Esse apelido é reservado. Escolha outro.",
  "em-uso": "Esse apelido já está em uso. Escolha outro.",
};

// Data em que o apelido pode ser trocado de novo (null = pode agora).
export function nextNicknameChange(
  lastChange: Date | null,
  now: Date = new Date(),
): Date | null {
  if (!lastChange) return null;
  const next = new Date(
    lastChange.getTime() + NICKNAME_CHANGE_DAYS * 24 * 60 * 60 * 1000,
  );
  return next > now ? next : null;
}

// Iniciais para o avatar padrão (até 2 letras).
export function initials(name: string): string {
  const parts = name
    .replace(/[_.-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  const letters =
    parts.length === 1
      ? parts[0].slice(0, 2)
      : parts[0][0] + parts[parts.length - 1][0];
  return letters.toUpperCase();
}
