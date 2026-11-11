"""Draws the app icons (assets/icon-192.png, assets/icon-512.png): a black P and a pink dot on yellow."""
import struct, zlib, os

def png(path, n):
    Y, K, P = (255, 210, 63), (17, 17, 17), (255, 107, 107)
    u = n / 16.0                                   # the icon is designed on a 16 x 16 grid
    def colour(x, y):
        gx, gy = x / u, y / u
        if 4 <= gx < 6.2 and 3.5 <= gy < 12.5: return K                 # stem of the P
        if 4 <= gx < 10 and 3.5 <= gy < 5.7: return K                   # top of the bowl
        if 4 <= gx < 10 and 7.3 <= gy < 9.5: return K                   # bottom of the bowl
        if 7.8 <= gx < 10 and 3.5 <= gy < 9.5: return K                 # right of the bowl
        if 10.6 <= gx < 12.6 and 10.5 <= gy < 12.5: return P            # the dot
        return Y
    raw = b"".join(b"\x00" + bytes(c for x in range(n) for c in colour(x, y)) for y in range(n))
    chunk = lambda t, d: struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", n, n, 8, 2, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))

here = os.path.join(os.path.dirname(__file__), "..", "assets")
for size in (192, 512):
    png(os.path.join(here, "icon-%d.png" % size), size)
print("icons written")
