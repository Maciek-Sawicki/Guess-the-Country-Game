const { getCountries, getRandomCountry } = require('../controllers/gameLogic');
const { comparePopulation, compareContinent, compareArea, compareLocation } = require('../controllers/gameLogic');

async function testGetCountries() {
  try {
    const countries = await getCountries();
    console.log(countries); // Wyświetlenie wszystkich krajów
  } catch (error) {
    console.error('Błąd podczas testowania getCountries:', error);
  }
}

async function testGetRandomCountry() {
    try {
        const randomCountry = await getRandomCountry(); // Poczekaj na wynik
        console.log(randomCountry); // Wyświetl wylosowany kraj
    } catch (error) {
        console.error('Błąd podczas testowania losowego kraju:', error); // Obsłuż błąd
    }
}

//testGetCountries();

async function startGame() {
    const targetCountry = await getRandomCountry(); // Wylosuj kraj

    const userGuess = { // Przykładowe dane użytkownika, zazwyczaj pobrane od niego
        name: 'Germany',
        population: 83000000,
        continent: 'Europe',
        area: 357022,
        latitude: 51,
        longitude: 9
    };

    console.log('Podpowiedzi:');

    // Porównania i podpowiedzi
    console.log(comparePopulation(userGuess, targetCountry));
    console.log(compareContinent(userGuess, targetCountry));
    console.log(compareArea(userGuess, targetCountry));
    console.log(compareLocation(userGuess, targetCountry));
}

const { getFeedback } = require('../controllers/gameLogic'); // Importujemy funkcję getFeedback

async function checkGuess(userGuess, targetCountry) {
    console.log(userGuess);
    console.log(targetCountry);



    // Otrzymujemy wynik porównania
    const feedback = getFeedback(userGuess, targetCountry);
    
    // Sprawdzanie różnych wyników porównania
    const result = {
        isPopulationClose: feedback.population === 'EQUAL',
        isPopulationGreater: feedback.population === 'GREATER',
        isPopulationLess: feedback.population === 'LESS',
        
        isAreaClose: feedback.area === 'EQUAL',
        isAreaGreater: feedback.area === 'GREATER',
        isAreaLess: feedback.area === 'LESS',
        
        isContinentMatch: feedback.continent === 'MATCH',
        isContinentDifferent: feedback.continent === 'DIFFERENT',
        
        isLocationNorth: feedback.location.latitudeHint === 'NORTH',
        isLocationSouth: feedback.location.latitudeHint === 'SOUTH',
        isLocationEast: feedback.location.longitudeHint === 'EAST',
        isLocationWest: feedback.location.longitudeHint === 'WEST',
        isLocationSameLatitude: feedback.location.latitudeHint === 'SAME_LATITUDE',
        isLocationSameLongitude: feedback.location.longitudeHint === 'SAME_LONGITUDE'
    };

    return result;
}

async function main() {
const userGuess = await getRandomCountry();
//const targetCountry = await getRandomCountry();

const targetCountry = {
  name: 'Germany',  
  population: 83000000,
  area: 357022,
  continent: 'Europe',
  latitude: 51.1657,
  longitude: 10.4515
};

const result = await checkGuess(userGuess, targetCountry);
console.log(result);
}

main();





//startGame();

//testGetRandomCountry();