import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Sparkles, MapPin, X, Check, Minus, Plus, Heart, Navigation } from 'lucide-react';
import {
  SharedInvitationProps,
  DEFAULT_INVITATION,
  DEFAULT_GALLERY,
  BISMILLAH,
  ARABIC_DAYS,
  ARABIC_HOURS,
  ARABIC_MINUTES,
  ARABIC_SECONDS,
  ARABIC_ATTENDING,
  ARABIC_DECLINED,
  ARABIC_GUESTS,
  ARABIC_YOUR_NAME,
  ARABIC_CONFIRM,
  ARABIC_THANKS_ATTENDING,
  ARABIC_THANKS_DECLINED,
  ARABIC_OPEN_MAP,
  ARABIC_GALLERY,
  ARABIC_RSVP,
  ARABIC_OUR_STORY,
  ARABIC_INVITES_YOU,
} from './shared/types';
import { useCountdown, useAmbientMusic, useLockBody, TimeLeft } from './shared/hooks';
import { MusicToggle } from './shared/MusicToggle';

const fmtDate = (d: string) =>
  new Intl.DateTimeFormat('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d));

/* ── Arabesque arch SVG frame ── */
function ArchFrame({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 280" className={className} fill="none" preserveAspectRatio="none">
      <path d="M100 0 C40 0 10 60 10 140 L10 270 L190 270 L190 140 C190 60 160 0 100 0 Z"
        stroke="currentColor" strokeWidth="2" />
      <path d="M100 12 C50 12 22 65 22 142 L22 258 L178 258 L178 142 C178 65 150 12 100 12 Z"
        stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

/* ── Sundial countdown (unique to Emerald) ── */
function SundialCountdown({ time }: { time: TimeLeft }) {
  const units = [
    { value: time.days, label: ARABIC_DAYS },
    { value: time.hours, label: ARABIC_HOURS },
    { value: time.minutes, label: ARABIC_MINUTES },
    { value: time.seconds, label: ARABIC_SECONDS },
  ];
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* sundial base */}
      <div className="relative bg-emerald-deep/60 border border-emerald-gold/25 rounded-3xl p-6 overflow-hidden">
        {/* geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'repeating-conic-gradient(rgba(212,184,118,0.3) 0deg 10deg, transparent 10deg 20deg)' }} />
        <div className="relative grid grid-cols-4 gap-2">
          {units.map((u, i) => (
            <div key={u.label} className="text-center">
              {/* gnomon shadow effect */}
              <div className="relative mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full border border-emerald-gold/30 flex items-center justify-center bg-emerald-deep/80">
                <motion.div
                  key={u.value}
                  initial={{ rotate: -15, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="font-cinzel text-xl md:text-2xl text-emerald-gold"
                >
                  {String(u.value).padStart(2, '0')}
                </motion.div>
                {/* sundial gnomon line */}
                <div className="absolute top-1 left-1/2 w-px h-3 bg-emerald-gold/40 origin-bottom" />
              </div>
              <div className="mt-2 text-[10px] md:text-xs text-emerald-gold/60 font-reem">{u.label}</div>
            </div>
          ))}
        </div>
        {/* base plate */}
        <div className="mt-4 h-2 rounded-full bg-gradient-to-r from-transparent via-emerald-gold/30 to-transparent" />
      </div>
    </div>
  );
}

