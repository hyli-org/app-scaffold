// src/shims/buffer.ts

// buffer/index.js doğrudan gerçek paketten çekilir, alias’a takılmaz
import { Buffer as NodeBuffer } from 'buffer/index.js';

// Eğer writeBigUInt64BE yoksa ekleyelim
if (!(NodeBuffer.prototype as any).writeBigUInt64BE) {
  Object.defineProperty(NodeBuffer.prototype, 'writeBigUInt64BE', {
    value(this: Buffer, value: bigint, offset = 0) {
      for (let i = 7; i >= 0; --i) {
        const byte = Number((value >> BigInt(i * 8)) & 0xffn);
        (this as any)[offset + (7 - i)] = byte;
      }
      return offset + 8;
    },
    writable: true,
  });
}

// Global Buffer’ı da atayalım (bazı kütüphaneler window.Buffer bekleyebilir)
;(window as any).Buffer = NodeBuffer;

// Adından export edelim
export const Buffer = NodeBuffer;