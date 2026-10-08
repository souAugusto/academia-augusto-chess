import { Transform, type TransformCallback } from "node:stream";

// O arquivo do Lichess é gerado pelo `pzstd`: cada quadro zstd vem precedido de
// um "skippable frame" (magic 0x184D2A50..5F + tamanho + conteúdo) que guarda o
// tamanho do quadro seguinte. O descompressor zstd do Node não aceita esses
// quadros, então este filtro os remove e repassa só os quadros de dados.

const SKIPPABLE_MASK = 0xfffffff0;
const SKIPPABLE_MAGIC = 0x184d2a50;

export function isSkippableMagic(value: number): boolean {
  return (value & SKIPPABLE_MASK) >>> 0 === SKIPPABLE_MAGIC;
}

export class SkippableFrameStripper extends Transform {
  buffer: Buffer = Buffer.alloc(0);
  // Bytes do quadro de dados atual que ainda faltam repassar.
  passthrough = 0;
  // Sem cabeçalho pzstd no começo de um quadro, não dá para saber onde ele
  // termina: a partir daí, repassa tudo sem mexer.
  raw = false;

  _transform(
    chunk: Buffer,
    _encoding: BufferEncoding,
    done: TransformCallback,
  ) {
    this.buffer = this.buffer.length
      ? Buffer.concat([this.buffer, chunk])
      : chunk;
    this.drain();
    done();
  }

  _flush(done: TransformCallback) {
    if (this.buffer.length) this.push(this.buffer);
    this.buffer = Buffer.alloc(0);
    done();
  }

  drain() {
    while (this.buffer.length) {
      if (this.raw) {
        this.push(this.buffer);
        this.buffer = Buffer.alloc(0);
        return;
      }
      if (this.passthrough > 0) {
        const take = Math.min(this.passthrough, this.buffer.length);
        this.push(this.buffer.subarray(0, take));
        this.buffer = this.buffer.subarray(take);
        this.passthrough -= take;
        continue;
      }
      if (this.buffer.length < 8) return; // espera mais bytes
      const magic = this.buffer.readUInt32LE(0);
      if (!isSkippableMagic(magic)) {
        this.raw = true;
        continue;
      }
      const size = this.buffer.readUInt32LE(4);
      if (this.buffer.length < 8 + size) return;
      // pzstd: conteúdo de 4 bytes = tamanho do quadro de dados seguinte.
      if (size === 4) this.passthrough = this.buffer.readUInt32LE(8);
      this.buffer = this.buffer.subarray(8 + size);
    }
  }
}
