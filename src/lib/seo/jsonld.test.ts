import { describe, expect, it } from "vitest";
import { homeJsonLd, serializeJsonLd } from "./jsonld";

describe("homeJsonLd", () => {
  it("monta organização, site e FAQ", () => {
    const data = homeJsonLd({
      siteUrl: "https://exemplo.com",
      name: "Academia",
      description: "Treino",
      faq: [{ question: "P?", answer: "R." }],
    });
    const types = data["@graph"].map((node) => node["@type"]);
    expect(types).toEqual(["EducationalOrganization", "WebSite", "FAQPage"]);
    expect(JSON.stringify(data)).toContain('"name":"P?"');
  });
});

describe("serializeJsonLd", () => {
  it("escapa o sinal de menor", () => {
    expect(serializeJsonLd({ a: "</script>" })).toBe('{"a":"\u003c/script>"}');
  });
});
