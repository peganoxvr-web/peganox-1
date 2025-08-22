// إدارة التنقل بين الصفحات
class GameManager {
    constructor() {
        this.currentGame = 'home';
        this.init();
    }

    init() {
        // إعداد أزرار التنقل
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gameCard = e.target.closest('.game-card');
                const gameName = gameCard.dataset.game;
                this.showGame(gameName);
            });
        });

        document.getElementById('homeBtn').addEventListener('click', () => {
            this.showGame('home');
        });

        // تهيئة الألعاب
        this.initGames();
    }

    showGame(gameName) {
        // إخفاء جميع الأقسام
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // إظهار القسم المطلوب
        document.getElementById(gameName).classList.add('active');

        // إظهار/إخفاء زر الرئيسية
        const homeBtn = document.getElementById('homeBtn');
        if (gameName === 'home') {
            homeBtn.classList.add('hidden');
        } else {
            homeBtn.classList.remove('hidden');
        }

        this.currentGame = gameName;

        // تهيئة اللعبة عند فتحها
        if (gameName !== 'home') {
            this.resetGame(gameName);
        }
    }

    initGames() {
        new SpaceInvaders();
        new SlidingPuzzle();
        new TicTacToe();
        new SnakeGame();
        new MemoryGame();
    }

    resetGame(gameName) {
        switch (gameName) {
            case 'puzzle':
                window.slidingPuzzle.shuffle();
                break;
            case 'tictactoe':
                window.ticTacToe.reset();
                break;
            case 'memory':
                window.memoryGame.reset();
                break;
        }
    }
}

// لعبة الفضاء
class SpaceInvaders {
    constructor() {
        this.canvas = document.getElementById('spaceCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;
        this.animationId = null;
        
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 60,
            width: 50,
            height: 30,
            speed: 5
        };
        
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        
        this.keys = {};
        
        this.init();
    }

