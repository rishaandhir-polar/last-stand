import { ZOMBIE_DEFAULT_HP } from './constants.js';

export function spawnZombie(state) {
    const { wave, canvas } = state;
    let pool = [{ type: 'normal', weight: 50 }];
    if (wave > 3) pool.push({ type: 'fast', weight: 20 });
    if (wave > 5) pool.push({ type: 'tank', weight: 10 });
    if (wave > 2) pool.push({ type: 'shooter', weight: 15 });
    if (wave > 3) pool.push({ type: 'exploder', weight: 15 });
    if (wave > 4) pool.push({ type: 'spawner', weight: 10 });
    if (wave > 4) pool.push({ type: 'shotgunner', weight: 15 });
    if (wave > 6) pool.push({ type: 'ar_gunner', weight: 10 });
    if (wave > 8) pool.push({ type: 'flamethrower', weight: 10 });

    let totalWeight = pool.reduce((s, i) => s + i.weight, 0);
    let r = Math.random() * totalWeight, type = 'normal';
    for (let item of pool) { if (r < item.weight) { type = item.type; break; } r -= item.weight; }

    let side = Math.floor(Math.random() * 4), x, y;
    if (side === 0) { x = Math.random() * canvas.width; y = -50; }
    else if (side === 1) { x = canvas.width + 50; y = Math.random() * canvas.height; }
    else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 50; }
    else { x = -50; y = Math.random() * canvas.height; }

    let z = { x, y, hp: ZOMBIE_DEFAULT_HP, radius: 20, speed: 2 + Math.min(3, wave * 0.1), color: '#2ecc71', reward: 10, maxHp: ZOMBIE_DEFAULT_HP, type };
    if (type === 'fast') { z.speed *= 1.5; z.hp *= 0.6; z.color = '#e74c3c'; }
    if (type === 'tank') { z.speed *= 0.5; z.hp *= 3; z.radius = 30; z.color = '#34495e'; z.reward = 50; }
    if (type === 'shooter') { z.speed *= 0.8; z.hp *= 0.8; z.color = '#8e44ad'; z.reward = 20; }
    if (type === 'exploder') { z.speed *= 1.2; z.hp *= 0.8; z.color = '#d35400'; z.reward = 30; }
    if (type === 'spawner') { z.speed *= 0.5; z.hp *= 2.0; z.color = '#f1c40f'; z.reward = 60; }
    z.maxHp = z.hp;
    state.zombies.push(z);
}

export function spawnBoss(state) {
    const { wave, canvas } = state;
    let x, y, side = Math.floor(Math.random() * 4);
    if (side === 0) { x = Math.random() * canvas.width; y = -100; }
    else if (side === 1) { x = canvas.width + 100; y = Math.random() * canvas.height; }
    else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 100; }
    else { x = -100; y = Math.random() * canvas.height; }
    state.zombies.push({ x, y, hp: 2000 + (wave * 200), maxHp: 2000 + (wave * 200), radius: 60, speed: 1.5, color: '#2c3e50', reward: 1000, type: 'boss' });
}
