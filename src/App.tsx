import './App.css'
import { useCallback, useState } from "react";
import words from 'an-array-of-english-words';
import { GUESS_TYPE, LETTER_STATE, StatusResponse, WORD_COLOR } from './types';
import { API_PATH, BASE_URL, COLOR_WHITE, DEFAULT_SIZE, MIN_SIZE, MIN_SEED, MAX_SIZE } from "./constants";

const App = () => {
  const [guessType, setGuessType] = useState(GUESS_TYPE.GUESS_RANDOM);
  const [size, setSize] = useState<number>(DEFAULT_SIZE);
  const [seed, setSeed] = useState<number>(0);
  const [word, setWord] = useState<string>("");
  const [wordGuessList, setWordGuessList] = useState<StatusResponse[][]>([]);
  const [count, setCount] = useState<number>(0);
  const [errorText, setErrorText] = useState("");

  const getGuessUrl = useCallback((wordGuess: string) => {
    switch(guessType){
      case GUESS_TYPE.GUESS_DAILY: {
        return `${BASE_URL}${API_PATH.GUESS_DAILY}?guess=${wordGuess}&size=${size}`
      }
      case GUESS_TYPE.GUESS_RANDOM: {
        return `${BASE_URL}${API_PATH.GUESS_RANDOM}?guess=${wordGuess}&seed=${seed}&size=${size}`
      }
      case GUESS_TYPE.GUESS_WORD: {
        return `${BASE_URL}${API_PATH.GUESS_WORD}/${word}?guess=${wordGuess}`
      }
      default: {
        return "";
      }
    }
  }, [guessType, seed, size, word])

  const apiGuessWord = useCallback(async (wordGuess: string) => {
      try {
        const response = await fetch(getGuessUrl(wordGuess));
        if (!response.ok) {
          console.error(`HTTP error! Status: ${response.status}`);
          setErrorText(`HTTP error! Status: ${response.status}`)
          return null;
        }
        const data = await response.json();
        console.log("check here wordGuessList",wordGuessList);
        console.log("check here wordGuessList2 ", [...wordGuessList]);
        console.log("check here after", [...wordGuessList, [...data]]);
        return data;
      } catch (error: any) {
        console.error("Error get data:", error);
        setErrorText(`Error get data: ${error?.message}`);
        return null;
      }
    }, [getGuessUrl, wordGuessList]);

    const isValidateWord = useCallback((word: string, wordGuessStatus: StatusResponse[], absentLetters: Set<string>, presentLetters: Set<string>) => {
      wordGuessStatus.forEach((status: StatusResponse) => {
        if(status?.result === LETTER_STATE.ABSENT){
          absentLetters.add(status?.guess);
        }
        else {
          presentLetters.add(status?.guess);
        }
      });
      for(const letter of word){
        if(absentLetters.has(letter)){
          return false;
        }
      }
      const currentWordSet = new Set(word.split(""));
      for(const letter of presentLetters){
        if(!currentWordSet.has(letter)){
          return false;
        }
      }
      for(let i = 0; i < wordGuessStatus.length; i++){
        const status = wordGuessStatus[i];
        if(status?.result === LETTER_STATE.CORRECT){
          if(word[i] !== status?.guess){
            return false;
          }
        }
      }
      return true;
    }, []);

    const getWordColor = useCallback((status: string) => {
      switch(status){
        case LETTER_STATE.ABSENT: {
          return WORD_COLOR[LETTER_STATE.ABSENT];
        }
        case LETTER_STATE.PRESENT: {
          return WORD_COLOR[LETTER_STATE.PRESENT];
        }
        case LETTER_STATE.CORRECT: {
          return WORD_COLOR[LETTER_STATE.CORRECT];
        }
        default: {
          return COLOR_WHITE;
        }
      }
    }, []);

    const renderWordGuess = useCallback(() => {
      return wordGuessList?.map((wordGuess: StatusResponse[]) => {
        return <h1> {wordGuess.map((data: StatusResponse) =>
          <span style={{color: getWordColor(data.result)}}>{data?.guess}</span>)}
          </h1>
      })
    } , [getWordColor, wordGuessList]);

    const handleSetSize = (numberValue: number) => {
      if(Number.isNaN(numberValue) || numberValue < MIN_SIZE){
        setSize(MIN_SIZE);
      }
      else if(numberValue > MAX_SIZE){
        setSize(MAX_SIZE);
      }
      else {
        setSize(numberValue);
      }
    }

    const renderInput = useCallback(()=> {
      switch(guessType){
        case GUESS_TYPE.GUESS_RANDOM: {
          return <>
            <div className="input-wrapper">
            <p>Input Size ({MIN_SIZE} - {MAX_SIZE}):</p>
              <input type="number" min={MIN_SIZE} max={MAX_SIZE} value={size} onChange={(e) => handleSetSize(Number(e.target.value))}/>
            </div>
            <div className="input-wrapper">
              <p>Input Seed:</p>
              <input type="number" min={MIN_SEED} value={seed} onChange={(e) => setSeed(Number(e.target.value))}/>
            </div>
          </>
        }
        case GUESS_TYPE.GUESS_DAILY: {
          return <>
            <div className="input-wrapper">
              <p>Input Size ({MIN_SIZE} - {MAX_SIZE}):</p>
              <input type="number" min={1} max={MAX_SIZE} value={size} onChange={(e) => handleSetSize(Number(e.target.value))}/>
            </div>
          </>
        }
        case GUESS_TYPE.GUESS_WORD: {
          return <>
            <div className="input-wrapper">
              <p>Input Word:</p>
              <input type="text" value={word} onChange={(e) => {
                setWord(e.target.value);
                handleSetSize(e.target.value.length);
              } }/>
            </div>
          </>
        }
        default: {
          return null;
        }
      }
    }, [guessType, seed, size, word])
  
    const handleGuessNotInEnglishDictionary = useCallback(async (wordSize: number, absentLetters: Set<string>, currentWordGuessList: any[], count: {value: number}) => {
      const allLetter = "abcdefghijklmnopqrstuvwxyz";
      const correctLetters = new Array(wordSize).fill("");
      let correctWord = "";
      let countGuess = 0;
      for(const letter of allLetter){
        console.log("correctLetters", JSON.stringify(correctLetters));
        if(absentLetters.has(letter)){
          continue;
        }
        countGuess++;
        const wordGuess = letter.repeat(wordSize);
        const wordGuessStatus = await apiGuessWord(wordGuess);
        count.value++;
        setCount(count.value);
        currentWordGuessList.push([...wordGuessStatus]);
        setWordGuessList([...currentWordGuessList]);
        wordGuessStatus.forEach((status: StatusResponse) => {
          if(status?.result === LETTER_STATE.CORRECT){
            correctLetters[status?.slot] = status?.guess;
          }
        });
        if(correctLetters.filter(letter => letter).length === wordSize){
          correctWord = correctLetters.join("");
          if(wordGuess !== correctWord){
            await apiGuessWord(correctWord);
            count.value++;
            setCount(count.value);
            currentWordGuessList.push(correctLetters.map((letter, index) => ({slot: index, guess: letter, result: LETTER_STATE.CORRECT})));
            setWordGuessList([...currentWordGuessList]);
          }
          break;
        }
      }
      console.log("correctLetters result", JSON.stringify(correctLetters));

      return {correctWord, countGuess};
    }, [apiGuessWord]);
  
    const handleGuessInEnglishDictionary = useCallback(async (wordSize: number, absentLetters: Set<string>, presentLetters: Set<string>, currentWordGuessList: any[], count: {value: number}) => {
      let wordList = [...words.filter(word => word.length === wordSize)];
      let correctWord = "";
      let countGuess = 0;
      while(wordList.length > 0){
        countGuess++;
        const newWordList: string[] = [];
        const wordGuess = wordList.shift();
        console.log("wordList size", wordList.length, "wordGuess", wordGuess);
        if(wordGuess){
          const wordGuessStatus = await apiGuessWord(wordGuess);
          count.value++;
          setCount(count.value);
          console.log("status", JSON.stringify(wordGuessStatus));
          if(!wordGuessStatus){
            console.error("Error");
            return null;
          }
          currentWordGuessList.push([...wordGuessStatus]);
          setWordGuessList([...currentWordGuessList]);
          const countCorrect = wordGuessStatus.filter((status: StatusResponse) => status?.result === LETTER_STATE.CORRECT).length;
          if(countCorrect === wordSize){
            correctWord = wordGuess;
            break;
          }
          wordList.forEach((word: string) => {
            if(isValidateWord(word, wordGuessStatus, absentLetters, presentLetters)){
              newWordList.push(word);
            }
          });
          console.log("word size", "wordList", wordList.length, "newWordList", newWordList.length);
        }
        wordList = newWordList;
      }
      return {correctWord, countGuess};
    }, [apiGuessWord, isValidateWord])
    console.log("size", size);
    const handleGuess = useCallback(async (wordSize: number) => {
      const currentWordGuessList: any[] = [];
      setWordGuessList([]);
      setErrorText("");
      setCount(0);
      const count = {value: 0};

      console.log("start here", wordGuessList);
      console.log("go here")
      const absentLetters = new Set<string>();
      const presentLetters = new Set<string>();
      const resultGuessInEnglishDictionary = await handleGuessInEnglishDictionary(wordSize, absentLetters, presentLetters, currentWordGuessList, count);
      console.log("in", resultGuessInEnglishDictionary);
      if(!resultGuessInEnglishDictionary?.correctWord){
        const resultGuessNotEnglishDictionary = await handleGuessNotInEnglishDictionary(wordSize, absentLetters, currentWordGuessList, count);
        console.log("none", resultGuessNotEnglishDictionary);
      }
    }, [handleGuessInEnglishDictionary, handleGuessNotInEnglishDictionary, wordGuessList])
    
    const handleSwitchPlan = useCallback((type: GUESS_TYPE) => {
      setGuessType(type);
      setCount(0);
      setSeed(0);
      handleSetSize(DEFAULT_SIZE);
      setWordGuessList([]);
      setWord("");
      setErrorText("");
    }, []);

    return (
      <div>
        <div className="button-wrapper">
          <button className={guessType === GUESS_TYPE.GUESS_DAILY ? "button-choose-guess-type-selected" : ""} onClick={() => handleSwitchPlan(GUESS_TYPE.GUESS_DAILY)}>Guess Daily</button>
          <button className={guessType === GUESS_TYPE.GUESS_RANDOM ? "button-choose-guess-type-selected" : ""} onClick={() => handleSwitchPlan(GUESS_TYPE.GUESS_RANDOM)}>Guess Random</button>
          <button className={guessType === GUESS_TYPE.GUESS_WORD ? "button-choose-guess-type-selected" : ""} onClick={() => handleSwitchPlan(GUESS_TYPE.GUESS_WORD)}>Guess Word</button>
        </div>
        {renderInput()}
        <button onClick={() => handleGuess(size)}>Start Automation Guess</button>
        {errorText && <p className="error-text">{errorText}</p>}
        <h2>Count: {count}</h2>
        <p>Word Guess Table</p>
        <div className="word-guess-wrapper">{renderWordGuess()}</div>
      </div>
    )
}

export default App;
