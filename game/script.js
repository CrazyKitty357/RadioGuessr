const CorrectCountry = "Germany";
let selectedButtonId = null;
let jsonData = null;
let guessCount = 0;
const maxGuesses = 2;
var SelectedCountry = null;
var wonVar = false;

fetch("countries.json")
  .then((response) => response.json())
  .then((data) => {
    jsonData = data[0];
  })
  .catch((error) => console.error("Error loading JSON:", error));

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

function StartGame() {
  guessCount = 0;
  document.getElementById("play-btn").hidden = true;
  document.getElementById("guess-btn").hidden = false;
  document.getElementById("audio-player").hidden = false;
  document.getElementById("audio-player").volume = 0.3;
  document.getElementById("audio-player").play();
  document.getElementById("country-selector").hidden = false;
  document.getElementById("guess-country-name").hidden = false;
  document.getElementById("guess-correct-text").hidden = false;
  // console.log(jsonData[CorrectCountry]?.globe);
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
    console.log("Game over! No more guesses.");
    return;
  }

  const button = document.getElementById(selectedButtonId);
  if (button) {
    guessCount++;
    console.log("GUESSED:", button.innerText);
    const guessedText = button.innerText;
    const correctIcon = jsonData[CorrectCountry]?.icon;

    if (guessedText === correctIcon) {
      console.log("YAY");
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
      console.log("Out of guesses!");
      // console.log(wonVar);
      if (wonVar == false) {
        EndGame(false);
      }
    }
  } else {
    document.getElementById("guess-correct-text").innerText =
      "Select a Country!";
    console.log("Element not found:", selectedButtonId);
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

  if (!won) {
    document.getElementById("guess-correct-text").innerText = "Game Over! ❌";
    document.getElementById("confetti-emoji").hidden = true;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.style.setProperty("--globe-emoji", `"🌎"`);
  fetch("countries.json")
    .then((response) => response.json())
    .then((data) => {
      // Convert country data to array format
      const countries = Object.entries(data[0]).map(([name, info]) => ({
        name,
        icon: info.icon,
      }));

      // Find and separate the correct country
      const correctCountry = countries.find((c) => c.name === CorrectCountry);
      if (!correctCountry) {
        throw new Error("Correct country not found in the data");
      }

      // Get other countries and shuffle them
      const otherCountries = countries.filter((c) => c.name !== CorrectCountry);
      const shuffledOthers = shuffleArray(otherCountries).slice(0, 5);

      // Combine and shuffle all selected countries
      const finalSelection = shuffleArray([correctCountry, ...shuffledOthers]);

      // Assign flags to buttons
      for (let i = 1; i <= 6; i++) {
        const button = document.getElementById(`country-${i}`);
        if (button && finalSelection[i - 1]) {
          button.textContent = finalSelection[i - 1].icon;
        }
      }
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
    particleCount: 50,
    spread: 100,
    origin: { x, y },
    colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
    shapes: ["circle", "square"],
    gravity: 0.8,
    scalar: 1.2,
  });
}

function stopAnimation() {}
