let col;
let row;
const rows = 6;
const cols = 7;
let clutter = "";
let playerRed = "R";
let playerYellow = "Y";
let gameover = false;
let currentPlayer = "R"; 

let box = document.querySelector("#box");
let tracker = document.querySelector("#track");
let restartButton = document.querySelector("#re");
let player1 = document.querySelector("#p1");
let player2 = document.querySelector("#p2");
let timer;
let countdownTime = 30;
let timerElement = document.querySelector('.sec'); 
let timerbg = document.querySelector(".timer-background");
let playerturn = document.querySelector(".player-turn");
const wintext = document.createElement("h1");

wintext.style.fontWeight = "bold"; 
wintext.style.textAlign = "center"; 
let board = [];
let intervalId = null; 

restartButton.addEventListener('click', restartGame);
function init() {
    if (localStorage.getItem('rulesShown') === 'true') {
        document.getElementById('rules').style.display = 'none';
        document.getElementById('game').style.display = 'block';
    } else {
        showRules();
    }
}

window.onload = init;
function restartGame() {
  location.reload();
}

function setgame() {
    board = Array(6).fill(null).map(() => Array(7).fill(null));

    //if i use normal like without .map then it will gave same etle map vaprva thi every time new array apse and ena andar red ke yellow just like that array fill thata rehse and
    //and darek vakhte coin put thay ena pela jose ke null 6 if it is null only then it will append coin 
    // ['R', null, null, null, null, null, null],
    // [null, null, null, null, null, null, null],
    // [null, null, null, null, null, null, null],
    // [null, null, null, null, null, null, null],
    // [null, null, null, null, null, null, null],
    // [null, null, null, null, null, null, null]
 
    clutter = "";

    for (let row = 0; row <= 5; row++) {
        for (let col = 0; col <= 6; col++) {
            clutter += `<div class="tile" data-row="${row}" data-col="${col}"></div>`;
        }
    }
    box.innerHTML = clutter;

    document.querySelectorAll('.tile').forEach(tile => {
        tile.addEventListener('click', setcoin);
    });

    resetTimer(); 
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

    const clickedElement = event.target;
    const col = parseInt(clickedElement.getAttribute("data-col"));
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

    if (checkWin(lowestRow, col)) {
        showWinner(currentPlayer);
        gameover = true;
    }

    coin.style.transform = `translateY(-${80 * lowestRow}px)`;
    setTimeout(() => {
        coin.style.transform = 'translateY(0px)';
    }, 50);

    change();
}

function checkWin(row, col) {
    const player = board[row][col];
    if (!player) return false;

    return (
        checkDirection(row, col, 1, 0, player) || //check karse vertical mate
        checkDirection(row, col, 0, 1, player) ||//check karse horizontal mate
        checkDirection(row, col, 1, 1, player) ||//diagonal forward mate
        checkDirection(row, col, 1, -1, player)//diagonal backward mate
    );
}

wintext.innerHTML = "Winner!";

function showWinner(winningPlayer) {
    clearInterval(intervalId); 

    if (winningPlayer === playerRed) {
        player1.style.backgroundColor = '#FD6687';  
        timerbg.textContent = "Game End";
        change();
        player1.append(wintext);
    } else if (winningPlayer === playerYellow) {
        player2.style.backgroundColor = '#FFCE67';  
        timerbg.textContent = "Game End";
        change();
        player2.append(wintext);
    }
}

function checkDirection(row, col, rowDelta, colDelta, player) {
    let count = 1;

    for (let i = 1; i < 4; i++) {
        const r = row + i * rowDelta;
        const c = col + i * colDelta;
        if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== player) break;
        count++;
    }

    for (let i = 1; i < 4; i++) {
        const r = row - i * rowDelta;
        const c = col - i * colDelta;
        if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== player) break;
        count++;
    }

    return count >= 4;
}

function checkDraw() {
    for (let col = 0; col < cols; col++) {
        if (board[0][col] === null) {
            return false;
        }
    } 
    return true; 
}

box.addEventListener('mousemove', function(event) {
    const boxRect = box.getBoundingClientRect();
    const tileWidth = boxRect.width / cols;
    let col = Math.floor((event.clientX - boxRect.left) / tileWidth);
    if (col < 0 || col >= cols) return;
    tracker.style.left = `${col * tileWidth + boxRect.left}px`;
});

function change() {
    if (currentPlayer === playerRed) {
        currentPlayer = playerYellow;
        timerbg.style.backgroundColor = "#FFCE67";
        playerturn.innerHTML = `Player's 2 Turn`;
    } else {
        currentPlayer = playerRed;
        timerbg.style.backgroundColor = "#FD6687";
        playerturn.innerHTML = `Player's 1 Turn`;
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

window.onload = function() {
    const mainContent = document.getElementById('main');
    const section = document.querySelector('section');
    
    mainContent.classList.add('fade-scale-in');
    section.classList.add('fade-scale-in');
};

document.getElementById('confirmButton').addEventListener('click', function() {
    const section = document.querySelector('section');
    if (section) {
        section.classList.add('fade-scale-out'); 
        section.addEventListener('animationend', function() {
            section.remove();
        });
    }
});

const rulesSection = document.querySelector('section[type="rules"]');
const mainContent = document.querySelector('#main');
const confirmButton = document.querySelector('#confirmButton');

mainContent.classList.add('blur-background');

confirmButton.addEventListener('click', () => {
    rulesSection.classList.add('hidden-section'); 
    mainContent.classList.remove('blur-background'); 
    setgame();
});

const rulesButton = document.getElementById('confirmButton');

rulesButton.addEventListener('click', () => {
    const rulesSection = document.querySelector('section[type="rules"]');
    if (rulesSection) {
        rulesSection.classList.add('fade-scale-out'); 
        rulesSection.addEventListener('animationend', () => {
            rulesSection.classList.add('hidden-section'); 
            mainContent.classList.remove('blur-background');
            setgame(); 
        });
    }
});

