import React, { useRef, useEffect, useCallback } from 'react';

/**
 * InteractiveBackground — Enhanced particle network with cursor interactions
 *
 * Features:
 *  • Particle network with aurora/indigo theme colors
 *  • Cursor-magnetic glow orb that follows the mouse
 *  • Click ripple/shockwave that pushes nearby particles outward
 *  • Mouse proximity highlights connection lines
 *  • Floating ambient gradient orbs for depth
 *  • Subtle grid overlay for a tech feel
 */
const InteractiveBackground = () => {
    const canvasRef = useRef(null);
    const cursorRef = useRef(null);    // DOM element for the CSS cursor glow
    const rippleRef = useRef(null);    // DOM element for the click ripple

    /* ─── Cursor glow follower (CSS layer, outside canvas) ─── */
    const handleMouseMove = useCallback((e) => {
        if (cursorRef.current) {
            cursorRef.current.style.left = `${e.clientX}px`;
            cursorRef.current.style.top = `${e.clientY}px`;
            cursorRef.current.style.opacity = '1';
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (cursorRef.current) cursorRef.current.style.opacity = '0';
    }, []);

    /* ─── Click ripple effect ─── */
    const handleClick = useCallback((e) => {
        const el = rippleRef.current;
        if (!el) return;
        el.style.left = `${e.clientX}px`;
        el.style.top = `${e.clientY}px`;
        el.classList.remove('ib-ripple-active');
        // Force reflow to reset animation
        void el.offsetWidth;
        el.classList.add('ib-ripple-active');
    }, []);

    /* ─── Canvas particle system ─── */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let dpr = window.devicePixelRatio || 1;
        let animId;

        const setCanvasSize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        setCanvasSize();

        /* ── Mouse state ── */
        const mouse = { x: null, y: null, radius: 200, clicked: false, clickX: 0, clickY: 0, clickTime: 0 };

        const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
        const onOut = () => { mouse.x = null; mouse.y = null; };
        const onClick = (e) => {
            mouse.clicked = true;
            mouse.clickX = e.clientX;
            mouse.clickY = e.clientY;
            mouse.clickTime = performance.now();
        };
        const onResize = () => { setCanvasSize(); init(); };

        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('mouseout', onOut);
        window.addEventListener('click', onClick);
        window.addEventListener('resize', onResize);

        /* ── Theme colours ── */
        const COLORS = [
            { r: 94,  g: 234, b: 212 }, // aurora-300 #5eead4
            { r: 45,  g: 212, b: 191 }, // aurora-400 #2dd4bf
            { r: 129, g: 140, b: 248 }, // indigo-400 #818cf8
            { r: 99,  g: 102, b: 241 }, // indigo-500 #6366f1
            { r: 167, g: 139, b: 250 }, // violet-400 #a78bfa
            { r: 20,  g: 184, b: 166 }, // aurora-500 #14b8a6
        ];

        /* ── Particle class ── */
        const particles = [];
        const particleCount = Math.min(Math.floor((width * height) / 12000), 300);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                const c = COLORS[Math.floor(Math.random() * COLORS.length)];
                this.r = c.r; this.g = c.g; this.b = c.b;
                this.size = Math.random() * 2.5 + 0.8;
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
                this.baseAlpha = Math.random() * 0.5 + 0.3;
                this.alpha = this.baseAlpha;
                this.pulse = Math.random() * Math.PI * 2; // phase
                this.pulseSpeed = Math.random() * 0.02 + 0.005;
                this.density = Math.random() * 30 + 5;
            }
            update(time) {
                /* Natural drift */
                this.x += this.vx;
                this.y += this.vy;

                /* Gentle pulse */
                this.pulse += this.pulseSpeed;
                this.alpha = this.baseAlpha + Math.sin(this.pulse) * 0.15;

                /* Bounce */
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                /* Mouse repulsion */
                if (mouse.x != null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        const fx = (dx / dist) * force * this.density * 0.15;
                        const fy = (dy / dist) * force * this.density * 0.15;
                        this.x -= fx;
                        this.y -= fy;
                        // Brighten near cursor
                        this.alpha = Math.min(1, this.alpha + force * 0.6);
                    }
                }

                /* Click shockwave push */
                if (mouse.clicked) {
                    const elapsed = (time - mouse.clickTime) / 1000;
                    if (elapsed < 0.6) {
                        const waveRadius = elapsed * 500; // expanding ring
                        const dx = this.x - mouse.clickX;
                        const dy = this.y - mouse.clickY;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const ringWidth = 100;
                        if (Math.abs(dist - waveRadius) < ringWidth) {
                            const push = (1 - elapsed / 0.6) * 4;
                            if (dist > 0) {
                                this.vx += (dx / dist) * push;
                                this.vy += (dy / dist) * push;
                            }
                        }
                    } else {
                        mouse.clicked = false;
                    }
                }

                /* Dampen velocity */
                this.vx *= 0.99;
                this.vy *= 0.99;

                /* Clamp */
                this.x = Math.max(0, Math.min(width, this.x));
                this.y = Math.max(0, Math.min(height, this.y));
            }
            draw() {
                // Glow
                const glowSize = this.size * 3;
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize);
                gradient.addColorStop(0, `rgba(${this.r},${this.g},${this.b},${this.alpha * 0.6})`);
                gradient.addColorStop(1, `rgba(${this.r},${this.g},${this.b},0)`);
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
                ctx.fill();

                // Core dot
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${this.alpha})`;
                ctx.fill();
            }
        }

        /* ── Ambient floating orbs (large soft blobs for depth) ── */
        const orbs = [];
        const orbCount = 4;
        class Orb {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.radius = Math.random() * 250 + 150;
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
                const palette = [
                    { r: 94, g: 234, b: 212 },
                    { r: 99, g: 102, b: 241 },
                    { r: 167, g: 139, b: 250 },
                ];
                const c = palette[Math.floor(Math.random() * palette.length)];
                this.r = c.r; this.g = c.g; this.b = c.b;
                this.alpha = Math.random() * 0.04 + 0.02;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < -this.radius) this.x = width + this.radius;
                if (this.x > width + this.radius) this.x = -this.radius;
                if (this.y < -this.radius) this.y = height + this.radius;
                if (this.y > height + this.radius) this.y = -this.radius;
            }
            draw() {
                const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                g.addColorStop(0, `rgba(${this.r},${this.g},${this.b},${this.alpha})`);
                g.addColorStop(1, `rgba(${this.r},${this.g},${this.b},0)`);
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        /* ── Init ── */
        function init() {
            particles.length = 0;
            orbs.length = 0;
            for (let i = 0; i < particleCount; i++) particles.push(new Particle());
            for (let i = 0; i < orbCount; i++) orbs.push(new Orb());
        }

        /* ── Subtle grid ── */
        function drawGrid() {
            ctx.strokeStyle = 'rgba(255,255,255,0.015)';
            ctx.lineWidth = 0.5;
            const spacing = 60;
            for (let x = 0; x < width; x += spacing) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
            }
            for (let y = 0; y < height; y += spacing) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
            }
        }

        /* ── Connections ── */
        function drawConnections() {
            const maxDist = Math.min(width, height) * 0.12;
            const maxDistSq = maxDist * maxDist;

            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq > maxDistSq) continue;

                    const dist = Math.sqrt(distSq);
                    let opacity = (1 - dist / maxDist) * 0.35;

                    // Brighten connections near the cursor
                    if (mouse.x != null) {
                        const mx = (particles[a].x + particles[b].x) / 2;
                        const my = (particles[a].y + particles[b].y) / 2;
                        const md = Math.sqrt((mouse.x - mx) ** 2 + (mouse.y - my) ** 2);
                        if (md < mouse.radius * 1.5) {
                            const boost = (1 - md / (mouse.radius * 1.5)) * 0.5;
                            opacity = Math.min(1, opacity + boost);
                        }
                    }

                    // Blend the two colors
                    const r = Math.round((particles[a].r + particles[b].r) / 2);
                    const g = Math.round((particles[a].g + particles[b].g) / 2);
                    const bv = Math.round((particles[a].b + particles[b].b) / 2);
                    ctx.strokeStyle = `rgba(${r},${g},${bv},${opacity})`;
                    ctx.lineWidth = opacity > 0.4 ? 1.2 : 0.7;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }

        /* ── Cursor glow on canvas (soft radial highlight) ── */
        function drawCursorGlow() {
            if (mouse.x == null) return;
            const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220);
            g.addColorStop(0, 'rgba(20,184,166,0.07)');
            g.addColorStop(0.5, 'rgba(99,102,241,0.03)');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 220, 0, Math.PI * 2);
            ctx.fill();
        }

        /* ── Main loop ── */
        function animate(time) {
            animId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, width, height);

            drawGrid();

            for (const orb of orbs) { orb.update(); orb.draw(); }
            for (const p of particles) { p.update(time); }
            drawConnections();
            for (const p of particles) { p.draw(); }
            drawCursorGlow();
        }

        /* ── Go ── */
        init();
        animId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseout', onOut);
            window.removeEventListener('click', onClick);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    /* ─── Attach DOM-level listeners for cursor & ripple ─── */
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mouseout', handleMouseLeave);
        window.addEventListener('click', handleClick);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
            window.removeEventListener('click', handleClick);
        };
    }, [handleMouseMove, handleMouseLeave, handleClick]);

    return (
        <>
            {/* Particle canvas */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 z-0 pointer-events-none"
                style={{ background: 'transparent' }}
            />

            {/* Cursor glow dot (CSS layer) */}
            <div
                ref={cursorRef}
                className="ib-cursor-glow pointer-events-none"
                style={{ opacity: 0 }}
            />

            {/* Click ripple ring (CSS layer) */}
            <div
                ref={rippleRef}
                className="ib-ripple pointer-events-none"
            />
        </>
    );
};

export default InteractiveBackground;
