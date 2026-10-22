declare module 'scrambling-text' {
  type ScrambleHandler = (text: string) => void;

  interface ScrambleOptions {
    characters?: string[];
  }

  export default class Scrambler {
    static readonly CHARACTERS: {
      DEFAULT: string[];
      ALPHABET: string[];
    };

    scramble(text: string, onScramble: ScrambleHandler, options?: ScrambleOptions | null): void;
  }
}
