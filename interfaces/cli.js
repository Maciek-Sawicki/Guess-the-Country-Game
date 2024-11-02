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
    console.log(chalk.blue(title));
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
            console.log(chalk.green(`Attempts: ${data.attempts}`));
            return true; 
        } 
        else if (data.feedback) {
            const { population, area, continent, location, distance } = data.feedback;
            const feedbackData = [
                ['Population', `Target country population is ${population.toUpperCase()} than Poland's population.`],
                ['Area', `Target country area is ${area} compared to Poland's area.`],
                ['Continent', continent === 'MATCH' ? 'Correct' : 'Incorrect'],
                ['Location Hint', `Move ${location.latitudeHint} and ${location.longitudeHint}.`],
                ['Distance', `Distance from target country: ${distance.toFixed(2)} km.`],
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
    // displayTitle();


    // const difficulty = await chooseDifficulty();
    // const targetCountry = await startGame(difficulty);
    
    // // Wait for a moment to ensure that the session is properly established
    // //await new Promise(resolve => setTimeout(resolve, 100)); // optional delay

    // // Now get the session data
    // //await getSessionData();

    //    // Wait for a moment to ensure that the session is properly established
    //    //await new Promise(resolve => setTimeout(resolve, 100)); // optional delay
    // await guess();
    // await guess();
    // await guess();

    displayTitle(); // Display game title
    
    let gameWon = false;

    while (true) {
        const difficulty = await chooseDifficulty();
        await startGame(difficulty);
        
        while (!gameWon) {
            const result = await makeGuess();

            if (result === 'restart') {
                gameWon = false; // Reset gameWon to continue the outer loop
                console.log(chalk.blue('Game has been restarted.'));
                break; // Exit inner loop to restart the game
            }

            if (result) {
                gameWon = true; // Set gameWon to true if guessed correctly
            }
        }
    }

};

main();
