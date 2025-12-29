import FF3Cipher from "ff3/lib/FF3Cipher";
import { config } from "../core/config";

const BASE62_CHARS =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const tweak = "D8E7920AFA330A73";

export function generateSlug(input: number): string {
  const value = fpeEncrypt(String(input));

  // Convert to Base62
  let slug = base62Encode(Number(value));

  return slug;
}

export function fpeEncrypt(plaintext: string) {
  const c = new FF3Cipher(config.FPE_KEY, tweak);

  let ciphertext = c.encrypt(plaintext);

  return ciphertext;
}

export function fpeDecrypt(ciphertext: string) {
  const c = new FF3Cipher(config.FPE_KEY, tweak);

  let decrypted = c.decrypt(ciphertext);

  return decrypted;
}

export function base62Encode(num: number): string {
  if (num === 0) return "0";

  let result = "";
  while (num > 0) {
    result = BASE62_CHARS[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

export function base62Decode(str: string): number {
  let result = 0;
  for (const char of str) {
    result = result * 62 + BASE62_CHARS.indexOf(char);
  }
  return result;
}
