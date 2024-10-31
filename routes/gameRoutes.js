import express from 'express';
import * as gameLogic from '../controllers/gameLogic.js'; 
import chalk from 'chalk';

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

    if (!['EASY-EUROPE', 'EASY', 'HARD', 'EXPERT'].includes(difficulty)) {
        return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    console.log(`${chalk.blue(`Session ID: ${req.sessionID}`)}, ${chalk.green(`Starting game with difficulty: ${difficulty}`)}`);

    try {
        const randomCountry = await gameLogic.getRandomCountryByDifficulty(difficulty);
        if (!randomCountry)     {
            return res.status(404).json({ error: 'No country found' });
        }

        console.log(`${chalk.blue(`Session ID: ${req.sessionID}`)}, ${chalk.green(`Target country: ${randomCountry.name}`)}`);

        req.session.targetCountry = randomCountry;
        req.session.attempts = 0; 
        req.session.save(err => {
            if (err) console.error('Session save error:', err);
            res.json({
                message: 'Game started!',
                targetCountry: req.session.targetCountry,
                attempts: req.session.attempts
            });
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to start game' });
    }
});

router.get('/session-data', (req, res) => {
    if (!req.session.targetCountry || typeof req.session.attempts === 'undefined') {
        return res.status(404).json({ error: 'Session data not found' });
    }
    res.json({
        targetCountry: req.session.targetCountry,
        attempts: req.session.attempts,
    });
});

router.post('/guess', async (req, res) => {
    if (!req.session.targetCountry) {
        return res.status(400).json({ error: 'Start game first!' });
    }
    const targetCountry = req.session.targetCountry;
    const { userGuess } = req.body;

    try {
        if (!req.session.attempts) {
            req.session.attempts = 0; 
        }
        req.session.attempts += 1;

        const fullCountryData = await gameLogic.getCountryByName(userGuess);
        if (!fullCountryData) {
            console.log("Failed to find country with this name:", userGuess);
            return null; 
        }

        console.log(`${chalk.blue(`Session ID: ${req.sessionID}`)}, ${chalk.green(`User guess: ${fullCountryData.name}`)}`);

        const isCorrect = gameLogic.checkGuess(fullCountryData, targetCountry);

        if (isCorrect) {
            console.log(`${chalk.blue(`Session ID: ${req.sessionID}`)}, ${chalk.green(`Game won! Correct country is ${targetCountry.name}`)}`);
            return res.json({
                message: `You won Boss! Correct country is ${targetCountry.name}`,
                attempts: req.session.attempts 
            });
        } else {
            const feedback = gameLogic.getFeedback(fullCountryData, targetCountry);
            return res.json({ feedback, attempts: req.session.attempts });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Error while checking the answer' });
    }    
});

router.post('/restart-game', (req, res) => {
    try {
        req.session.targetCountry = null; 
        req.session.attempts = 0; 
        res.json({ message: 'Game restarted' });
    } catch (error) {
        res.status(500).json({ error: 'Error while restarting the game' });
    }
});

export default router;
