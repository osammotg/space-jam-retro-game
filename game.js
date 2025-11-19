/**
 * Retro Spacecraft Game
 * HTML5 Canvas + Vanilla JS
 */

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 800;

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.life = 100;
        this.markedForDeletion = false;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 2;
        if (this.life <= 0) this.markedForDeletion = true;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / 100;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}

class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 15;
        this.speed = 10;
        this.markedForDeletion = false;
    }

    update() {
        this.y -= this.speed;
        if (this.y < 0) this.markedForDeletion = true;
    }

    draw(ctx) {
        ctx.fillStyle = '#0ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Background {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.stars = [];
        this.numStars = 100;
        this.speed = 4;
        
        // Initialize stars
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push({
                x: Math.random() * this.gameWidth,
                y: Math.random() * this.gameHeight,
                size: Math.random() * 2 + 1,
                speedMultiplier: Math.random() * 0.5 + 0.5
            });
        }
    }

    update(speedModifier = 1) {
        this.stars.forEach(star => {
            star.y += this.speed * star.speedMultiplier * speedModifier;
            if (star.y > this.gameHeight) {
                star.y = 0;
                star.x = Math.random() * this.gameWidth;
            }
        });
    }

    draw(ctx) {
        ctx.fillStyle = 'white';
        this.stars.forEach(star => {
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
    }
}

class Obstacle {
    constructor(gameWidth, speedModifier = 1) {
        this.gameWidth = gameWidth;
        this.width = 50;
        this.height = 50;
        this.x = Math.random() * (this.gameWidth - this.width);
        this.y = -this.height;
        this.speed = 5 * speedModifier;
        this.markedForDeletion = false;
        this.color = '#888'; // Grey asteroid color
    }

    update() {
        this.y += this.speed;
        if (this.y > CANVAS_HEIGHT) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        // Simple blocky asteroid
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add some detail
        ctx.fillStyle = '#666';
        ctx.fillRect(this.x + 10, this.y + 10, 10, 10);
        ctx.fillRect(this.x + 30, this.y + 30, 10, 10);
    }
}

class Collectible {
    constructor(gameWidth, speedModifier = 1) {
        this.gameWidth = gameWidth;
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (this.gameWidth - this.width);
        this.y = -this.height;
        this.speed = 3 * speedModifier;
        this.markedForDeletion = false;
        
        // Determine type
        const rand = Math.random();
        if (rand < 0.6) {
            this.type = 'coin';
            this.color = 'gold';
        } else if (rand < 0.75) {
            this.type = 'boost';
            this.color = 'cyan';
        } else if (rand < 0.85) {
            this.type = 'life';
            this.color = 'magenta';
        } else if (rand < 0.95) {
            this.type = 'shield';
            this.color = 'blue';
        } else {
            this.type = 'magnet';
            this.color = 'lime';
        }
    }

    update() {
        this.y += this.speed;
        if (this.y > CANVAS_HEIGHT) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        if (this.type === 'coin') {
            // Circle-ish shape for coin
            ctx.fillRect(this.x + 5, this.y, 20, 30);
            ctx.fillRect(this.x, this.y + 5, 30, 20);
            ctx.fillStyle = '#FFD700'; // Lighter center
            ctx.fillRect(this.x + 10, this.y + 10, 10, 10);
        } else if (this.type === 'boost') {
            // Arrow up shape
            ctx.fillRect(this.x + 10, this.y, 10, 30);
            ctx.fillRect(this.x, this.y + 10, 30, 10);
        } else if (this.type === 'life') {
            // Heart-ish shape
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y + 5, 30, 20);
            ctx.fillRect(this.x + 5, this.y, 10, 10);
            ctx.fillRect(this.x + 15, this.y, 10, 10);
            ctx.fillRect(this.x + 10, this.y + 20, 10, 10);
        } else if (this.type === 'shield') {
            // Shield shape
            ctx.fillRect(this.x + 5, this.y, 20, 20);
            ctx.fillRect(this.x + 10, this.y + 20, 10, 10);
        } else if (this.type === 'magnet') {
            // U shape
            ctx.fillRect(this.x, this.y, 8, 25);
            ctx.fillRect(this.x + 22, this.y, 8, 25);
            ctx.fillRect(this.x, this.y + 20, 30, 8);
        }
    }
}

