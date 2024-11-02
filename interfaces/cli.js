import inquirer from 'inquirer';
import axios from 'axios';
import chalk from 'chalk';
import figlet from 'figlet';
import { table } from 'table';

const apiUrl = 'http://localhost:3000/api';
let sessionCookie = '';

const axiosInstance = axios.create({
    baseURL: apiUrl,
    withCredentials: true, 
});

const displayTitle = () => {
    const terminalWidth = process.stdout.columns || 80; 
    const title = figlet.textSync("Guess the Country Game", {
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

const startGame = async (difficulty) => {
    try {
        const response = await axiosInstance.post('/start-game', { difficulty });
        sessionCookie = response.headers['set-cookie'][0]; 

        console.log('Game started! Try to guess the country.');
        console.log('Type "restart" to start over, "exit" to quit)');
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

    try {
        const { data } = await axiosInstance.post(`${apiUrl}/guess`, { userGuess }, {
            headers: {
                Cookie: sessionCookie,
            },
        });

        if (data.message) {
            console.log(chalk.green.bold(`${data.message} 🎉`));
            console.log(chalk.green.bold(`Attempts: ${data.attempts}`));
            return true; 
        } 
        else if (data.feedback) {
            const { population, area, continent, location, distance } = data.feedback;

            const latitudeHint = location.latitudeHint === 'SAME_LATITUDE' ? '' : `Move ${chalk.blue.bold(location.latitudeHint)}`;
            const longitudeHint = location.longitudeHint === 'SAME_LONGITUDE' ? '' : `Move ${chalk.blue.bold(location.longitudeHint)}`;
            const combinedHint = [latitudeHint, longitudeHint].filter(Boolean).join(' and ');

            const feedbackData = [
                ['Population', `Target country population is ${chalk.blue.bold(population.toUpperCase())} than ${userGuess}'s population.`],
                ['Area', `Target country area is ${chalk.blue.bold(area)} compared to ${userGuess}'s area.`],
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

