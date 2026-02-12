GAME.drawMap = function (ctx, canvas, walls) {
    const TILE_SIZE = GAME.TILE_SIZE;
    for (let y = 0; y < canvas.height; y += TILE_SIZE) {
        for (let x = 0; x < canvas.width; x += TILE_SIZE) {
            ctx.fillStyle = ((x / TILE_SIZE + y / TILE_SIZE) % 2 === 0) ? '#2c3e50' : '#34495e';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#222';
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        }
    }

    walls.forEach(w => {
        ctx.save();
        ctx.translate(w.x, w.y);
        ctx.rotate(w.rotation || 0);
        if (w.type === 'wood') ctx.fillStyle = `rgb(139, 69, 19)`;
        if (w.type === 'stone') ctx.fillStyle = `rgb(100, 100, 100)`;
        if (w.type === 'metal') ctx.fillStyle = `rgb(50, 50, 80)`;
        ctx.fillRect(-40, -10, 80, 20);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(-40, -10, 80, 20);
        if (w.hp < w.maxHp) {
            ctx.fillStyle = 'red'; ctx.fillRect(-30, -20, 60, 4);
            ctx.fillStyle = 'green'; ctx.fillRect(-30, -20, 60 * (w.hp / w.maxHp), 4);
        }
        ctx.restore();
    });
};
