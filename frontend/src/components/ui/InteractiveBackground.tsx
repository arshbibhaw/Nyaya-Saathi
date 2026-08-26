"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

// --- Minimal 3D Simplex Noise Implementation ---
class SimplexNoise {
  private p: Uint8Array;
  private perm: Uint8Array;
  private permMod12: Uint8Array;

  constructor() {
    this.p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(Math.random() * 256);
    }
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  noise3D(xin: number, yin: number, zin: number) {
    const F3 = 1.0 / 3.0;
    const G3 = 1.0 / 6.0;
    let n0, n1, n2, n3;
    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);
    const t = (i + j + k) * G3;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    const z0 = zin - Z0;

    let i1, j1, k1;
    let i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1;
      } else {
        i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1;
      } else if (x0 < z0) {
        i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1;
      } else {
        i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
      }
    }

    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2.0 * G3;
    const y2 = y0 - j2 + 2.0 * G3;
    const z2 = z0 - k2 + 2.0 * G3;
    const x3 = x0 - 1.0 + 3.0 * G3;
    const y3 = y0 - 1.0 + 3.0 * G3;
    const z3 = z0 - 1.0 + 3.0 * G3;

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) n0 = 0.0;
    else {
      const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]] * 3;
      t0 *= t0;
      n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0);
    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) n1 = 0.0;
    else {
      const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] * 3;
      t1 *= t1;
      n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1);
    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) n2 = 0.0;
    else {
      const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] * 3;
      t2 *= t2;
      n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2);
    }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) n3 = 0.0;
    else {
      const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] * 3;
      t3 *= t3;
      n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3);
    }

    return 32.0 * (n0 + n1 + n2 + n3);
  }
}

const grad3 = new Float32Array([
  1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
  1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
  0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1,
]);

// Helper to normalize angle diffs for smooth shortest-path lerping
function angleLerp(current: number, target: number, amount: number) {
  let diff = target - current;
  // Normalize to [-PI, PI]
  diff = Math.atan2(Math.sin(diff), Math.cos(diff));
  return current + diff * amount;
}

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const simplex = new SimplexNoise();

    // Configuration
    const RESOLUTION = 24; // Spacing between vectors
    const LINE_LENGTH = 12;
    const NOISE_SCALE = 0.002;
    const TIME_SCALE = 0.0002;
    const MOUSE_RADIUS = 120;
    const LERP_FACTOR = 0.1; // Smoothing speed

    // Theme-aware stroke color
    const currentTheme = theme === "system" ? systemTheme : theme;
    const STROKE_STYLE = currentTheme === "dark"
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(15, 23, 42, 0.12)";

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Keep track of each vector's current angle for smooth interpolation
    const vectors: { currentAngle: number }[][] = [];
    
    const initVectors = () => {
      const cols = Math.floor(width / RESOLUTION) + 1;
      const rows = Math.floor(height / RESOLUTION) + 1;
      
      for (let i = 0; i < cols; i++) {
        if (!vectors[i]) vectors[i] = [];
        for (let j = 0; j < rows; j++) {
          if (!vectors[i][j]) vectors[i][j] = { currentAngle: 0 };
        }
      }
    };
    
    initVectors();

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initVectors();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = STROKE_STYLE;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";

      const cols = Math.floor(width / RESOLUTION) + 1;
      const rows = Math.floor(height / RESOLUTION) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * RESOLUTION;
          const y = j * RESOLUTION;

          // Base noise angle
          const noiseVal = simplex.noise3D(x * NOISE_SCALE, y * NOISE_SCALE, time * TIME_SCALE);
          let targetAngle = noiseVal * Math.PI * 2;

          // Mouse interaction (repel)
          const dx = x - mouseX;
          const dy = y - mouseY;
          const distSq = dx * dx + dy * dy;
          const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;

          if (distSq < MOUSE_RADIUS_SQ) {
            const force = 1 - Math.sqrt(distSq) / MOUSE_RADIUS;
            const repelAngle = Math.atan2(dy, dx);
            // Blend between natural flow and repel angle based on proximity
            targetAngle = angleLerp(targetAngle, repelAngle, force * 0.8);
          }

          const v = vectors[i][j];
          // Smoothly interpolate to the target angle
          v.currentAngle = angleLerp(v.currentAngle, targetAngle, LERP_FACTOR);

          // Draw the vector line
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(
            x + Math.cos(v.currentAngle) * LINE_LENGTH,
            y + Math.sin(v.currentAngle) * LINE_LENGTH
          );
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, [mounted, theme, systemTheme]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-[1] pointer-events-none"
      style={{ maskImage: "radial-gradient(ellipse at center, black 50%, transparent 100%)" }}
    />
  );
}
