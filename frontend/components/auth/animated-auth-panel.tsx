"use client";

import { motion, useReducedMotion, type TargetAndTransition, type Transition } from "framer-motion";

/* ── SVG shapes for decorative overlay ── */

function PawShape() {
  return (
    <>
      <ellipse cx="0" cy="10" rx="16" ry="13" />
      <ellipse cx="-13" cy="-7" rx="7" ry="6" />
      <ellipse cx="-5" cy="-15" rx="7" ry="6" />
      <ellipse cx="5" cy="-15" rx="7" ry="6" />
      <ellipse cx="13" cy="-7" rx="7" ry="6" />
    </>
  );
}

function HeartShape() {
  return (
    <path d="M0,-10 C0,-20,-16,-20,-16,-8 C-16,4,0,18,0,24 C0,18,16,4,16,-8 C16,-20,0,-20,0,-10Z" />
  );
}

function SparkleShape() {
  return (
    <path d="M0,-10 L2,-2 L10,0 L2,2 L0,10 L-2,2 L-10,0 L-2,-2Z" />
  );
}

/* ── Decorative data ── */

// [x, y, scale, opacity, rotation, delay, floatDist, duration]
const PAWS: [number, number, number, number, number, number, number, number][] = [
  [200, 300, 1.60, 0.14,  -8, 0.0, 9, 4.5],
  [ 85, 185, 0.80, 0.10,  28, 0.7, 7, 3.8],
  [320, 155, 0.75, 0.09, -33, 1.4, 7, 4.1],
  [ 80, 420, 0.90, 0.10,  22, 0.4, 8, 5.0],
  [315, 390, 0.95, 0.10, -18, 1.1, 7, 4.3],
  [330,  82, 0.55, 0.08, -28, 1.9, 5, 3.5],
  [ 60, 105, 0.52, 0.07,  25, 2.4, 5, 3.9],
  [200, 535, 0.70, 0.08,   5, 2.0, 6, 4.6],
  [340, 548, 0.50, 0.06, -18, 0.9, 5, 3.7],
  [ 36, 318, 0.48, 0.06,  40, 1.7, 4, 4.2],
];

// [x, y, scale, delay]
const HEARTS: [number, number, number, number][] = [
  [162, 272, 0.75, 0.5],
  [254, 432, 0.62, 2.2],
  [350, 230, 0.65, 4.0],
];

const SPARKLES: [number, number, number, number][] = [
  [358,  56, 0.95, 0.3],
  [ 44, 138, 0.78, 1.1],
  [356, 460, 0.88, 1.8],
  [ 44, 514, 0.74, 2.5],
  [294,  74, 0.68, 0.8],
];

/* ── Animal circle component ── */

interface AnimalCircleProps {
  src: string;
  size: number;
  left?: string;
  right?: string;
  top: string;
  reduced: boolean;
  animateProps?: TargetAndTransition;
  transition?: Transition;
  withRotate?: boolean;
}

