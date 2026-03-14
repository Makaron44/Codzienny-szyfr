import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#020617]">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ willChange: "transform" }}
        className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-emerald-500/5 blur-[80px] rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ willChange: "transform" }}
        className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-500/5 blur-[80px] rounded-full"
      />
    </div>
  );
};

export default AnimatedBackground;
