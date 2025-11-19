export class Background {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.layers = [
            { speed: 0.2, stars: [] }, // Distant stars
            { speed: 0.5, stars: [] }, // Mid-distance
            { speed: 1.0, stars: [] }  // Close stars
        ];
        
        this.initLayers();
    }

    initLayers() {
        this.layers.forEach(layer => {
            for (let i = 0; i < 50; i++) {
                layer.stars.push({
                    x: Math.random() * this.gameWidth,
                    y: Math.random() * this.gameHeight,
                    size: Math.random() * 2 + (layer.speed * 1.5) // Faster stars are bigger
                });
            }
        });
    }

    update(speedModifier = 1) {
        this.layers.forEach(layer => {
            layer.stars.forEach(star => {
                star.y += layer.speed * 4 * speedModifier; // Base speed 4
                if (star.y > this.gameHeight) {
                    star.y = 0;
                    star.x = Math.random() * this.gameWidth;
                }
            });
        });
    }

    draw(ctx) {
        ctx.fillStyle = 'white';
        this.layers.forEach(layer => {
            layer.stars.forEach(star => {
                ctx.globalAlpha = layer.speed; // Fainter stars in back
                ctx.fillRect(star.x, star.y, star.size, star.size);
            });
        });
        ctx.globalAlpha = 1.0;
    }
}
