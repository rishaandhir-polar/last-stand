import { drawMap } from './render-map.js';
import { drawEntities } from './render-entities.js';
import { drawFX } from './render-fx.js';

export function draw(state) {
    const { ctx, canvas, walls } = state;
    drawMap(ctx, canvas, walls);
    drawEntities(ctx, state);
    drawFX(ctx, state);
    if (state.buildMode) drawBuildGhost(ctx, state);
}

export function drawBuildGhost(ctx, state) {
    const { mouseX, mouseY, buildRotation, buildMode } = state;
    ctx.save(); ctx.globalAlpha = 0.5; ctx.translate(mouseX, mouseY); ctx.rotate(buildRotation);
    ctx.fillStyle = '#7f8c8d';
    if (buildMode === 'turret') {
        ctx.fillRect(-10, -10, 20, 20); ctx.fillStyle = '#3498db'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
    } else {
        ctx.fillRect(-40, -10, 80, 20);
    }
    ctx.restore();
}

export function drawLighting(state) {
    const { ctx, canvas, worldOpacity } = state;
    if (worldOpacity > 0) {
        ctx.fillStyle = `rgba(0, 0, 50, ${worldOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

export function drawStaminaUI(state) {
    const { ctx, canvas, player } = state;
    let barWidth = 200, x = (canvas.width - barWidth) / 2, y = canvas.height - 40;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x, y, barWidth, 10);
    ctx.fillStyle = '#f1c40f'; ctx.fillRect(x, y, barWidth * (player.stamina / player.maxStamina), 10);
}
