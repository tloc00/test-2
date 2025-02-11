# Setting Up to Run React.js Project

## 1. Install Node.js & npm
- Download and install Node.js from [nodejs.org](https://nodejs.org/)
- Verify installation:
  ```sh
  node -v
  npm -v
  ```

## 2. Install Required Dependencies
Inside the project folder, install dependencies:
```sh
npm install
```

## 3. Run the React Project
```sh
npm run dev  # If using Vite
npm start    # If using create-react-app
```

# Version requirement
Node Version: `v18.19.0` or newer

# Description Project
- This project is using to process automation guess in wordle game
- API using:
  - https://wordle.votee.dev:8000/daily: Guess the daily wordle game, can update query parameters: `size` to change size of result word
    - Query Parameters:
      + size: The number of letters in the word (default 5)
      + guess: The word will be guessed
  - https://wordle.votee.dev:8000/random: Guess the random wordle game, can update query parameters: `size` to change size of result word or `seed` to change new result word
    - Query Parameters:
      + size: The number of letters in the word (default 5)
      + guess: The word will be guessed
      + seed: The value to ensure consistent wordle game
  - https://wordle.votee.dev:8000/word/{word}: Guess the random wordle game, can update path parameters: `word` to change the result word
    - Path Parameters:
      + word: The result word that our system have to guess
    - Query Parameters:
      + guess: The word will be guessed

# Solution Explanation

## 1. Overview
- There are 2 case in this wordle game: English word and Non-English word (ex: "abc", "aaa")
- First, I will using English word package dictionary (using `an-array-of-english-words` package for ReactJS) to guess, if all of words in this dictionary is not result word, I will guess Non-English word

## 2. Scope and UI description
- This automation guessing wordle game only use alphabet letter (a - z) to guess
- `size` query parameter will be 1 -> 100 because API will response error if `size` is large (I doesn't mean `size=100` makes sure API response error)
- If the guess is correct all of the letter in the guess table will be green color
- `Green` color for `correct` letter, `Yellow` color for `present` letter, `Gray` color for `absent` letter
- User can click 1 of 3 buttons on the top to switch type of wordle game type

## 2. Flow Detail
- Step 1: Using `an-array-of-english-words` package to get all English words
- Step 2: Base on `size` parameter which user input => Filter all English words with length = `size`
- Step 3: Pick a word in this `size` word => Send to API
- Step 4: Base on `result` attribute which API responses to filter word list and make word list smaller until can guess
