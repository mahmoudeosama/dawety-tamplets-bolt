import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Minus, Plus, Heart } from 'lucide-react';
import {
  ARABIC_ATTENDING,
  ARABIC_DECLINED,
  ARABIC_GUESTS,
  ARABIC_YOUR_NAME,
  ARABIC_CONFIRM,
  ARABIC_THANKS_ATTENDING,
  ARABIC_THANKS_DECLINED,
  ARABIC_RSVP,
} from './types';

interface RSVPProps {
  onRSVP?: (status: 'attending' | 'declined', count: number, name: string) => void;
  accent: string;
  accentSolid: string;
  text: string;
  subText: string;
  border: string;
  cardBg: string;
  inputBg: string;
  theme: 'dark' | 'light';
}

export function RSVPCard({
  onRSVP,
  accent,
  accentSolid,
  text,
  subText,
  border,
  cardBg,
  inputBg,
  theme,
}: RSVPProps) {
  const [status, setStatus] = useState<'attending' | 'declined' | null>(null);
  const [count, setCount] = useState(1);
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!status || !name.trim()) return;
    onRSVP?.(status, count, name.trim());
    setSubmitted(true);
  };

  const placeholderText = theme === 'dark' ? 'placeholder:text-white/40' : 'placeholder:text-black/40';

  return (
    <div className={`w-full ${cardBg} ${border} rounded-2xl p-6 md:p-8 shadow-xl`}>
      <h3 className={`text-center font-marcellus text-2xl md:text-3xl ${text} mb-1`}>{ARABIC_RSVP}</h3>
      <p className={`text-center text-sm ${subText} mb-6`}>يرجى تأكيد حضوركم قبل الموعد</p>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className={`mx-auto mb-4 w-16 h-16 rounded-full ${accentSolid} flex items-center justify-center`}
            >
              <Heart className="text-white" size={28} fill="white" />
            </motion.div>
            <p className={`font-reem text-lg ${text}`}>
              {status === 'attending' ? ARABIC_THANKS_ATTENDING : ARABIC_THANKS_DECLINED}
            </p>
            <p className={`mt-1 text-sm ${subText}`}>{name}</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStatus('attending')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                  status === 'attending'
                    ? `${accentSolid} text-white border-transparent`
                    : `${border} ${text} hover:${accent}`
                }`}
              >
                <Check size={18} />
                <span className="font-reem text-sm">{ARABIC_ATTENDING}</span>
              </button>
              <button
                onClick={() => setStatus('declined')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                  status === 'declined'
                    ? `${accentSolid} text-white border-transparent`
                    : `${border} ${text} hover:${accent}`
                }`}
              >
                <X size={18} />
                <span className="font-reem text-sm">{ARABIC_DECLINED}</span>
              </button>
            </div>

            <div>
              <label className={`block text-sm ${subText} mb-2`}>{ARABIC_GUESTS}</label>
              <div className={`flex items-center justify-between ${inputBg} ${border} rounded-xl px-4 py-2`}>
                <button
                  onClick={() => setCount((c) => Math.max(1, c - 1))}
                  className={`w-9 h-9 rounded-full ${accentSolid} text-white flex items-center justify-center`}
                  aria-label="decrease"
                >
                  <Minus size={16} />
                </button>
                <span className={`font-cinzel text-2xl ${text}`}>{count}</span>
                <button
                  onClick={() => setCount((c) => Math.min(10, c + 1))}
                  className={`w-9 h-9 rounded-full ${accentSolid} text-white flex items-center justify-center`}
                  aria-label="increase"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm ${subText} mb-2`}>{ARABIC_YOUR_NAME}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اكتب اسمك الكامل"
                className={`w-full ${inputBg} ${border} ${text} ${placeholderText} rounded-xl px-4 py-3 outline-none focus:ring-2 ${accent} transition`}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!status || !name.trim()}
              onClick={submit}
              className={`w-full py-3.5 rounded-xl font-reem text-base text-white ${accentSolid} disabled:opacity-40 disabled:cursor-not-allowed transition-opacity`}
            >
              {ARABIC_CONFIRM}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
