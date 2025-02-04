function getToday() {
  const unix = Math.floor(new Date().getTime() / 1000);
  const date = new Date(unix * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function midnightUTCCountdown() {
  const now = new Date();
  const nextUTCMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  const timeDifference = nextUTCMidnight - now;

  const hours = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

  const min = String(minutes).padStart(2, "0");
  const sec = String(seconds).padStart(2, "0");
  const hr = String(hours).padStart(2, "0");

  document.getElementById("todays-game").innerHTML =
    `play today's game! <br /> ${getToday() + " " + hr + ":" + min + ":" + sec}`;
}

const interval = setInterval(midnightUTCCountdown, 1000);
midnightUTCCountdown();

function goToPage(url) {
  window.location.href = url;
}

document.getElementById("todays-game").onclick = function () {
  goToPage(`game/?date=${getToday()}`);
};
// document.getElementById("old-game").onclick = function () {
//   goToPage("game/?date=old");
// };
