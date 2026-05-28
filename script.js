const rows = 6;
const cols = 7;
const playerRed = "R";
const playerYellow = "Y";

let gameover = false;
let currentPlayer = "R"; 
let redScore = 0;
let yellowScore = 0;
let activeCol = 3;
let gameInitialized = false;

let board = [];
let intervalId = null; 
let countdownTime = 30;

// DOM Elements
const box = document.querySelector("#box");
const tracker = document.querySelector("#track");
const restartButton = document.querySelector("#re");
const player1 = document.querySelector("#p1");
const player2 = document.querySelector("#p2");
const timerElement = document.querySelector('.sec'); 
const timerbg = document.querySelector(".timer-background");
const playerturn = document.querySelector(".player-turn");
const rulesSection = document.querySelector('section[type="rules"]');
const mainContent = document.querySelector('#main');
const confirmButton = document.querySelector('#confirmButton');
const rulesMenuBtn = document.querySelector('#menu');

// Event Listeners
restartButton.addEventListener('click', restartGame);
document.addEventListener('keyup', recordKey);

// Mousemove tracking on board
box.addEventListener('mousemove', function(event) {
    if (gameover) return;
    
    const boxRect = box.getBoundingClientRect();
    const tileWidth = boxRect.width / cols;
    let col = Math.floor((event.clientX - boxRect.left) / tileWidth);
    
    if (col >= 0 && col < cols) {
        updateTrackerPosition(col);
    }
});

box.addEventListener('mouseleave', function() {
    tracker.classList.add('hidden-tracker');
});

// Initial startup rules handling
window.onload = function() {
    mainContent.classList.add('blur-background');
    rulesSection.classList.remove('hidden-section');
    rulesSection.classList.add('fade-scale-in');
};

// Rules Modal Close
confirmButton.addEventListener('click', () => {
    rulesSection.classList.add('fade-scale-out');
    rulesSection.addEventListener('animationend', function handler() {
        rulesSection.classList.add('hidden-section');
        rulesSection.classList.remove('fade-scale-out');
        mainContent.classList.remove('blur-background');
        rulesSection.removeEventListener('animationend', handler);
        
        if (!gameInitialized) {
            setgame();
        } else if (!gameover) {
            resetTimer();
        }
    });
});

// Nav Rules Button Click
rulesMenuBtn.addEventListener('click', () => {
    clearInterval(intervalId); // Pause the game timer
    mainContent.classList.add('blur-background');
    rulesSection.classList.remove('hidden-section');
    rulesSection.classList.add('fade-scale-in');
});

function restartGame() {
    redScore = 0;
    yellowScore = 0;
    document.querySelector('.p1-points').textContent = "0";
    document.querySelector('.p2-points').textContent = "0";
    setgame();
}

function setgame() {
    board = Array(6).fill(null).map(() => Array(7).fill(null));
    gameover = false;
    currentPlayer = "R";
    activeCol = 3;
    
    // Remove existing tile elements to avoid duplicates
    document.querySelectorAll('.tile').forEach(tile => tile.remove());
    
    // Create and append cells
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.setAttribute('data-row', row);
            tile.setAttribute('data-col', col);
            tile.addEventListener('click', setcoin);
            box.appendChild(tile);
        }
    }
    
    // Reset timer-background card
    timerbg.classList.remove('win-card');
    timerbg.style.backgroundColor = "#FD6687";
    playerturn.innerHTML = "PLAYER 1'S TURN";
    timerElement.style.display = "block";
    
    const playAgainBtn = document.getElementById('play-again');
    if (playAgainBtn) playAgainBtn.remove();
    
    tracker.classList.add('hidden-tracker');
    
    resetTimer();
    gameInitialized = true;
}

function findLowestEmptyRow(col) {
    for (let row = 5; row >= 0; row--) {
        if (board[row][col] === null) {
            return row;
        }
    }
    return -1;
}

function setcoin(event) {
    if (gameover) return;

    const clickedElement = event.target.closest('.tile');
    if (!clickedElement) return;
    
    const col = parseInt(clickedElement.getAttribute("data-col"));
    dropCoinAt(col);
}

function dropCoinAt(col) {
    if (gameover) return;
    
    const lowestRow = findLowestEmptyRow(col);
    if (lowestRow === -1) return;

    board[lowestRow][col] = currentPlayer;

    const targetTile = document.querySelector(`.tile[data-row="${lowestRow}"][data-col="${col}"]`);
    const coin = document.createElement("div");
    coin.classList.add('coin', 'box-shadow');

    if (currentPlayer === playerRed) {
        coin.classList.add("red-coin");
    } else {
        coin.classList.add("yellow-coin");
    }

    targetTile.append(coin);

    // Falling animation
    const tileHeight = targetTile.getBoundingClientRect().height + 16;
    coin.style.transform = `translateY(-${tileHeight * (lowestRow + 1)}px)`;
    
    setTimeout(() => {
        coin.style.transform = 'translateY(0px)';
    }, 20);

    const winningCells = checkWin(lowestRow, col);
    if (winningCells) {
        showWinner(currentPlayer, winningCells);
        gameover = true;
    } else if (checkDraw()) {
        showDraw();
        gameover = true;
    } else {
        change();
    }
}

