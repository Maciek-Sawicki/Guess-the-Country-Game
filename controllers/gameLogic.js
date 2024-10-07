const axios = require('axios');

let countriesCache = null

async function getCountries() {
    if (!countriesCache) {
        try {
            const response = await axios.get('https://restcountries.com/v3.1/all');
            const countriesRaw = response.data;
            const countries = countriesRaw.map((country) => ({
                name: country.name.common,
                population: country.population,
                continent: country.continents[0],
                area: country.area,
                latitude: country.latlng[0],
                longitude: country.latlng[1],
            }));
            countriesCache = countries;
        } catch (error) {
          console.error('Error fetching data: ', error);
          throw error;
        }
    }
    return countriesCache;
}

async function getRandomCountry() {
    const countries = await getCountries(); 
    return countries[Math.floor(Math.random() * countries.length)];
}

async function getRandomCountryByDifficulty(difficulty) {
    const countries = await getCountries();
    
    let filteredCountries;
    if (difficulty === 'EASY') {
        filteredCountries = countries.filter(country => country.population > 50000000);
    } else { (difficulty === 'HARD') 
        filteredCountries = countries
    }
    return filteredCountries[Math.floor(Math.random() * filteredCountries.length)];
}

function checkGuess(userGuess, targetCountry) {
    return userGuess.toLowerCase() === targetCountry.name.toLowerCase();
}

function comparePopulation(userGuess, targetCountry) {
    const populationDiff = Math.abs(targetCountry.population - userGuess.population);

    if (populationDiff < 1000000) {
        return 'EQUAL';
    } else if (userGuess.population > targetCountry.population) {
        return 'GREATER';
    } else {
        return "LESS";
    }
}

function compareContinent(userGuess, targetCountry) {
    if (userGuess.continent === targetCountry.continent) {
        return 'MATCH';
    } else {
        return "DIFFERENT";
    }
}

function compareArea(userGuess, targetCountry) {
    const areaDiff = Math.abs(targetCountry.area - userGuess.area);

    if (areaDiff < 50000) {
        return 'EQUAL';
    } else if (userGuess.area > targetCountry.area) {
        return 'GREATER';
    } else {
        return "LESS";
    }
}

function compareLocation(userGuess, targetCountry) {
    const latitudeDiff = targetCountry.latitude - userGuess.latitude;
    const longitudeDiff = targetCountry.longitude - userGuess.longitude;

    const tolerance = 2; // tolerance ±2° 

    let latitudeHint = '';
    let longitudeHint = '';

    if (Math.abs(latitudeDiff) <= tolerance) {
        latitudeHint = 'SAME_LATITUDE';
    } else if (latitudeDiff > 0) {
        latitudeHint = 'NORTH'; 
    } else {
        latitudeHint = 'SOUTH';
    }

    if (Math.abs(longitudeDiff) <= tolerance) {
        longitudeHint = 'SAME_LONGITUDE'; 
    } else if (longitudeDiff > 0) {
        longitudeHint = 'EAST';  
    } else {
        longitudeHint = 'WEST'; 
    }

    return { latitudeHint, longitudeHint };
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const distance = R * c; // distance in kilometers
    return distance;
}

function compareDistance(userGuess, targetCountry) {
    const distance = calculateDistance(userGuess.latitude, userGuess.longitude, targetCountry.latitude, targetCountry.longitude);
    return { distance };
}

function getFeedback(userGuess, targetCountry) {
    const population = comparePopulation(userGuess, targetCountry);
    const area = compareArea(userGuess, targetCountry);
    const continent = compareContinent(userGuess, targetCountry);
    const location = compareLocation(userGuess, targetCountry);
    const distance = compareDistance(userGuess, targetCountry);

    const feedback = {
        population,
        area,
        continent,
        location,
        distance
    }

    return feedback
}

module.exports = {
    getCountries,
    getRandomCountry,
    getRandomCountryByDifficulty,
    checkGuess,
    comparePopulation,
    compareArea,
    compareContinent,
    compareLocation,
    compareDistance,
    getFeedback
};