from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
ENTRY = ROOT / "src" / "main.js"
OUT = ROOT / "dist" / "escape-lebethel-local.html"

IMPORT_RE = re.compile(r"^\s*import\s+(?:[^'\";]+?\s+from\s+)?['\"](.+?)['\"]\s*;?\s*$", re.M)


def resolve_import(src: Path, spec: str) -> Path:
    if not spec.startswith("."):
        raise ValueError(f"Only relative imports are supported in local build: {spec}")
    path = (src.parent / spec).resolve()
    if path.suffix:
        return path
    return path.with_suffix(".js")


def strip_module_syntax(code: str) -> str:
    code = IMPORT_RE.sub("", code)
    code = re.sub(r"^\s*export\s+\{\s*[^}]+?\s*\}\s*;?\s*$", "", code, flags=re.M)
    code = re.sub(r"\bexport\s+default\s+", "", code)
    code = re.sub(r"\bexport\s+(class|function|const|let|var)\s+", r"\1 ", code)
    return code.strip()


def collect(path: Path, seen: set[Path], stack: set[Path], ordered: list[Path]) -> None:
    path = path.resolve()
    if path in seen:
        return
    if path in stack:
        return
    stack.add(path)
    code = path.read_text(encoding="utf-8")
    for spec in IMPORT_RE.findall(code):
        collect(resolve_import(path, spec), seen, stack, ordered)
    stack.remove(path)
    seen.add(path)
    ordered.append(path)


def build() -> None:
    ordered: list[Path] = []
    collect(ENTRY, set(), set(), ordered)
    chunks = []
    for path in ordered:
        rel = path.relative_to(ROOT).as_posix()
        code = strip_module_syntax(path.read_text(encoding="utf-8"))
        chunks.append(f"\n// ===== {rel} =====\n{code}\n")
    bundle = "\n".join(chunks)
    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
  <title>逃离来伯特利 · 本地单文件版</title>
  <style>
    html, body {{
      margin: 0; padding: 0; width: 100%; height: 100%;
      background: #0b0d12; color: #e8e6df; overflow: hidden;
      font-family: "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif;
      user-select: none; -webkit-user-select: none;
    }}
    #stage {{ display: block; margin: 0 auto; background: #14171f; }}
    #fps {{
      position: fixed; top: 6px; right: 8px; color: #6a7;
      font: 12px/1 monospace; opacity: .55; pointer-events: none;
    }}
    .hint {{
      position: fixed; bottom: 6px; left: 50%; transform: translateX(-50%);
      color: #888; font-size: 12px; pointer-events: none; white-space: nowrap;
    }}
  </style>
</head>
<body>
  <canvas id="stage" width="1024" height="640"></canvas>
  <div id="fps"></div>
  <div class="hint">WASD 移动 · 左键攻击 · Q/E 技能 · 1/2/3 道具 · F 队友伤害 · R 内奸亮明</div>
  <script>
{bundle}
  </script>
</body>
</html>
"""
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)} ({len(html.encode('utf-8'))} bytes)")


if __name__ == "__main__":
    build()
