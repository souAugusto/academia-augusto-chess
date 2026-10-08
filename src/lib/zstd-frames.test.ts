import { Readable } from "node:stream";
import { text } from "node:stream/consumers";
import { createZstdDecompress, zstdCompressSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { isSkippableMagic, SkippableFrameStripper } from "./zstd-frames";

// Monta um arquivo no formato do pzstd: [skippable(tamanho)] [quadro] ...
function pzstd(parts: string[]): Buffer {
  return Buffer.concat(
    parts.flatMap((part) => {
      const frame = zstdCompressSync(Buffer.from(part));
      const header = Buffer.alloc(12);
      header.writeUInt32LE(0x184d2a50, 0);
      header.writeUInt32LE(4, 4);
      header.writeUInt32LE(frame.length, 8);
      return [header, frame];
    }),
  );
}

async function decode(file: Buffer, chunkSize: number): Promise<string> {
  const chunks: Buffer[] = [];
  for (let i = 0; i < file.length; i += chunkSize)
    chunks.push(file.subarray(i, i + chunkSize));
  return text(
    Readable.from(chunks)
      .pipe(new SkippableFrameStripper())
      .pipe(createZstdDecompress()),
  );
}

describe("SkippableFrameStripper", () => {
  const file = pzstd(["linha 1\nlinha 2\n", "linha 3\n", "linha 4\n"]);

  it("remove os quadros de controle do pzstd e descomprime tudo", async () => {
    expect(await decode(file, 64 * 1024)).toBe(
      "linha 1\nlinha 2\nlinha 3\nlinha 4\n",
    );
  });

  it("funciona com os dados chegando em pedaços pequenos", async () => {
    expect(await decode(file, 3)).toBe("linha 1\nlinha 2\nlinha 3\nlinha 4\n");
  });

  it("deixa passar arquivo zstd comum", async () => {
    const plain = zstdCompressSync(Buffer.from("sem pzstd\n"));
    expect(await decode(plain, 5)).toBe("sem pzstd\n");
  });

  it("reconhece a faixa de magic numbers dos quadros de controle", () => {
    expect(isSkippableMagic(0x184d2a50)).toBe(true);
    expect(isSkippableMagic(0x184d2a5f)).toBe(true);
    expect(isSkippableMagic(0xfd2fb528)).toBe(false);
  });
});
