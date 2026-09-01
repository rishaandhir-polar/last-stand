GAME.getBiome = function (wave) {
    // Cycle: Lab(0-4) Desert(5-9) Alien(10-14), repeating
    const idx = Math.floor(((wave || 1) - 1) / 5) % 3;
    return ['lab', 'desert', 'alien'][idx];
};

GAME.BIOME_PALETTES = {
    lab:    { tileA: '#1a2a3a', tileB: '#1e3248', grid: '#162233', accent: '#00aaff', name: 'LAB' },
    desert: { tileA: '#3d2b0e', tileB: '#4a3415', grid: '#2e2008', accent: '#e8a030', name: 'DESERT' },
    alien:  { tileA: '#1a0a2e', tileB: '#220d3a', grid: '#120622', accent: '#a020f0', name: 'ALIEN' },
};

GAME.drawMap = function (ctx, canvas, walls, wave) {
    const TILE_SIZE = GAME.TILE_SIZE;
    const biome = GAME.getBiome(wave);
    const pal = GAME.BIOME_PALETTES[biome];

    for (let y = 0; y < canvas.height; y += TILE_SIZE) {
        for (let x = 0; x < canvas.width; x += TILE_SIZE) {
            ctx.fillStyle = ((x / TILE_SIZE + y / TILE_SIZE) % 2 === 0) ? pal.tileA : pal.tileB;
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = pal.grid;
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        }
    }

    // Biome name watermark bottom-right
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = pal.accent;
    ctx.font = 'bold 64px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(pal.name, canvas.width - 20, canvas.height - 20);
    ctx.globalAlpha = 1.0;
    ctx.textAlign = 'left';

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

