import express from 'express';
import * as gameLogic from '../controllers/gameLogic.js'; 

const router = express.Router();

router.get('/countries', async (req, res) => {
    try {
        const countries = await gameLogic.getCountries();
        res.json(countries);
    } catch (error) {
        console.error('Error getting countries', error);
        res.status(500).json({ error: 'Failed to get countries list' });
    }
});

router.get('/random-country', async (req, res) => {
    try {
        const randomCountry = await gameLogic.getRandomCountry();
        res.json(randomCountry);
    } catch (error) {
        console.error('Error getting random country:', error);
        res.status(500).json({ error: 'Failed to get random country' });
    }
});

router.get('/random-country/:difficulty', async (req, res) => {
    const difficulty = req.params.difficulty.toUpperCase();
    try {
        const randomCountry = await gameLogic.getRandomCountryByDifficulty(difficulty);
        res.json(randomCountry);
    } catch (error) {
        console.error(`Error getting random country with difficulty ${difficulty}:`, error);
        res.status(500).json({ error: 'Failed to get random country with difficulty' });
    }
});

router.post('/start-game', async (req, res) => {

    const { difficulty } = req.body;

    if (!['EASY', 'HARD', 'EXPERT'].includes(difficulty)) {
        return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    console.log('Starting game with difficulty:', difficulty);

    try {
        const randomCountry = await gameLogic.getRandomCountryByDifficulty(difficulty);
        
        console.log(randomCountry);

        if (!randomCountry)     {
            return res.status(404).json({ error: 'No country found' });
        }

        req.session.targetCountry = randomCountry;
        req.session.attempts = 0; 

        res.json({ message: 'Game started!', targetCountry: req.session.targetCountry , attempts:req.session.attempts});
    } catch (error) {
        console.error('Error starting game:', error);
        res.status(500).json({ error: 'Failed to start game' });
    }
});

router.post('/guess', async (req, res) => {

    const targetCountry = req.session.targetCountry;
    console.log('Target country in session:', targetCountry); // Logowanie dla debugowania


    const { userGuess } = req.body;

    
    //const userGuess = 'Syria';

    //const targetCountry = req.session.targetCountry;

    console.log('Sesja podczas zgadywania:', req.session);

    if (!targetCountry) {
        return res.status(400).json({ error: 'Najpierw rozpocznij grę!' });
    }

    try {
        if (!req.session.attempts) {
            req.session.attempts = 0; // Upewnij się, że attempts jest zainicjowane
        }
        req.session.attempts += 1;

        console.log("USERGUESS", userGuess);
        console.log("TARGETCOUNTRY", targetCountry);

        const fullCountryData = await gameLogic.getCountryByName(userGuess);
        if (!fullCountryData) {
            console.log("Nie znaleziono kraju o nazwie:", userGuess);
            return null; // lub inna obsługa błędu
        }

        const isCorrect = gameLogic.checkGuess(userGuess, targetCountry);

        if (isCorrect) {
            return res.json({ message: 'Wygrałeś szefie', attempts: req.session.attempts });
        } else {
            const feedback = gameLogic.getFeedback(fullCountryData, targetCountry);
            return res.json({ feedback, attempts: req.session.attempts });
        }
    } catch (error) {
        console.error('Błąd podczas sprawdzania odpowiedzi:', error);
        return res.status(500).json({ error: 'Błąd podczas sprawdzania odpowiedzi' });
    }
});


router.post('/restart-game', (req, res) => {
    try {
        req.session.targetCountry = null; // Zresetuj cel gry
        req.session.attempts = 0; // Zresetuj liczbę prób
        res.json({ message: 'Gra została zrestartowana' });
    } catch (error) {
        res.status(500).json({ error: 'Błąd podczas restartowania gry' });
    }
});




router.post('/feedback', async (req, res) => {
    const { userGuess, targetCountry } = req.body;
    try {
        const feedback = gameLogic.getFeedback(userGuess, targetCountry);
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get feedback' });
    }
});

export default router;
