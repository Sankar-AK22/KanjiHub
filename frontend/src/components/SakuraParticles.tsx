import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  rotation: number;
}

export default function SakuraParticles() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const createPetals = () => {
      const newPetals: Petal[] = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 6,
        size: 8 + Math.random() * 14,
        opacity: 0.15 + Math.random() * 0.25,
        rotation: Math.random() * 360,
      }));
      setPetals(newPetals);
    };

    createPetals();
  }, []);

  return (
    <div className="sakura-container" aria-hidden="true">
      <AnimatePresence>
        {petals.map((petal) => (
          <motion.div
            key={petal.id}
            className="sakura-petal"
            initial={{
              x: `${petal.x}vw`,
              y: '-5vh',
              rotate: petal.rotation,
              opacity: 0,
            }}
            animate={{
              y: '105vh',
              x: `${petal.x + (Math.random() - 0.5) * 30}vw`,
              rotate: petal.rotation + 360,
              opacity: [0, petal.opacity, petal.opacity, 0],
            }}
            transition={{
              duration: petal.duration,
              delay: petal.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              position: 'fixed',
              width: petal.size,
              height: petal.size,
              borderRadius: '50% 0 50% 0',
              background: 'linear-gradient(135deg, #ffb7c5 0%, #ff8fa3 50%, #ffc2d1 100%)',
              pointerEvents: 'none',
              zIndex: 1,
              filter: 'blur(0.5px)',
              boxShadow: '0 0 4px rgba(255,183,197,0.3)',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
