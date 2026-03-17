const COLORS = ['#FF5E5E', '#1DD1A1', '#54A0FF', '#FECA57', '#A29BFE', '#FF9F43'];
let playerName = localStorage.getItem('lysgo_name') || "Player";
let currentLevel = parseInt(localStorage.getItem('lysgo_level')) || 1;
let gameOverCount = parseInt(localStorage.getItem('lysgo_fails')) || 0;
let boardSize = 5, gameActive = false, timeLeft, timerInterval, board = [];

// Inisialisasi input nama
document.getElementById('user-name').value = (playerName !== "Player") ? playerName : "";

function saveData() {
    localStorage.setItem('lysgo_name', playerName);
    localStorage.setItem('lysgo_level', currentLevel);
    localStorage.setItem('lysgo_fails', gameOverCount);
}

function startGame() {
    const input = document.getElementById('user-name').value;
    if (input.trim() !== "") playerName = input;
    document.getElementById('display-player-name').innerText = playerName;
    document.getElementById('start-screen').style.display = 'none';
    saveData();
    initGame();
}

function toggleGuide() {
    const guide = document.getElementById('guide-overlay');
    guide.style.display = (guide.style.display === 'flex') ? 'none' : 'flex';
}

function determineBoardSize(level) {
    if (level >= 10) return 20;
    if (level >= 5) return 14;
    if (level >= 3) return 10;
    return 5;
}

function updateLivesUI() {
    let hearts = "";
    for(let i=0; i<3; i++) hearts += (i < (3 - gameOverCount)) ? "❤️" : "🖤";
    document.getElementById('lives-display').innerText = hearts;
}

function initGame() {
    boardSize = determineBoardSize(currentLevel);
    document.getElementById('level-display').innerText = currentLevel;
    document.getElementById('size-label').innerText = boardSize + "x" + boardSize;
    document.getElementById('message').innerText = "";
    gameActive = true;
    renderBoard();
    startTimer();
    updateLivesUI();
}

function renderBoard() {
    const b = document.getElementById('game-board'); b.innerHTML = '';
    b.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    board = [];
    for(let r=0; r<boardSize; r++) {
        board[r] = [];
        for(let c=0; c<boardSize; c++) {
            const col = COLORS[Math.floor(Math.random()*COLORS.length)];
            board[r][c] = col;
            const div = document.createElement('div'); div.className='cell';
            div.id=`c-${r}-${c}`; div.style.backgroundColor=col; b.appendChild(div);
        }
    }
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = (boardSize === 5) ? 30 : (boardSize === 10 ? 55 : (boardSize === 14 ? 110 : 220));
    document.getElementById('timer-display').innerText = timeLeft;
    timerInterval = setInterval(() => {
        if (!gameActive) return;
        timeLeft--;
        document.getElementById('timer-display').innerText = timeLeft;
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function handleColorClick(col) {
    if(!gameActive || col === board[0][0]) return;
    floodFill(0, 0, board[0][0], col);
    if(board.every(row => row.every(c => c === col))) win();
}

function floodFill(r, c, oldC, newC) {
    if(r<0||r>=boardSize||c<0||c>=boardSize||board[r][c]!==oldC) return;
    board[r][c]=newC; 
    const cell = document.getElementById(`c-${r}-${c}`);
    if(cell) cell.style.backgroundColor=newC;
    floodFill(r+1,c,oldC,newC); floodFill(r-1,c,oldC,newC);
    floodFill(r,c+1,oldC,newC); floodFill(r,c-1,oldC,newC);
}

function win() {
    gameActive = false; clearInterval(timerInterval);
    if (currentLevel >= 500) {
        showAward("SANG LEGENDA", `Selamat ${playerName}! Misi 500 Level selesai!`);
        return;
    }
    const nextLevel = currentLevel + 1;
    const nextSize = determineBoardSize(nextLevel);
    if (nextSize > boardSize) {
        showAward("PAPAN BERUBAH!", `Level ${nextLevel}: Papan membesar jadi ${nextSize}x${nextSize}!`);
    } else {
        currentLevel++;
        saveData();
        setTimeout(initGame, 1200);
    }
}

function endGame() {
    gameActive = false; clearInterval(timerInterval);
    gameOverCount++; 
    updateLivesUI();
    if (gameOverCount >= 3) {
        currentLevel = 1; gameOverCount = 0;
        saveData();
        showAward("GAME OVER TOTAL", `Nyawa habis! Mengulang dari Level 1.`);
    } else {
        if (currentLevel > 1) currentLevel--;
        saveData();
        showAward("WAKTU HABIS", `Sisa nyawa: ${3-gameOverCount}. Level turun!`);
    }
}

function showAward(title, desc) {
    document.getElementById('award-title').innerText = title;
    document.getElementById('award-desc').innerText = desc;
    document.getElementById('award-overlay').style.display = 'flex';
}

function handleAwardClick() {
    document.getElementById('award-overlay').style.display = 'none';
    if(document.getElementById('award-title').innerText === "PAPAN BERUBAH!") currentLevel++;
    if(document.getElementById('award-title').innerText === "SANG LEGENDA") {
        currentLevel = 1; gameOverCount = 0;
    }
    saveData();
    initGame();
}

// Generate tombol warna
const cp = document.getElementById('color-picker');
COLORS.forEach(c => {
    const btn = document.createElement('div'); btn.className='btn-color';
    btn.style.backgroundColor=c; btn.onclick = () => handleColorClick(c); cp.appendChild(btn);
});