function checkWin(row, col) {
    const player = board[row][col];
    if (!player) return null;

    const directions = [
        [1, 0],   // vertical
        [0, 1],   // horizontal
        [1, 1],   // diagonal forward
        [1, -1]   // diagonal backward
    ];

    for (const [rowDelta, colDelta] of directions) {
        const cells = [[row, col]];

        // check positive direction
        for (let i = 1; i < 4; i++) {
            const r = row + i * rowDelta;
            const c = col + i * colDelta;
            if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== player) break;
            cells.push([r, c]);
        }

        // check negative direction
        for (let i = 1; i < 4; i++) {
            const r = row - i * rowDelta;
            const c = col - i * colDelta;
            if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== player) break;
            cells.push([r, c]);
        }

        if (cells.length >= 4) {
            return cells; 
        }
    }
    return null;
}

function checkDraw() {
    for (let col = 0; col < cols; col++) {
        if (board[0][col] === null) {
            return false;
        }
    } 
    return true; 
}

function showWinner(winningPlayer, winningCells) {
    clearInterval(intervalId); 

    // Highlight the winning 4 coins
    winningCells.forEach(([r, c]) => {
        const tile = document.querySelector(`.tile[data-row="${r}"][data-col="${c}"]`);
        if (tile) {
            const coin = tile.querySelector('.coin');
            if (coin) {
                coin.classList.add('winner');
            }
        }
    });

    // Update scores
    if (winningPlayer === playerRed) {
        redScore++;
        document.querySelector('.p1-points').textContent = redScore;
    } else {
        yellowScore++;
        document.querySelector('.p2-points').textContent = yellowScore;
    }

    // Transition turn card to Win Card
    timerbg.classList.add('win-card');
    timerbg.style.backgroundColor = "white";
    
    playerturn.innerHTML = winningPlayer === playerRed ? "PLAYER 1" : "PLAYER 2";
    timerElement.innerHTML = "WINS";
    timerElement.style.display = "block"; // Ensure it shows "WINS" text

    // Create and append Play Again button
    const playAgainBtn = document.createElement("button");
    playAgainBtn.id = "play-again";
    playAgainBtn.textContent = "PLAY AGAIN";
    playAgainBtn.addEventListener('click', setgame);
    timerbg.appendChild(playAgainBtn);
}

function showDraw() {
    clearInterval(intervalId);

    timerbg.classList.add('win-card');
    timerbg.style.backgroundColor = "white";
    
    playerturn.innerHTML = "GAME OVER";
    timerElement.innerHTML = "DRAW";

    const playAgainBtn = document.createElement("button");
    playAgainBtn.id = "play-again";
    playAgainBtn.textContent = "PLAY AGAIN";
    playAgainBtn.addEventListener('click', setgame);
    timerbg.appendChild(playAgainBtn);
}

function change() {
    if (currentPlayer === playerRed) {
        currentPlayer = playerYellow;
        timerbg.style.backgroundColor = "#FFCE67";
        playerturn.innerHTML = "PLAYER 2'S TURN";
    } else {
        currentPlayer = playerRed;
        timerbg.style.backgroundColor = "#FD6687";
        playerturn.innerHTML = "PLAYER 1'S TURN";
    }
    
    // Update tracker to match active player color
    const arrow = document.querySelector('#track-arrow');
    if (arrow) {
        arrow.setAttribute('fill', currentPlayer === 'R' ? '#FD6687' : '#FFCE67');
    }

    resetTimer(); 
}

function resetTimer() {
    clearInterval(intervalId); 
    countdownTime = 30;
    timerElement.innerHTML = countdownTime + "s";
    intervalId = setInterval(startTimer, 1000); 
}

function startTimer() {
    if (countdownTime > 0) {
        countdownTime--; 
        timerElement.innerHTML = countdownTime + "s"; 
    } else {
        clearInterval(intervalId); 
        change();
    }
}

function updateTrackerPosition(col) {
    if (col < 0 || col >= cols) return;
    activeCol = col;
    
    const boxRect = box.getBoundingClientRect();
    const tileWidth = boxRect.width / cols;
    const trackerLeft = col * tileWidth + (tileWidth - 38) / 2;
    
    tracker.style.left = `${trackerLeft}px`;
    tracker.classList.remove('hidden-tracker');
    
    const arrow = document.querySelector('#track-arrow');
    if (arrow) {
        arrow.setAttribute('fill', currentPlayer === 'R' ? '#FD6687' : '#FFCE67');
    }
}

function recordKey(e) {
    if (gameover) return;
    
    // Ignore keyboard events if rules modal is visible
    if (rulesSection && !rulesSection.classList.contains('hidden-section')) {
        return;
    }
    
    switch(e.key) {
        case "ArrowRight":
            activeCol = Math.min(cols - 1, activeCol + 1);
            updateTrackerPosition(activeCol);
            break;
        case "ArrowLeft":
            activeCol = Math.max(0, activeCol - 1);
            updateTrackerPosition(activeCol);
            break;
        case "Enter":
        case " ": // Spacebar
            e.preventDefault(); // Prevent page scrolling
            dropCoinAt(activeCol);
            break;
        default:
            break;
    }
}
