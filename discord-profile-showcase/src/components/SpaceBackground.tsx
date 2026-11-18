import React, { useEffect, useRef } from 'react';

interface ConstellationTemplate {
  name: string;
  vietnameseName: string;
  stars: { x: number; y: number }[];
  connections: [number, number][];
}

const CONSTELLATION_TEMPLATES: ConstellationTemplate[] = [
  {
    name: "Aries",
    vietnameseName: "Bạch Dương",
    stars: [{ x: 15, y: 15 }, { x: 45, y: 25 }, { x: 70, y: 50 }, { x: 85, y: 75 }],
    connections: [[0, 1], [1, 2], [2, 3]]
  },
  {
    name: "Taurus",
    vietnameseName: "Kim Ngưu",
    stars: [{ x: 10, y: 15 }, { x: 30, y: 30 }, { x: 45, y: 45 }, { x: 60, y: 50 }, { x: 85, y: 55 }, { x: 25, y: 55 }, { x: 45, y: 70 }, { x: 65, y: 85 }],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [2, 6], [6, 7]]
  },
  {
    name: "Gemini",
    vietnameseName: "Song Tử",
    stars: [{ x: 20, y: 20 }, { x: 40, y: 22 }, { x: 60, y: 24 }, { x: 80, y: 26 }, { x: 22, y: 65 }, { x: 42, y: 67 }, { x: 62, y: 69 }, { x: 82, y: 71 }],
    connections: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [0, 4], [2, 6], [3, 7]]
  },
  {
    name: "Cancer",
    vietnameseName: "Cự Giải",
    stars: [{ x: 50, y: 15 }, { x: 50, y: 40 }, { x: 20, y: 65 }, { x: 80, y: 65 }, { x: 50, y: 85 }],
    connections: [[0, 1], [1, 2], [1, 3], [1, 4]]
  },
  {
    name: "Leo",
    vietnameseName: "Sư Tử",
    stars: [{ x: 85, y: 50 }, { x: 70, y: 30 }, { x: 50, y: 25 }, { x: 35, y: 35 }, { x: 40, y: 55 }, { x: 60, y: 60 }, { x: 25, y: 75 }, { x: 10, y: 70 }],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [4, 6], [6, 7]]
  },
  {
    name: "Virgo",
    vietnameseName: "Xử Nữ",
    stars: [{ x: 15, y: 20 }, { x: 30, y: 35 }, { x: 45, y: 30 }, { x: 60, y: 35 }, { x: 75, y: 45 }, { x: 40, y: 60 }, { x: 25, y: 75 }, { x: 55, y: 65 }, { x: 70, y: 80 }],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [5, 7], [7, 8]]
  },
  {
    name: "Libra",
    vietnameseName: "Thiên Bình",
    stars: [{ x: 50, y: 15 }, { x: 25, y: 45 }, { x: 75, y: 45 }, { x: 50, y: 75 }, { x: 25, y: 80 }],
    connections: [[0, 1], [0, 2], [1, 3], [2, 3], [1, 4]]
  },
  {
    name: "Scorpio",
    vietnameseName: "Bọ Cạp",
    stars: [{ x: 15, y: 15 }, { x: 30, y: 15 }, { x: 45, y: 20 }, { x: 40, y: 35 }, { x: 45, y: 50 }, { x: 55, y: 65 }, { x: 70, y: 65 }, { x: 80, y: 55 }, { x: 85, y: 40 }, { x: 75, y: 25 }],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]]
  },
  {
    name: "Sagittarius",
    vietnameseName: "Nhân Mã",
    stars: [{ x: 40, y: 15 }, { x: 60, y: 15 }, { x: 25, y: 35 }, { x: 45, y: 35 }, { x: 65, y: 35 }, { x: 35, y: 55 }, { x: 55, y: 55 }, { x: 45, y: 75 }],
    connections: [[0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [3, 6], [5, 6], [6, 7]]
  },
  {
    name: "Capricorn",
    vietnameseName: "Ma Kết",
    stars: [{ x: 15, y: 30 }, { x: 45, y: 25 }, { x: 80, y: 35 }, { x: 75, y: 65 }, { x: 50, y: 70 }, { x: 25, y: 55 }],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4]]
  },
  {
    name: "Aquarius",
    vietnameseName: "Bảo Bình",
    stars: [{ x: 15, y: 40 }, { x: 30, y: 30 }, { x: 45, y: 35 }, { x: 55, y: 20 }, { x: 70, y: 25 }, { x: 85, y: 45 }, { x: 60, y: 55 }, { x: 40, y: 65 }, { x: 25, y: 75 }],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6], [6, 7], [7, 8]]
  },
  {
    name: "Pisces",
    vietnameseName: "Song Ngư",
    stars: [{ x: 15, y: 15 }, { x: 30, y: 25 }, { x: 45, y: 35 }, { x: 60, y: 45 }, { x: 75, y: 55 }, { x: 85, y: 75 }, { x: 55, y: 75 }, { x: 35, y: 75 }, { x: 15, y: 65 }],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6], [6, 7], [7, 8], [8, 0]]
  }
];

