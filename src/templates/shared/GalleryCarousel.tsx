import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ARABIC_GALLERY,
} from './types';

interface GalleryProps {
  images: string[];
  accent: string;
  ring: string;
  bg: string;
  text: string;
  subText: string;
}

export function GalleryCarousel({ images, accent, ring, bg, text, subText }: GalleryProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = () => setLightbox(null);
  const prev = () => setLightbox((i) => (i === null ? null : (i + images.length - 1) % images.length));
  const next = () => setLightbox((i) => (i === null ? null : (i + 1) % images.length));

  return (
    <div className="w-full">
      <h3 className={`text-center font-marcellus text-2xl ${text} mb-6`}>{ARABIC_GALLERY}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {images.map((src, i) => (
          <motion.button
            key={src + i}
            onClick={() => setLightbox(i)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={`relative overflow-hidden rounded-xl ${ring} aspect-[4/3] group`}
          >
            <img
              src={src}
              alt={`wedding gallery ${i + 1}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <span className={`absolute inset-0 ${bg === 'dark' ? 'bg-black/30' : 'bg-black/10'} opacity-0 group-hover:opacity-100 transition-opacity`} />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4"
          >
            <button
              onClick={close}
              className="absolute top-5 right-5 text-white/80 hover:text-white transition"
              aria-label="close"
            >
              <X size={28} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute right-4 md:right-8 text-white/70 hover:text-white transition"
              aria-label="previous"
            >
              <ChevronRight size={40} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute left-4 md:left-8 text-white/70 hover:text-white transition"
              aria-label="next"
            >
              <ChevronLeft size={40} />
            </button>
            <motion.img
              key={lightbox}
              src={images[lightbox]}
              alt="preview"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[82vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
