from pathlib import Path
from collections import defaultdict

ROOT = Path(".")
IGNORE_DIRS = {".git"}

stats = defaultdict(lambda: {
    "files": 0,
    "lines": 0,
    "chars": 0
})

for path in ROOT.rglob("*"):
    if not path.is_file():
        continue

    if any(part in IGNORE_DIRS for part in path.parts):
        continue

    ext = path.suffix.lower() or "[no extension]"

    stats[ext]["files"] += 1

    try:
        text = path.read_text(encoding="utf-8")
        stats[ext]["chars"] += len(text)
        stats[ext]["lines"] += len(text.splitlines())
    except (UnicodeDecodeError, OSError):
        # Binary/unreadable files still count as files,
        # but aren't included in character/line counts.
        pass

print(f"{'Extension':<18} {'Files':>7} {'Lines':>10} {'Characters':>14}")
print("-" * 53)

total_files = total_lines = total_chars = 0

for ext, data in sorted(stats.items(), key=lambda x: x[1]["files"], reverse=True):
    print(
        f"{ext:<18} "
        f"{data['files']:>7,} "
        f"{data['lines']:>10,} "
        f"{data['chars']:>14,}"
    )

    total_files += data["files"]
    total_lines += data["lines"]
    total_chars += data["chars"]

print("-" * 53)
print(
    f"{'TOTAL':<18} "
    f"{total_files:>7,} "
    f"{total_lines:>10,} "
    f"{total_chars:>14,}"
)