import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
}

const colors = [
  "hsl(328, 100%, 50%)",
  "hsl(190, 100%, 50%)",
  "hsl(54, 100%, 50%)",
  "hsl(270, 100%, 57%)",
  "hsl(150, 100%, 50%)",
];

export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const p: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 0.5,
      size: 6 + Math.random() * 8,
    }));
    setParticles(p);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: 0, rotate: 360 + Math.random() * 360 }}
          transition={{ duration: 2 + Math.random(), delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
