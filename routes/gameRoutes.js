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
        console.error('Error getting random country with difficulty ${difficulty}:', error);
        res.status(500).json({ error: 'Failed to get random country with difficulty' });
    }
});

router.get('/game-status', async (req, res) => {
    
    try {
        const randomCountry = await gameLogic.getRandomCountryByDifficulty(difficulty);
        res.json(randomCountry);
    } catch (error) {
        console.error('Error getting random country with difficulty ${difficulty}:', error);
        res.status(500).json({ error: 'Failed to get random country with difficulty' });
    }
});

router.post('/check-guess', (req, res) => {
    const { userGuess, targetCountry } = req.body;
    const feedback = gameLogic.getFeedback(userGuess, targetCountry);
    res.json(feedback);
});

export default router;
