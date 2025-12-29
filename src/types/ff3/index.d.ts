declare module "ff3/lib/FF3Cipher" {
  export default class FF3Cipher {
    constructor(key: string, tweak: string, radix?: number);
    encrypt(value: string): string;
    decrypt(value: string): string;
  }
}
