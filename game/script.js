let CorrectCountry = "Germany"; // Initial value, will be updated by setRadio
let RadioGardenURL = "https://gensokyoradio.net/"; // Initial value, will be updated
let StationURL = "https://stream.gensokyoradio.net/3/"; // Initial value, will be updated
let selectedButtonId = null;
let jsonData = null; // For countries data
let stationData = null; // For stations data
let guessCount = 0;
const maxGuesses = 2;
var SelectedCountry = null; // The country selected by the user's button click
var wonVar = false; // Track if the user won the game

const url = new URL(window.location.href);
const dateParam = url.searchParams.get("date");

// Removed the first fetch("countries.json") as it's redundant

async function fetchStations() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/CrazyKitty357/RadioGuessr-db/refs/heads/main/stations.json",
      { cache: 'reload' } // <--- Added cache: 'reload' option here
    );
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    stationData = await response.json();
  } catch (error) {
    console.error("Error loading stations.json:", error);
    // Optionally, display an error message to the user
    document.getElementById("play-btn").innerText = "Error loading stations. Please try again.";
    document.getElementById("play-btn").disabled = true;
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
  // Ensure jsonData is loaded before trying to use it
  if (jsonData) {
    for (const countryName in jsonData) {
      if (jsonData[countryName].icon === selectedIcon) {
        SelectedCountry = countryName;
        break;
      }
    }
  } else {
      console.warn("jsonData not yet loaded when ToggleButton was called.");
      SelectedCountry = null; // Or some default/error state
  }


  document.getElementById("guess-country-name").innerText = SelectedCountry || "Select a Country";
}

// Removed window.onload function, handled by DOMContentLoaded

