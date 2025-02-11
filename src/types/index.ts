export enum LETTER_STATE {
    ABSENT="absent",
    PRESENT="present",
    CORRECT="correct"
  }
  
  export interface StatusResponse {
    result: string;
    guess: string;
    slot: number;
  }
  
  export enum GUESS_TYPE {
    GUESS_DAILY = "GUESS_DAILY",
    GUESS_RANDOM = "GUESS_RANDOM",
    GUESS_WORD = "GUESS_WORD"
  }
  
  export const WORD_COLOR = {
      [LETTER_STATE.ABSENT]: "#787c7e",
      [LETTER_STATE.PRESENT]: "#c9b458",
      [LETTER_STATE.CORRECT]: "#6aaa64",
  }