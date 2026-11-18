import React, { useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';

export function MusicVisualizer() {
  const { isPlaying, isMuted, volume, getAudioData } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isPlayingRef = useRef(isPlaying);
  const isMutedRef = useRef(isMuted);
  const volumeRef = useRef(volume);

  isPlayingRef.current = isPlaying;
  isMutedRef.current = isMuted;
  volumeRef.current = volume;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Smoothed audio reactivity with snappy attack for loud beats
    let smoothBass = 0;
    let smoothMid = 0;
    let smoothTreble = 0;
    let globalVisualizerAlpha = 0;
    let rotationPhase = 0; // Slow graceful rotation
    let colorCycleHue = 0; // Dynamic continuous color cycling
    let wavePhase = 0;

    // Radiant shockwave rings emitted when loud sound / heavy bass drops occur
    interface Shockwave {
      radius: number;
      maxRadius: number;
      opacity: number;
      hue: number;
      speed: number;
    }
    const shockwaves: Shockwave[] = [];
    let lastShockwaveTime = 0;

    const barCount = 52;
    const innerWavePoints = 48;
    const sideWavePoints = 38;
    const leftPeaks = new Float32Array(sideWavePoints);
    const rightPeaks = new Float32Array(sideWavePoints);

    const render = () => {
      animId = requestAnimationFrame(render);

      const isActive = isPlayingRef.current && !isMutedRef.current && volumeRef.current > 0;
      const targetAlpha = isActive ? 1 : 0;
      globalVisualizerAlpha += (targetAlpha - globalVisualizerAlpha) * 0.08;

      if (globalVisualizerAlpha < 0.005) {
        ctx.clearRect(0, 0, width, height);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.globalAlpha = globalVisualizerAlpha;

      const audioData = getAudioData();
      const { frequencyData, bassEnergy, midEnergy, trebleEnergy } = audioData;

      // Snappy attack on sudden loud beats, smooth natural release
      const bassAttack = bassEnergy > smoothBass ? 0.35 : 0.18;
      smoothBass += (bassEnergy - smoothBass) * bassAttack;
      smoothMid += (midEnergy - smoothMid) * 0.20;
      smoothTreble += (trebleEnergy - smoothTreble) * 0.24;

      // Rotates gracefully, speeding up slightly with music intensity
      rotationPhase += 0.003 + smoothBass * 0.004;
      colorCycleHue = (colorCycleHue + 0.7 + smoothBass * 1.2) % 360;
      wavePhase += 0.06 + smoothBass * 0.10;

      // Position: placed comfortably below the interactive buttons
      const btnEl = document.getElementById('cosmic-volume-btn') || document.getElementById('cosmic-projects-btn');
      let cx = width / 2;
      let cy = height * 0.72;

      if (btnEl) {
        const rect = btnEl.getBoundingClientRect();
        cy = Math.min(height - 85, rect.bottom + 70);
      }

      // ============================================================
      // ENHANCED DYNAMIC SIZING ON LOUD SOUND (+0.75x intensity / 1.75x factor):
      // Noticeably punchier expansion and bar reach on loud beats while retaining clean symmetry
      // ============================================================
      const isMobile = width < 768;
      const bassScale = Math.pow(smoothBass, 1.18);
      // Scaled up by ~1.75x: radius expands 26px -> ~38px on loud beats
      const baseSpectrumRadius = 26 + bassScale * 12;
      const innerBaseRadius = 13.5 + bassScale * 6.8;
      // Bars reach ~38-46px on crests
      const dynamicMaxBarHeight = isMobile 
        ? (19 + bassScale * 18) 
        : (21 + bassScale * 24.5);

      // Radiant shockwave ring on distinct beat peaks
      const now = Date.now();
      if (bassEnergy > 0.68 && now - lastShockwaveTime > 320) {
        shockwaves.push({
          radius: baseSpectrumRadius + 2,
          maxRadius: baseSpectrumRadius + 28 + smoothBass * 18,
          opacity: 0.78,
          hue: colorCycleHue,
          speed: 2.0 + smoothBass * 1.6,
        });
        lastShockwaveTime = now;
      }

      // Render expanding shockwaves
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += sw.speed;
        const progress = (sw.radius - baseSpectrumRadius) / (sw.maxRadius - baseSpectrumRadius);
        sw.opacity = Math.max(0, 0.78 * (1 - progress));

        if (sw.opacity <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(s, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(cx, cy, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${sw.hue}, 95%, 75%, ${sw.opacity * 0.55})`;
        ctx.lineWidth = Math.max(0.7, 1.5 * (1 - progress));
        ctx.stroke();
      }

      // ============================================================
      // 0. INNER GLOWING REACTOR CORE (Tỏa sáng rõ nét khi có âm thanh lớn)
      // ============================================================
      if (smoothBass > 0.12) {
        const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerBaseRadius);
        coreGlow.addColorStop(0, `hsla(${colorCycleHue}, 100%, 85%, ${smoothBass * 0.44})`);
        coreGlow.addColorStop(0.7, `hsla(${colorCycleHue}, 95%, 68%, ${smoothBass * 0.22})`);
        coreGlow.addColorStop(1, `hsla(${colorCycleHue}, 90%, 55%, 0)`);
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, innerBaseRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // ============================================================
      // 1. INNER ROTATING & AUDIO-REACTIVE NEON WAVE
      // ============================================================
      const innerStep = (Math.PI * 2) / innerWavePoints;

      ctx.beginPath();
      for (let i = 0; i <= innerWavePoints; i++) {
        const idx = i % innerWavePoints;
        const half = innerWavePoints / 2;
        const distFromHalf = Math.abs(idx - half) / half;
        
        const freqIndex = Math.min(
          frequencyData.length - 1,
          Math.floor((1 - distFromHalf) * (frequencyData.length * 0.45))
        );
        const rawVal = (frequencyData[freqIndex] || 0) / 255;
        
        // Scaled ripple amplitude (+75% reactivity)
        const waveOffset = (rawVal * 5.8 + bassScale * 5.8) * (0.45 + 0.55 * Math.sin(idx * 0.55 + wavePhase * 1.6));
        const r = innerBaseRadius + waveOffset;
        
        // Rotate in sync
        const a = idx * innerStep + rotationPhase * 1.25;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();

      const innerHue = (colorCycleHue + 180) % 360;
      ctx.strokeStyle = `hsla(${innerHue}, 95%, 75%, ${0.74 + smoothBass * 0.24})`;
      ctx.lineWidth = 1.6 + smoothBass * 0.65;
      if (!isMobile) {
        ctx.shadowColor = `hsl(${innerHue}, 90%, 65%)`;
        ctx.shadowBlur = 4;
      }
      ctx.stroke();
      if (!isMobile) ctx.shadowBlur = 0;

      // ============================================================
      // 2. 360° CIRCULAR SPECTRUM BARS (NHẢY MẠNH MẼ HƠN 1.75X KHI ÂM THANH LỚN)
      // ============================================================
      const angleStep = (Math.PI * 2) / barCount;
      if (!isMobile) {
        ctx.shadowBlur = 2;
      }

      for (let i = 0; i < barCount; i++) {
        const half = barCount / 2;
        const distFromHalf = Math.abs(i - half) / half;
        const freqIndex = Math.min(
          frequencyData.length - 1,
          Math.floor((1 - distFromHalf) * (frequencyData.length * 0.55))
        );

        const rawVal = (frequencyData[freqIndex] || 0) / 255;
        // Scaled bar response (+75% loudness reaction)
        const barHeight = Math.max(2.5, Math.pow(rawVal, 1.1) * dynamicMaxBarHeight * (0.38 + smoothBass * 0.78));

        // Slow graceful rotation
        const angle = i * angleStep + rotationPhase;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const startX = cx + cos * baseSpectrumRadius;
        const startY = cy + sin * baseSpectrumRadius;
        const endX = cx + cos * (baseSpectrumRadius + barHeight);
        const endY = cy + sin * (baseSpectrumRadius + barHeight);

        // Continuous rainbow color shift
        const barHue = (colorCycleHue + i * (360 / barCount)) % 360;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `hsla(${barHue}, 94%, 68%, ${0.7 + rawVal * 0.3})`;
        ctx.lineWidth = 1.8 + smoothBass * 0.6;
        ctx.lineCap = 'round';
        if (!isMobile) {
          ctx.shadowColor = `hsl(${barHue}, 90%, 60%)`;
        }
        ctx.stroke();

        // Subtle glowing crest tip on prominent beats
        if (barHeight > 18) {
          ctx.fillStyle = `hsla(${barHue}, 100%, 88%, ${0.55 + rawVal * 0.4})`;
          ctx.beginPath();
          ctx.arc(endX, endY, 1.1 + rawVal * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (!isMobile) ctx.shadowBlur = 0;

      // Base boundary circle under the bars
      ctx.beginPath();
      ctx.arc(cx, cy, baseSpectrumRadius - 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${colorCycleHue}, 90%, 75%, ${0.4 + smoothBass * 0.4})`;
      ctx.lineWidth = 1.25 + smoothBass * 1.2;
      ctx.stroke();

      // ============================================================
      // 3. TWO SIDE AUDIO WAVEFORM LINES
      // ============================================================
      const sideArmLength = Math.min(190, width * 0.28);
      const startGap = baseSpectrumRadius + dynamicMaxBarHeight * 0.48 + 6;

      // Left Line: Gentle subtle vibration
      for (let j = 0; j < sideWavePoints; j++) {
        const ratio = j / sideWavePoints;
        const freqIdx = Math.min(frequencyData.length - 1, Math.floor(ratio * 35));
        const raw = (frequencyData[freqIdx] || 0) / 255;
        
        // Gentle amplitude (3px - 6px peak)
        const targetAmp = raw * (4.5 + smoothBass * 4.5) * Math.sin((1 - ratio) * Math.PI);
        leftPeaks[j] += (targetAmp - leftPeaks[j]) * 0.25;
      }

      ctx.beginPath();
      for (let j = 0; j < sideWavePoints; j++) {
        const ratio = j / sideWavePoints;
        const xPos = cx - startGap - ratio * sideArmLength;
        
        const sign = (j % 2 === 0 ? 1 : -1);
        const yOffset = sign * leftPeaks[j] * (0.8 + 0.2 * Math.sin(j * 0.7 + wavePhase));
        const yPos = cy + yOffset;

        if (j === 0) {
          ctx.moveTo(xPos, yPos);
        } else {
          ctx.lineTo(xPos, yPos);
        }
      }
      const leftGrad = ctx.createLinearGradient(cx - startGap - sideArmLength, cy, cx - startGap, cy);
      leftGrad.addColorStop(0, `hsla(${(colorCycleHue + 160) % 360}, 90%, 65%, 0)`);
      leftGrad.addColorStop(0.4, `hsla(${(colorCycleHue + 100) % 360}, 90%, 65%, 0.6)`);
      leftGrad.addColorStop(1, `hsla(${colorCycleHue}, 90%, 65%, 0.9)`);

      ctx.strokeStyle = leftGrad;
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      if (!isMobile) {
        ctx.shadowColor = `hsl(${colorCycleHue}, 90%, 65%)`;
        ctx.shadowBlur = 3;
      }
      ctx.stroke();
      if (!isMobile) ctx.shadowBlur = 0;

      // Right Line: Gentle subtle vibration
      for (let j = 0; j < sideWavePoints; j++) {
        const ratio = j / sideWavePoints;
        const freqIdx = Math.min(frequencyData.length - 1, Math.floor(ratio * 35));
        const raw = (frequencyData[freqIdx] || 0) / 255;
        
        const targetAmp = raw * (4.5 + smoothBass * 4.5) * Math.sin((1 - ratio) * Math.PI);
        rightPeaks[j] += (targetAmp - rightPeaks[j]) * 0.25;
      }

      ctx.beginPath();
      for (let j = 0; j < sideWavePoints; j++) {
        const ratio = j / sideWavePoints;
        const xPos = cx + startGap + ratio * sideArmLength;
        
        const sign = (j % 2 === 0 ? 1 : -1);
        const yOffset = sign * rightPeaks[j] * (0.8 + 0.2 * Math.cos(j * 0.7 - wavePhase));
        const yPos = cy + yOffset;

        if (j === 0) {
          ctx.moveTo(xPos, yPos);
        } else {
          ctx.lineTo(xPos, yPos);
        }
      }
      const rightGrad = ctx.createLinearGradient(cx + startGap, cy, cx + startGap + sideArmLength, cy);
      rightGrad.addColorStop(0, `hsla(${colorCycleHue}, 90%, 65%, 0.9)`);
      rightGrad.addColorStop(0.6, `hsla(${(colorCycleHue + 60) % 360}, 90%, 65%, 0.6)`);
      rightGrad.addColorStop(1, `hsla(${(colorCycleHue + 160) % 360}, 90%, 65%, 0)`);

      ctx.strokeStyle = rightGrad;
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      if (!isMobile) {
        ctx.shadowColor = `hsl(${(colorCycleHue + 60) % 360}, 90%, 65%)`;
        ctx.shadowBlur = 3;
      }
      ctx.stroke();
      if (!isMobile) ctx.shadowBlur = 0;

      ctx.restore();
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [getAudioData]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
}