function StartGame() {
  if (!stationData || !jsonData) {
      console.error("Data not loaded yet. Cannot start game.");
      // Optionally, display an error or wait indicator
      return;
  }

  // setRadio depends on stationData being loaded
  setRadio(dateParam);

  guessCount = 0;
  wonVar = false; // Reset wonVar at the start of the game
  console.log("no cheating :)");
  document.getElementById("play-btn").hidden = true;
  document.getElementById("guess-btn").hidden = false;
  document.getElementById("audio-player").hidden = false;
  document.getElementById("audio-player").volume = 0.3;
  document.getElementById("audio-player").play();
  document.getElementById("country-selector").hidden = false;
  document.getElementById("guess-country-name").hidden = false;
  document.getElementById("guess-correct-text").hidden = false;
  document.getElementById("share-btn").hidden = true; // Hide share button at start


  // MOBILE HINT - Ensure jsonData[CorrectCountry] exists
  if (isMobilePlatform() === true && jsonData && jsonData[CorrectCountry]) {
    document.body.style.setProperty(
      "--globe-emoji",
      `"${jsonData[CorrectCountry]?.globe}"`, // Added ?. for safety
    );
  }

  // Set favicon - Ensure jsonData[CorrectCountry] exists
  if (jsonData && jsonData[CorrectCountry]) {
      var link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/svg+xml"; // Set type for SVG favicon
        document.head.appendChild(link);
      }
      // Use encodeURIComponent for safety in data URL
      const svgIcon = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='80'>${jsonData[CorrectCountry]?.globe || '🌎'}</text></svg>`;
      link.href = `data:image/svg+xml,${encodeURIComponent(svgIcon)}`;
  }
}

function MakeGuess() {
  if (!jsonData) {
    console.error("JSON has not loaded!");
    document.getElementById("guess-correct-text").innerText = "Error: Data not loaded.";
    return;
  }
  if (selectedButtonId === null) { // Check if a button has been selected
      document.getElementById("guess-correct-text").innerText = "Select a Country first!";
      return;
  }

  if (guessCount >= maxGuesses) {
    // Game already over or no guesses left
    return;
  }

  const button = document.getElementById(selectedButtonId);
  if (button) {
    guessCount++;
    const guessedText = button.innerText;
    const correctCountryData = jsonData[CorrectCountry];

    if (!correctCountryData) {
        console.error(`Correct country data not found for: ${CorrectCountry}`);
        document.getElementById("guess-correct-text").innerText = "Error: Correct country data missing.";
        EndGame(false); // End game on error
        return;
    }

    const correctIcon = correctCountryData.icon;

    if (guessedText === correctIcon) {
      document.getElementById("guess-correct-text").innerText =
        "Congratulations!";
      wonVar = true; // Set wonVar to true
      EndGame(true);
    } else {
      document.getElementById("guess-correct-text").innerText =
        `Incorrect ❌ (${maxGuesses - guessCount} guess${maxGuesses - guessCount === 1 ? '' : 'es'} remaining)`; // Added pluralization

      if (guessCount >= maxGuesses) { // Only end if not won and out of guesses
          wonVar = false; // Ensure wonVar is false on final incorrect guess
          EndGame(false);
      }
    }

    document.getElementById("guess-correct-text").hidden = false;

  } else {
     // This case should ideally not happen if selectedButtonId is set, but good safety
    document.getElementById("guess-correct-text").innerText =
      "Error: Selected button not found.";
    console.error("Element not found:", selectedButtonId);
  }
}

function EndGame(won) {
  document.getElementById("guess-btn").disabled = true;
  document.getElementById("guess-btn").hidden = true;
  // document.getElementById("audio-player").pause(); // Consider if you want to pause
  // document.getElementById("audio-player").hidden = true; // Consider if you want to hide
  document.getElementById("country-selector").hidden = true;
  // document.getElementById("guess-country-name").hidden = true; // Keep visible to show correct answer
  document.getElementById("confetti-emoji").hidden = false;
  document.getElementById("radio-url").hidden = false;
  document.getElementById("share-btn").hidden = false; // Show share button at end

  // Ensure RadioGardenURL is valid before setting href
  document.getElementById("radio-url").innerHTML =
    `<p>RADIO URL: <a href="${RadioGardenURL || '#'}" class="link">${RadioGardenURL || 'URL not available'}</a></p>`;


  if (won) {
     document.getElementById("guess-correct-text").innerText = "Game Over! ✅"; // Indicate win clearly
     // Correct answer is implicitly known
  } else {
    document.getElementById("guess-country-name").hidden = false;
    document.getElementById("guess-country-name").innerText =
      `The correct country was ${CorrectCountry}`; // CorrectCountry should be set by setRadio
    document.getElementById("guess-correct-text").innerText = "Game Over! ❌"; // Indicate loss clearly
    document.getElementById("confetti-emoji").hidden = true;
  }
}

async function shareScore() {
    if (!jsonData || !CorrectCountry || !dateParam) {
        console.error("Cannot share score: Data not available.");
        // Optionally inform the user
        document.getElementById("guess-correct-text").innerText = "Error preparing share data.";
        return;
    }

    // Determine the result symbols based on wonVar AND guessCount
    let resultSymbols = '';
    if (wonVar && guessCount === 1) {
        resultSymbols = '✅'; // Won on the first guess
    } else if (wonVar && guessCount === 2) {
        resultSymbols = '❎✅'; // Won on the second guess (first was incorrect, second correct)
    } else if (!wonVar && guessCount === 2) {
        resultSymbols = '❎❎'; // Lost after two guesses (both incorrect)
    } else {
         // This case shouldn't ideally happen with maxGuesses = 2, but good to handle
         console.warn("Unexpected state for share score generation:", { wonVar, guessCount });
         resultSymbols = '❓❓'; // Indicate an unknown result state
    }

    // Get the globe emoji for the correct country
    const globeEmoji = jsonData[CorrectCountry]?.globe || '🌎'; // Default to world emoji if not found

    // Construct the clipboard text
    const shareText = `RadioGuessr ${globeEmoji}: ${dateParam}\n${resultSymbols}\nhttps://crazykitty357.github.io/RadioGuessr/`; // Added site URL

    try {
        // Use the modern Clipboard API
        await navigator.clipboard.writeText(shareText);
        console.log("Score copied to clipboard:", shareText);

        // Provide user feedback
        const shareButton = document.getElementById("share-btn");
        const originalText = shareButton.innerText; // Get original text from button
        shareButton.innerText = "Copied!";
        // Optional: Revert text after a short delay
        setTimeout(() => {
             // Check if the text hasn't been changed by something else since
             if (shareButton.innerText === "Copied!") {
                 shareButton.innerText = originalText;
             }
        }, 2000); // Revert after 2 seconds

    } catch (err) {
        console.error("Failed to copy score to clipboard:", err);
        // Inform the user if copy failed
        const shareButton = document.getElementById("share-btn");
        shareButton.innerText = "Copy Failed!";
         setTimeout(() => {
             if (shareButton.innerText === "Copy Failed!") {
                 shareButton.innerText = "Share Score"; // Revert to default share text
             }
        }, 3000); // Revert after 3 seconds
    }
}


