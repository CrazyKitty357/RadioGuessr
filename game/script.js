let CorrectCountry = "Germany";
let RadioGardenURL = "https://gensokyoradio.net/";
let StationURL = "https://stream.gensokyoradio.net/3/";
let selectedButtonId = null;
let jsonData = null;
let guessCount = 0;
const maxGuesses = 2;
var SelectedCountry = null;
var wonVar = false;

const url = new URL(window.location.href);
const dateParam = url.searchParams.get("date");

// console.log(dateParam);

fetch("countries.json")
  .then((response) => response.json())
  .then((data) => {
    jsonData = data[0];
  })
  .catch((error) => console.error("Error loading JSON:", error));

async function fetchStations() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/CrazyKitty357/RadioGuessr-db/refs/heads/main/stations.json",
    );
    stationData = await response.json();
  } catch (error) {
    console.error("Error loading JSON:", error);
  }
}

function isMobilePlatform() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /iPhone|iPad|iPod|Android/i.test(userAgent);
}

function ToggleButton(buttonId) {
  if (selectedButtonId) {
    document.getElementById(selectedButtonId).classList.remove("selected");
  }
  selectedButtonId = buttonId;
  document.getElementById(buttonId).classList.add("selected");

  // Get the emoji from the selected button
  const selectedIcon = document.getElementById(buttonId).textContent.trim();

  // Find the country name by comparing the icon to each country's icon in jsonData
  for (const countryName in jsonData) {
    if (jsonData[countryName].icon === selectedIcon) {
      SelectedCountry = countryName;
      break;
    }
  }

  document.getElementById("guess-country-name").innerText = SelectedCountry;
}

window.onload = function () {
  fetchStations();
  document.getElementById("play-btn").innerText = "PLAY GAME!";
  // setTimeout(function () {
  // console.clear();
  // document.getElementById("play-btn").innerText = "PLAY GAME!";
  // }, 250);
};

function StartGame() {
  setRadio(dateParam);
  guessCount = 0;
  console.log("no cheating :)");
  document.getElementById("play-btn").hidden = true;
  document.getElementById("guess-btn").hidden = false;
  document.getElementById("audio-player").hidden = false;
  document.getElementById("audio-player").volume = 0.3;
  document.getElementById("audio-player").play();
  document.getElementById("country-selector").hidden = false;
  document.getElementById("guess-country-name").hidden = false;
  document.getElementById("guess-correct-text").hidden = false;
  // console.log(jsonData[CorrectCountry]?.globe);

  // MOBILE HINT
  if (isMobilePlatform() === true)
    document.body.style.setProperty(
      "--globe-emoji",
      `"${jsonData[CorrectCountry]?.globe}"`,
    );

  var link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>${jsonData[CorrectCountry]?.globe}</text></svg>`;
}

function MakeGuess() {
  if (!jsonData) {
    console.error("JSON has not loaded!");
    return;
  }
  if (guessCount >= maxGuesses) {
    // console.log("Game over! No more guesses.");
    return;
  }

  const button = document.getElementById(selectedButtonId);
  if (button) {
    guessCount++;
    // console.log("GUESSED:", button.innerText);
    const guessedText = button.innerText;
    const correctIcon = jsonData[CorrectCountry]?.icon;

    if (guessedText === correctIcon) {
      // console.log("YAY");
      document.getElementById("guess-correct-text").innerText =
        "Congratulations!";
      wonVar = true;
      EndGame(true);
    } else {
      document.getElementById("guess-correct-text").innerText =
        `Incorrect ❌ (${maxGuesses - guessCount} guess remaining)`;
    }

    document.getElementById("guess-correct-text").hidden = false;

    if (guessCount >= maxGuesses) {
      // console.log("Out of guesses!");
      // console.log(wonVar);
      if (wonVar == false) {
        EndGame(false);
      }
    }
  } else {
    document.getElementById("guess-correct-text").innerText =
      "Select a Country!";
    // console.log("Element not found:", selectedButtonId);
  }
}

function EndGame(won) {
  // console.log(won);
  document.getElementById("guess-btn").disabled = true;
  document.getElementById("guess-btn").hidden = true;
  // document.getElementById("audio-player").pause();
  // document.getElementById("audio-player").hidden = true;
  document.getElementById("country-selector").hidden = true;
  document.getElementById("guess-country-name").hidden = true;
  document.getElementById("confetti-emoji").hidden = false;
  document.getElementById("radio-url").hidden = false;
  document.getElementById("radio-url").innerHTML =
    `<p>RADIO URL: <a href=${RadioGardenURL} class="link">${RadioGardenURL}</a></p>`;

  if (!won) {
    document.getElementById("guess-country-name").hidden = false;
    document.getElementById("guess-country-name").innerText =
      `The correct country was ${CorrectCountry}`;
    document.getElementById("guess-correct-text").innerText = "Game Over! ❌";
    document.getElementById("confetti-emoji").hidden = true;
    // document.getElementById("radio-url").hidden = true;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  document.body.style.setProperty("--globe-emoji", `"🌎"`);

  await fetchStations();

  fetch("countries.json")
    .then((response) => response.json())
    .then((data) => {
      const countries = Object.entries(data[0]).map(([name, info]) => ({
        name,
        icon: info.icon,
      }));

      setRadio(dateParam);

      const correctCountry = countries.find((c) => c.name === CorrectCountry);
      if (!correctCountry) {
        throw new Error("Correct country not found in the data");
      }

      const otherCountries = shuffleArray(
        countries.filter((c) => c.name !== CorrectCountry),
      ).slice(0, 5);

      const finalSelection = shuffleArray([correctCountry, ...otherCountries]);

      finalSelection.forEach((country, i) => {
        const button = document.getElementById(`country-${i + 1}`);
        if (button) button.textContent = country.icon;
      });
    })
    .catch((error) => console.error("Error:", error));
});

// Keep the same shuffleArray function
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function triggerConfetti(event) {
  const rect = event.target.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  confetti({
    particleCount: 100,
    spread: 100,
    origin: { x, y },
    colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
    shapes: ["circle", "square"],
    gravity: 0.8,
    scalar: 1.2,
  });
}

function setRadio(date) {
  const targetDate = date;

  const station = stationData.find((item) => item.date === targetDate);

  // console.log(station.stationURL);
  // console.log(station.country);
  CorrectCountry = station.country;
  RadioGardenURL = station.radioGarden;
  StationURL = station.stationURL;
  document.getElementById("audio-player").src = StationURL;
}
