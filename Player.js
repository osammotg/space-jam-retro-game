import { Projectile } from './Projectile.js';

export class Player {
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
            if ((e.key === ' ' || e.key === 'ArrowUp') && !this.game.gameOver && !this.game.paused) {
                this.shoot();
            }
            if (e.key === 'Shift' && !this.game.gameOver && !this.game.paused) {
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
