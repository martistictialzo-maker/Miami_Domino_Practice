// =====================================
// SETTINGS
// =====================================

const BOARD_COLS = 7;
const TOTAL_ROUNDS = 3;
const TARGETS_PER_ROUND = 4;
const PENALTY_SECONDS = 4;

// =====================================
// IMAGE LIST
// =====================================

const dominoFiles = [
    "0_0.png",
    "0_1.png",
    "0_2.png",
    "0_3.png",
    "0_4.png",
    "0_5.png",
    "0_6.png",

    "1_1.png",
    "1_2.png",
    "1_3.png",
    "1_4.png",
    "1_5.png",
    "1_6.png",

    "2_2.png",
    "2_3.png",
    "2_4.png",
    "2_5.png",
    "2_6.png",

    "3_3.png",
    "3_4.png",
    "3_5.png",
    "3_6.png",

    "4_4.png",
    "4_5.png",
    "4_6.png",

    "5_5.png",
    "5_6.png",

    "6_6.png"
];

// =====================================
// ELEMENTS
// =====================================

const boardGrid = document.getElementById("boardGrid");
const targetsGrid = document.getElementById("targetsGrid");

const infoLabel = document.getElementById("info");
const timerLabel = document.getElementById("timer");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

// =====================================
// GAME STATE
// =====================================

let boardDominoes = [];
let allTargets = [];
let currentTargets = [];

let completedDominoes = new Set();

let roundNum = 1;
let foundTotal = 0;
let mistakes = 0;

let foundThisRound = 0;

let locked = false;
let gameStarted = false;

let startTime = null;
let timerInterval = null;

// =====================================
// HELPERS
// =====================================

function shuffle(array) {

    let copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

function sample(array, count) {

    return shuffle(array).slice(0, count);
}

// =====================================
// START GAME
// =====================================

function startGame() {

    gameStarted = true;

    locked = false;

    roundNum = 1;
    foundTotal = 0;
    mistakes = 0;

    foundThisRound = 0;

    completedDominoes.clear();

    boardDominoes = shuffle(dominoFiles);

    allTargets = sample(boardDominoes, 12);

    currentTargets = allTargets.slice(0, 4);

    startTime = Date.now();

    startBtn.style.display = "none";
    resetBtn.style.display = "none";

    buildBoard();
    updateTargets();
    updateInfo();

    startTimer();
}

// =====================================
// BUTTONS
// =====================================

startBtn.addEventListener("click", startGame);

resetBtn.addEventListener("click", startGame);

// =====================================
// TIMER
// =====================================

function startTimer() {

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {

        if (!gameStarted) return;

        const elapsed =
            (Date.now() - startTime) / 1000;

        timerLabel.textContent =
            `Time: ${elapsed.toFixed(2)}`;

    }, 50);
}

// =====================================
// BUILD BOARD
// =====================================

function buildBoard() {

    boardGrid.innerHTML = "";

    boardDominoes.forEach(dominoName => {

        const domino = document.createElement("div");
        domino.className = "domino";

        const img = document.createElement("img");
        img.src = `images/${dominoName}`;

        domino.appendChild(img);

        domino.addEventListener("click", () => {
            clickDomino(dominoName, domino);
        });

        boardGrid.appendChild(domino);
    });
}

// =====================================
// TARGET DISPLAY
// =====================================

function updateTargets() {

    targetsGrid.innerHTML = "";

    currentTargets.forEach(targetName => {

        const target = document.createElement("div");
        target.className = "domino target-domino";

        const img = document.createElement("img");
        img.src = `images/${targetName}`;

        target.appendChild(img);

        // If already found
        if (completedDominoes.has(targetName)) {

            const check = document.createElement("img");

            check.src = "images/green_check.png";
            check.className = "overlay";

            target.appendChild(check);
        }

        targetsGrid.appendChild(target);
    });
}

// =====================================
// INFO
// =====================================

function updateInfo() {

    infoLabel.textContent =
        `Round ${roundNum} | Found ${foundTotal}/12 | Mistakes ${mistakes}`;
}

// =====================================
// CLICK DOMINO
// =====================================

function clickDomino(dominoName, dominoElement) {

    if (locked) {
        return;
    }

    if (completedDominoes.has(dominoName)) {
        return;
    }

    // =================================
    // CORRECT
    // =================================

    if (currentTargets.includes(dominoName)) {

        completedDominoes.add(dominoName);

        foundTotal++;
        foundThisRound++;

        const check = document.createElement("img");

        check.src = "images/green_check.png";
        check.className = "overlay";

        dominoElement.appendChild(check);

        updateTargets();

        // Round complete
        if (foundThisRound === TARGETS_PER_ROUND) {

            if (roundNum === TOTAL_ROUNDS) {

                gameComplete();
                return;
            }

            roundNum++;

            foundThisRound = 0;

            const start =
                (roundNum - 1) * 4;

            const end =
                start + 4;

            currentTargets =
                allTargets.slice(start, end);

            updateTargets();
        }

        updateInfo();
        return;
    }

    // =================================
    // WRONG
    // =================================

    mistakes++;

    locked = true;

    updateInfo();

    const cross = document.createElement("img");

    cross.src = "images/red_cross.png";
    cross.className = "overlay";

    dominoElement.appendChild(cross);

    infoLabel.textContent =
        `❌ WRONG! WAIT ${PENALTY_SECONDS} SECONDS`;

    setTimeout(() => {

        cross.remove();

        locked = false;

        updateInfo();

    }, PENALTY_SECONDS * 1000);
}

// =====================================
// GAME COMPLETE
// =====================================

function gameComplete() {

    gameStarted = false;

    clearInterval(timerInterval);

    const elapsed =
        (Date.now() - startTime) / 1000;

    infoLabel.textContent =
        `🏆 COMPLETE! Found 12/12`;

    timerLabel.textContent =
        `Time: ${elapsed.toFixed(2)} | Mistakes: ${mistakes}`;

    resetBtn.style.display = "inline-block";
}

// =====================================
// KEYBOARD SUPPORT
// =====================================

document.addEventListener("keydown", (event) => {

    if (event.key === "e" || event.key === "E") {

        if (!gameStarted) {
            startGame();
        }
    }

    if (event.key === "r" || event.key === "R") {

        startGame();
    }
});

// =====================================
// PAGE READY
// =====================================

infoLabel.textContent = "Press Start";
timerLabel.textContent = "Time: 0.00";
