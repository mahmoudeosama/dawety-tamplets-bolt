import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftOpen, MapPin, X, Check, Minus, Plus, Heart, Navigation, Sparkles } from 'lucide-react';
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

/* ── Frosted ring countdown (unique to FrostedGlass) ── */
function FrostedRingCountdown({ time }: { time: TimeLeft }) {
  const units = [
    { value: time.days, label: ARABIC_DAYS, max: 365 },
    { value: time.hours, label: ARABIC_HOURS, max: 24 },
    { value: time.minutes, label: ARABIC_MINUTES, max: 60 },
    { value: time.seconds, label: ARABIC_SECONDS, max: 60 },
  ];
  return (
    <div className="flex justify-center gap-3 md:gap-5">
      {units.map((u) => {
        const pct = Math.min(1, u.value / u.max);
        return (
          <div key={u.label} className="text-center">
            <div className="relative w-16 h-16 md:w-20 md:h-20">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="2" />
                <motion.circle
                  cx="40" cy="40" r="36" fill="none" stroke="#d4af37" strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 36 * (1 - pct) }}
                  transition={{ duration: 0.5 }}
                  style={{ filter: 'drop-shadow(0 0 4px rgba(212,175,55,0.6))' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div key={u.value} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="font-cinzel text-xl md:text-2xl text-frost-goldLight"
                  style={{ textShadow: '0 0 10px rgba(212,175,55,0.5)' }}>
                  {String(u.value).padStart(2, '0')}
                </motion.div>
              </div>
            </div>
            <div className="mt-2 text-[10px] md:text-xs text-frost-gold/50 font-reem">{u.label}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Glass card gallery (unique to FrostedGlass) ── */
function GlassCardGallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  return (
    <div className="w-full">
      <h3 className="text-center font-marcellus text-2xl text-frost-goldLight mb-6">{ARABIC_GALLERY}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.slice(0, 6).map((src, i) => (
          <motion.button key={src + i} onClick={() => setLightbox(i)}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden rounded-xl border border-frost-gold/20 aspect-square backdrop-blur-md bg-white/5">
            <img src={src} alt={`photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-frost-dark/40 to-transparent" />
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[120] bg-frost-dark/95 backdrop-blur-xl flex items-center justify-center p-4">
            <button className="absolute top-5 right-5 text-frost-goldLight/80" onClick={() => setLightbox(null)}><X size={28} /></button>
            <motion.img key={lightbox} src={images[lightbox]} alt="preview" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-h-[82vh] max-w-[92vw] rounded-xl object-contain shadow-2xl border border-frost-gold/30" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TemplateFrostedGlass(props: SharedInvitationProps) {
  const {
    groomName = DEFAULT_INVITATION.groomName, brideName = DEFAULT_INVITATION.brideName,
    weddingDate = DEFAULT_INVITATION.weddingDate, time = DEFAULT_INVITATION.time,
    venueName = DEFAULT_INVITATION.venueName, venueAddress = DEFAULT_INVITATION.venueAddress,
    storyText = 'كضوءٍ يمر عبر الزجاج المضبب، تتراءى لنا ملامح فرحتنا. نسأل الله أن يبارك في جمعنا.',
    latitude, longitude, galleryImages = DEFAULT_GALLERY, onRSVP,
  } = props;

  const [opened, setOpened] = useState(false);
  const timeLeft = useCountdown(weddingDate);
  const music = useAmbientMusic();
  useLockBody(!opened);

  const sparkles = useMemo(() => Array.from({ length: 16 }, () => ({
    x: Math.random() * 100, y: Math.random() * 100, delay: Math.random() * 3, duration: 2 + Math.random() * 3, size: 1 + Math.random() * 2,
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
    <div className="relative min-h-screen bg-frost-dark text-frost-goldLight overflow-hidden font-reem" dir="rtl"
      style={{ backgroundImage: 'radial-gradient(rgba(212,175,55,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-frost-gold/10 blur-[130px]" />
      </div>
      <div className="pointer-events-none fixed inset-0">
        {sparkles.map((s, i) => (
          <motion.span key={i} className="absolute rounded-full bg-frost-gold" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
            animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.5, 1.3, 0.5] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity }} />
        ))}
      </div>
      <MusicToggle playing={music.playing} toggle={music.toggle} accentSolid="bg-gradient-to-br from-frost-goldLight to-frost-gold" ring="ring-2 ring-frost-gold/50" />

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="gate" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
              <PanelLeftOpen className="mx-auto text-frost-gold mb-3" size={40} />
              <p className="font-amiri text-2xl text-frost-goldLight">الزجاج المضبب</p>
            </motion.div>

            <div className="relative w-[280px] h-[440px] md:w-[380px] md:h-[540px] overflow-hidden rounded-2xl">
              {/* center content */}
              <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                <div>
                  <p className="font-amiri text-3xl md:text-4xl text-frost-goldLight">{groomName}</p>
                  <p className="font-vibes text-4xl text-frost-gold/60">&</p>
                  <p className="font-amiri text-3xl md:text-4xl text-frost-goldLight">{brideName}</p>
                </div>
              </div>
              {/* left frosted panel slides left */}
              <motion.div onClick={() => setOpened(true)}
                animate={opened ? { x: '-105%' } : { x: 0 }} transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
                className="absolute top-0 left-0 w-1/2 h-full backdrop-blur-xl bg-white/8 border-r border-frost-gold/30 cursor-pointer">
                <div className="absolute inset-4 border border-frost-gold/15 rounded-xl" />
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 10px, rgba(212,175,55,0.3) 10px 11px)' }} />
              </motion.div>
              {/* right frosted panel slides right */}
              <motion.div onClick={() => setOpened(true)}
                animate={opened ? { x: '105%' } : { x: 0 }} transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
                className="absolute top-0 right-0 w-1/2 h-full backdrop-blur-xl bg-white/8 border-l border-frost-gold/30 cursor-pointer">
                <div className="absolute inset-4 border border-frost-gold/15 rounded-xl" />
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0 10px, rgba(212,175,55,0.3) 10px 11px)' }} />
              </motion.div>
            </div>

            <motion.button onClick={() => setOpened(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-10 px-8 py-4 rounded-full bg-gradient-to-br from-frost-goldLight to-frost-gold text-frost-dark font-reem text-lg shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center gap-2">
              <Sparkles size={18} /> افتح الدعوة
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="invite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 max-w-2xl mx-auto px-4 py-12 space-y-16">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <p className="font-amiri text-xl text-frost-gold">{BISMILLAH}</p>
            </motion.div>

            {/* Hero — glass card */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
              className="backdrop-blur-md bg-white/5 border border-frost-gold/20 rounded-2xl p-8 text-center">
              <p className="text-frost-gold/60 mb-4">{ARABIC_INVITES_YOU}</p>
              <h1 className="font-amiri text-5xl text-frost-goldLight">{groomName}</h1>
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="font-vibes text-5xl text-frost-gold my-2" style={{ textShadow: '0 0 20px currentColor' }}>&</motion.div>
              <h1 className="font-amiri text-5xl text-frost-goldLight">{brideName}</h1>
              <div className="mt-6 inline-block border-y border-frost-gold/20 py-2 px-6">
                <p className="font-reem text-frost-goldLight/90">{fmtDate(weddingDate)}</p>
                <p className="font-reem text-frost-gold/60 text-sm">{time}</p>
              </div>
            </motion.div>

            {/* Frosted ring countdown */}
            <div className="text-center">
              <h3 className="font-marcellus text-2xl text-frost-goldLight mb-6">العد التنازلي للزفاف</h3>
              <FrostedRingCountdown time={timeLeft} />
            </div>

            {/* Story */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="backdrop-blur-md bg-white/5 border border-frost-gold/20 rounded-2xl p-8 text-center">
              <h3 className="font-marcellus text-xl text-frost-goldLight mb-4">{ARABIC_OUR_STORY}</h3>
              <p className="font-amiri text-lg leading-loose text-frost-goldLight/70">{storyText}</p>
            </motion.div>

            {/* Glass card gallery */}
            <GlassCardGallery images={galleryImages} />

            {/* Venue */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="backdrop-blur-md bg-white/5 border border-frost-gold/20 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <MapPin size={20} className="text-frost-gold" />
                <h3 className="font-marcellus text-xl text-frost-goldLight">موقع الحفل</h3>
              </div>
              <p className="font-reem text-lg text-frost-goldLight">{venueName}</p>
              <p className="text-sm text-frost-gold/50 mt-1">{venueAddress}</p>
              <motion.a href={mapsUrl} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-frost-goldLight to-frost-gold text-frost-dark font-reem">
                <Navigation size={16} /> {ARABIC_OPEN_MAP}
              </motion.a>
            </motion.div>

            {/* RSVP */}
            <div className="backdrop-blur-md bg-white/5 border border-frost-gold/20 rounded-2xl p-6 md:p-8">
              <h3 className="text-center font-marcellus text-2xl text-frost-goldLight mb-1">{ARABIC_RSVP}</h3>
              <p className="text-center text-sm text-frost-gold/50 mb-6">يرجى تأكيد حضوركم قبل الموعد</p>
              <AnimatePresence mode="wait">
                {rsvpDone ? (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                      className="mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br from-frost-goldLight to-frost-gold flex items-center justify-center">
                      <Heart size={24} className="text-frost-dark" fill="currentColor" />
                    </motion.div>
                    <p className="font-reem text-frost-goldLight">{rsvpStatus === 'attending' ? ARABIC_THANKS_ATTENDING : ARABIC_THANKS_DECLINED}</p>
                    <p className="text-sm text-frost-gold/30 mt-1">{rsvpName}</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setRsvpStatus('attending')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'attending' ? 'bg-gradient-to-br from-frost-goldLight to-frost-gold text-frost-dark border-transparent' : 'border-frost-gold/25 text-frost-goldLight'}`}>
                        <Check size={18} /><span className="font-reem text-sm">{ARABIC_ATTENDING}</span>
                      </button>
                      <button onClick={() => setRsvpStatus('declined')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'declined' ? 'bg-gradient-to-br from-frost-goldLight to-frost-gold text-frost-dark border-transparent' : 'border-frost-gold/25 text-frost-goldLight'}`}>
                        <X size={18} /><span className="font-reem text-sm">{ARABIC_DECLINED}</span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-frost-gold/50 mb-2">{ARABIC_GUESTS}</label>
                      <div className="flex items-center justify-between bg-frost-dark/60 border border-frost-gold/25 rounded-xl px-4 py-2">
                        <button onClick={() => setRsvpCount((c) => Math.max(1, c - 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-frost-goldLight to-frost-gold text-frost-dark flex items-center justify-center"><Minus size={16} /></button>
                        <span className="font-cinzel text-2xl text-frost-goldLight">{rsvpCount}</span>
                        <button onClick={() => setRsvpCount((c) => Math.min(10, c + 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-frost-goldLight to-frost-gold text-frost-dark flex items-center justify-center"><Plus size={16} /></button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-frost-gold/50 mb-2">{ARABIC_YOUR_NAME}</label>
                      <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="اكتب اسمك الكامل"
                        className="w-full bg-frost-dark/60 border border-frost-gold/25 text-frost-goldLight placeholder:text-white/20 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-frost-gold transition" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!rsvpStatus || !rsvpName.trim()} onClick={handleRSVP}
                      className="w-full py-3.5 rounded-xl font-reem text-base text-frost-dark bg-gradient-to-br from-frost-goldLight to-frost-gold disabled:opacity-40 disabled:cursor-not-allowed">
                      {ARABIC_CONFIRM}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center font-amiri text-frost-gold/40 pb-8">ضوءٌ يمر عبر الزجاج</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