class Player {
    constructor(game) {
        this.gameWidth = game.canvas.width;
        this.gameHeight = game.canvas.height;
        this.width = 40;
        this.height = 40;
        this.x = this.gameWidth / 2 - this.width / 2;
        this.y = this.gameHeight - this.height - 20;
        this.speed = 0;
        this.maxSpeed = 7;
        this.dashSpeed = 15;
        this.isDashing = false;
        this.dashTimer = 0;
        this.dashDuration = 150; // ms
        this.dashCooldown = 0;
        this.dashCooldownTime = 1000;
        
        this.hasShield = false;
        this.hasMagnet = false;
        this.magnetTimer = 0;
        this.magnetDuration = 5000; // 5s

        this.projectiles = [];
        this.game = game;
        
        window.addEventListener('keydown', (e) => {
            if ((e.key === ' ' || e.key === 'ArrowUp') && !this.game.gameOver) {
                this.shoot();
            }
            if (e.key === 'Shift' && !this.game.gameOver) {
                this.dash();
            }
        });
    }

    update(input, deltaTime) {
        // Movement logic
        let currentSpeed = this.maxSpeed;
        
        // Dash Logic
        if (this.dashCooldown > 0) this.dashCooldown -= deltaTime;
        
        if (this.isDashing) {
            currentSpeed = this.dashSpeed;
            this.dashTimer -= deltaTime;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.dashCooldown = this.dashCooldownTime;
            }
        }
        
        if (this.hasMagnet) {
            this.magnetTimer -= deltaTime;
            if (this.magnetTimer <= 0) {
                this.hasMagnet = false;
            }
        }

        if (input.keys.left) {
            this.speed = -currentSpeed;
        } else if (input.keys.right) {
            this.speed = currentSpeed;
        } else {
            this.speed = 0;
        }

        this.x += this.speed;

        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;
        