    init() {
        document.getElementById('spaceStart').addEventListener('click', () => this.start());
        document.getElementById('spacePause').addEventListener('click', () => this.pause());
        
        document.addEventListener('keydown', (e) => this.keys[e.key] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
        
        this.createEnemies();
        this.draw();
    }

    start() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gameLoop();
        }
    }

    pause() {
        this.gameRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    createEnemies() {
        this.enemies = [];
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 10; col++) {
                this.enemies.push({
                    x: col * 60 + 50,
                    y: row * 50 + 50,
                    width: 40,
                    height: 30,
                    alive: true
                });
            }
        }
    }

    update() {
        if (!this.gameRunning) return;

        // حركة اللاعب
        if ((this.keys['ArrowLeft'] || this.keys['a']) && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if ((this.keys['ArrowRight'] || this.keys['d']) && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        
        // إطلاق النار
        if (this.keys[' '] || this.keys['ArrowUp'] || this.keys['w']) {
            this.shoot();
            this.keys[' '] = false; // منع الإطلاق المستمر
        }

        // تحديث الرصاصات
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= 7;
            return bullet.y > 0;
        });

        // تحديث رصاصات الأعداء
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += 3;
            return bullet.y < this.canvas.height;
        });

        // التحقق من التصادمات
        this.checkCollisions();

        // حركة الأعداء وإطلاق النار العشوائي
        this.updateEnemies();
    }

    shoot() {
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10
        });
    }

    updateEnemies() {
        // إطلاق نار عشوائي من الأعداء
        if (Math.random() < 0.01) {
            const aliveEnemies = this.enemies.filter(enemy => enemy.alive);
            if (aliveEnemies.length > 0) {
                const enemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                this.enemyBullets.push({
                    x: enemy.x + enemy.width / 2 - 2,
                    y: enemy.y + enemy.height,
                    width: 4,
                    height: 10
                });
            }
        }
    }

    checkCollisions() {
        // تصادم رصاصات اللاعب مع الأعداء
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (enemy.alive && 
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {
                    
                    this.enemies[enemyIndex].alive = false;
                    this.bullets.splice(bulletIndex, 1);
                    this.score += 10;
                    document.getElementById('spaceScore').textContent = this.score;
                }
            });
        });

        // تصادم رصاصات الأعداء مع اللاعب
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            if (bullet.x < this.player.x + this.player.width &&
                bullet.x + bullet.width > this.player.x &&
                bullet.y < this.player.y + this.player.height &&
                bullet.y + bullet.height > this.player.y) {
                
                this.enemyBullets.splice(bulletIndex, 1);
                this.lives--;
                document.getElementById('spaceLives').textContent = this.lives;
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });

        // فحص الفوز
        if (this.enemies.every(enemy => !enemy.alive)) {
            this.victory();
        }
    }

    gameOver() {
        this.gameRunning = false;
        alert(`انتهت اللعبة! النقاط النهائية: ${this.score}`);
        this.reset();
    }

    victory() {
        this.gameRunning = false;
        alert(`تهانينا! لقد فزت بنقاط: ${this.score}`);
        this.reset();
    }

    reset() {
        this.score = 0;
        this.lives = 3;
        this.bullets = [];
        this.enemyBullets = [];
        this.player.x = this.canvas.width / 2 - 25;
        this.createEnemies();
        document.getElementById('spaceScore').textContent = this.score;
        document.getElementById('spaceLives').textContent = this.lives;
    }

    draw() {
        // مسح الشاشة
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // رسم النجوم
        this.ctx.fillStyle = '#fff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 23) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }

        // رسم اللاعب
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // رسم الأعداء
        this.ctx.fillStyle = '#ff0000';
        this.enemies.forEach(enemy => {
            if (enemy.alive) {
                this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
        });

        // رسم الرصاصات
        this.ctx.fillStyle = '#ffff00';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        this.ctx.fillStyle = '#ff00ff';
        this.enemyBullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }

    gameLoop() {
        this.update();
        this.draw();
        
        if (this.gameRunning) {
            this.animationId = requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// لعبة الأحجية المنزلقة
class SlidingPuzzle {
    constructor() {
        this.size = 4;
        this.tiles = [];
        this.emptyPos = { row: 3, col: 3 };
        this.moves = 0;
        
        this.init();
        window.slidingPuzzle = this;
    }

    init() {
        this.createBoard();
        document.getElementById('puzzleShuffle').addEventListener('click', () => this.shuffle());
    }

    createBoard() {
        const board = document.getElementById('puzzleBoard');
        board.innerHTML = '';
        
        // إنشاء المصفوفة
        this.tiles = [];
        for (let i = 0; i < this.size; i++) {
            this.tiles[i] = [];
            for (let j = 0; j < this.size; j++) {
                const value = i * this.size + j + 1;
                this.tiles[i][j] = value <= 15 ? value : 0;
            }
        }
        
        this.renderBoard();
    }

    renderBoard() {
        const board = document.getElementById('puzzleBoard');
        board.innerHTML = '';
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const tile = document.createElement('button');
                tile.className = 'puzzle-tile';
                tile.dataset.row = i;
                tile.dataset.col = j;
                
                if (this.tiles[i][j] === 0) {
                    tile.classList.add('empty');
                    tile.textContent = '';
                } else {
                    tile.textContent = this.tiles[i][j];
                    tile.addEventListener('click', () => this.moveTile(i, j));
                }
                
                board.appendChild(tile);
            }
        }
    }

    moveTile(row, col) {
        // فحص إمكانية الحركة
        if (this.canMove(row, col)) {
            // تبديل المربع مع المربع الفارغ
            this.tiles[this.emptyPos.row][this.emptyPos.col] = this.tiles[row][col];
            this.tiles[row][col] = 0;
            this.emptyPos = { row, col };
            
            this.moves++;
            document.getElementById('puzzleMoves').textContent = this.moves;
            
            this.renderBoard();
            
            if (this.checkWin()) {
                setTimeout(() => {
                    alert(`تهانينا! حللت الأحجية في ${this.moves} حركة!`);
                }, 100);
            }
        }
    }

    canMove(row, col) {
        const rowDiff = Math.abs(row - this.emptyPos.row);
        const colDiff = Math.abs(col - this.emptyPos.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    checkWin() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const expectedValue = i * this.size + j + 1;
                if (i === 3 && j === 3) {
                    if (this.tiles[i][j] !== 0) return false;
                } else {
                    if (this.tiles[i][j] !== expectedValue) return false;
                }
            }
        }
        return true;
    }

    shuffle() {
        // خلط عشوائي للأحجية
        for (let i = 0; i < 1000; i++) {
            const possibleMoves = [];
            
            // البحث عن الحركات الممكنة
            for (let row = 0; row < this.size; row++) {
                for (let col = 0; col < this.size; col++) {
                    if (this.canMove(row, col)) {
                        possibleMoves.push({ row, col });
                    }
                }
            }
            
            if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                this.tiles[this.emptyPos.row][this.emptyPos.col] = this.tiles[randomMove.row][randomMove.col];
                this.tiles[randomMove.row][randomMove.col] = 0;
                this.emptyPos = randomMove;
            }
        }
        
        this.moves = 0;
        document.getElementById('puzzleMoves').textContent = this.moves;
        this.renderBoard();
    }
}

