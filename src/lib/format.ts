// Formatação de valores de negócio. Datas sempre no fuso America/Sao_Paulo.
export const BUSINESS_TIME_ZONE = "America/Sao_Paulo";

// 1900 -> "R$ 19"; 1990 -> "R$ 19,90"
export function formatPriceBRL(cents: number): string {
  const hasCents = cents % 100 !== 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  })
    .format(cents / 100)
    .replace(/ /g, " ");
}

// Data do dia de negócio ("YYYY-MM-DD") em São Paulo, para o puzzle do dia.
export function todayInSaoPaulo(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// "Quarta-feira, 7 de outubro, às 20h" (minutos só quando não forem zero).
export function formatLiveDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const weekday = get("weekday");
  const minute = get("minute");
  const time =
    minute === "00" ? `${Number(get("hour"))}h` : `${get("hour")}h${minute}`;
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${get("day")} de ${get("month")}, às ${time}`;
}
