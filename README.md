# Guess the Country Game

## Project Overview
"Guess the Country Game" is an interactive game where players attempt to guess a randomly selected country based on provided hints. The game offers multiple difficulty levels, which impact the selection of countries.

The application is built using **Node.js**, **Express**, and various **CLI libraries** like `inquirer`, `axios`, `chalk`, `figlet`, and `table`. The project fetches country data from an API and provides feedback to guide the player toward the correct guess.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Game Rules](#game-rules)
- [Libraries Used](#libraries-used)
- [API Endpoints](#api-endpoints)

## Installation
To run the project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Maciek-Sawicki/Guess-the-Country-Game
   cd guess-the-country-game
   ```
2. **Install the dependencies**
   ```bash
   npm install
   ```
3. **Start the server**
    ```bash
    npm start
    ```
3. **Start the CLI game interface:**
Open another terminal and run:
    ```bash
    node cli.js
    ```

## Usage

1. **Starting the CLI**: When you run the CLI, the game title will appear.
2. **Selecting Difficulty**:
   - **EASY-EUROPE**: Easy level, with European countries only.
   - **EASY**: Easy level, with all countries having a large population.
   - **HARD**: Hard difficulty, including all UN member countries.
   - **EXPERT**: Hard difficulty, including all countries and dependent territories.
3. **Gameplay**: Start guessing the country name based on hints provided by the game.

### Commands During Gameplay:
- Type `restart` to restart the game.
- Type `exit` to exit the game.

## Game Rules
- **Goal**: Guess the correct country based on hints about population, area, continent, and location.
- **Hints**: After each guess, the game provides feedback such as:
  - Whether the target country has a larger or smaller population,
  - If it’s on the same continent or not,
  - Its direction relative to your guess (north, south, etc.).
- **Winning**: You win once you guess the correct country. The game will display the number of attempts made.

## Libraries Used
- **axios**: Fetches data from the [REST Countries API](https://restcountries.com/).
- **inquirer**: Provides a CLI interface for selecting difficulty and entering guesses.
- **chalk**: Adds color and style to CLI messages.
- **figlet**: Renders ASCII text for the game title.
- **table**: Displays hint data in a structured table format.
- **string-similarity**: Suggests similar country names if a player’s guess is misspelled.

## API Endpoints
The server provides several endpoints:

- `GET /api/countries`: Retrieves the list of countries.
- `GET /api/random-country`: Returns a random country.
- `GET /api/random-country/:difficulty`: Returns a random country based on the difficulty level.
- `POST /api/start-game`: Starts a new game session.
- `POST /api/guess`: Processes a player’s guess and returns feedback.

# Happy guessing!
