GAME.draw = function (state) {
    const { ctx, canvas, walls } = state;
    
    ctx.save();
    if (state.screenShake > 0) {
        state.screenShake -= 1;
        ctx.translate((Math.random() - 0.5) * state.screenShake, (Math.random() - 0.5) * state.screenShake);
    }

    GAME.drawMap(ctx, canvas, walls, state.wave);
    GAME.drawGroundTraps(ctx, state);
    GAME.drawEntities(ctx, state);
    GAME.drawTopFX(ctx, state);
    if (state.buildMode) GAME.drawBuildGhost(ctx, state);
    
    ctx.restore();
};

GAME.drawBuildGhost = function (ctx, state) {
    const { mouseX, mouseY, buildRotation, buildMode } = state;
    
    // Check placement validity
    const isValid = GAME.isPlacementValid(state);
    
    // Glowing neon style colors
    const glowColor = isValid ? 'rgba(46, 204, 113, 0.85)' : 'rgba(231, 76, 60, 0.85)';
    const fillColor = isValid ? 'rgba(46, 204, 113, 0.25)' : 'rgba(231, 76, 60, 0.25)';
    
    // Draw range circle in screen space
    if (buildMode === 'turret' || buildMode === 'drone') {
        ctx.save();
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        
        // Pulse alpha slowly for tech aesthetic
        const rangePulse = 0.7 + 0.3 * Math.sin(Date.now() / 250);
        ctx.globalAlpha = rangePulse;
        
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, buildMode === 'turret' ? 300 : 250, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = isValid ? 'rgba(46, 204, 113, 0.03)' : 'rgba(231, 76, 60, 0.03)';
        ctx.fill();
        ctx.restore();
    }

    ctx.save();
    ctx.translate(mouseX, mouseY);
    ctx.rotate(buildRotation);
    
    // Apply glowing effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = glowColor;
    ctx.strokeStyle = glowColor;
    ctx.fillStyle = fillColor;
    ctx.lineWidth = 2;

    if (buildMode === 'turret') {
        ctx.fillRect(-12, -12, 24, 24);
        ctx.strokeRect(-12, -12, 24, 24);
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -12); ctx.lineTo(0, -6);
        ctx.stroke();
    } else if (buildMode === 'landmine') {
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = isValid ? '#2ecc71' : '#e74c3c';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
    } else if (buildMode === 'spike') {
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.cos(i * Math.PI / 2) * 16, Math.sin(i * Math.PI / 2) * 16);
            ctx.lineTo(-Math.cos(i * Math.PI / 2) * 4, -Math.sin(i * Math.PI / 2) * 4);
            ctx.stroke();
        }
        ctx.strokeRect(-16, -16, 32, 32);
    } else if (buildMode === 'drone') {
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        for (let i = 0; i < 4; i++) {
            const rx = Math.cos(i * Math.PI / 2) * 16;
            const ry = Math.sin(i * Math.PI / 2) * 16;
            ctx.beginPath();
            ctx.arc(rx, ry, 5, 0, Math.PI * 2);
            ctx.stroke();
        }
    } else {
        ctx.fillRect(-40, -10, 80, 20);
        ctx.strokeRect(-40, -10, 80, 20);
        ctx.beginPath();
        ctx.moveTo(-40, 0); ctx.lineTo(40, 0);
        ctx.moveTo(-20, -10); ctx.lineTo(-20, 10);
        ctx.moveTo(20, -10); ctx.lineTo(20, 10);
        ctx.stroke();
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

GAME.drawLowHealthVignette = function (state) {
    const { player, canvas, ctx } = state;
    if (!player || player.hp >= 30 || player.hp <= 0) return;

    ctx.save();
    const severity = (30 - player.hp) / 30;
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 150);
    const alpha = severity * (0.15 + pulse * 0.15);

    const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.3,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.75
    );
    grad.addColorStop(0, 'rgba(255, 0, 0, 0)');
    grad.addColorStop(1, `rgba(255, 0, 0, ${alpha})`);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
};
