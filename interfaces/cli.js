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

const makeGuess = async () => {
    const countryListData = await fetchCountryList();

    if (!Array.isArray(countryListData) || countryListData.length === 0) {
        console.log(chalk.red("Error: Country list is empty or not loaded correctly."));
        return false;
    }

    const originalCountryList = countryListData.map(country => country.name);
    const countryListLowerCase = countryListData.map(country => country.name.toLowerCase());

    while (true) {
        const { userGuess } = await inquirer.prompt([
            {
                type: 'input',
                name: 'userGuess',
                message: 'Enter the name of the country:',
            },
        ]);

        if (userGuess.toLowerCase() === 'exit') {
            console.log(chalk.blue('Exiting the game. Goodbye!'));
            process.exit(0);
        } else if (userGuess.toLowerCase() === 'restart') {
            return 'restart';
        }

        // Check if the guess is valid or suggest similar countries
        const bestMatch = stringSimilarity.findBestMatch(userGuess.toLowerCase(), countryListLowerCase).bestMatch;

        if (bestMatch.rating >= 0.7 && bestMatch.target.toLowerCase() !== userGuess.toLowerCase()) {
            const originalCountry = originalCountryList[countryListLowerCase.indexOf(bestMatch.target)];
            const { confirmSuggestion } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmSuggestion',
                    message: `Did you mean ${chalk.blue.bold(originalCountry)}?`,
                },
            ]);

            if (confirmSuggestion) {
                return await processGuess(bestMatch.target); // Pass corrected guess
            } else {
                console.log(chalk.yellowBright('Please try entering the country name again.'));
                continue;
            }
        } else if (countryListLowerCase.includes(userGuess.toLowerCase())) {
            return await processGuess(userGuess); // Exact match, proceed with guess
        } else {
            console.log(chalk.red("Country not recognized. Please try again."));
        }
    }
};

const processGuess = async (userGuess) => {
    try {
        const { data } = await axiosInstance.post(`${apiUrl}/guess`, { userGuess }, {
            headers: { Cookie: sessionCookie },
        });

        if (data.message) {
            console.log(`${chalk.blue('You won Boss! Correct country is')} ${chalk.bgGreen.bold(`${data.message}`)} 🎉`);
            console.log(chalk.blue(`Attempts: ${data.attempts}`));
            return true;
        } else if (data.feedback) {
            const { populationHint, population, areaHint, area, continent, location, distance } = data.feedback;

            const latitudeHint = location.latitudeHint === 'SAME_LATITUDE' ? '' : `Move ${chalk.blue.bold(location.latitudeHint)}`;
            const longitudeHint = location.longitudeHint === 'SAME_LONGITUDE' ? '' : `Move ${chalk.blue.bold(location.longitudeHint)}`;
            const combinedHint = [latitudeHint, longitudeHint].filter(Boolean).join(' and ');

            const feedbackData = [
                ['Population', `Target country's population is ${chalk.blue.bold(populationHint)} than ${userGuess}. ${userGuess}: ${chalk.blue.bold(population.toLocaleString())}`],
                ['Area', `Target country's area is ${chalk.blue.bold(areaHint)} than ${userGuess}. ${userGuess}: ${chalk.blue.bold(area)} km²`],
                ['Continent', continent === 'MATCH' ? chalk.green.bold('Correct') : chalk.red.bold('Incorrect')],
                ['Location Hint', combinedHint ? combinedHint : chalk.blue.bold('Same location')],
                ['Distance', `Distance from target country: ${chalk.blue.bold(distance.toFixed())} km.`],
            ];
            const output = table(feedbackData);

            console.log(chalk.yellow.bold(`\nHint after guess #${data.attempts}:`));
            console.log(output);
        }
    } catch (error) {
        console.error(chalk.red('Error making guess:'), error.response?.data?.error || error.message);
    }

    return false;
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