function AnimalCircle({
  src, size, left, right, top, reduced, animateProps = {} as TargetAndTransition, transition = {}, withRotate = false,
}: AnimalCircleProps) {
  const half = size / 2;

  return (
    <div
      className="absolute"
      style={{
        left,
        right,
        top,
        marginLeft: left ? -half : undefined,
        marginRight: right ? -half : undefined,
        marginTop: -half,
      }}
    >
      {/* Glow behind circle */}
      <div
        className="absolute rounded-full bg-white/20 blur-xl"
        style={{ inset: -10 }}
      />
      <motion.div
        style={
          withRotate
            ? { transformBox: "fill-box", transformOrigin: "center" }
            : undefined
        }
        animate={reduced ? false : animateProps}
        transition={{ repeat: Infinity, ease: "easeInOut", ...transition }}
      >
        <div
          className="relative rounded-full overflow-hidden shadow-2xl"
          style={{
            width: size,
            height: size,
            border: "3px solid rgba(255,255,255,0.45)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main panel ── */

export function AnimatedAuthPanel({ variant }: { variant: "login" | "register" }) {
  const reduced = useReducedMotion() ?? false;

  const gradient =
    variant === "login"
      ? "from-primary-700 via-primary-600 to-secondary-600"
      : "from-secondary-700 via-secondary-600 to-primary-600";

  return (
    <div
      className={`hidden lg:flex h-full bg-gradient-to-br ${gradient} relative overflow-hidden`}
    >
      {/* Background blobs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── Animal photos ── */}

      {/* Perro — lower-left, float + gentle sway */}
      <AnimalCircle
        src="/animals/dog.jpg"
        size={118}
        left="15%"
        top="56%"
        reduced={reduced}
        withRotate
        animateProps={{ y: [0, -16, 0], rotate: [0, -2.5, 0, 2.5, 0] }}
        transition={{ duration: 4.2, delay: 0.2 }}
      />

      {/* Gato — upper-right, fluid sway */}
      <AnimalCircle
        src="/animals/cat.jpg"
        size={106}
        right="10%"
        top="18%"
        reduced={reduced}
        withRotate
        animateProps={{ y: [0, -12, 0], rotate: [0, 2, 0, -2, 0] }}
        transition={{ duration: 3.8, delay: 0.9 }}
      />

      {/* Conejo — upper-left, hop with pause */}
      <AnimalCircle
        src="/animals/rabbit.jpg"
        size={92}
        left="8%"
        top="20%"
        reduced={reduced}
        animateProps={{ y: [0, -20, 0] }}
        transition={{ duration: 1.4, delay: 0.5, repeatDelay: 1.6 }}
      />

      {/* Pájaro — lower-right, free flight */}
      <AnimalCircle
        src="/animals/bird.jpg"
        size={80}
        right="7%"
        top="72%"
        reduced={reduced}
        animateProps={{ x: [0, 18, 32, 18, 0], y: [0, -16, -7, -22, 0] }}
        transition={{ duration: 5.5, delay: 1.6 }}
      />

      {/* Hámster — lower-center, gentle float */}
      <AnimalCircle
        src="/animals/hamster.jpg"
        size={72}
        left="48%"
        top="83%"
        reduced={reduced}
        animateProps={{ y: [0, -10, 0] }}
        transition={{ duration: 3.4, delay: 1.0 }}
      />

      {/* ── SVG decorative overlay (paws, hearts, sparkles) ── */}
      <svg
        viewBox="0 0 400 600"
        className="absolute inset-0 w-full h-full pointer-events-none"
        fill="white"
        aria-hidden="true"
        role="presentation"
      >
        {/* Giant watermark paw */}
        <g transform="translate(200 310) rotate(-15) scale(8)" opacity="0.04">
          <PawShape />
        </g>

        {PAWS.map(([x, y, scale, opacity, rotation, delay, floatDist, duration], i) => (
          <motion.g
            key={`paw-${i}`}
            animate={reduced ? {} : { y: [0, -floatDist, 0] }}
            transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
          >
            <g transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`} opacity={opacity}>
              <PawShape />
            </g>
          </motion.g>
        ))}

        {HEARTS.map(([x, y, scale, delay], i) => (
          <motion.g
            key={`heart-${i}`}
            initial={{ opacity: 0.26 }}
            animate={
              reduced
                ? { opacity: 0.26 }
                : { y: [0, -16, 0], opacity: [0.26, 0.48, 0.26] }
            }
            transition={{ duration: 4.5 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay }}
          >
            <g transform={`translate(${x} ${y}) scale(${scale})`}>
              <HeartShape />
            </g>
          </motion.g>
        ))}

        {SPARKLES.map(([x, y, scale, delay], i) => (
          <motion.g
            key={`sparkle-${i}`}
            initial={{ opacity: 0.08 }}
            animate={
              reduced
                ? { opacity: 0.22 }
                : { opacity: [0.08, 0.40, 0.08] }
            }
            transition={{ duration: 2.8 + i * 0.15, repeat: Infinity, ease: "easeInOut", delay }}
          >
            <g transform={`translate(${x} ${y}) scale(${scale})`}>
              <SparkleShape />
            </g>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
