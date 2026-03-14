import Tile from './Tile';
import { motion } from 'framer-motion';

const Row = ({ guess, evaluation, length, isCurrent, isInvalid }) => {
  const tiles = Array.from({ length });
  
  return (
    <motion.div 
      animate={isInvalid ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="grid gap-2 justify-center"
      style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
    >
      {tiles.map((_, i) => (
        <Tile 
          key={i} 
          value={guess?.[i] || ''} 
          status={evaluation?.[i]}
          delay={i * 0.1}
          isActive={isCurrent && i === guess?.length}
        />
      ))}
    </motion.div>
  );
};

export default Row;