// لعبة XO
class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.init();
        window.ticTacToe = this;
    }

    init() {
        this.createBoard();
        document.getElementById('tictactoeReset').addEventListener('click', () => this.reset());
    }

    createBoard() {
        const board = document.getElementById('tictactoeBoard');
        board.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('button');
            cell.className = 'tictactoe-cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.makeMove(i));
            board.appendChild(cell);
        }
        
        this.updateDisplay();
    }

    makeMove(index) {
        if (this.board[index] === '' && this.gameActive) {
            this.board[index] = this.currentPlayer;
            this.updateDisplay();
            
            if (this.checkWinner()) {
                this.endGame(`الفائز: ${this.currentPlayer}!`);
            } else if (this.board.every(cell => cell !== '')) {
                this.endGame('تعادل!');
            } else {
                this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
                document.getElementById('currentPlayer').textContent = this.currentPlayer;
            }
        }
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // صفوف
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // أعمدة
            [0, 4, 8], [2, 4, 6] // أقطار
        ];

        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c];
        });
    }

    endGame(message) {
        this.gameActive = false;
        const resultDiv = document.getElementById('gameResult');
        resultDiv.textContent = message;
        resultDiv.className = 'game-result ' + (message.includes('تعادل') ? 'draw' : 'win');
        
        // تعطيل جميع الخلايا
        document.querySelectorAll('.tictactoe-cell').forEach(cell => {
            cell.disabled = true;
        });
    }

    updateDisplay() {
        const cells = document.querySelectorAll('.tictactoe-cell');
        cells.forEach((cell, index) => {
            cell.textContent = this.board[index];
        });
    }

    reset() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        document.getElementById('currentPlayer').textContent = this.currentPlayer;
        document.getElementById('gameResult').textContent = '';
        document.getElementById('gameResult').className = 'game-result';
        
        const cells = document.querySelectorAll('.tictactoe-cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.disabled = false;
        });
    }
}

