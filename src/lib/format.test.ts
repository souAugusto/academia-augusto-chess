import { describe, expect, it } from "vitest";
import {
  formatLiveDate,
  formatLongDate,
  formatPriceBRL,
  todayInSaoPaulo,
} from "./format";

describe("formatPriceBRL", () => {
  it("omite centavos quando o valor é inteiro", () => {
    expect(formatPriceBRL(1900)).toBe("R$ 19");
    expect(formatPriceBRL(11900)).toBe("R$ 119");
  });

  it("mostra centavos quando existem", () => {
    expect(formatPriceBRL(1990)).toBe("R$ 19,90");
  });
});

describe("todayInSaoPaulo", () => {
  it("usa o dia de São Paulo, não o de UTC", () => {
    // 02:00 UTC do dia 7 = 23:00 do dia 6 em São Paulo
    expect(todayInSaoPaulo(new Date("2026-10-07T02:00:00Z"))).toBe(
      "2026-10-06",
    );
    expect(todayInSaoPaulo(new Date("2026-10-07T03:00:00Z"))).toBe(
      "2026-10-07",
    );
  });
});

describe("formatLiveDate", () => {
  it("formata em português no fuso de São Paulo", () => {
    // 23:00 UTC = 20:00 em São Paulo
    expect(formatLiveDate(new Date("2026-10-07T23:00:00Z"))).toBe(
      "Quarta-feira, 7 de outubro, às 20h",
    );
  });

  it("mostra os minutos quando não são zero", () => {
    expect(formatLiveDate(new Date("2026-10-07T23:30:00Z"))).toBe(
      "Quarta-feira, 7 de outubro, às 20h30",
    );
  });
});

describe("formatLongDate", () => {
  it("usa o dia de Brasília", () => {
    expect(formatLongDate(new Date("2027-03-16T02:59:59Z"))).toBe(
      "15 de março de 2027",
    );
  });
});
