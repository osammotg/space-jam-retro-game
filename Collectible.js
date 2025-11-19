export class Collectible {
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
        if (this.y > 800) { // Hardcoded height for now, passed from game usually
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
