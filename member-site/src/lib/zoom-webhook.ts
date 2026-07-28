import { createHmac } from "crypto";

export function buildUrlValidationResponse(plainToken: string) {
  const secret = process.env.ZOOM_WEBHOOK_SECRET_TOKEN ?? "";
  const encryptedToken = createHmac("sha256", secret).update(plainToken).digest("hex");
  console.log("zoom url_validation debug", {
    secretLength: secret.length,
    secretFirst4: secret.slice(0, 4),
    secretLast4: secret.slice(-4),
    plainToken,
    encryptedToken,
  });
  return { plainToken, encryptedToken };
}

export function verifyZoomSignature(params: {
  rawBody: string;
  timestamp: string;
  signature: string;
}): boolean {
  const message = `v0:${params.timestamp}:${params.rawBody}`;
  const expected =
    "v0=" +
    createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET_TOKEN!).update(message).digest("hex");
  return expected === params.signature;
}
