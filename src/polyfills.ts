import { getRandomValues as expoCryptoGetRandomValues } from "expo-crypto";
import { Buffer } from "buffer";
import "react-native-get-random-values";

// Buffer polyfill
global.Buffer = global.Buffer || Buffer;

// Crypto polyfill
class Crypto {
  getRandomValues = expoCryptoGetRandomValues;
}

const webCrypto = typeof crypto !== "undefined" ? crypto : new Crypto();

if (typeof crypto === "undefined") {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    enumerable: true,
    get: () => webCrypto,
  });
}

// TextEncoder/TextDecoder polyfills for Solana
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = require("text-encoding").TextEncoder;
}

if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = require("text-encoding").TextDecoder;
}
