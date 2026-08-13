import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flower2, MapPin, X, Check, Minus, Plus, Heart, Navigation, Sparkles } from 'lucide-react';
import {
  SharedInvitationProps, DEFAULT_INVITATION, DEFAULT_GALLERY, BISMILLAH,
  ARABIC_DAYS, ARABIC_HOURS, ARABIC_MINUTES, ARABIC_SECONDS,
  ARABIC_ATTENDING, ARABIC_DECLINED, ARABIC_GUESTS, ARABIC_YOUR_NAME,
  ARABIC_CONFIRM, ARABIC_THANKS_ATTENDING, ARABIC_THANKS_DECLINED,
  ARABIC_OPEN_MAP, ARABIC_GALLERY, ARABIC_RSVP, ARABIC_OUR_STORY, ARABIC_INVITES_YOU,
} from './shared/types';
import { useCountdown, useAmbientMusic, useLockBody, TimeLeft } from './shared/hooks';
import { MusicToggle } from './shared/MusicToggle';
import { fireConfetti } from './shared/confetti';

const fmtDate = (d: string) => new Intl.DateTimeFormat('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d));

/* ── Flower bloom countdown (unique to FloralGate) ── */
function FlowerBloomCountdown({ time }: { time: TimeLeft }) {
  const units = [
    { value: time.days, label: ARABIC_DAYS },
    { value: time.hours, label: ARABIC_HOURS },
    { value: time.minutes, label: ARABIC_MINUTES },
    { value: time.seconds, label: ARABIC_SECONDS },
  ];
  return (
    <div className="flex justify-center gap-3 md:gap-5">
      {units.map((u) => (
        <div key={u.label} className="text-center">
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            {/* petals */}
            {[0, 72, 144, 216, 288].map((angle) => (
              <div key={angle} className="absolute top-1/2 left-1/2 w-7 h-7 md:w-9 md:h-9 rounded-full bg-sage-rose/30"
                style={{ transform: `rotate(${angle}deg) translateY(-12px)`, transformOrigin: 'center' }} />
            ))}
            {/* center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-sage-sage/60 flex items-center justify-center">
                <motion.div key={u.value} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="font-cinzel text-sm md:text-lg text-sage-cream">{String(u.value).padStart(2, '0')}</motion.div>
              </div>
            </div>
          </div>
          <div className="mt-2 text-[10px] md:text-xs text-sage-sage/60 font-reem">{u.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Garden path gallery (unique to FloralGate) ── */
function GardenPathGallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  return (
    <div className="w-full">
      <h3 className="text-center font-amiri text-2xl text-sage-sage mb-6">{ARABIC_GALLERY}</h3>
      <div className="space-y-3">
        {images.slice(0, 6).map((src, i) => (
          <motion.button key={src + i} onClick={() => setLightbox(i)}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.02 }}
            className={`relative w-full overflow-hidden rounded-2xl border-2 border-sage-sage/30 shadow-lg ${i % 2 === 0 ? 'mr-auto' : 'ml-auto'} max-w-[85%]`}>
            <img src={src} alt={`photo ${i + 1}`} loading="lazy" className="h-32 md:h-40 w-full object-cover" />
            <Flower2 size={16} className="absolute bottom-2 right-2 text-sage-cream/50" />
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[120] bg-sage-deep/95 flex items-center justify-center p-4">
            <button className="absolute top-5 right-5 text-sage-cream/80" onClick={() => setLightbox(null)}><X size={28} /></button>
            <motion.img key={lightbox} src={images[lightbox]} alt="preview" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-h-[82vh] max-w-[92vw] rounded-xl object-contain shadow-2xl border border-sage-sage/30" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TemplateFloralGate(props: SharedInvitationProps) {
  const {
    groomName = DEFAULT_INVITATION.groomName, brideName = DEFAULT_INVITATION.brideName,
    weddingDate = DEFAULT_INVITATION.weddingDate, time = DEFAULT_INVITATION.time,
    venueName = DEFAULT_INVITATION.venueName, venueAddress = DEFAULT_INVITATION.venueAddress,
    storyText = 'كحديقةٍ تفتّحت فيها الورود، بدأت حكايتنا بأزهار المحبة. نسأل الله أن يديم بيننا المودة والرحمة ويجعل حياتنا جنةً من الأنس.',
    latitude, longitude, galleryImages = DEFAULT_GALLERY, onRSVP,
  } = props;

  const [opened, setOpened] = useState(false);
  const timeLeft = useCountdown(weddingDate);
  const music = useAmbientMusic();
  useLockBody(!opened);

  const petals = useMemo(() => Array.from({ length: 14 }, () => ({
    x: Math.random() * 100, delay: Math.random() * 5, duration: 6 + Math.random() * 5, size: 8 + Math.random() * 10,
  })), []);

  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'declined' | null>(null);
  const [rsvpCount, setRsvpCount] = useState(1);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpDone, setRsvpDone] = useState(false);

  const lat = latitude ?? 30.0074, lng = longitude ?? 31.4913;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  const handleRSVP = () => {
    if (!rsvpStatus || !rsvpName.trim()) return;
    onRSVP?.(rsvpStatus, rsvpCount, rsvpName.trim());
    setRsvpDone(true);
    if (rsvpStatus === 'attending') fireConfetti();
  };

  return (
    <div className="relative min-h-screen bg-sage-deep text-sage-cream overflow-hidden font-reem" dir="rtl">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-sage-sage/15 blur-[130px]" />
      </div>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {petals.map((p, i) => (
          <motion.div key={i} className="absolute top-0" style={{ left: `${p.x}%` }}
            animate={{ y: ['0vh', '110vh'], x: [0, 20, -15, 5], rotate: [0, 360], opacity: [0, 0.5, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity }}>
            <Flower2 size={p.size} className="text-sage-rose/30" />
          </motion.div>
        ))}
      </div>
      <MusicToggle playing={music.playing} toggle={music.toggle} accentSolid="bg-gradient-to-br from-sage-sage to-sage-mid" ring="ring-2 ring-sage-sage/40" />

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="gate" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4 perspective-2000">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
              <Flower2 className="mx-auto text-sage-rose mb-3" size={40} />
              <p className="font-amiri text-2xl text-sage-cream">بوابة الحديقة</p>
            </motion.div>

            <div className="relative w-[280px] h-[440px] md:w-[380px] md:h-[540px] perspective-2000">
              {/* center content */}
              <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                <div>
                  <p className="font-amiri text-3xl md:text-4xl text-sage-cream">{groomName}</p>
                  <p className="font-vibes text-4xl text-sage-rose/60">&</p>
                  <p className="font-amiri text-3xl md:text-4xl text-sage-cream">{brideName}</p>
                </div>
              </div>
              {/* left gate swings open */}
              <motion.div className="absolute top-0 left-0 w-1/2 h-full origin-left preserve-3d cursor-pointer"
                onClick={() => setOpened(true)}
                animate={opened ? { rotateY: -100 } : { rotateY: 0 }} transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-sage-mid to-sage-deep border-2 border-sage-sage/40 rounded-l-lg shadow-xl">
                  {/* wrought-iron bars */}
                  <div className="absolute inset-3 border border-sage-sage/20 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 opacity-20"
                      style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 20px, rgba(106,138,112,0.5) 20px 21px), repeating-linear-gradient(0deg, transparent 0 20px, rgba(106,138,112,0.5) 20px 21px)' }} />
                  </div>
                  {/* roses on gate */}
                  {[20, 50, 80].map((top) => (
                    <div key={top} className="absolute" style={{ top: `${top}%`, right: '10%' }}>
                      <Flower2 size={20} className="text-sage-rose/50" fill="currentColor" />
                    </div>
                  ))}
                </div>
              </motion.div>
              {/* right gate swings open */}
              <motion.div className="absolute top-0 right-0 w-1/2 h-full origin-right preserve-3d cursor-pointer"
                onClick={() => setOpened(true)}
                animate={opened ? { rotateY: 100 } : { rotateY: 0 }} transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-gradient-to-l from-sage-mid to-sage-deep border-2 border-sage-sage/40 rounded-r-lg shadow-xl">
                  <div className="absolute inset-3 border border-sage-sage/20 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 opacity-20"
                      style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 20px, rgba(106,138,112,0.5) 20px 21px), repeating-linear-gradient(0deg, transparent 0 20px, rgba(106,138,112,0.5) 20px 21px)' }} />
                  </div>
                  {[20, 50, 80].map((top) => (
                    <div key={top} className="absolute" style={{ top: `${top}%`, left: '10%' }}>
                      <Flower2 size={20} className="text-sage-rose/50" fill="currentColor" />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.button onClick={() => setOpened(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-10 px-8 py-4 rounded-full bg-gradient-to-br from-sage-sage to-sage-mid text-sage-cream font-reem text-lg shadow-[0_0_30px_rgba(106,138,112,0.4)] flex items-center gap-2">
              <Sparkles size={18} /> افتح بوابة الحديقة
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="invite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 max-w-2xl mx-auto px-4 py-12 space-y-16">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <p className="font-amiri text-xl text-sage-sage">{BISMILLAH}</p>
            </motion.div>

            {/* Hero — garden arch */}
            <div className="relative text-center py-8">
              <div className="relative inline-block px-12 py-8">
                {/* arch frame */}
                <div className="absolute top-0 left-0 right-0 h-8 flex justify-center">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Flower2 key={i} size={16} className="text-sage-rose/40 mx-1" fill="currentColor" />
                  ))}
                </div>
                <p className="text-sage-sage/60 mb-4 mt-4">{ARABIC_INVITES_YOU}</p>
                <h1 className="font-amiri text-5xl text-sage-cream">{groomName}</h1>
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="font-vibes text-5xl text-sage-rose my-2" style={{ textShadow: '0 0 20px currentColor' }}>&</motion.div>
                <h1 className="font-amiri text-5xl text-sage-cream">{brideName}</h1>
                <div className="mt-6 inline-block border-y border-sage-sage/30 py-2 px-6">
                  <p className="font-reem text-sage-cream/90">{fmtDate(weddingDate)}</p>
                  <p className="font-reem text-sage-sage/60 text-sm">{time}</p>
                </div>
              </div>
            </div>

            {/* Flower bloom countdown */}
            <div className="text-center">
              <h3 className="font-amiri text-2xl text-sage-cream mb-6">العد التنازلي للزفاف</h3>
              <FlowerBloomCountdown time={timeLeft} />
            </div>

            {/* Story */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-sage-mid/60 border border-sage-sage/20 rounded-2xl p-8 text-center">
              <Flower2 size={20} className="text-sage-rose/40 mx-auto mb-3" fill="currentColor" />
              <h3 className="font-amiri text-xl text-sage-cream mb-4">{ARABIC_OUR_STORY}</h3>
              <p className="font-amiri text-lg leading-loose text-sage-cream/70">{storyText}</p>
            </motion.div>

            {/* Garden path gallery */}
            <GardenPathGallery images={galleryImages} />

            {/* Venue */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-sage-mid/60 border border-sage-sage/20 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <MapPin size={20} className="text-sage-sage" />
                <h3 className="font-amiri text-xl text-sage-cream">موقع الحفل</h3>
              </div>
              <p className="font-reem text-lg text-sage-cream">{venueName}</p>
              <p className="text-sm text-sage-sage/50 mt-1">{venueAddress}</p>
              <motion.a href={mapsUrl} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-sage-sage to-sage-mid text-sage-cream font-reem">
                <Navigation size={16} /> {ARABIC_OPEN_MAP}
              </motion.a>
            </motion.div>

            {/* RSVP */}
            <div className="bg-sage-mid/60 border border-sage-sage/20 rounded-2xl p-6 md:p-8">
              <h3 className="text-center font-amiri text-2xl text-sage-cream mb-1">{ARABIC_RSVP}</h3>
              <p className="text-center text-sm text-sage-sage/50 mb-6">يرجى تأكيد حضوركم قبل الموعد</p>
              <AnimatePresence mode="wait">
                {rsvpDone ? (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                      className="mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br from-sage-sage to-sage-mid flex items-center justify-center">
                      <Heart size={24} className="text-sage-cream" fill="currentColor" />
                    </motion.div>
                    <p className="font-reem text-sage-cream">{rsvpStatus === 'attending' ? ARABIC_THANKS_ATTENDING : ARABIC_THANKS_DECLINED}</p>
                    <p className="text-sm text-sage-sage/30 mt-1">{rsvpName}</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setRsvpStatus('attending')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'attending' ? 'bg-gradient-to-br from-sage-sage to-sage-mid text-sage-cream border-transparent' : 'border-sage-sage/25 text-sage-cream'}`}>
                        <Check size={18} /><span className="font-reem text-sm">{ARABIC_ATTENDING}</span>
                      </button>
                      <button onClick={() => setRsvpStatus('declined')
                      }
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'declined' ? 'bg-gradient-to-br from-sage-sage to-sage-mid text-sage-cream border-transparent' : 'border-sage-sage/25 text-sage-cream'}`}>
                        <X size={18} /><span className="font-reem text-sm">{ARABIC_DECLINED}</span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-sage-sage/50 mb-2">{ARABIC_GUESTS}</label>
                      <div className="flex items-center justify-between bg-sage-deep/80 border border-sage-sage/25 rounded-xl px-4 py-2">
                        <button onClick={() => setRsvpCount((c) => Math.max(1, c - 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-sage-sage to-sage-mid text-sage-cream flex items-center justify-center"><Minus size={16} /></button>
                        <span className="font-cinzel text-2xl text-sage-cream">{rsvpCount}</span>
                        <button onClick={() => setRsvpCount((c) => Math.min(10, c + 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-sage-sage to-sage-mid text-sage-cream flex items-center justify-center"><Plus size={16} /></button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-sage-sage/50 mb-2">{ARABIC_YOUR_NAME}</label>
                      <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="اكتب اسمك الكامل"
                        className="w-full bg-sage-deep/80 border border-sage-sage/25 text-sage-cream placeholder:text-white/25 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-sage-sage transition" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!rsvpStatus || !rsvpName.trim()} onClick={handleRSVP}
                      className="w-full py-3.5 rounded-xl font-reem text-base text-sage-cream bg-gradient-to-br from-sage-sage to-sage-mid disabled:opacity-40 disabled:cursor-not-allowed">
                      {ARABIC_CONFIRM}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center font-amiri text-sage-sage/40 pb-8">في رحاب الحديقة نلتقي</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
