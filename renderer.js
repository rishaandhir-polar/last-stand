GAME.draw = function (state) {
    const { ctx, canvas, walls } = state;
    GAME.drawMap(ctx, canvas, walls);
    GAME.drawEntities(ctx, state);
    GAME.drawFX(ctx, state);
    if (state.buildMode) GAME.drawBuildGhost(ctx, state);
};

GAME.drawBuildGhost = function (ctx, state) {
    const { mouseX, mouseY, buildRotation, buildMode } = state;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.translate(mouseX, mouseY);
    ctx.rotate(buildRotation);

    if (buildMode === 'turret') {
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(-10, -10, 20, 20);
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
    } else if (buildMode === 'landmine') {
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
    } else if (buildMode === 'spike') {
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.cos(i * Math.PI / 2) * 15, Math.sin(i * Math.PI / 2) * 15);
            ctx.lineTo(0, 0);
            ctx.stroke();
        }
    } else {
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(-40, -10, 80, 20);
    }
    ctx.restore();
};

GAME.drawLighting = function (state) {
    const { ctx, canvas, worldOpacity } = state;
    if (worldOpacity > 0) {
        ctx.fillStyle = `rgba(0, 0, 50, ${worldOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
};

GAME.drawStaminaUI = function (state) {
    const { ctx, canvas, player } = state;
    let barWidth = 200, x = (canvas.width - barWidth) / 2, y = canvas.height - 40;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x, y, barWidth, 10);
    ctx.fillStyle = '#f1c40f'; ctx.fillRect(x, y, barWidth * (player.stamina / player.maxStamina), 10);
};
