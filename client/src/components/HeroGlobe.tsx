import { useEffect, useRef, useMemo } from "react";
import { statisticalTests } from "@/lib/statsData";

// Golden Spiral method for evenly distributing points on a sphere
function distributePointsOnSphere(n: number) {
  const points = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

  for (let i = 0; i < n; i++) {
    // Avoid exact poles so items are never fully stationary
    const y = 0.9 - (i / (n - 1)) * 1.8; // y goes from 0.9 to -0.9
    const radius = Math.sqrt(1 - y * y); // radius at y

    const theta = phi * i; // golden angle increment

    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;

    points.push({ x, y, z });
  }

  return points;
}

export function HeroGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Take the first 45 short-named tests to map onto the sphere (avoids overcrowding)
  const testNames = useMemo(() => {
    return statisticalTests
      .filter((t) => t.name.length <= 20)
      .slice(0, 45)
      .map((t) => t.name);
  }, []);

  const spherePoints = useMemo(() => distributePointsOnSphere(testNames.length), [testNames]);

  useEffect(() => {
    if (!containerRef.current) return;

    // We update the rotation strictly via requestAnimationFrame to avoid React state overhead
    let animationFrameId: number;
    // Current rotation angle
    let angleY = 0;

    // Fixed tilt to keep the spin axis vertical but slightly angled (approx 17 degrees)
    const angleX = 0.3;

    const radius = 340; // Increased radius for better spread

    const isOpera = typeof navigator !== "undefined" && /Opera|OPR\//.test(navigator.userAgent);

    const updateSphere = () => {
      // Rotate the sphere very slowly
      angleY += 0.0004;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      itemsRef.current.forEach((el, index) => {
        if (!el) return;
        const p = spherePoints[index];

        // 3D rotation matrix (applying Y-axis rotation, then X-axis rotation)
        const rotY_x = p.x * cosY - p.z * sinY;
        const rotY_z = p.x * sinY + p.z * cosY;

        const rotX_y = p.y * cosX - rotY_z * sinX;
        const rotX_z = p.y * sinX + rotY_z * cosX;

        // Apply perspective sizing and opacity based on Z depth
        const projectedZ = rotX_z;
        // Map Z depth (-1 to 1) to scale (0.5 to 1) and opacity (0.1 to 0.7)
        const depthRatio = (projectedZ + 1) / 2;

        // Apply radius size and flatten geometry into an ellipse (stretch X, squash Y)
        const renderX = rotY_x * radius * 1.6;
        const renderY = rotX_y * radius * 0.4;

        // Items in front are larger and opaque. Items in back are smaller and transparent.
        const scale = 0.8 + depthRatio * 0.4;
        const opacity = 0.25 + depthRatio * 0.75;

        // Z-index sorting so front items draw over back items
        const newZIndex = Math.floor(depthRatio * 100).toString();

        // Calculate final pixel positions (centering is handled by CSS left-1/2 top-1/2 on the parent)
        // We use a single translate3d string to allow the browser compositor to bypass CSS function parsing.
        // The -50% centering is baked into the CSS classes `left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`
        el.style.transform = `translate3d(${renderX}px, ${renderY}px, 0) scale(${scale})`;
        el.style.opacity = opacity.toFixed(3); // Fix precision to reduce string allocation thrashing

        // Only update zIndex if it actually changed to prevent expensive layout thrashing in Chromium/Opera
        if (el.style.zIndex !== newZIndex) {
          el.style.zIndex = newZIndex;
        }
      });

      // If Opera, do not queue the next frame (leave it static after first layout)
      if (!isOpera) {
        animationFrameId = requestAnimationFrame(updateSphere);
      }
    };

    updateSphere();

    return () => {
      if (!isOpera && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [spherePoints]);

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none flex items-center justify-center transform-gpu"
      style={{ willChange: "transform" }}
    >
      {/* Vignette Overlay for smooth edges using solid inline CSS to guarantee parsing */}
      <div
        className="absolute inset-0 z-50 pointer-events-none transform-gpu"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, hsl(var(--background)) 55%)",
          willChange: "transform",
        }}
      />

      {/* Sphere Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center pointer-events-none transform-gpu"
        style={{ willChange: "transform" }}
      >
        {testNames.map((name, i) => (
          <div
            key={i}
            ref={(el) => (itemsRef.current[i] = el)}
            // Added -translate-x-1/2 -translate-y-1/2 here so we don't have to calculate it in the JS loop
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-semibold transition-colors duration-200"
            style={{
              willChange: "transform, opacity",
            }}
          >
            {/* The individual text nodes without backgrounds/borders or expensive drop-shadows */}
            <div className="text-foreground/70 font-medium whitespace-nowrap">{name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
