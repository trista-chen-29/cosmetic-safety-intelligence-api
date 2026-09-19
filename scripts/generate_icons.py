from __future__ import annotations

import struct
import zlib
from pathlib import Path


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def write_png(path: Path, size: int) -> None:
    rows = bytearray()
    for y in range(size):
        rows.append(0)
        for x in range(size):
            nx = (x + 0.5) / size
            ny = (y + 0.5) / size
            dx = nx - 0.5
            dy = ny - 0.5
            radius = (dx * dx + dy * dy) ** 0.5
            corner = min(nx, ny, 1 - nx, 1 - ny)
            if corner < 0.06:
                color = (0, 0, 0, 0)
            elif radius < 0.12:
                color = (63, 107, 83, 255)
            elif 0.26 < radius < 0.34:
                color = (63, 107, 83, 255)
            else:
                color = (244, 239, 231, 255)
            rows.extend(color)

    raw = zlib.compress(bytes(rows), 9)
    png = b"".join(
        [
            b"\x89PNG\r\n\x1a\n",
            chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)),
            chunk(b"IDAT", raw),
            chunk(b"IEND", b""),
        ]
    )
    path.write_bytes(png)


def main() -> None:
    public = Path(__file__).resolve().parents[1] / "frontend" / "public"
    public.mkdir(parents=True, exist_ok=True)
    write_png(public / "pwa-192.png", 192)
    write_png(public / "pwa-512.png", 512)
    write_png(public / "apple-touch-icon.png", 180)


if __name__ == "__main__":
    main()
