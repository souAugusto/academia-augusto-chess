# Converte lances em notação inglesa para a portuguesa nos TEXTOS das lições
# (não mexe nas listas de lances usadas pela validação). Uso local:
#   python scripts/notacao-pt.py src/content/licoes/aberturas/arquivo.ts
import re
import sys

MOVE = re.compile(r"(?<![A-Za-z])(\d+\.{1,3})?([KQRN])([a-h1-8]?x?[a-h][1-8](?:=[QRBN])?[+#!?]*)")
PIECES = {"K": "R", "Q": "D", "R": "T", "N": "C", "B": "B"}
SKIP_KEYS = re.compile(r"^\s*(san|answer|before|alternatives|solution|accept|moves|fen)\s*:")
SAN_ARRAY_LINE = re.compile(r'^\s*("[^"\s]+",?\s*)+\],?\s*$|^\s*("[^"\s]+",?\s*)+$')


def convert(text: str) -> str:
    def repl(match: re.Match) -> str:
        number, piece, rest = match.group(1) or "", match.group(2), match.group(3)
        rest = re.sub(r"=([QRBN])", lambda m: "=" + PIECES[m.group(1)], rest)
        return f"{number}{PIECES[piece]}{rest}"

    return MOVE.sub(repl, text)


for path in sys.argv[1:]:
    lines = open(path, encoding="utf-8").read().split("\n")
    in_san_array = False
    out = []
    for line in lines:
        stripped = line.strip()
        if re.match(r"^(moves|before|alternatives|solution|accept)\s*:\s*\[\s*$", stripped):
            in_san_array = True
            out.append(line)
            continue
        if in_san_array:
            out.append(line)
            if stripped.startswith("]"):
                in_san_array = False
            continue
        if SKIP_KEYS.match(line) or SAN_ARRAY_LINE.match(line) or "san: \"" in line:
            # Linha de lances (ex.: { san: "Nf3", note: "..." }): converte só a nota.
            if "note:" in line:
                head, note = line.split("note:", 1)
                line = head + "note:" + convert(note)
            out.append(line)
            continue
        out.append(convert(line))
    open(path, "w", encoding="utf-8", newline="").write("\n".join(out))
    print(f"convertido: {path}")
