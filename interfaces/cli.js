import inquirer from 'inquirer';
import axios from 'axios';
import chalk from 'chalk';
import figlet from 'figlet';

const apiUrl = 'http://localhost:3000/api';
let sessionCookie = '';

const axiosInstance = axios.create({
    baseURL: apiUrl,
    withCredentials: true, 
});

// axiosInstance.interceptors.request.use(request => {
//     console.log('Starting Request', request);
//     return request;
// });

// axiosInstance.interceptors.response.use(response => {
//     console.log('Response:', response);
//     return response;
// });


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
        console.log('Start Game Response:', response.data);

        // Store the session cookie for future requests
        sessionCookie = response.headers['set-cookie'][0]; // Get the first cookie
        //console.log('Set-Cookie:', sessionCookie);

        //return response.data.targetCountry;
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


const guess = async (targetCountry) => {
    const { userGuess } = await inquirer.prompt([
        {
            type: 'input',
            name: 'userGuess',
            message: 'Enter the name of the country:',
        },
    ]);

    console.log('User guess before sending:', userGuess);

    console.log(targetCountry);


    try {
        const { data } = await axiosInstance.post(`${apiUrl}/guess`, { userGuess },
        {
            // headers: {
            //     'Content-Type': 'application/json' // Ustawienie Content-Type
            // }
            headers: {
                Cookie: sessionCookie // Attach the stored cookie
            }
        });
        console.log('Response data from server:', data);
        return data;
    }

    catch (error) {
        console.error('Error making guess:', error.response.data.error);
    }
}

const main = async () => {  
    const difficulty = await chooseDifficulty();
    const targetCountry = await startGame(difficulty);
    
    // Wait for a moment to ensure that the session is properly established
    await new Promise(resolve => setTimeout(resolve, 100)); // optional delay

    // Now get the session data
    await getSessionData();

       // Wait for a moment to ensure that the session is properly established
       await new Promise(resolve => setTimeout(resolve, 100)); // optional delay
    await guess();
    await guess();
    await guess();

}

main();
