const tilePool = ['🍉', '🍒', '🍋', '🍊', '🍇', '🍏', '🍓', '🍍', '🎋', '🏮', '🌸', '🀄', '⭐', '💎', '🍀', '🎈'];

let currentLevel = 1;
let globalScore = 0;
let activeTiles = [];
let slotTiles = [];
let isProcessingMatch = false;
let shuffleLeft = 3;
let levelStartTime;

const board = document.getElementById('game-board');
const slotContainer = document.getElementById('slot-container');
const levelTxt = document.getElementById('level-txt');
const scoreTxt = document.getElementById('score-txt');
const remTxt = document.getElementById('rem-txt');
const shuffleCountTxt = document.getElementById('shuffle-count');

const TILE_W = 44;
const TILE_H = 58;

// Jalankan game saat file script dimuat
initGame(currentLevel);

function initGame(level) {
    board.innerHTML = '';
    slotContainer.innerHTML = '';
    slotTiles = [];
    isProcessingMatch = false;
    levelTxt.innerText = level;
    scoreTxt.innerText = globalScore;
    
    shuffleLeft = 3; 
    shuffleCountTxt.innerText = shuffleLeft;
    levelStartTime = Date.now(); 

    activeTiles = [];
    let idCounter = 0;
    let layouts = [];

    let maxCols = Math.min(4 + Math.floor(level / 2), 7);
    let maxRows = Math.min(4 + Math.floor(level / 2), 7);
    let maxLayers = Math.min(2 + Math.floor(level / 2), 5); 

    let activeSymbolsCount = Math.min(6 + level, tilePool.length);
    let availableSymbols = tilePool.slice(0, activeSymbolsCount);

    for (let layer = 0; layer < maxLayers; layer++) {
        let rowOffset = layer * 0.5;
        let colOffset = layer * 0.5;
        
        let currentRows = maxRows - layer;
        let currentCols = maxCols - layer;

        if (currentRows <= 0 || currentCols <= 0) break;

        for (let r = 0; r < currentRows; r++) {
            for (let c = 0; c < currentCols; c++) {
                if (level > 2 && layer === 0) {
                    if ((r === 0 || r === currentRows - 1) && (c === 0 || c === currentCols - 1)) continue;
                }
                layouts.push({ r: r + rowOffset, c: c + colOffset, layer: layer });
            }
        }
    }

    if (layouts.length % 2 !== 0) layouts.pop(); 

    const MAX_TILES_LIMIT = 76;
    if (layouts.length > MAX_TILES_LIMIT) {
        layouts = layouts.slice(0, MAX_TILES_LIMIT);
        if (layouts.length % 2 !== 0) layouts.pop();
    }

    let symbols = [];
    let pairsCount = layouts.length / 2;
    for (let i = 0; i < pairsCount; i++) {
        let sym = availableSymbols[i % availableSymbols.length];
        symbols.push(sym, sym);
    }
    shuffle(symbols);

    let totalGridW = maxCols * (TILE_W - 4);
    let totalGridH = maxRows * (TILE_H - 6);
    let startX = (400 - totalGridW) / 2; 
    let startY = (520 - totalGridH) / 2; 

    for (let i = 0; i < layouts.length; i++) {
        let layout = layouts[i];
        let posX = Math.floor(layout.c * (TILE_W - 4)) + startX;
        let posY = Math.floor(layout.r * (TILE_H - 6)) + startY;

        activeTiles.push({
            id: idCounter++,
            symbol: symbols[i],
            x: posX,
            y: posY,
            layer: layout.layer,
            element: null
        });
    }

    renderBoard();
}

function renderBoard() {
    board.innerHTML = '';
    checkMahjongLocks(); 

    activeTiles.sort((a,b) => a.layer - b.layer);

    activeTiles.forEach(tile => {
        const el = document.createElement('div');
        el.classList.add('tile');
        el.innerHTML = tile.symbol;
        el.style.left = tile.x + 'px';
        el.style.top = tile.y + 'px';
        el.style.zIndex = tile.layer * 10 + 2;

        if (tile.isLocked) {
            el.classList.add('locked');
        } else {
            el.addEventListener('click', () => onTileClick(tile));
        }

        tile.element = el;
        board.appendChild(el);
    });

    remTxt.innerText = activeTiles.length;
}

function checkMahjongLocks() {
    for (let i = 0; i < activeTiles.length; i++) {
        let t1 = activeTiles[i];
        let hasTileAbove = false;
        let hasTileLeft = false;
        let hasTileRight = false;

        for (let j = 0; j < activeTiles.length; j++) {
            if (i === j) continue;
            let t2 = activeTiles[j];

            if (t2.layer > t1.layer) {
                if (t1.x < t2.x + TILE_W - 4 && t1.x + TILE_W - 4 > t2.x &&
                    t1.y < t2.y + TILE_H - 4 && t1.y + TILE_H - 4 > t2.y) {
                    hasTileAbove = true;
                }
            }

            if (t2.layer === t1.layer) {
                let isRowAligned = (t1.y < t2.y + TILE_H - 6 && t1.y + TILE_H - 6 > t2.y);
                if (isRowAligned) {
                    if (t2.x < t1.x && t2.x + TILE_W >= t1.x - 2) hasTileLeft = true;
                    if (t2.x > t1.x && t1.x + TILE_W >= t2.x - 2) hasTileRight = true;
                }
            }
        }

        if (hasTileAbove || (hasTileLeft && hasTileRight)) {
            t1.isLocked = true;
        } else {
            t1.isLocked = false;
        }
    }
}

