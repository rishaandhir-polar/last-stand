// render-hazards.js — Rendering environmental obstacles, barrels, and hazards

GAME.drawHazards = function (ctx, state) {
    if (!state.hazards || state.hazards.length === 0) return;

    state.hazards.forEach(hz => {
        ctx.save();
        ctx.translate(hz.x, hz.y);

        if (hz.type === 'barrel_explosive') {
            // Red Explosive Barrel
            ctx.fillStyle = '#c0392b';
            ctx.beginPath(); ctx.arc(0, 0, hz.radius, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 3; ctx.stroke();
            // Black hazard band
            ctx.fillStyle = '#111';
            ctx.fillRect(-hz.radius + 3, -4, (hz.radius - 3) * 2, 8);
            // Yellow flame icon/dot
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
        } else if (hz.type === 'cryo_tank') {
            // Cyan Cryo Frost Tank
            ctx.fillStyle = '#2980b9';
            ctx.beginPath(); ctx.arc(0, 0, hz.radius, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 2.5; ctx.stroke();
            // Frost glow
            ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
            ctx.beginPath(); ctx.arc(0, 0, hz.radius * 0.5, 0, Math.PI * 2); ctx.fill();
        } else if (hz.type === 'boulder') {
            // Desert Boulder Rock
            ctx.fillStyle = '#7f6138';
            ctx.beginPath();
            ctx.moveTo(-hz.radius, -hz.radius * 0.4);
            ctx.lineTo(-hz.radius * 0.4, -hz.radius);
            ctx.lineTo(hz.radius * 0.7, -hz.radius * 0.7);
            ctx.lineTo(hz.radius, hz.radius * 0.3);
            ctx.lineTo(hz.radius * 0.3, hz.radius);
            ctx.lineTo(-hz.radius * 0.6, hz.radius * 0.7);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#4a3720'; ctx.lineWidth = 3; ctx.stroke();
        } else if (hz.type === 'quicksand') {
            // Quicksand Pit
            ctx.fillStyle = 'rgba(100, 70, 30, 0.55)';
            ctx.beginPath(); ctx.arc(0, 0, hz.radius, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(140, 100, 45, 0.7)'; ctx.lineWidth = 2; ctx.stroke();
        } else if (hz.type === 'acid_pool') {
            // Toxic Slime Acid Pool
            ctx.fillStyle = 'rgba(46, 204, 113, 0.45)';
            ctx.beginPath(); ctx.arc(0, 0, hz.radius, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(39, 174, 96, 0.8)'; ctx.lineWidth = 2.5; ctx.stroke();
            // Acid bubbles
            ctx.fillStyle = '#2ecc71';
            const t = Date.now() * 0.003;
            ctx.beginPath();
            ctx.arc(Math.sin(t) * 10, Math.cos(t) * 10, 4, 0, Math.PI * 2);
            ctx.arc(Math.cos(t * 1.3) * 14, Math.sin(t * 1.3) * 14, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (hz.type === 'spore_pod') {
            // Alien Spore Pod
            const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.08;
            ctx.scale(pulse, pulse);
            ctx.fillStyle = '#8e44ad';
            ctx.beginPath(); ctx.arc(0, 0, hz.radius, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#9b59b6'; ctx.lineWidth = 3; ctx.stroke();
            // Spore core
            ctx.fillStyle = '#e056fd';
            ctx.beginPath(); ctx.arc(0, 0, hz.radius * 0.45, 0, Math.PI * 2); ctx.fill();
        }

        ctx.restore();
    });
};
