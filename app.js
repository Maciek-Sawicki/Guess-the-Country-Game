// app.js
const express = require('express');
const { getCountries } = require('./controllers/gameLogic');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint do rozpoczęcia gry
app.get('/start', async (req, res) => {
  try {
    const country = await getRandomCountry();
    res.json({ message: 'Zgadnij kraj!', country: country.name.common });
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się rozpocząć gry.' });
  }
});

// Funkcja do pobierania losowego kraju
async function getRandomCountry() {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all');
    const countries = response.data;
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    return randomCountry;
  } catch (error) {
    console.error('Błąd pobierania danych:', error);
    throw error;
  }
}

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer uruchomiony na http://localhost:${PORT}`);
});
