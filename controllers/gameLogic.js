import axios from 'axios';

const populationTreshold = 100000000;
let countriesCache = null

export const getCountries = async () => {
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
                unMember: country.unMember
            }));
            countriesCache = countries;
        } catch (error) {
          console.error('Error fetching data: ', error);
          throw error;
        }
    }
    return countriesCache;
};

export const getCountryByName = async (countryName) => {
    const countries = await getCountries();
    return countries.find(country => country.name.toLowerCase() === countryName.toLowerCase());
};

export const getRandomCountry = async () => {
    const countries = await getCountries(); 
    return countries[Math.floor(Math.random() * countries.length)];
};

export const getRandomCountryByDifficulty = async (difficulty) => {
    const countries = await getCountries();
    
    let filteredCountries = [];
    if (difficulty === 'EASY') {
        filteredCountries = countries.filter(country => (country.population > populationTreshold && country.unMember === true));
    } else if (difficulty === 'EASY-EUROPE') {
        filteredCountries = countries.filter(country => country.continent === "Europe");
    } else if (difficulty === 'HARD') {
        filteredCountries = countries.filter(country => country.unMember === true);
    } else if (difficulty === 'EXPERT') {   
        filteredCountries = countries;
    }
    return filteredCountries[Math.floor(Math.random() * filteredCountries.length)];
};

export const getCountriesByDifficulty = async (difficulty) => {
    const countries = await getCountries();

    let filteredCountries = [];
    if (difficulty === 'EASY') {
        filteredCountries = countries.filter(country => (country.population > populationTreshold && country.unMember === true));
    } else if (difficulty === 'EASY-EUROPE') {
        filteredCountries = countries.filter(country => country.continent === "Europe");
    } else if (difficulty === 'HARD') {
        filteredCountries = countries.filter(country => country.unMember === true);
    } else if (difficulty === 'EXPERT') {   
        filteredCountries = countries;
    }
    return filteredCountries;
};

export const checkGuess = (userGuess, targetCountry) => {
    return userGuess.name.toLowerCase() === targetCountry.name.toLowerCase();
};


export const comparePopulation = (userGuess, targetCountry) => {
    const populationDiff = Math.abs(targetCountry.population - userGuess.population);

    if (populationDiff < 1000000) {
        return 'SIMILAR';
    } else if (userGuess.population < targetCountry.population) {
        return 'GREATER';
    } else {
        return "LOWER";
    }
};

export const compareContinent = (userGuess, targetCountry) => {
    if (userGuess.continent === targetCountry.continent) {
        return 'MATCH';
    } else {
        return "DIFFERENT";
    }
};

export const compareArea = (userGuess, targetCountry) => {
    const areaDiff = Math.abs(targetCountry.area - userGuess.area);

    if (areaDiff < 50000) {
        return 'SIMILAR';
    } else if (userGuess.area < targetCountry.area) {
        return 'GREATER';
    } else {
        return "LOWER";
    }
};

export const compareLocation = (userGuess, targetCountry) => {
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
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
};

export const compareDistance = (userGuess, targetCountry) => {
    const distance = calculateDistance(userGuess.latitude, userGuess.longitude, targetCountry.latitude, targetCountry.longitude);
    return distance;
};

export const getFeedback = (userGuess, targetCountry) => {
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

    return feedback;
};

export default {
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