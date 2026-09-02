// physics-pathfinding.js — Raycasting and line-of-sight obstacle detection

GAME.isSegmentBlockedByWall = function (x1, y1, x2, y2, w, padding = 8) {
    const rot = w.rotation || 0;
    const cos = Math.cos(-rot);
    const sin = Math.sin(-rot);
    const lx1 = (x1 - w.x) * cos - (y1 - w.y) * sin;
    const ly1 = (x1 - w.x) * sin + (y1 - w.y) * cos;
    const lx2 = (x2 - w.x) * cos - (y2 - w.y) * sin;
    const ly2 = (x2 - w.x) * sin + (y2 - w.y) * cos;

    const minX = -40 - padding, maxX = 40 + padding;
    const minY = -10 - padding, maxY = 10 + padding;

    let t0 = 0, t1 = 1;
    const dx = lx2 - lx1, dy = ly2 - ly1;
    const p = [-dx, dx, -dy, dy];
    const q = [lx1 - minX, maxX - lx1, ly1 - minY, maxY - ly1];

    for (let i = 0; i < 4; i++) {
        if (p[i] === 0) {
            if (q[i] < 0) return false;
        } else {
            const t = q[i] / p[i];
            if (p[i] < 0) {
                if (t > t1) return false;
                if (t > t0) t0 = t;
            } else {
                if (t < t0) return false;
                if (t < t1) t1 = t;
            }
        }
    }
    return t0 <= t1;
};

GAME.isPathBlocked = function (x1, y1, x2, y2, walls, padding = 8) {
    for (let w of walls) {
        if (GAME.isSegmentBlockedByWall(x1, y1, x2, y2, w, padding)) return true;
    }
    return false;
};
