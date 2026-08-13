import { motion } from 'framer-motion';
import { BISMILLAH } from './types';

interface BismillahProps {
  accent: string;
  size?: string;
}

export function BismillahHeader({ accent, size = 'text-xl md:text-2xl' }: BismillahProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center"
    >
      <p className={`font-amiri ${size} ${accent} tracking-wide`}>{BISMILLAH}</p>
      <div className="mx-auto mt-2 w-24 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-50" />
    </motion.div>
  );
}

interface AmpersandProps {
  accent: string;
  size?: string;
}

export function GlowingAmpersand({ accent, size = 'text-6xl md:text-8xl' }: AmpersandProps) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 150, delay: 0.3 }}
      className={`font-vibes ${size} ${accent} leading-none`}
      style={{ textShadow: '0 0 24px currentColor, 0 0 48px currentColor' }}
    >
      &
    </motion.div>
  );
}

export function OrnamentalDivider({ accent, className = '' }: { accent: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 my-6 ${className}`}>
      <span className={`h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-current ${accent} opacity-60`} />
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className={`${accent} text-lg`}
      >
        ❖
      </motion.span>
      <span className={`h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-current ${accent} opacity-60`} />
    </div>
  );
}
