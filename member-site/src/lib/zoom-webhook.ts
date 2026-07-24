import { createHmac } from "crypto";

export function buildUrlValidationResponse(plainToken: string) {
  const encryptedToken = createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET_TOKEN!)
    .update(plainToken)
    .digest("hex");
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
