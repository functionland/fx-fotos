import { Principal } from "@dfinity/principal";
import { Optional } from "./canister";

export * from "./CatchAll";
export * from "./video";
export * from "./auth";
export * from "./updateHead";
export * from "./canister";

export const KEY_LOCALSTORAGE_USER = `ic-cancan-photos-user`;

export const MAX_CHUNK_SIZE = 1024 * 500; // 500kb
export const REWARDS_CHECK_INTERVAL = 60000;
export const hashtagRegExp = /(?:\s|^)#[A-Za-z0-9\-._]+(?:\s|$)/gim;

export const encodeArrayBuffer = (file: ArrayBuffer): number[] =>
  Array.from(new Uint8Array(file));

export function unwrap<T>(val: Optional<T>): T | null {
	console.log(val);
  if (val[0] === undefined) {
    return null;
  } else {
    return val[0];
  }
}

export function formatBigNumber(number: number): string {
  if (number >= 1000000000) {
    return `${(number / 1000000000).toFixed(2)}B`;
  }
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(2)}M`;
  }
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }
  return `${number}`;
}

// Converts a file from a byteArray to a blob URL
// TODO: Detect mime-type, "fileToBlobUrl" https://stackoverflow.com/a/29672957
export function fileToImgSrc(file: [] | number[][], imgType = "jpeg"): string {
  const byteArray = new Uint8Array(file[0]);
  const picBlob = new Blob([byteArray], { type: `image/${imgType}` });
  const picSrc = URL.createObjectURL(picBlob);
  return picSrc;
}

// Converts a word into a hex color for placeholder profile pic backgrounds
export function textToColor(text: string): string {
  const numStringFromString = text
    .split("")
    .map((char) => char.charCodeAt(0))
    .join("");
  let hexFromNumString = parseInt(numStringFromString, 10).toString(16);
  const hexLength = hexFromNumString.length;
  const trimAmount = hexLength - 6;

  if (trimAmount < 0) {
    for (let i = 0; i < Math.abs(trimAmount); i++) {
      hexFromNumString += "0";
    }
  }
  if (trimAmount > 1) {
    const startIndex = Math.ceil(trimAmount / 2);
    const hexArray = hexFromNumString.split("");
    const trimmedArray = hexArray.slice(startIndex, startIndex + 6);

    hexFromNumString = trimmedArray.join("");
  }

  return `#${hexFromNumString}`;
}

// Regular expressions for detecting canisterId in various formats
/*const ic0AppHostRegEx = /\(?:(?<canisterId>.*)\.)?(?<subdomain>[^.]*)\.(?<domain>ic0\.app)$/;
const localhostRegEx = /\(?<canisterId>(?:\w{5}-){4}cai)\.[^.]*$/;

// Detect canisterId from current URL
export function getCanisterId(): Principal {
  const loc = new URL(window.location.toString());
  const hostName = loc.hostname;
  const matchesIc0 = ic0AppHostRegEx.exec(hostName);
  const matchesLocalhost = localhostRegEx.exec(hostName);

  if (matchesIc0?.groups?.canisterId) {
    return Principal.fromText(matchesIc0.groups.canisterId);
  } else if (matchesLocalhost?.groups?.canisterId) {
    return Principal.fromText(matchesLocalhost.groups.canisterId!);
  } else if (loc.searchParams.get("canisterId")) {
    return Principal.fromText(loc.searchParams.get("canisterId")!);
  } else {
    throw new Error("Could not find the canister ID.");
  }
}*/