// لعبة الثعبان
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{ x: 200, y: 200 }];
        this.direction = { x: 0, y: 0 };
        this.food = this.generateFood();
        this.score = 0;
        this.gameRunning = false;
        this.gameLoop = null;
        
        this.init();
    }

    init() {
        document.getElementById('snakeStart').addEventListener('click', () => this.start());
        document.getElementById('snakePause').addEventListener('click', () => this.pause());
        
        document.addEventListener('keydown', (e) => this.changeDirection(e));
        
        this.draw();
    }

    start() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gameLoop = setInterval(() => this.update(), 150);
        }
    }

    pause() {
        this.gameRunning = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
    }

    changeDirection(e) {
        if (!this.gameRunning) return;
        
        const key = e.key;
        const goingUp = this.direction.y === -this.gridSize;
        const goingDown = this.direction.y === this.gridSize;
        const goingRight = this.direction.x === this.gridSize;
        const goingLeft = this.direction.x === -this.gridSize;

        if ((key === 'ArrowLeft' || key === 'a') && !goingRight) {
            this.direction = { x: -this.gridSize, y: 0 };
        } else if ((key === 'ArrowUp' || key === 'w') && !goingDown) {
            this.direction = { x: 0, y: -this.gridSize };
        } else if ((key === 'ArrowRight' || key === 'd') && !goingLeft) {
            this.direction = { x: this.gridSize, y: 0 };
        } else if ((key === 'ArrowDown' || key === 's') && !goingUp) {
            this.direction = { x: 0, y: this.gridSize };
        }
    }

    update() {
        if (!this.gameRunning) return;

        const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };

        // فحص التصادم مع الجدران
        if (head.x < 0 || head.x >= this.canvas.width || head.y < 0 || head.y >= this.canvas.height) {
            this.gameOver();
            return;
        }

        // فحص التصادم مع الجسم
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // فحص أكل الطعام
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('snakeScore').textContent = this.score;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)) * this.gridSize,
                y: Math.floor(Math.random() * (this.canvas.height / this.gridSize)) * this.gridSize
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }

    draw() {
        // مسح الشاشة
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // رسم الثعبان
        this.ctx.fillStyle = '#0f0';
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                this.ctx.fillStyle = '#0a0'; // لون مختلف للرأس
            } else {
                this.ctx.fillStyle = '#0f0';
            }
            this.ctx.fillRect(segment.x, segment.y, this.gridSize - 2, this.gridSize - 2);
        });

        // رسم الطعام
        this.ctx.fillStyle = '#f00';
        this.ctx.fillRect(this.food.x, this.food.y, this.gridSize - 2, this.gridSize - 2);
    }

    gameOver() {
        this.pause();
        alert(`انتهت اللعبة! النقاط النهائية: ${this.score}`);
        this.reset();
    }

    reset() {
        this.snake = [{ x: 200, y: 200 }];
        this.direction = { x: 0, y: 0 };
        this.food = this.generateFood();
        this.score = 0;
        document.getElementById('snakeScore').textContent = this.score;
        this.draw();
    }
}

// لعبة الذاكرة
class MemoryGame {
    constructor() {
        this.cards = ['🎮', '🚀', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪'];
        this.gameCards = [...this.cards, ...this.cards];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.canFlip = true;
        
        this.init();
        window.memoryGame = this;
    }

    init() {
        this.createBoard();
        document.getElementById('memoryReset').addEventListener('click', () => this.reset());
    }

    createBoard() {
        this.shuffle(this.gameCards);
        const board = document.getElementById('memoryBoard');
        board.innerHTML = '';
        
        this.gameCards.forEach((card, index) => {
            const cardElement = document.createElement('button');
            cardElement.className = 'memory-card';
            cardElement.dataset.index = index;
            cardElement.dataset.card = card;
            cardElement.textContent = '?';
            cardElement.addEventListener('click', () => this.flipCard(cardElement, index));
            board.appendChild(cardElement);
        });
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    flipCard(cardElement, index) {
        if (!this.canFlip || cardElement.classList.contains('flipped') || cardElement.classList.contains('matched')) {
            return;
        }

        cardElement.classList.add('flipped');
        cardElement.textContent = cardElement.dataset.card;
        this.flippedCards.push({ element: cardElement, index });

        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            this.moves++;
            
            setTimeout(() => this.checkMatch(), 1000);
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.element.dataset.card === card2.element.dataset.card) {
            // تطابق!
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');
            this.matchedPairs++;
            
            document.getElementById('memoryPairs').textContent = `${this.matchedPairs}/8`;
            
            if (this.matchedPairs === 8) {
                setTimeout(() => {
                    alert(`تهانينا! أكملت اللعبة في ${this.moves} محاولة!`);
                }, 500);
            }
        } else {
            // لا يوجد تطابق
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
            card1.element.textContent = '?';
            card2.element.textContent = '?';
        }
        
        this.flippedCards = [];
        this.canFlip = true;
        document.getElementById('memoryScore').textContent = this.moves;
    }

    reset() {
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.canFlip = true;
        
        document.getElementById('memoryScore').textContent = this.moves;
        document.getElementById('memoryPairs').textContent = `${this.matchedPairs}/8`;
        
        this.createBoard();
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new GameManager();
});