document.addEventListener("DOMContentLoaded", async () => {
  // Set initial globe emoji (can be done directly in CSS)
  document.body.style.setProperty("--globe-emoji", `"🌎"`);
  document.getElementById("play-btn").innerText = "Loading...";
  document.getElementById("play-btn").disabled = true;

  // Add event listener for the share button
  // Ensure the button exists in your HTML (e.g., <button id="share-btn" hidden>Share Score</button>)
  const shareButton = document.getElementById("share-btn");
  if (shareButton) {
      shareButton.addEventListener("click", shareScore);
  } else {
      console.error("Share button with id 'share-btn' not found!");
  }


  await fetchStations(); // Wait for stations data

  if (!stationData) {
      // If stations failed to load, stop here. Error message already set in fetchStations.
      return;
  }

  // Fetch countries data AFTER stations, as setRadio needs stationData to know the correct country
  fetch("countries.json", { cache: 'reload' }) // <--- Added cache: 'reload' option here
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
      jsonData = data[0]; // Store the data globally

      // Set the initial radio based on dateParam AFTER stationData is loaded
      setRadio(dateParam); // This sets CorrectCountry

      // Now use the CorrectCountry determined by setRadio to build the buttons
      // Need a default CorrectCountry if setRadio failed or dateParam was bad
      const targetCountry = CorrectCountry || Object.keys(jsonData)[0]; // Use first country as fallback if CorrectCountry is null/undefined

      const countries = Object.entries(jsonData).map(([name, info]) => ({
        name,
        icon: info.icon,
        globe: info.globe
      }));

      const correctCountry = countries.find((c) => c.name === targetCountry);

      // If targetCountry isn't found in countries.json, something is wrong.
      // Or if setRadio failed AND countries.json was empty/malformed.
      if (!correctCountry && targetCountry) {
         console.error(`Target country "${targetCountry}" not found in countries.json`);
         document.getElementById("play-btn").innerText = `Error: Data mismatch for "${targetCountry}"`;
         document.getElementById("play-btn").disabled = true;
         return; // Stop initialization
      } else if (!correctCountry && !targetCountry) {
           console.error("Could not determine target country and countries.json seems empty or malformed.");
           document.getElementById("play-btn").innerText = "Error loading country data.";
           document.getElementById("play-btn").disabled = true;
           return; // Stop initialization
      }


      const otherCountries = shuffleArray(
        countries.filter((c) => c.name !== targetCountry),
      ).slice(0, 5); // Get 5 others

      // Handle the case where there aren't enough other countries (e.g. less than 6 countries total)
      const finalSelection = shuffleArray([correctCountry, ...otherCountries].filter(c => c != null)); // Filter out potential null if correctCountry wasn't found but loop continued


      // Populate country selector buttons
      // Only populate up to 6 buttons total
      for (let i = 0; i < 6; i++) {
          const button = document.getElementById(`country-${i + 1}`);
          if (button) {
              if (finalSelection[i]) {
                 button.textContent = finalSelection[i].icon;
                 // You might want to store the country name or a reference on the button element
                 // button.dataset.countryName = country.name;
              } else {
                 // Hide or disable unused buttons if there are fewer than 6 options
                 button.style.display = 'none'; // Or button.disabled = true;
              }
          }
      }


      // Data loaded and setup complete, enable play button ONLY if setRadio didn't report an error
      // setRadio sets the play-btn text/disabled state on error
      if (document.getElementById("play-btn").disabled !== true || document.getElementById("play-btn").innerText === "Loading...") {
           document.getElementById("play-btn").innerText = "PLAY GAME!";
           document.getElementById("play-btn").disabled = false;
      }


    })
    .catch((error) => {
        console.error("Error loading countries.json:", error);
        document.getElementById("play-btn").innerText = "Error loading country data. Please try again.";
        document.getElementById("play-btn").disabled = true;
    });
});

// Keep the same shuffleArray function
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Ensure confetti is defined if you're calling this
// Make sure the confetti library is included in your HTML
function triggerConfetti(event) {
    // Check if confetti function exists globally
    if (typeof confetti !== 'function') {
        console.warn("Confetti function not found. Make sure the library is included.");
        return;
    }

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

  // Ensure stationData is available
  if (!stationData) {
      console.error("stationData is not loaded when setRadio is called.");
      // Cannot proceed without station data, error already reported by fetchStations
      return;
  }

  const station = stationData.find((item) => item.date === targetDate);

  if (!station) {
      console.error(`No station found for date: ${targetDate}`);
      // Handle case where no station is found for the given date
      document.getElementById("play-btn").innerText = `No game data found for date "${targetDate}".`;
      document.getElementById("play-btn").disabled = true;
      document.getElementById("guess-btn").hidden = true;
      document.getElementById("audio-player").hidden = true;
      document.getElementById("country-selector").hidden = true;
      document.getElementById("guess-country-name").hidden = true;
      document.getElementById("guess-correct-text").hidden = true;
      document.getElementById("radio-url").hidden = true; // Hide URL too
      document.getElementById("confetti-emoji").hidden = true; // Hide confetti
      document.getElementById("share-btn").hidden = true; // Hide share button

      // Set page title to reflect error
      document.title = "RadioGuessr - No Data";
      return; // Stop here
  }

  // console.log(station.stationURL);
  // console.log(station.country);
  CorrectCountry = station.country;
  RadioGardenURL = station.radioGarden;
  StationURL = station.stationURL;

  // Set the audio source *only if* a station was found
  document.getElementById("audio-player").src = StationURL;

  // Set page title based on the date
  document.title = `RadioGuessr - ${targetDate}`;
}