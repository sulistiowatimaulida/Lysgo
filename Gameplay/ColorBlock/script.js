window.onload = () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const GRID_SIZE = 8;
    const TILE_SIZE = 50; 
    const HAND_Y = 480;

    let board, hand, score, highScore, hammerCount, refreshCount, isHammerActive;
    let isDragging = false, activeIdx = -1, mouseX = 0, mouseY = 0;

    const SHAPES = [
        { color: '#e4bc2c', cells: [{x:0, y:0}, {x:1, y:0}, {x:2, y:0}, {x:0, y:1}] },
        { color: '#4CAF50', cells: [{x:0, y:0}, {x:1, y:0}, {x:1, y:1}, {x:2, y:1}] },
        { color: '#FF5252', cells: [{x:0, y:0}, {x:1, y:0}, {x:0, y:1}, {x:1, y:1}] },
        { color: '#448AFF', cells: [{x:0, y:0}, {x:1, y:0}, {x:2, y:0}] },
        { color: '#9c27b0', cells: [{x:1, y:0}, {x:0, y:1}, {x:1, y:1}, {x:2, y:1}] }
    ];

    function initGame() {
        board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
        hand = [null, null, null];
        score = 0;
        highScore = localStorage.getItem('sulisBest') || 0;
        hammerCount = 1; 
        refreshCount = 1;
        isHammerActive = false;
        document.getElementById('refresh-btn').classList.remove('pulse-warn');
        document.getElementById('game-over-modal').style.display = 'none';
        updateUI();
        refill();
    }

    function updateUI() {
        document.getElementById('score').innerText = score;
        document.getElementById('highScore').innerText = highScore;
        document.getElementById('hammer-count').innerText = hammerCount;
        document.getElementById('refresh-count').innerText = refreshCount;
    }

    function refill() {
        if (hand.every(p => p === null)) {
            hand = hand.map(() => JSON.parse(JSON.stringify(SHAPES[Math.floor(Math.random() * SHAPES.length)])));
        }
        
        if (checkGameOver()) {
            if (refreshCount > 0) {
                document.getElementById('refresh-btn').classList.add('pulse-warn');
            } else {
                triggerGameOver();
            }
        } else {
            document.getElementById('refresh-btn').classList.remove('pulse-warn');
        }
    }

    function checkGameOver() {
        const pieces = hand.filter(p => p !== null);
        if (pieces.length === 0) return false;
        for (let p of pieces) {
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    let canFit = p.cells.every(cell => {
                        const nr = r + cell.y, nc = c + cell.x;
                        return nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && board[nr][nc] === 0;
                    });
                    if (canFit) return false;
                }
            }
        }
        return true;
    }

    function triggerGameOver() {
        document.getElementById('finalScore').innerText = score;
        document.getElementById('game-over-modal').style.display = 'flex';
        if (score > highScore) localStorage.setItem('sulisBest', score);
    }

    function checkLines() {
        let rows = [], cols = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            if (board[i].every(c => c !== 0)) rows.push(i);
            let colFull = true;
            for(let r=0; r<GRID_SIZE; r++) if(board[r][i] === 0) colFull = false;
            if (colFull) cols.push(i);
        }
        if (rows.length + cols.length > 0) {
            rows.forEach(r => board[r].fill(0));
            cols.forEach(c => { for(let r=0; r<GRID_SIZE; r++) board[r][c] = 0; });
            score += (rows.length + cols.length) * 100;
            if (score > 0 && score % 500 === 0) refreshCount++;
            updateUI();
        }
    }

    function drawBlock(x, y, color, size = TILE_SIZE) {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.roundRect(x+2, y+2, size-4, size-4, 8); ctx.fill();
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                ctx.fillStyle = "#1e1414";
                ctx.fillRect(c * TILE_SIZE + 1, r * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
                if (board[r][c]) drawBlock(c * TILE_SIZE, r * TILE_SIZE, board[r][c]);
            }
        }
        hand.forEach((p, i) => {
            if (p && !(isDragging && activeIdx === i)) {
                const sx = 50 + (i * 120);
                p.cells.forEach(c => drawBlock(sx + (c.x * 25), HAND_Y + (c.y * 25), p.color, 25));
            }
        });
        if (isDragging && activeIdx !== -1) {
            hand[activeIdx].cells.forEach(c => drawBlock(mouseX + (c.x * TILE_SIZE) - 25, mouseY + (c.y * TILE_SIZE) - 80, hand[activeIdx].color));
        }
        requestAnimationFrame(render);
    }

    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: (cx - rect.left) * (canvas.width / rect.width), y: (cy - rect.top) * (canvas.height / rect.height) };
    };

    const handleStart = (e) => {
        const pos = getPos(e);
        if (isHammerActive) {
            let c = Math.floor(pos.x/TILE_SIZE), r = Math.floor(pos.y/TILE_SIZE);
            if(r < GRID_SIZE && board[r][c] !== 0) {
                board[r][c] = 0; hammerCount--; isHammerActive = false;
                document.getElementById('hammer-btn').classList.remove('active');
                updateUI(); refill();
            }
            return;
        }
        mouseX = pos.x; mouseY = pos.y;
        hand.forEach((p, i) => {
            if (p && mouseX > 50+(i*120)-20 && mouseX < 50+(i*120)+120 && mouseY > HAND_Y-20 && mouseY < HAND_Y+120) {
                isDragging = true; activeIdx = i;
            }
        });
    };

    const handleEnd = () => {
        if (isDragging) {
            const p = hand[activeIdx];
            const col = Math.round((mouseX - 25) / TILE_SIZE);
            const row = Math.round((mouseY - 80) / TILE_SIZE);
            if (p.cells.every(c => {
                const nr = row + c.y, nc = col + c.x;
                return nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && board[nr][nc] === 0;
            })) {
                p.cells.forEach(c => board[row + c.y][col + c.x] = p.color);
                hand[activeIdx] = null; score += p.cells.length * 10;
                checkLines(); refill(); updateUI();
            }
        }
        isDragging = false; activeIdx = -1;
    };

    // LOGIKA REFRESH
    document.getElementById('refresh-btn').onclick = () => { 
        if(refreshCount > 0) { 
            hand = [null,null,null];
            for (let r = GRID_SIZE - 2; r < GRID_SIZE; r++) {
                board[r].fill(0);
            }
            refreshCount--; 
            document.getElementById('refresh-btn').classList.remove('pulse-warn'); 
            updateUI();
            refill();
            if (navigator.vibrate) navigator.vibrate(100);
        } 
    };

    document.getElementById('close-guide').onclick = () => document.getElementById('guide-modal').style.display = 'none';
    document.getElementById('open-guide').onclick = () => document.getElementById('guide-modal').style.display = 'flex';
    document.getElementById('btn-restart').onclick = initGame;
    document.getElementById('hammer-btn').onclick = () => { if(hammerCount > 0) { isHammerActive = !isHammerActive; document.getElementById('hammer-btn').classList.toggle('active'); }};

    canvas.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', (e) => { if(isDragging) { const p = getPos(e); mouseX = p.x; mouseY = p.y; }});
    window.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleStart(e); }, {passive: false});
    window.addEventListener('touchmove', (e) => { e.preventDefault(); if(isDragging) { const p = getPos(e); mouseX = p.x; mouseY = p.y; }}, {passive: false});
    window.addEventListener('touchend', handleEnd);

    initGame(); render();
};
