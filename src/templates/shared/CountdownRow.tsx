import { motion } from 'framer-motion';
import { TimeLeft } from './hooks';
import { ARABIC_DAYS, ARABIC_HOURS, ARABIC_MINUTES, ARABIC_SECONDS } from './types';

interface CountdownProps {
  time: TimeLeft;
  accent: string;
  text: string;
  subText: string;
  border: string;
  cardBg: string;
  title?: string;
}

export function CountdownRow({
  time,
  accent,
  text,
  subText,
  border,
  cardBg,
  title,
}: CountdownProps) {
  const units: { value: number; label: string }[] = [
    { value: time.days, label: ARABIC_DAYS },
    { value: time.hours, label: ARABIC_HOURS },
    { value: time.minutes, label: ARABIC_MINUTES },
    { value: time.seconds, label: ARABIC_SECONDS },
  ];

  return (
    <div className="w-full">
      {title && <h3 className={`text-center font-marcellus text-2xl md:text-3xl ${text} mb-5`}>{title}</h3>}
      <div className="grid grid-cols-4 gap-2 md:gap-3">
        {units.map((u, i) => (
          <motion.div
            key={u.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={`${cardBg} ${border} rounded-xl py-4 md:py-5 text-center`}
          >
            <motion.div
              key={u.value}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`font-cinzel text-2xl md:text-4xl ${accent}`}
            >
              {String(u.value).padStart(2, '0')}
            </motion.div>
            <div className={`mt-1 text-[10px] md:text-xs ${subText} font-reem`}>{u.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
