import inquirer from 'inquirer';
import axios from 'axios';
import chalk from 'chalk';
import figlet from 'figlet';
import { table } from 'table';
import stringSimilarity from 'string-similarity';

const apiUrl = 'http://localhost:3000/api';
let sessionCookie = '';

const axiosInstance = axios.create({
    baseURL: apiUrl,
    withCredentials: true, 
});

const displayTitle = () => {
    const terminalWidth = process.stdout.columns || 80; 
    const title = figlet.textSync("Guess the Country Game", {
        font: 'Slant',
        width: terminalWidth,
        whitespaceBreak: true, 
    });
    console.log(chalk.blue.italic(title));
};

const chooseDifficulty = async () => {
    const { difficulty } = await inquirer.prompt([
        {
            type: 'list',
            name: 'difficulty',
            message: 'Choose difficulty level:',
            choices: ['EASY-EUROPE', 'EASY', 'HARD', 'EXPERT'],
        },
    ]);
    return difficulty;
};

const fetchCountryList = async () => {
    try {
        const response = await axios.get(`${apiUrl}/countries`, {
            headers: { Cookie: sessionCookie }
        });
        return response.data; 
    } catch (error) {
        console.error(chalk.red('Error fetching country list:', error.response?.data?.error || error.message));
        return [];
    }
};

const isCountryListValid = (countryList) => {
    if (!Array.isArray(countryList) || countryList.length === 0) {
        console.log(chalk.red("Error: Country list is empty or not loaded correctly."));
        return false;
    }
    return true;
};

const startGame = async (difficulty) => {
    try {
        const response = await axiosInstance.post('/start-game', { difficulty });
        sessionCookie = response.headers['set-cookie'][0]; 

        console.log(chalk.blue('Game started! Try to guess the country.'));
        console.log(`Type ${chalk.blue("restart")} to start over, ${chalk.blue("exit")} to quit)`);
        console.log();
    } catch (error) {
        console.error('Error starting game:', error.response?.data?.error || error.message);
    }
};

const getSessionData = async () => {
    try {
        const response = await axiosInstance.get('/session-data', {
            headers: {
                Cookie: sessionCookie 
            }
        });
        console.log('Session Data:', response.data);
    } catch (error) {
        console.error('Error getting session data:', error.message);
    }
};

const getUserGuess = async () => {
    const { userGuess } = await inquirer.prompt([
        {
            type: 'input',
            name: 'userGuess',
            message: 'Enter the name of the country:',
        },
    ]);
    return userGuess;
};

const isExitCommand = (guess) => guess === 'exit';
const isRestartCommand = (guess) => guess === 'restart';

const exitGame = () => {
    console.log(chalk.blue('Exiting the game. Goodbye!'));
    process.exit(0);
};

const findBestMatch = (guess, countryList) => {
    return stringSimilarity.findBestMatch(guess.toLowerCase(), countryList).bestMatch;
};

const isCloseMatch = (bestMatch, userGuess) => {
    return bestMatch.rating >= 0.7 && bestMatch.target.toLowerCase() !== userGuess.toLowerCase();
};

const isExactMatch = (guess, countryList) => countryList.includes(guess.toLowerCase());

const confirmSuggestion = async (bestMatch, originalCountryList, countryListLowerCase) => {
    const originalCountry = originalCountryList[countryListLowerCase.indexOf(bestMatch.target)];
    const { confirmSuggestion } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmSuggestion',
            message: `Did you mean ${chalk.blue.bold(originalCountry)}?`,
        },
    ]);
    return confirmSuggestion;
};

