// Roman -> Devanagari phonetic transliteration (no external library)

const CONSONANTS = {
  ksh: "क्ष",
  gya: "ज्ञ",
  dnya: "ज्ञ",
  shr: "श्र",
  chh: "छ",
  kh: "ख",
  gh: "घ",
  ng: "ङ",
  ch: "च",
  jh: "झ",
  ny: "ञ",
  Th: "ठ",
  Dh: "ढ",
  th: "थ",
  dh: "ध",
  ph: "फ",
  bh: "भ",
  sh: "श",
  Sh: "ष",
  k: "क",
  g: "ग",
  j: "ज",
  T: "ट",
  D: "ड",
  N: "ण",
  t: "त",
  d: "द",
  n: "न",
  p: "प",
  f: "फ",
  b: "ब",
  m: "म",
  y: "य",
  r: "र",
  l: "ल",
  v: "व",
  w: "व",
  s: "स",
  h: "ह",
  x: "क्स",
  z: "ज",
};

const VOWELS_INDEPENDENT = {
  aa: "आ",
  ee: "ई",
  oo: "ऊ",
  ai: "ऐ",
  au: "औ",
  A: "आ",
  I: "ई",
  U: "ऊ",
  R: "ऋ",
  a: "अ",
  i: "इ",
  u: "उ",
  e: "ए",
  o: "ओ",
};

const VOWELS_MATRA = {
  aa: "ा",
  ee: "ी",
  oo: "ू",
  ai: "ै",
  au: "ौ",
  A: "ा",
  I: "ी",
  U: "ू",
  R: "ृ",
  a: "",
  i: "ि",
  u: "ु",
  e: "े",
  o: "ो",
};

// Longest keys first, so "chh" is tried before "ch" before "c", etc.
const ALL_KEYS = [
  ...Object.keys(CONSONANTS),
  ...Object.keys(VOWELS_INDEPENDENT),
].sort((a, b) => b.length - a.length);

export function transliterateToNepali(roman) {
  let result = "";
  let i = 0;
  let lastWasConsonant = false;

  while (i < roman.length) {
    const ch = roman[i];

    if (ch === " ") {
      result += " ";
      i += 1;
      lastWasConsonant = false;
      continue;
    }

    let matched = null;
    for (const key of ALL_KEYS) {
      if (roman.substr(i, key.length) === key) {
        matched = key;
        break;
      }
    }

    if (!matched) {
      // unknown character (number, punctuation, etc.) - pass through
      result += ch;
      i += 1;
      lastWasConsonant = false;
      continue;
    }

    if (CONSONANTS[matched] !== undefined) {
      if (lastWasConsonant) result += "्"; // halant, joins conjuncts e.g. "pr" -> प्र
      result += CONSONANTS[matched];
      lastWasConsonant = true;
    } else {
      result += lastWasConsonant
        ? VOWELS_MATRA[matched]
        : VOWELS_INDEPENDENT[matched];
      lastWasConsonant = false;
    }

    i += matched.length;
  }

  return result;
}