/* ── Masonry garden gallery (unique to Emerald) ── */
function MasonryGallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const heights = ['h-32', 'h-48', 'h-40', 'h-56', 'h-36', 'h-44'];

  return (
    <div className="w-full">
      <h3 className="text-center font-marcellus text-2xl text-emerald-gold mb-6">{ARABIC_GALLERY}</h3>
      <div className="columns-2 md:columns-3 gap-3 space-y-3">
        {images.map((src, i) => (
          <motion.button
            key={src + i}
            onClick={() => setLightbox(i)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.03 }}
            className={`relative w-full ${heights[i % heights.length]} overflow-hidden rounded-xl border border-emerald-gold/20 break-inside-avoid block`}
          >
            <img src={src} alt={`photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/40 to-transparent" />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[120] bg-emerald-deep/95 flex items-center justify-center p-4">
            <button className="absolute top-5 right-5 text-emerald-gold/80 hover:text-emerald-gold" onClick={() => setLightbox(null)}><X size={28} /></button>
            <motion.img key={lightbox} src={images[lightbox]} alt="preview"
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-h-[82vh] max-w-[92vw] rounded-lg object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TemplateEmeraldSanctuary(props: SharedInvitationProps) {
  const {
    groomName = DEFAULT_INVITATION.groomName,
    brideName = DEFAULT_INVITATION.brideName,
    weddingDate = DEFAULT_INVITATION.weddingDate,
    time = DEFAULT_INVITATION.time,
    venueName = DEFAULT_INVITATION.venueName,
    venueAddress = DEFAULT_INVITATION.venueAddress,
    storyText = 'كزرعنا المحبة في حدائق القلوب، وأينعت بأغصان المودة. نسأل الله أن يبارك في جمعنا ويجعل حياتنا جنةً من الأنس.',
    latitude, longitude,
    galleryImages = DEFAULT_GALLERY,
    onRSVP,
  } = props;

  const [opened, setOpened] = useState(false);
  const timeLeft = useCountdown(weddingDate);
  const music = useAmbientMusic();
  useLockBody(!opened);

  const fireflies = useMemo(
    () => Array.from({ length: 18 }, () => ({
      x: Math.random() * 100, y: Math.random() * 100,
      delay: Math.random() * 4, duration: 4 + Math.random() * 4,
    })), []
  );

  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'declined' | null>(null);
  const [rsvpCount, setRsvpCount] = useState(1);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpDone, setRsvpDone] = useState(false);

  const lat = latitude ?? 30.0074;
  const lng = longitude ?? 31.4913;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="relative min-h-screen bg-emerald-deep text-emerald-gold overflow-hidden font-reem" dir="rtl">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] rounded-full bg-emerald-mid/40 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-gold/8 blur-[120px]" />
      </div>
      <div className="pointer-events-none fixed inset-0">
        {fireflies.map((f, i) => (
          <motion.span key={i} className="absolute w-1.5 h-1.5 rounded-full bg-emerald-gold"
            style={{ left: `${f.x}%`, top: `${f.y}%` }}
            animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: f.duration, delay: f.delay, repeat: Infinity }} />
        ))}
      </div>
      <MusicToggle playing={music.playing} toggle={music.toggle} accentSolid="bg-gradient-to-br from-emerald-gold to-emerald-mid" ring="ring-2 ring-emerald-gold/40" />

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="gate" exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.7 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4 perspective-2000">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
              <Leaf className="mx-auto text-emerald-gold mb-3" size={44} />
              <p className="font-amiri text-2xl text-emerald-gold">بوابة الزمرد</p>
            </motion.div>

            <div className="relative w-[280px] h-[440px] md:w-[380px] md:h-[560px]">
              <div className="absolute inset-0 rounded-t-[50%] border-[3px] border-emerald-gold shadow-[0_0_50px_rgba(212,184,118,0.3)]" />
              <div className="absolute inset-3 rounded-t-[48%] border border-emerald-gold/40 overflow-hidden bg-emerald-deep/80">
                <div className="absolute inset-0 opacity-30"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 14px, rgba(212,184,118,0.4) 14px 15px), repeating-linear-gradient(-45deg, transparent 0 14px, rgba(212,184,118,0.4) 14px 15px)' }} />
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity }}
                  className="absolute top-8 left-1/2 -translate-x-1/2 text-emerald-gold text-3xl">❁</motion.div>
              </div>
              <motion.div onClick={() => setOpened(true)} className="absolute top-0 right-1/2 w-1/2 h-full origin-right cursor-pointer preserve-3d"
                animate={opened ? { x: '110%' } : { x: 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-gradient-to-l from-emerald-mid to-emerald-deep border-l border-emerald-gold/50 rounded-tr-[50%]">
                  <div className="absolute inset-3 border border-emerald-gold/30 rounded-tr-[48%]" />
                  <div className="absolute top-1/2 right-3 w-2 h-14 bg-emerald-gold rounded-full" />
                </div>
              </motion.div>
              <motion.div onClick={() => setOpened(true)} className="absolute top-0 left-1/2 w-1/2 h-full origin-left cursor-pointer preserve-3d"
                animate={opened ? { x: '-110%' } : { x: 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-mid to-emerald-deep border-r border-emerald-gold/50 rounded-tl-[50%]">
                  <div className="absolute inset-3 border border-emerald-gold/30 rounded-tl-[48%]" />
                  <div className="absolute top-1/2 left-3 w-2 h-14 bg-emerald-gold rounded-full" />
                </div>
              </motion.div>
              <AnimatePresence>
                {opened && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 3, opacity: 0 }} transition={{ duration: 1.5 }}
                      className="w-32 h-32 rounded-full bg-emerald-gold/30 blur-xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button onClick={() => setOpened(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-10 px-8 py-4 rounded-full bg-gradient-to-br from-emerald-gold to-emerald-mid text-emerald-deep font-reem text-lg shadow-[0_0_30px_rgba(212,184,118,0.4)] flex items-center gap-2">
              <Sparkles size={18} /> افتح البوابة الزمردية
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="invite" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 max-w-3xl mx-auto px-4 py-12">

            {/* Bismillah inside arch */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center mb-12">
              <div className="relative w-56 h-40 flex items-center justify-center">
                <ArchFrame className="absolute inset-0 w-full h-full text-emerald-gold/30" />
                <p className="font-amiri text-lg text-emerald-gold text-center px-4">{BISMILLAH}</p>
              </div>
            </motion.div>

            {/* Zigzag garden-path sections — alternating left/right */}
            {/* Section 1: Groom (right side) */}
            <div className="flex justify-end mb-8">
              <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="max-w-xs bg-emerald-deep/60 border border-emerald-gold/25 rounded-2xl p-6 text-center">
                <p className="text-emerald-gold/60 text-sm mb-1">العريس</p>
                <h2 className="font-amiri text-4xl text-emerald-gold" style={{ textShadow: '0 0 20px rgba(212,184,118,0.3)' }}>{groomName}</h2>
              </motion.div>
            </div>

            {/* Connector — stepping stone */}
            <div className="flex justify-center mb-8">
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="font-vibes text-5xl text-emerald-gold" style={{ textShadow: '0 0 24px currentColor' }}>&</motion.div>
            </div>

            {/* Section 2: Bride (left side) */}
            <div className="flex justify-start mb-8">
              <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="max-w-xs bg-emerald-deep/60 border border-emerald-gold/25 rounded-2xl p-6 text-center">
                <p className="text-emerald-gold/60 text-sm mb-1">العروس</p>
                <h2 className="font-amiri text-4xl text-emerald-gold" style={{ textShadow: '0 0 20px rgba(212,184,118,0.3)' }}>{brideName}</h2>
              </motion.div>
            </div>

            {/* Date & time centered */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-center mb-12 py-4 border-y border-emerald-gold/20">
              <p className="font-reem text-emerald-gold/90 text-lg">{fmtDate(weddingDate)}</p>
              <p className="font-reem text-emerald-gold/60">{time}</p>
            </motion.div>

            {/* Sundial countdown */}
            <div className="mb-12">
              <h3 className="text-center font-marcellus text-2xl text-emerald-gold mb-6">العد التنازلي للزفاف</h3>
              <SundialCountdown time={timeLeft} />
            </div>

            {/* Story as garden inscription stone */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mb-12 relative bg-emerald-mid/40 border border-emerald-gold/20 rounded-2xl p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-deep px-4 text-emerald-gold text-2xl">❁</div>
              <h3 className="text-center font-marcellus text-xl text-emerald-gold mb-4 mt-2">{ARABIC_OUR_STORY}</h3>
              <p className="font-amiri text-lg leading-loose text-emerald-gold/75 text-center">{storyText}</p>
            </motion.div>

            {/* Masonry gallery */}
            <div className="mb-12">
              <MasonryGallery images={galleryImages} />
            </div>

            {/* Venue as garden gate card */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mb-12 bg-emerald-deep/60 border border-emerald-gold/25 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <MapPin size={20} className="text-emerald-gold" />
                <h3 className="font-marcellus text-xl text-emerald-gold">موقع الحفل</h3>
              </div>
              <p className="font-reem text-lg text-emerald-gold">{venueName}</p>
              <p className="text-sm text-emerald-gold/50 mt-1">{venueAddress}</p>
              <motion.a href={mapsUrl} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-emerald-gold to-emerald-mid text-emerald-deep font-reem">
                <Navigation size={16} /> {ARABIC_OPEN_MAP}
              </motion.a>
            </motion.div>

            {/* RSVP as garden form */}
            <div className="bg-emerald-deep/60 border border-emerald-gold/25 rounded-2xl p-6 md:p-8">
              <h3 className="text-center font-marcellus text-2xl text-emerald-gold mb-1">{ARABIC_RSVP}</h3>
              <p className="text-center text-sm text-emerald-gold/50 mb-6">يرجى تأكيد حضوركم قبل الموعد</p>
              <AnimatePresence mode="wait">
                {rsvpDone ? (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                      className="mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-gold to-emerald-mid flex items-center justify-center">
                      <Heart size={24} className="text-emerald-deep" fill="currentColor" />
                    </motion.div>
                    <p className="font-reem text-emerald-gold">{rsvpStatus === 'attending' ? ARABIC_THANKS_ATTENDING : ARABIC_THANKS_DECLINED}</p>
                    <p className="text-sm text-emerald-gold/40 mt-1">{rsvpName}</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setRsvpStatus('attending')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'attending' ? 'bg-gradient-to-br from-emerald-gold to-emerald-mid text-emerald-deep border-transparent' : 'border-emerald-gold/25 text-emerald-gold'}`}>
                        <Check size={18} /><span className="font-reem text-sm">{ARABIC_ATTENDING}</span>
                      </button>
                      <button onClick={() => setRsvpStatus('declined')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'declined' ? 'bg-gradient-to-br from-emerald-gold to-emerald-mid text-emerald-deep border-transparent' : 'border-emerald-gold/25 text-emerald-gold'}`}>
                        <X size={18} /><span className="font-reem text-sm">{ARABIC_DECLINED}</span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-emerald-gold/50 mb-2">{ARABIC_GUESTS}</label>
                      <div className="flex items-center justify-between bg-emerald-deep/80 border border-emerald-gold/25 rounded-xl px-4 py-2">
                        <button onClick={() => setRsvpCount((c) => Math.max(1, c - 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-gold to-emerald-mid text-emerald-deep flex items-center justify-center"><Minus size={16} /></button>
                        <span className="font-cinzel text-2xl text-emerald-gold">{rsvpCount}</span>
                        <button onClick={() => setRsvpCount((c) => Math.min(10, c + 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-gold to-emerald-mid text-emerald-deep flex items-center justify-center"><Plus size={16} /></button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-emerald-gold/50 mb-2">{ARABIC_YOUR_NAME}</label>
                      <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="اكتب اسمك الكامل"
                        className="w-full bg-emerald-deep/80 border border-emerald-gold/25 text-emerald-gold placeholder:text-white/25 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-emerald-gold transition" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!rsvpStatus || !rsvpName.trim()}
                      onClick={() => { onRSVP?.(rsvpStatus!, rsvpCount, rsvpName.trim()); setRsvpDone(true); }}
                      className="w-full py-3.5 rounded-xl font-reem text-base text-emerald-deep bg-gradient-to-br from-emerald-gold to-emerald-mid disabled:opacity-40 disabled:cursor-not-allowed">
                      {ARABIC_CONFIRM}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center font-amiri text-emerald-gold/40 pb-8 mt-8">في رحاب حدائق المحبة نلتقي</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
