export class Projectile {
    constructor(x, y, isEnemy = false) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 15;
        this.speed = 10;
        this.markedForDeletion = false;
        this.isEnemy = isEnemy;
    }

    update() {
        if (this.isEnemy) {
            this.y += this.speed * 0.7; // Enemy shots are slightly slower
        } else {
            this.y -= this.speed;
        }
        
        // Check bounds (assuming canvas height ~800, but safe to check < 0 or > 1000)
        if (this.y < -50 || this.y > 1000) this.markedForDeletion = true;
    }

    draw(ctx) {
        ctx.fillStyle = this.isEnemy ? '#ff0000' : '#0ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
