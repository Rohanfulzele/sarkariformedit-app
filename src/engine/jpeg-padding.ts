/**
 * Pads a JPEG below the portal's minimum KB by inserting COM (comment) marker
 * segments after the SOI marker. COM segments are ignored by every JPEG decoder,
 * so this adds bytes without altering a single visible pixel. Chosen over
 * upscaling (would break exact pixel dimensions) or refusing outright (bad UX
 * when only a few KB short) — see PRD open question Q1.
 */
export async function padJpegToMinSize(blob: Blob, minBytes: number): Promise<Blob> {
  if (blob.size >= minBytes) return blob;

  const buf = new Uint8Array(await blob.arrayBuffer());
  const deficit = minBytes - buf.length;
  const MAX_SEGMENT_PAYLOAD = 65533; // 65535 - 2 length bytes

  const segments: Uint8Array[] = [];
  let remaining = deficit;
  while (remaining > 0) {
    const payloadLen = Math.min(remaining, MAX_SEGMENT_PAYLOAD);
    const segLen = payloadLen + 2;
    const seg = new Uint8Array(4 + payloadLen);
    seg[0] = 0xff;
    seg[1] = 0xfe;
    seg[2] = (segLen >> 8) & 0xff;
    seg[3] = segLen & 0xff;
    segments.push(seg);
    remaining -= payloadLen;
  }

  const soi = buf.slice(0, 2);
  const rest = buf.slice(2);
  const totalLength = soi.length + segments.reduce((sum, s) => sum + s.length, 0) + rest.length;
  const out = new Uint8Array(totalLength);

  let offset = 0;
  out.set(soi, offset);
  offset += soi.length;
  for (const seg of segments) {
    out.set(seg, offset);
    offset += seg.length;
  }
  out.set(rest, offset);

  return new Blob([out], { type: "image/jpeg" });
}
