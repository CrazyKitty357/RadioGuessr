let currentStation = null;
let guessesLeft = 5;
let countdownInterval = null;
let gameActive = false;
let userGuesses = []; // Store user's guesses
let correctCountry = false;

function showDate() {
    const today = new Date();
    const utcDate = today.toISOString().split('T')[0];
    document.getElementById('dateText').textContent = utcDate;
    setTimeout(showDate, 1000);
}

function updateCountdown() {
    const now = new Date();
    const nextUTCMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const timeDifference = nextUTCMidnight - now;

    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
    document.getElementById('countdown').innerHTML =
        "Next Station in " +
        ("0" + hours).slice(-2) + ":" +
        ("0" + minutes).slice(-2) + ":" +
        ("0" + seconds).slice(-2);
    setTimeout(updateCountdown, 1000);
}

async function fetchDailyStation() {
try {
const today = new Date();
const utcDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

const response = await fetch('https://raw.githubusercontent.com/CrazyKitty357/RadioGuessr-db/refs/heads/main/stations.json');
const data = await response.json();

// Normalize the dates in the JSON to ensure consistency
const todaysStations = data.filter(station => {
    // Convert station date to UTC format with leading zeros
    let [year, month, day] = station.date.split('-');
    month = month.padStart(2, '0'); // Ensure two digits for month
    day = day.padStart(2, '0');     // Ensure two digits for day
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate === utcDate;
});

if (todaysStations.length > 0) {
    currentStation = todaysStations[0];

    // Set the radio garden information
    document.getElementById('radio-garden-url').textContent = currentStation.radioGarden;
    document.getElementById('radio-garden-url').href = currentStation.radioGarden;
} else {
    document.getElementById('status-message').textContent = "No daily station available today.";
}
} catch (error) {
document.getElementById('status-message').textContent = "Error loading the daily station.";
}
}


async function startDailyMode() {
    if (gameActive) return;
    gameActive = true;

    await fetchDailyStation();
    if (!currentStation) return;

    guessesLeft = 5;
    userGuesses = []; // Reset guesses

    document.getElementById('play-button').classList.add('hidden');
    document.getElementById('radio-player').classList.remove('hidden');
    document.getElementById('guesses-left').textContent = guessesLeft;
    document.getElementById('guesses-left-container').classList.remove('hidden');
    document.getElementById('status-message').textContent = "";
    document.getElementById('country-selection').classList.remove('hidden');
    document.getElementById('copy-button').classList.add('hidden'); // Hide copy button at game start
    document.getElementById('radio-garden').textContent = "";
    document.getElementById('radio-garden-url').classList.add('hidden');

    startStation(currentStation, 1000000);

    generateCountryDropdown();
}

function startStation(station, seconds) {
    const radioPlayer = document.getElementById('radio-player');
    radioPlayer.src = station.stationURL;
    radioPlayer.play();

    clearTimeout(countdownInterval);
    countdownInterval = setTimeout(() => {
        radioPlayer.pause();
        document.getElementById('status-message').textContent = "Time's up!";
        endGame(false);
    }, seconds * 1000);
}

async function fetchCountries() {
    try {
        const response = await fetch('new_countries.json');
        const data = await response.json();
        return data.countries;
    } catch (error) {
        return [];
    }
}

async function generateCountryDropdown() {
    const dropdown = document.getElementById('country-dropdown');
    dropdown.innerHTML = '';

    const countries = await fetchCountries();
    countries.forEach(country => {
        // Skip countries with missing latitude or longitude
        if (country.lat === undefined || country.lon === undefined || isNaN(country.lat) || isNaN(country.lon)) {
            return; // Skip this country if lat/lon is invalid
        }

        const option = document.createElement('option');
        option.value = country.name; // Set the country name as the value
        option.textContent = country.name; // Display the country name in the dropdown
        dropdown.appendChild(option);
    });
}


// Haversine formula to calculate distance between two lat/lon points
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c; // Distance in kilometers
    const distanceMiles = distanceKm * 0.621371; // Convert to miles
    return { km: distanceKm.toFixed(2), miles: distanceMiles.toFixed(2) };
}

// Fetch country coordinates from countries.json
async function getCountryCoordinates(countryName) {
    const countries = await fetchCountries();
    const countryData = countries.find(c => c.name === countryName);
    return countryData ? { lat: countryData.lat, lon: countryData.lon } : null;
}

// Modify the submitGuess function to show distance
async function submitGuess() {
    const selectedCountry = document.getElementById('country-dropdown').value;

    if (selectedCountry === currentStation.country) {
        userGuesses.push('✅'); // Correct guess
        document.getElementById('status-message').textContent = "You guessed the correct country!";
        endGame(true); // Correct guess
    } else {
        userGuesses.push('❌'); // Incorrect guess
        guessesLeft--;
        document.getElementById('guesses-left').textContent = guessesLeft;

        // Calculate distance if the guess is incorrect
        const guessedCoordinates = await getCountryCoordinates(selectedCountry);
        const correctCoordinates = await getCountryCoordinates(currentStation.country);

        if (guessedCoordinates && correctCoordinates) {
            const distance = calculateDistance(
                guessedCoordinates.lat, guessedCoordinates.lon, 
                correctCoordinates.lat, correctCoordinates.lon
            );
            document.getElementById('status-message').textContent = `Incorrect guess. You are ${distance.km} km (${distance.miles} miles) away from the correct country. Try again!`;
        }

        if (guessesLeft === 0) {
            document.getElementById('status-message').textContent = `Game over! The correct country was ${currentStation.country}.`;
            endGame(false); // Out of guesses
        }
    }
}


function endGame(correct) {
    gameActive = false;
    document.getElementById('play-button').classList.remove('hidden');
    document.getElementById('play-button').textContent = "Play again! (it's the same station)";
    document.getElementById('country-selection').classList.add('hidden');
    document.getElementById('guesses-left-container').classList.add('hidden');
    document.getElementById('copy-button').classList.remove('hidden'); // Show copy button
    document.getElementById('radio-garden').textContent = "Listen to this station on radio garden: ";
    document.getElementById('radio-garden-url').classList.remove('hidden');
}

function copyToClipboard() {
    const utcDate = document.getElementById('dateText').textContent;
    const lastFiveGuesses = userGuesses.slice(-5).join('\n'); // Take the last 5 guesses
    const textToCopy = `RadioGuessr: ${utcDate}\n${lastFiveGuesses}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Guesses shared to clipboard!");
    }).catch(err => {
        alert("Failed to copy: ", err);
    });
}

const toggleButton = document.getElementById('toggle-theme');

toggleButton.addEventListener('click', () => {
    const html = document.documentElement;
    if (html.getAttribute('data-theme') === 'dark') {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme)
}