const makeGuess = async () => {
    const countryListData = await fetchCountryList();
    if (!isCountryListValid(countryListData)) return false;

    const originalCountryList = countryListData.map(country => country.name);
    const countryListLowerCase = originalCountryList.map(country => country.toLowerCase());

    while (true) {
        const userGuess = await getUserGuess();
        
        if (isExitCommand(userGuess)) {
            exitGame();
        } else if (isRestartCommand(userGuess)) {
            return 'restart';
        }

        const bestMatch = findBestMatch(userGuess, countryListLowerCase);

        if (isCloseMatch(bestMatch, userGuess)) {
            const suggestionConfirmed = await confirmSuggestion(bestMatch, originalCountryList, countryListLowerCase);
            if (suggestionConfirmed) {
                return await processGuess(bestMatch.target, originalCountryList);
            }
            console.log(chalk.yellowBright('Please try entering the country name again.'));
        } else if (isExactMatch(userGuess, countryListLowerCase)) {
            return await processGuess(userGuess, originalCountryList);
        } else {
            console.log(chalk.red("Country not recognized. Please try again."));
        }
    }
};

const processGuess = async (userGuess, originalCountryList) => {
    try {
        const { data } = await makeGuessRequest(userGuess);

        if (data.message) {
            displayWinningMessage(data.message, data.attempts);
            return true;
        } else if (data.feedback) {
            displayFeedback(data.feedback, userGuess, data.attempts, originalCountryList);
        }
    } catch (error) {
        handleError(error);
    }
    return false;
};

const makeGuessRequest = async (userGuess) => {
    return await axiosInstance.post(`${apiUrl}/guess`, { userGuess }, {
        headers: { Cookie: sessionCookie },
    });
};

const displayWinningMessage = (countryName, attempts) => {
    console.log(`${chalk.blue('You won Boss! Correct country is')} ${chalk.bgGreen.bold(countryName)} 🎉`);
    console.log(chalk.blue(`Attempts: ${attempts}`));
};

const displayFeedback = (feedback, userGuess, attempts, originalCountryList) => {
    const matchingCountry = originalCountryList.find(country => 
        country.toLowerCase() === userGuess.toLowerCase()
    );
    const originalCountryName = matchingCountry ? matchingCountry : 'Country not found';

    const feedbackData = [
        ['Population', formatPopulationHint(feedback.populationHint, feedback.population, originalCountryName)],
        ['Area', formatAreaHint(feedback.areaHint, feedback.area, originalCountryName)],
        ['Continent', formatContinentHint(feedback.continent)],
        ['Location Hint', formatLocationHint(feedback.location)],
        ['Distance', formatDistanceHint(feedback.distance)],
    ];
    
    console.log(chalk.yellow.bold(`\nHint after guess #${attempts}:`));
    console.log(table(feedbackData));
};


const formatPopulationHint = (populationHint, population, userGuess) => {
    return `Target country's population is ${chalk.blue.bold(populationHint)} than ${userGuess}. ${userGuess}: ${chalk.blue.bold(population.toLocaleString())}`;
};

const formatAreaHint = (areaHint, area, userGuess) => {
    return `Target country's area is ${chalk.blue.bold(areaHint)} than ${userGuess}. ${userGuess}: ${chalk.blue.bold(area.toLocaleString())} km²`;
};

const formatContinentHint = (continent) => {
    return continent === 'MATCH' ? chalk.green.bold('Correct') : chalk.red.bold('Incorrect');
};

const formatLocationHint = (location) => {
    const latitudeHint = location.latitudeHint === 'SAME_LATITUDE' ? '' : `Move ${chalk.blue.bold(location.latitudeHint)}`;
    const longitudeHint = location.longitudeHint === 'SAME_LONGITUDE' ? '' : `Move ${chalk.blue.bold(location.longitudeHint)}`;
    return [latitudeHint, longitudeHint].filter(Boolean).join(' and ') || chalk.blue.bold('Same location');
};

const formatDistanceHint = (distance) => {
    return `Distance from target country: ${chalk.blue.bold(distance.toFixed())} km.`;
};

const handleError = (error) => {
    console.error(chalk.red('Error making guess:'), error.response?.data?.error || error.message);
};


const main = async () => {
    displayTitle(); 
    
    while (true) {
        const difficulty = await chooseDifficulty();
        await startGame(difficulty);
        
        let gameWon = false; 

        while (!gameWon) {
            const result = await makeGuess(); 

            if (result === 'restart') {
                console.log(chalk.blue('Game has been restarted.'));
                break;
            }

            if (result) {
                gameWon = true; 
            }
        }
    }
};

main();