interface SpaceBackgroundProps {
  introStep?: 'text' | 'opening' | 'complete';
}

export function SpaceBackground({ introStep = 'complete' }: SpaceBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Constellations Structure
    interface ConstellationInstance {
      name: string;
      vietnameseName: string;
      x: number;
      y: number;
      width: number;
      height: number;
      stars: { x: number; y: number; opacity: number; pulsePhase: number; speed: number }[];
      connections: [number, number][];
      glowOpacity: number;
      lineProgress: number; // 0 to 1 progressively connects the stars
      phase: 'spawn-stars' | 'draw-lines' | 'steady' | 'fade-out';
      phaseStartTime: number;
      steadyDuration: number;
    }

    const constellations: ConstellationInstance[] = [];
    let lastConstellationCheckTime = Date.now();

    // Star structure with balance and performance metadata
    interface Star {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      speed: number;
      isLarge: boolean;
    }

    // ========================================================================
    // CELLULAR STRATIFIED DISTRIBUTION ("Cho sao đều ra cả nửa trên & nửa dưới"):
    // Divides the screen into equal vertical bands (rows) and horizontal columns.
    // Mathematically guarantees that the upper half and lower half of the screen
    // receive EXACTLY 50% / 50% star density without any clumping or empty voids!
    // ========================================================================
    const generateBalancedStars = (w: number, h: number): Star[] => {
      const isMobile = w < 768;
      // Ideal star counts: mobile ~140-160 stars, desktop ~260-280 stars for high density without lag
      const rows = isMobile ? 16 : 14;
      const cols = isMobile ? 10 : 20;
      const newStars: Star[] = [];
      const cellW = w / cols;
      const cellH = h / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Add natural organic jitter within cell (10% to 90% bounds)
          const x = (c + 0.1 + Math.random() * 0.8) * cellW;
          const y = (r + 0.1 + Math.random() * 0.8) * cellH;

          // Natural distribution of star sizes:
          const randSize = Math.random();
          let radius = 0.6;
          let isLarge = false;

          if (randSize < 0.68) {
            radius = Math.random() * 0.35 + 0.5; // 0.5 to 0.85px fine cosmic dust
          } else if (randSize < 0.90) {
            radius = Math.random() * 0.4 + 0.95;  // 0.95 to 1.35px prominent stars
          } else {
            radius = Math.random() * 0.5 + 1.4;   // 1.4 to 1.9px glowing celestial jewels
            isLarge = true;
          }

          newStars.push({
            x,
            y,
            radius,
            opacity: Math.random() * 0.7 + 0.3,
            speed: (Math.random() * 0.007 + 0.003) * (Math.random() < 0.5 ? 1 : -1),
            isLarge,
          });
        }
      }
      return newStars;
    };

    let stars: Star[] = generateBalancedStars(width, height);

    // Handle Resize: Smooth proportional coordinate scaling
    // Prevents stars from clumping at the top when mobile address bars expand or shrink
    const handleResize = () => {
      if (!canvas) return;
      const oldWidth = width || window.innerWidth;
      const oldHeight = height || window.innerHeight;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      if (oldWidth > 0 && oldHeight > 0) {
        const scaleX = width / oldWidth;
        const scaleY = height / oldHeight;
        stars.forEach(star => {
          star.x *= scaleX;
          star.y *= scaleY;
        });
      }

      // Keep active constellations inside screen bounds
      constellations.forEach(c => {
        if (c.x + c.width > width) c.x = Math.max(20, width - c.width - 40);
        if (c.y + c.height > height) c.y = Math.max(20, height - c.height - 40);
      });
    };
    window.addEventListener('resize', handleResize);

    // Shooting Stars - Distributed throughout the sky
    interface ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      dx: number;
      dy: number;
      opacity: number;
      maxOpacity: number;
      fadeRate: number;
      active: boolean;
      trail: { x: number; y: number; opacity: number; size: number }[];
    }

    const shootingStars: ShootingStar[] = [];
    let lastShootingStarTime = 0;

    const createShootingStar = (): ShootingStar => {
      const startOpacity = Math.random() * 0.4 + 0.6;
      const fromTop = Math.random() < 0.6;
      let x = 0;
      let y = 0;
      if (fromTop) {
        // Spawn along top boundary across 0-85% width
        x = Math.random() * (width * 0.85);
        y = -20;
      } else {
        // Spawn along left boundary across 0-70% height
        x = -20;
        y = Math.random() * (height * 0.7);
      }

      return {
        x,
        y,
        length: Math.random() * 120 + 80,
        speed: Math.random() * 8 + 6,
        dx: Math.random() * 4 + 6, // Smooth trajectory crossing towards bottom-right
        dy: Math.random() * 3 + 3,
        opacity: startOpacity,
        maxOpacity: startOpacity,
        fadeRate: Math.random() * 0.008 + 0.004,
        active: true,
        trail: [],
      };
    };

    const startTime = Date.now();

    // Animation Loop
    const draw = () => {
      const elapsed = Date.now() - startTime;

      // Reset master canvas to pitch black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Layered Timeline Calculations:
      // If we're not complete yet, we stay pitch black ("tối om")
      let skyOpacity = 0;
      let starFactor = 0;

      if (introStep === 'complete') {
        // After loading screen, sky gradient fades in over 1.5 seconds
        skyOpacity = Math.min(1, elapsed / 1500);
        // Stars start to fade in 500ms after sky starts, brightening up over 2.0s
        starFactor = Math.min(1, Math.max(0, elapsed - 500) / 2000);
      }

      if (skyOpacity > 0) {
        // Draw deep space gradient with current opacity
        ctx.save();
        ctx.globalAlpha = skyOpacity;
        const gradient = ctx.createRadialGradient(
          width / 2,
          height / 2,
          10,
          width / 2,
          height / 2,
          width
        );
        gradient.addColorStop(0, '#020d1e'); // Dark cyan-blue deep space
        gradient.addColorStop(0.5, '#010814'); // Navy space
        gradient.addColorStop(1, '#000205'); // Absolute deep black
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // Draw Twinkling Stars (only when starFactor > 0)
      if (starFactor > 0) {
        // High-performance hardware-accelerated star rendering:
        // Replaces costly Gaussian shadowBlur with smooth dual-circle alpha halos.
        // This delivers buttery 60 FPS on mobile phones while preserving brilliant cosmic sparkle!
        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];
          const currentOpacity = star.opacity * starFactor;

          if (star.isLarge) {
            // Glowing jewel star: subtle soft ambient halo + white hot stellar core
            ctx.fillStyle = `rgba(186, 230, 253, ${currentOpacity * 0.28})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius * 2.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.98})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Fine & prominent twinkling dust stars
            ctx.fillStyle = `rgba(186, 230, 253, ${currentOpacity * 0.88})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
          }

          // Natural organic twinkle oscillation
          star.opacity += star.speed;
          if (star.opacity > 1 || star.opacity < 0.25) {
            star.speed = -star.speed;
          }
        }

        // Manage and Draw Shooting Stars (One active star, spawning roughly every 2.5 seconds)
        const now = Date.now();
        if (shootingStars.length === 0 && now - lastShootingStarTime > 2500) {
          shootingStars.push(createShootingStar());
          lastShootingStarTime = now;
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const ss = shootingStars[i];
          if (!ss.active) {
            shootingStars.splice(i, 1);
            continue;
          }

          // Lightweight dust trail behind shooting star
          if (Math.random() < 0.5 && ss.trail.length < 8) {
            ss.trail.push({
              x: ss.x,
              y: ss.y,
              opacity: ss.opacity * 0.5,
              size: Math.random() * 1.0 + 0.5
            });
          }

          // Update and Draw Trail Particles
          for (let t = ss.trail.length - 1; t >= 0; t--) {
            const p = ss.trail[t];
            p.opacity -= 0.035; // smooth fade
            if (p.opacity <= 0) {
              ss.trail.splice(t, 1);
            } else {
              ctx.fillStyle = `rgba(56, 189, 248, ${p.opacity * starFactor})`;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Draw shooting star path
          const tailX = ss.x - ss.dx * (ss.length / ss.speed);
          const tailY = ss.y - ss.dy * (ss.length / ss.speed);

          const ssGradient = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
          ssGradient.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity * starFactor})`);
          ssGradient.addColorStop(0.15, `rgba(56, 189, 248, ${ss.opacity * 0.95 * starFactor})`);
          ssGradient.addColorStop(0.5, `rgba(14, 165, 233, ${ss.opacity * 0.5 * starFactor})`);
          ssGradient.addColorStop(1, 'rgba(2, 132, 199, 0)');

          ctx.strokeStyle = ssGradient;
          ctx.lineWidth = ss.maxOpacity * 2.5;
          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          // Move
          ss.x += ss.dx;
          ss.y += ss.dy;
          ss.opacity -= ss.fadeRate;

          if (ss.opacity <= 0 || ss.x > width + 100 || ss.y > height + 100) {
            ss.active = false;
          }
        }

        // 🌌 Random Constellations Spawn: 5% chance every 10 seconds, only 1 constellation at a time
        if (now - lastConstellationCheckTime >= 10000) {
          lastConstellationCheckTime = now;
          if (Math.random() < 0.05 && constellations.length === 0) {
            const template = CONSTELLATION_TEMPLATES[Math.floor(Math.random() * CONSTELLATION_TEMPLATES.length)];
            
            const constWidth = Math.random() * 80 + 120; // 120px to 200px
            const constHeight = constWidth * 0.85;
            const padding = 80;
            const x = Math.random() * Math.max(20, width - constWidth - padding * 2) + padding;
            const y = Math.random() * Math.max(20, height - constHeight - padding * 2) + padding;

            constellations.push({
              name: template.name,
              vietnameseName: template.vietnameseName,
              x,
              y,
              width: constWidth,
              height: constHeight,
              stars: template.stars.map(s => ({
                x: s.x,
                y: s.y,
                opacity: Math.random() * 0.4 + 0.6,
                pulsePhase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.02 + 0.015
              })),
              connections: template.connections,
              glowOpacity: 0,
              lineProgress: 0,
              phase: 'spawn-stars',
              phaseStartTime: now,
              steadyDuration: Math.random() * 3000 + 7000 // 7 to 10 seconds steady
            });
          }
        }

        // Draw active constellations with multi-phase animation ("sao tạo nên hình r có nối theo")
        for (let i = constellations.length - 1; i >= 0; i--) {
          const c = constellations[i];
          const phaseElapsed = now - c.phaseStartTime;

          if (c.phase === 'spawn-stars') {
            // Phase 1: Stars appear and light up first
            c.glowOpacity = Math.min(1, phaseElapsed / 1400);
            c.lineProgress = 0;
            if (phaseElapsed >= 1400) {
              c.phase = 'draw-lines';
              c.phaseStartTime = now;
            }
          } else if (c.phase === 'draw-lines') {
            // Phase 2: Lines progressively trace from star to star
            c.glowOpacity = 1;
            c.lineProgress = Math.min(1, phaseElapsed / 2400); // 2.4s to trace all lines
            if (phaseElapsed >= 2400) {
              c.phase = 'steady';
              c.phaseStartTime = now;
            }
          } else if (c.phase === 'steady') {
            // Phase 3: Full constellation shines steadily
            c.glowOpacity = 1;
            c.lineProgress = 1;
            if (phaseElapsed >= c.steadyDuration) {
              c.phase = 'fade-out';
              c.phaseStartTime = now;
            }
          } else if (c.phase === 'fade-out') {
            // Phase 4: Smoothly fade back into the starry sky
            c.glowOpacity = Math.max(0, 1 - (phaseElapsed / 2000));
            if (c.glowOpacity <= 0) {
              constellations.splice(i, 1);
              continue;
            }
          }

          const currentGlow = c.glowOpacity * starFactor;
          if (currentGlow <= 0) continue;

          // Draw Progressive Connection Lines ("r có nối theo")
          if (c.lineProgress > 0) {
            ctx.save();
            ctx.strokeStyle = `rgba(14, 165, 233, ${0.28 * currentGlow})`;
            ctx.lineWidth = 1.0;
            ctx.setLineDash([3, 3]); // Elegant celestial dashed charts style!

            const totalLines = c.connections.length;
            c.connections.forEach(([i1, i2], idx) => {
              const s1 = c.stars[i1];
              const s2 = c.stars[i2];
              if (!s1 || !s2) return;

              const px1 = c.x + (s1.x / 100) * c.width;
              const py1 = c.y + (s1.y / 100) * c.height;
              const px2 = c.x + (s2.x / 100) * c.width;
              const py2 = c.y + (s2.y / 100) * c.height;

              // Progressively trace each line segment in sequence
              const lineStart = idx / totalLines;
              const lineEnd = (idx + 1) / totalLines;

              if (c.lineProgress <= lineStart) return;

              const segProgress = Math.min(1, Math.max(0, (c.lineProgress - lineStart) / (lineEnd - lineStart)));
              const currentX = px1 + (px2 - px1) * segProgress;
              const currentY = py1 + (py2 - py1) * segProgress;

              ctx.beginPath();
              ctx.moveTo(px1, py1);
              ctx.lineTo(currentX, currentY);
              ctx.stroke();

              // If line is currently being actively drawn, draw a subtle glowing pulse spark at the moving tip
              if (segProgress > 0 && segProgress < 1 && c.phase === 'draw-lines') {
                ctx.save();
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#38bdf8';
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(currentX, currentY, 1.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              }
            });
            ctx.restore();
          }

          // Draw Star Nodes in Constellation
          c.stars.forEach((s) => {
            const px = c.x + (s.x / 100) * c.width;
            const py = c.y + (s.y / 100) * c.height;

            // Pulse star brightness over time
            s.pulsePhase += s.speed;
            const pulseFactor = Math.sin(s.pulsePhase) * 0.35 + 0.65; // oscillates between 0.3 and 1.0
            const finalOpacity = s.opacity * pulseFactor * currentGlow;

            // Subtle glowing halo around constellation stars
            const haloGrad = ctx.createRadialGradient(px, py, 0, px, py, 7);
            haloGrad.addColorStop(0, `rgba(186, 230, 253, ${0.5 * finalOpacity})`);
            haloGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');
            ctx.fillStyle = haloGrad;
            ctx.beginPath();
            ctx.arc(px, py, 7, 0, Math.PI * 2);
            ctx.fill();

            // Core star point
            ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * finalOpacity})`;
            ctx.beginPath();
            ctx.arc(px, py, 1.6, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [introStep]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
    />
  );
}
