import { Projectile } from './Projectile.js';

export class Enemy {
    constructor(gameWidth, speedModifier = 1, type = 'asteroid') {
        this.gameWidth = gameWidth;
        this.type = type;
        this.width = 50;
        this.height = 50;
        this.x = Math.random() * (this.gameWidth - this.width);
        this.y = -this.height;
        this.speedY = 5 * speedModifier;
        this.speedX = 0;
        this.markedForDeletion = false;
        this.color = '#888';
        this.health = 1;
        
        // Type specific properties
        if (this.type === 'chaser') {
            this.color = '#ff8800';
            this.speedY = 3 * speedModifier;
            this.health = 2;
        } else if (this.type === 'shooter') {
            this.color = '#aa00ff';
            this.speedY = 2 * speedModifier;
            this.health = 3;
            this.shootTimer = 0;
            this.shootInterval = 2000;
        } else if (this.type === 'boss') {
            this.width = 150;
            this.height = 100;
            this.x = this.gameWidth / 2 - this.width / 2;
            this.color = '#ff0000';
            this.speedY = 1 * speedModifier;
            this.health = 20;
            this.shootTimer = 0;
            this.shootInterval = 1000;
        }
    }

    update(player, projectiles) {
        this.y += this.speedY;
        this.x += this.speedX;

        // Chaser Logic
        if (this.type === 'chaser' && player) {
            if (this.x < player.x) this.speedX = 1;
            else if (this.x > player.x) this.speedX = -1;
        }

        // Shooter Logic
        if (this.type === 'shooter' || this.type === 'boss') {
            this.shootTimer += 16; // Approx ms per frame
            if (this.shootTimer > this.shootInterval) {
                this.shootTimer = 0;
                // Fire projectile downwards
                projectiles.push(new Projectile(this.x + this.width/2, this.y + this.height, true));
            }
        }

        // Boss Logic (Stop at top)
        if (this.type === 'boss' && this.y > 50) {
            this.y = 50;
            this.speedX = Math.sin(Date.now() / 1000) * 2; // Move side to side
        }

        if (this.y > 800 + this.height) { // Off screen
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Simple details
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(this.x + 10, this.y + 10, this.width - 20, this.height - 20);
        
        // Health bar for boss
        if (this.type === 'boss') {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y - 10, this.width, 5);
            ctx.fillStyle = 'green';
            ctx.fillRect(this.x, this.y - 10, this.width * (this.health / 20), 5);
        }
    }
}