        // Projectiles
        this.projectiles.forEach(projectile => projectile.update());
        this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
    }

    dash() {
        if (this.dashCooldown <= 0 && !this.isDashing) {
            this.isDashing = true;
            this.dashTimer = this.dashDuration;
            // Add particles
            this.game.createParticles(this.x + this.width/2, this.y + this.height, 'cyan', 10);
        }
    }

    shoot() {
        this.projectiles.push(new Projectile(this.x + this.width / 2 - 2, this.y));
        this.game.audio.shoot();
    }

    draw(ctx) {
        // Draw Projectiles
        this.projectiles.forEach(projectile => projectile.draw(ctx));

        // Simple pixelated ship design
        ctx.fillStyle = 'white';
        
        // Main body
        ctx.fillRect(this.x + 10, this.y, 20, 30); // Center fuselage
        ctx.fillRect(this.x, this.y + 20, 10, 20); // Left wing
        ctx.fillRect(this.x + 30, this.y + 20, 10, 20); // Right wing
        
        // Engine flame
        if (this.isDashing) {
            ctx.fillStyle = 'cyan';
            ctx.fillRect(this.x + 12, this.y + 30, 16, 15);
        } else {
            ctx.fillStyle = 'orange';
            ctx.fillRect(this.x + 14, this.y + 30, 12, 5);
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x + 16, this.y + 35, 8, 5);
        }

        // Shield effect
        if (this.hasShield) {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 35, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Magnet effect
        if (this.hasMagnet) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 45 + Math.sin(Date.now() / 100) * 5, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

class InputHandler {
    constructor() {
        this.keys = {
            left: false,
            right: false,
            enter: false,
            space: false
        };

        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = true;
            if (e.key === 'Enter') this.keys.enter = true;
            if (e.key === ' ') this.keys.space = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = false;
            if (e.key === 'Enter') this.keys.enter = false;
            if (e.key === ' ') this.keys.space = false;
        });

        // Touch/Mouse Controls for Buttons
        const setupBtn = (id, key) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            
            const press = (e) => { e.preventDefault(); this.keys[key] = true; };
            const release = (e) => { e.preventDefault(); this.keys[key] = false; };

            btn.addEventListener('mousedown', press);
            btn.addEventListener('touchstart', press);
            btn.addEventListener('mouseup', release);
            btn.addEventListener('touchend', release);
            btn.addEventListener('mouseleave', release);
        };

        setupBtn('btn-left', 'left');
        setupBtn('btn-right', 'right');
        
        // Special handling for Shoot/Dash/Enter buttons triggers
        const btnShoot = document.getElementById('btn-shoot');
        if (btnShoot) {
            const trigger = (e) => {
                e.preventDefault();
                // Dispatch space keydown event manually or handle directly
                window.dispatchEvent(new KeyboardEvent('keydown', { 'key': ' ' }));
            };
            btnShoot.addEventListener('mousedown', trigger);
            btnShoot.addEventListener('touchstart', trigger);
        }

        const btnDash = document.getElementById('btn-dash');
        if (btnDash) {
            const trigger = (e) => {
                e.preventDefault();
                 window.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Shift' }));
            };
            btnDash.addEventListener('mousedown', trigger);
            btnDash.addEventListener('touchstart', trigger);
        }
    }
}

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        
        this.input = new InputHandler();
        this.player = new Player(this);
        this.background = new Background(this.canvas.width, this.canvas.height);
        
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.obstacleInterval = 1000; // ms

        this.collectibles = [];
        this.collectibleTimer = 0;
        this.collectibleInterval = 2000; // ms
        
        this.particles = [];

        this.lastTime = 0;
        this.gameOver = false;
        this.score = 0;
        this.lives = 3;
        this.gameTime = 0;
        this.speedModifier = 1;
        this.highScore = localStorage.getItem('spaceCraftHighScore') || 0;
        
        // Visual Juice
        this.shakeTimer = 0;
        this.shakeIntensity = 0;

        this.audio = new AudioController();
    }

    start() {
        this.gameLoop(0);
    }

    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.height + rect1.y > rect2.y
        );
    }

    createParticles(x, y, color, amount) {
        for (let i = 0; i < amount; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    screenShake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    }

    update(deltaTime) {
        if (this.gameOver) return;

        this.gameTime += deltaTime;
        // Increase difficulty every 10 seconds
        this.speedModifier = 1 + Math.floor(this.gameTime / 10000) * 0.1;

        // Update Screenshake
        if (this.shakeTimer > 0) {
            this.shakeTimer -= deltaTime;
            if (this.shakeTimer <= 0) this.shakeIntensity = 0;
        }

        this.background.update(this.speedModifier);
        this.player.update(this.input, deltaTime);

        // Obstacle Spawning
        if (this.obstacleTimer > this.obstacleInterval) {
            this.obstacles.push(new Obstacle(this.canvas.width, this.speedModifier));
            this.obstacleTimer = 0;
        } else {
            this.obstacleTimer += deltaTime;
        }

        // Collectible Spawning
        if (this.collectibleTimer > this.collectibleInterval) {
            this.collectibles.push(new Collectible(this.canvas.width, this.speedModifier));
            this.collectibleTimer = 0;
        } else {
            this.collectibleTimer += deltaTime;
        }

        // Particles
        this.particles.forEach(particle => particle.update());
        this.particles = this.particles.filter(particle => !particle.markedForDeletion);

        // Updates and Collision Checks
        this.obstacles.forEach(obstacle => {
            obstacle.update();
            
            // Check collision with Player
            if (this.checkCollision(this.player, obstacle)) {
                obstacle.markedForDeletion = true;
                if (this.player.hasShield) {
                    this.player.hasShield = false;
                    this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 'cyan', 20);
                    this.screenShake(10, 200);
                    this.audio.explosion(); // Shield break sound
                } else if (!this.player.isDashing) { // Dash makes you invincible-ish
                    this.lives--;
                    this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 'red', 20);
                    this.screenShake(20, 400);
                    this.audio.explosion();
                    if (this.lives <= 0) {
                        this.gameOver = true;
                        this.audio.gameOver();
                        if (this.score > this.highScore) {
                            this.highScore = this.score;
                            localStorage.setItem('spaceCraftHighScore', this.highScore);
                        }
                    }
                }
            }

            // Check collision with Projectiles
            this.player.projectiles.forEach(projectile => {
                if (this.checkCollision(projectile, obstacle)) {
                    obstacle.markedForDeletion = true;
                    projectile.markedForDeletion = true;
                    this.createParticles(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2, '#888', 10);
                    this.screenShake(2, 50);
                    this.score += 5;
                    this.audio.explosion();
                }
            });
        });
        this.obstacles = this.obstacles.filter(obstacle => !obstacle.markedForDeletion);

        this.collectibles.forEach(collectible => {
            collectible.update();

            // Magnet logic
            if (this.player.hasMagnet && collectible.type === 'coin') {
                const dx = (this.player.x + this.player.width/2) - (collectible.x + collectible.width/2);
                const dy = (this.player.y + this.player.height/2) - (collectible.y + collectible.height/2);
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 200) {
                    collectible.x += dx / 20;
                    collectible.y += dy / 20;
                }
            }

            if (this.checkCollision(this.player, collectible)) {
                collectible.markedForDeletion = true;
                this.createParticles(collectible.x + collectible.width/2, collectible.y + collectible.height/2, collectible.color, 10);
                
                if (collectible.type === 'coin') {
                    this.score += 10;
                    this.audio.collectCoin();
                } else if (collectible.type === 'boost') {
                    this.score += 50; // Boost gives points for now
                    this.audio.powerup();
                } else if (collectible.type === 'life') {
                    this.lives++;
                    this.audio.powerup();
                } else if (collectible.type === 'shield') {
                    this.player.hasShield = true;
                    this.audio.powerup();
                } else if (collectible.type === 'magnet') {
                    this.player.hasMagnet = true;
                    this.player.magnetTimer = this.player.magnetDuration;
                    this.audio.powerup();
                }
            }
        });
        this.collectibles = this.collectibles.filter(collectible => !collectible.markedForDeletion);
    }

    draw() {
        this.ctx.save();
        
        // Apply Screenshake
        if (this.shakeIntensity > 0) {
            const dx = (Math.random() - 0.5) * this.shakeIntensity;
            const dy = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(dx, dy);
        }

        // Clear screen
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.background.draw(this.ctx);
        this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
        this.collectibles.forEach(collectible => collectible.draw(this.ctx));
        this.particles.forEach(particle => particle.draw(this.ctx));
        
        if (!this.gameOver) {
            this.player.draw(this.ctx);
        }

        // HUD
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Courier New';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('SCORE: ' + this.score, 20, 30);
        this.ctx.fillText('HI: ' + this.highScore, 200, 30);
        this.ctx.fillText('LIVES: ' + '♥'.repeat(this.lives), 20, 60);

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ff3333';
            this.ctx.font = 'bold 60px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '20px Courier New';
            this.ctx.fillText('Final Score: ' + this.score, this.canvas.width / 2, this.canvas.height / 2 + 30);
            this.ctx.fillText('High Score: ' + this.highScore, this.canvas.width / 2, this.canvas.height / 2 + 60);
            this.ctx.fillText('Press ENTER to Restart', this.canvas.width / 2, this.canvas.height / 2 + 100);
        }
        
        this.ctx.restore(); // Restore transform for screenshake
    }

    restart() {
        this.obstacles = [];
        this.collectibles = [];
        this.particles = [];
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.gameTime = 0;
        this.speedModifier = 1;
        this.lastTime = performance.now();
        
        // Reset player pos
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        
        this.gameLoop(this.lastTime);
    }

    gameLoop(timeStamp) {
        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;

        if (!this.gameOver) {
            this.update(deltaTime);
            this.draw();
            requestAnimationFrame(this.gameLoop.bind(this));
        } else {
            this.draw(); // Draw one last time to show Game Over screen
            if (this.input.keys.enter) {
                this.restart();
            } else {
                requestAnimationFrame(this.gameLoop.bind(this)); // Keep loop running to check for input
            }
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    const game = new Game('gameCanvas');
    game.start();
});
