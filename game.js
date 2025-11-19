/**
 * Retro Spacecraft Game
 * HTML5 Canvas + Vanilla JS
 */

import { Player } from './Player.js';
import { InputHandler } from './InputHandler.js';
import { Background } from './Background.js';
import { Enemy } from './Enemy.js';
import { Collectible } from './Collectible.js';
import { Particle } from './Particle.js';
import AudioController from './audio.js';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 800;

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        
        this.input = new InputHandler();
        this.audio = new AudioController();
        this.player = new Player(this);
        this.background = new Background(this.canvas.width, this.canvas.height);
        
        this.obstacles = []; // Now contains Enemy instances
        this.obstacleTimer = 0;
        this.obstacleInterval = 1000; // ms

        this.collectibles = [];
        this.collectibleTimer = 0;
        this.collectibleInterval = 2000; // ms
        
        this.particles = [];
        this.enemyProjectiles = [];

        this.lastTime = 0;
        this.gameOver = false;
        this.paused = false;
        this.score = 0;
        this.lives = 3;
        this.gameTime = 0;
        this.speedModifier = 1;
        this.highScore = localStorage.getItem('spaceCraftHighScore') || 0;
        
        // Visual Juice
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
        this.floatingTexts = [];

        // Game Progression
        this.bossSpawned = false;
        this.lastBossScore = 0;
        this.comboCount = 0;
        this.comboTimer = 0;

        // Settings UI
        const settingsBtn = document.getElementById('settings-btn');
        settingsBtn.addEventListener('click', () => {
            const muted = this.audio.toggleMute();
            settingsBtn.textContent = muted ? '🔇' : '🔊';
            // Prevent focus so spacebar doesn't trigger button
            settingsBtn.blur();
        });
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

    createFloatingText(text, x, y, color = 'white') {
        this.floatingTexts.push({
            text, x, y, color,
            life: 60,
            dy: -1
        });
    }

    screenShake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    }

    togglePause() {
        this.paused = !this.paused;
    }

    update(deltaTime) {
        // Handle Pause
        if (this.input.keys.escape) {
            this.input.keys.escape = false; // Consume key press
            this.togglePause();
        }

        if (this.gameOver || this.paused) return;

        this.gameTime += deltaTime;
        // Increase difficulty every 10 seconds
        this.speedModifier = 1 + Math.floor(this.gameTime / 10000) * 0.1;

        // Update Screenshake
        if (this.shakeTimer > 0) {
            this.shakeTimer -= deltaTime;
            if (this.shakeTimer <= 0) this.shakeIntensity = 0;
        }

        // Combo Timer
        if (this.comboCount > 0) {
            this.comboTimer -= deltaTime;
            if (this.comboTimer <= 0) this.comboCount = 0;
        }

        this.background.update(this.speedModifier);
        this.player.update(this.input, deltaTime);

        // Enemy Spawning Logic
        if (!this.bossSpawned) {
            // Check for Boss Spawn
            if (this.score - this.lastBossScore >= 1000 && this.score > 0) {
                this.obstacles.push(new Enemy(this.canvas.width, this.speedModifier, 'boss'));
                this.bossSpawned = true;
                this.lastBossScore = this.score;
                this.createFloatingText("BOSS APPROACHING!", this.canvas.width/2 - 100, 200, 'red');
            } else {
                // Normal Spawning
                if (this.obstacleTimer > this.obstacleInterval) {
                    const rand = Math.random();
                    let type = 'asteroid';
                    if (rand > 0.8) type = 'chaser';
                    else if (rand > 0.9) type = 'shooter';
                    
                    this.obstacles.push(new Enemy(this.canvas.width, this.speedModifier, type));
                    this.obstacleTimer = 0;
                } else {
                    this.obstacleTimer += deltaTime;
                }
            }
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

        // Floating Texts
        this.floatingTexts.forEach(ft => {
            ft.y += ft.dy;
            ft.life--;
        });
        this.floatingTexts = this.floatingTexts.filter(ft => ft.life > 0);

        // Enemy Projectiles
        this.enemyProjectiles.forEach(proj => {
            proj.update();
            if (this.checkCollision(proj, this.player)) {
                proj.markedForDeletion = true;
                if (!this.player.hasShield && !this.player.isDashing) {
                    this.lives--;
                    this.screenShake(10, 200);
                    this.createParticles(this.player.x, this.player.y, 'red', 10);
                    if (this.lives <= 0) this.gameOver = true;
                } else if (this.player.hasShield) {
                    this.player.hasShield = false;
                    this.audio.explosion();
                }
            }
        });
        this.enemyProjectiles = this.enemyProjectiles.filter(p => !p.markedForDeletion);

        // Updates and Collision Checks
        this.obstacles.forEach(obstacle => {
            obstacle.update(this.player, this.enemyProjectiles);
            
            // Check collision with Player
            if (this.checkCollision(this.player, obstacle)) {
                if (obstacle.type !== 'boss') obstacle.markedForDeletion = true;
                
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
                    projectile.markedForDeletion = true;
                    obstacle.health--;
                    
                    this.createParticles(projectile.x, projectile.y, 'orange', 5);

                    if (obstacle.health <= 0) {
                        obstacle.markedForDeletion = true;
                        this.createParticles(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2, obstacle.color, 15);
                        this.screenShake(5, 100);
                        this.audio.explosion();
                        
                        // Combo Logic
                        this.comboCount++;
                        this.comboTimer = 2000; // 2s to keep combo
                        const multiplier = Math.min(this.comboCount, 5); // Max 5x
                        const points = 10 * multiplier;
                        
                        this.score += points;
                        this.createFloatingText(`+${points}`, obstacle.x, obstacle.y);
                        if (multiplier > 1) this.createFloatingText(`${multiplier}x COMBO!`, obstacle.x, obstacle.y - 20, 'yellow');

                        if (obstacle.type === 'boss') {
                            this.bossSpawned = false;
                            this.score += 500;
                            this.createFloatingText("+500 BOSS DEFEATED!", obstacle.x, obstacle.y, 'gold');
                        }
                    }
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
                    this.createFloatingText("+10", collectible.x, collectible.y, 'gold');
                } else if (collectible.type === 'boost') {
                    this.score += 50; // Boost gives points for now
                    this.audio.powerup();
                    this.createFloatingText("BOOST!", collectible.x, collectible.y, 'cyan');
                } else if (collectible.type === 'life') {
                    this.lives++;
                    this.audio.powerup();
                    this.createFloatingText("1UP", collectible.x, collectible.y, 'magenta');
                } else if (collectible.type === 'shield') {
                    this.player.hasShield = true;
                    this.audio.powerup();
                    this.createFloatingText("SHIELD", collectible.x, collectible.y, 'blue');
                } else if (collectible.type === 'magnet') {
                    this.player.hasMagnet = true;
                    this.player.magnetTimer = this.player.magnetDuration;
                    this.audio.powerup();
                    this.createFloatingText("MAGNET", collectible.x, collectible.y, 'lime');
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
        this.enemyProjectiles.forEach(p => p.draw(this.ctx));
        
        if (!this.gameOver) {
            this.player.draw(this.ctx);
        }

        // Floating Texts
        this.floatingTexts.forEach(ft => {
            this.ctx.fillStyle = ft.color;
            this.ctx.font = 'bold 16px Courier New';
            this.ctx.fillText(ft.text, ft.x, ft.y);
        });

        // HUD
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Courier New';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('SCORE: ' + this.score, 20, 30);
        this.ctx.fillText('HI: ' + this.highScore, 200, 30);
        this.ctx.fillText('LIVES: ' + '♥'.repeat(this.lives), 20, 60);
        
        if (this.comboCount > 1) {
            this.ctx.fillStyle = 'yellow';
            this.ctx.fillText(`COMBO x${Math.min(this.comboCount, 5)}`, 20, 90);
        }

        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '40px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }

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
        this.enemyProjectiles = [];
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.gameTime = 0;
        this.speedModifier = 1;
        this.bossSpawned = false;
        this.lastBossScore = 0;
        this.comboCount = 0;
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
