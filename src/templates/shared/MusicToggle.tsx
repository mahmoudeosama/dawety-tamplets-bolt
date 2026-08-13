import { motion } from 'framer-motion';
import { Music, Volume2 } from 'lucide-react';

interface MusicProps {
  playing: boolean;
  toggle: () => void;
  accentSolid: string;
  ring: string;
}

export function MusicToggle({ playing, toggle, accentSolid, ring }: MusicProps) {
  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      className={`fixed bottom-5 right-5 z-[90] w-14 h-14 rounded-full ${accentSolid} ${ring} flex items-center justify-center shadow-2xl`}
      aria-label={playing ? 'pause music' : 'play music'}
    >
      {playing ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Volume2 size={22} className="text-white" />
        </motion.span>
      ) : (
        <Music size={22} className="text-white" />
      )}
      {playing && (
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-white/50"
          animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