function triggerShuffleHint() {
    if (shuffleLeft <= 0 || activeTiles.length === 0 || isProcessingMatch) return;

    shuffleLeft--;
    shuffleCountTxt.innerText = shuffleLeft;

    let currentSymbols = activeTiles.map(t => t.symbol);
    shuffle(currentSymbols);

    for (let i = 0; i < activeTiles.length; i++) {
        activeTiles[i].symbol = currentSymbols[i];
    }

    renderBoard();
}

function onTileClick(tile) {
    if (tile.isLocked || isProcessingMatch) return;

    activeTiles = activeTiles.filter(t => t.id !== tile.id);
    
    tile.element.style.transform = 'scale(0.2)';
    tile.element.style.opacity = '0';
    
    setTimeout(() => { tile.element.remove(); }, 120);

    pushToSlot(tile.symbol);
    renderBoard(); 
}

function pushToSlot(symbol) {
    const uniqueId = Date.now() + Math.random();
    slotTiles.push({ symbol: symbol, id: uniqueId });

    renderSlot();

    let matchSymbol = null;
    let counts = {};
    
    for(let i=0; i<slotTiles.length; i++) {
        let sym = slotTiles[i].symbol;
        if(counts[sym] !== undefined) {
            matchSymbol = sym;
            break;
        }
        counts[sym] = true;
    }

    if (matchSymbol) {
        isProcessingMatch = true; 
        
        setTimeout(() => {
            const slotElements = slotContainer.querySelectorAll('.slot-tile');
            slotElements.forEach(el => {
                if (el.getAttribute('data-symbol') === matchSymbol) {
                    el.classList.add('destroying');
                    createBurstParticles(el);
                }
            });

            setTimeout(() => {
                slotTiles = slotTiles.filter(item => item.symbol !== matchSymbol);
                renderSlot();
                isProcessingMatch = false;

                globalScore += 10;
                scoreTxt.innerText = globalScore;

                if (activeTiles.length === 0 && slotTiles.length === 0) {
                    showWinOverlay();
                }
            }, 300);

        }, 100); 
    } else {
        if (slotTiles.length >= 4) {
            setTimeout(() => {
                document.getElementById('lose-overlay').style.display = 'flex';
            }, 250);
        }
    }
}

function showWinOverlay() {
    let durationSeconds = Math.floor((Date.now() - levelStartTime) / 1000);
    let starCount = 1;

    if (durationSeconds < 25 + (currentLevel * 5)) {
        starCount = 3; 
    } else if (durationSeconds < 50 + (currentLevel * 10)) {
        starCount = 2; 
    }

    let starHTML = '';
    for (let i = 1; i <= 3; i++) {
        if (i <= starCount) {
            starHTML += '<span class="fill">★</span>';
        } else {
            starHTML += '<span>★</span>';
        }
    }

    document.getElementById('win-stars').innerHTML = starHTML;
    document.getElementById('win-score-txt').innerText = globalScore;
    document.getElementById('win-overlay').style.display = 'flex';
}

function renderSlot() {
    slotContainer.innerHTML = '';
    slotTiles.forEach(item => {
        const sEl = document.createElement('div');
        sEl.classList.add('slot-tile');
        sEl.innerHTML = item.symbol;
        sEl.setAttribute('data-symbol', item.symbol);
        slotContainer.appendChild(sEl);
    });
}

function createBurstParticles(element) {
    const rect = element.getBoundingClientRect();
    const slotRect = slotContainer.getBoundingClientRect();
    
    const originX = rect.left - slotRect.left + (rect.width / 2);
    const originY = rect.top - slotRect.top + (rect.height / 2);

    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.classList.add('burst-particle');
        particle.style.left = originX + 'px';
        particle.style.top = originY + 'px';

        const angle = Math.random() * Math.PI * 2;
        const distance = 35 + Math.random() * 35;
        const pX = Math.cos(angle) * distance;
        const pY = Math.sin(angle) * distance;

        particle.style.setProperty('--x', `${pX}px`);
        particle.style.setProperty('--y', `${pY}px`);

        const colors = ['#ffd700', '#ffffff', '#4ade80', '#fb923c'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];

        slotContainer.appendChild(particle);
        setTimeout(() => { particle.remove(); }, 300);
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function restartGame() {
    document.getElementById('lose-overlay').style.display = 'none';
    initGame(currentLevel);
}

function nextLevel() {
    document.getElementById('win-overlay').style.display = 'none';
    currentLevel++;
    initGame(currentLevel);
}
