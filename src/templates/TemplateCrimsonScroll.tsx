import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, MapPin, X, Check, Minus, Plus, Heart, Navigation, Sparkles } from 'lucide-react';
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

/* ── Embroidered countdown (unique to CrimsonScroll) ── */
function EmbroideredCountdown({ time }: { time: TimeLeft }) {
  const units = [
    { value: time.days, label: ARABIC_DAYS },
    { value: time.hours, label: ARABIC_HOURS },
    { value: time.minutes, label: ARABIC_MINUTES },
    { value: time.seconds, label: ARABIC_SECONDS },
  ];
  return (
    <div className="flex justify-center gap-3 md:gap-5">
      {units.map((u, i) => (
        <div key={u.label} className="text-center">
          <div className="relative w-16 h-20 md:w-20 md:h-24 bg-crimson-mid border-2 border-crimson-gold/30 rounded-lg overflow-hidden">
            {/* embroidery corners */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-crimson-gold/40" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-crimson-gold/40" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-crimson-gold/40" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-crimson-gold/40" />
            <motion.div key={u.value} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="relative h-full flex items-center justify-center font-vibes text-2xl md:text-3xl text-crimson-goldLight"
              style={{ textShadow: '0 0 12px rgba(232,200,144,0.4)' }}>
              {String(u.value).padStart(2, '0')}
            </motion.div>
          </div>
          <div className="mt-2 text-[10px] md:text-xs text-crimson-gold/50 font-reem">{u.label}</div>
          {i < units.length - 1 && <div className="hidden" />}
        </div>
      ))}
    </div>
  );
}

/* ── Tapestry gallery (unique to CrimsonScroll) ── */
function TapestryGallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  return (
    <div className="w-full">
      <h3 className="text-center font-amiri text-2xl text-crimson-goldLight mb-6">{ARABIC_GALLERY}</h3>
      <div className="grid grid-cols-3 gap-1">
        {images.slice(0, 6).map((src, i) => (
          <motion.button key={src + i} onClick={() => setLightbox(i)}
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ delay: i * 0.08, type: 'spring' }} whileHover={{ scale: 1.05 }}
            className={`relative overflow-hidden border border-crimson-gold/20 ${i === 0 ? 'col-span-2 row-span-2' : ''} aspect-square`}>
            <img src={src} alt={`photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-crimson-deep/40 to-transparent" />
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[120] bg-crimson-deep/95 flex items-center justify-center p-4">
            <button className="absolute top-5 right-5 text-crimson-goldLight/80" onClick={() => setLightbox(null)}><X size={28} /></button>
            <motion.img key={lightbox} src={images[lightbox]} alt="preview" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-h-[82vh] max-w-[92vw] rounded-lg object-contain shadow-2xl border border-crimson-gold/30" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TemplateCrimsonScroll(props: SharedInvitationProps) {
  const {
    groomName = DEFAULT_INVITATION.groomName, brideName = DEFAULT_INVITATION.brideName,
    weddingDate = DEFAULT_INVITATION.weddingDate, time = DEFAULT_INVITATION.time,
    venueName = DEFAULT_INVITATION.venueName, venueAddress = DEFAULT_INVITATION.venueAddress,
    storyText = 'كمخطوطةٍ مطرّزة بخيوط الذهب على مخملٍ قرمزي، كُتبت حكايتنا بأحرف المحبة. نسأل الله أن يبارك في جمعنا ويديم بيننا المودة.',
    latitude, longitude, galleryImages = DEFAULT_GALLERY, onRSVP,
  } = props;

  const [opened, setOpened] = useState(false);
  const [unrolling, setUnrolling] = useState(false);
  const timeLeft = useCountdown(weddingDate);
  const music = useAmbientMusic();
  useLockBody(!opened);

  const sparkles = useMemo(() => Array.from({ length: 14 }, () => ({
    x: Math.random() * 100, y: Math.random() * 100, delay: Math.random() * 3, duration: 2 + Math.random() * 3, size: 1 + Math.random() * 2,
  })), []);

  const handleUnroll = () => { setUnrolling(true); setTimeout(() => setOpened(true), 1200); };

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
    <div className="relative min-h-screen bg-crimson-deep text-crimson-goldLight overflow-hidden font-reem" dir="rtl">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-crimson-red/15 blur-[130px]" />
      </div>
      <div className="pointer-events-none fixed inset-0">
        {sparkles.map((s, i) => (
          <motion.span key={i} className="absolute rounded-full bg-crimson-gold" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
            animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.5, 1.3, 0.5] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity }} />
        ))}
      </div>
      <MusicToggle playing={music.playing} toggle={music.toggle} accentSolid="bg-gradient-to-br from-crimson-goldLight to-crimson-red" ring="ring-2 ring-crimson-gold/40" />

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="gate" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
              <ScrollText className="mx-auto text-crimson-gold mb-3" size={40} />
              <p className="font-amiri text-2xl text-crimson-goldLight">المخطوطة القرمزية</p>
            </motion.div>

            <div className="relative w-[280px] h-[400px] md:w-[360px] md:h-[480px]">
              {/* center content (revealed as scroll unrolls) */}
              <motion.div className="absolute inset-x-0 top-0 bottom-0 bg-gradient-to-b from-crimson-mid to-crimson-deep border-x-2 border-crimson-gold/30 overflow-hidden"
                initial={{ height: 0 }} animate={{ height: unrolling ? '100%' : 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
                <div className="absolute inset-3 border border-crimson-gold/20" />
                <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                  <div>
                    <p className="font-amiri text-2xl md:text-3xl text-crimson-goldLight">{groomName}</p>
                    <p className="font-vibes text-3xl text-crimson-gold/60">&</p>
                    <p className="font-amiri text-2xl md:text-3xl text-crimson-goldLight">{brideName}</p>
                  </div>
                </div>
              </motion.div>

              {/* top roll (rolls up) */}
              <motion.div className="absolute top-0 left-0 right-0 z-10"
                animate={unrolling ? { y: -60 } : { y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
                <div className="w-full h-12 bg-gradient-to-b from-crimson-red to-crimson-mid rounded-full border-2 border-crimson-gold/40 shadow-xl" />
                <div className="w-full h-3 bg-gradient-to-b from-crimson-mid to-transparent" />
              </motion.div>

              {/* bottom roll (rolls down) */}
              <motion.div className="absolute bottom-0 left-0 right-0 z-10"
                animate={unrolling ? { y: 60 } : { y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
                <div className="w-full h-3 bg-gradient-to-t from-crimson-mid to-transparent" />
                <div className="w-full h-12 bg-gradient-to-t from-crimson-red to-crimson-mid rounded-full border-2 border-crimson-gold/40 shadow-xl" />
              </motion.div>

              {/* center seal */}
              <AnimatePresence>
                {!unrolling && (
                  <motion.button onClick={handleUnroll} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    exit={{ scale: [1, 1.5, 0], opacity: 0 }} transition={{ duration: 0.5 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 rounded-full bg-gradient-to-br from-crimson-goldLight to-crimson-red flex items-center justify-center shadow-[0_0_30px_rgba(232,200,144,0.4)] border-2 border-crimson-goldLight/30">
                    <ScrollText size={22} className="text-crimson-deep" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <motion.button onClick={handleUnroll} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-10 px-8 py-4 rounded-full bg-gradient-to-br from-crimson-goldLight to-crimson-red text-crimson-deep font-reem text-lg shadow-[0_0_30px_rgba(232,200,144,0.4)] flex items-center gap-2">
              <Sparkles size={18} /> افتح المخطوطة
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="invite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 max-w-xl mx-auto px-4 py-12 space-y-12">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <p className="font-amiri text-xl text-crimson-gold">{BISMILLAH}</p>
            </motion.div>

            {/* Hero — on velvet scroll */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="relative bg-gradient-to-b from-crimson-mid to-crimson-deep border-2 border-crimson-gold/30 rounded-lg p-8 text-center shadow-2xl">
              {/* gold embroidery border */}
              <div className="absolute inset-3 border border-crimson-gold/20 rounded-lg" />
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-crimson-gold via-crimson-goldLight to-crimson-gold rounded-t-lg" />
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-crimson-gold via-crimson-goldLight to-crimson-gold rounded-b-lg" />
              <p className="text-crimson-gold/60 mb-4 mt-2">{ARABIC_INVITES_YOU}</p>
              <h1 className="font-amiri text-5xl text-crimson-goldLight">{groomName}</h1>
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="font-vibes text-5xl text-crimson-gold my-2" style={{ textShadow: '0 0 20px currentColor' }}>&</motion.div>
              <h1 className="font-amiri text-5xl text-crimson-goldLight">{brideName}</h1>
              <div className="mt-6 inline-block border-y border-crimson-gold/30 py-2 px-6">
                <p className="font-reem text-crimson-goldLight">{fmtDate(weddingDate)}</p>
                <p className="font-reem text-crimson-gold/60 text-sm">{time}</p>
              </div>
            </motion.div>

            {/* Embroidered countdown */}
            <div className="text-center">
              <h3 className="font-amiri text-2xl text-crimson-goldLight mb-6">العد التنازلي للزفاف</h3>
              <EmbroideredCountdown time={timeLeft} />
            </div>

            {/* Story */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-crimson-mid/60 border border-crimson-gold/20 rounded-2xl p-8 text-center">
              <h3 className="font-amiri text-xl text-crimson-goldLight mb-4">{ARABIC_OUR_STORY}</h3>
              <p className="font-amiri text-lg leading-loose text-crimson-goldLight/70">{storyText}</p>
            </motion.div>

            {/* Tapestry gallery */}
            <TapestryGallery images={galleryImages} />

            {/* Venue */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-crimson-mid/60 border border-crimson-gold/20 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <MapPin size={20} className="text-crimson-gold" />
                <h3 className="font-amiri text-xl text-crimson-goldLight">موقع الحفل</h3>
              </div>
              <p className="font-reem text-lg text-crimson-goldLight">{venueName}</p>
              <p className="text-sm text-crimson-gold/50 mt-1">{venueAddress}</p>
              <motion.a href={mapsUrl} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-crimson-goldLight to-crimson-red text-crimson-deep font-reem">
                <Navigation size={16} /> {ARABIC_OPEN_MAP}
              </motion.a>
            </motion.div>

            {/* RSVP */}
            <div className="bg-crimson-mid/60 border border-crimson-gold/20 rounded-2xl p-6 md:p-8">
              <h3 className="text-center font-amiri text-2xl text-crimson-goldLight mb-1">{ARABIC_RSVP}</h3>
              <p className="text-center text-sm text-crimson-gold/50 mb-6">يرجى تأكيد حضوركم قبل الموعد</p>
              <AnimatePresence mode="wait">
                {rsvpDone ? (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                      className="mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br from-crimson-goldLight to-crimson-red flex items-center justify-center">
                      <Heart size={24} className="text-crimson-deep" fill="currentColor" />
                    </motion.div>
                    <p className="font-reem text-crimson-goldLight">{rsvpStatus === 'attending' ? ARABIC_THANKS_ATTENDING : ARABIC_THANKS_DECLINED}</p>
                    <p className="text-sm text-crimson-gold/30 mt-1">{rsvpName}</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setRsvpStatus('attending')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'attending' ? 'bg-gradient-to-br from-crimson-goldLight to-crimson-red text-crimson-deep border-transparent' : 'border-crimson-gold/25 text-crimson-goldLight'}`}>
                        <Check size={18} /><span className="font-reem text-sm">{ARABIC_ATTENDING}</span>
                      </button>
                      <button onClick={() => setRsvpStatus('declined')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'declined' ? 'bg-gradient-to-br from-crimson-goldLight to-crimson-red text-crimson-deep border-transparent' : 'border-crimson-gold/25 text-crimson-goldLight'}`}>
                        <X size={18} /><span className="font-reem text-sm">{ARABIC_DECLINED}</span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-crimson-gold/50 mb-2">{ARABIC_GUESTS}</label>
                      <div className="flex items-center justify-between bg-crimson-deep/80 border border-crimson-gold/25 rounded-xl px-4 py-2">
                        <button onClick={() => setRsvpCount((c) => Math.max(1, c - 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-crimson-goldLight to-crimson-red text-crimson-deep flex items-center justify-center"><Minus size={16} /></button>
                        <span className="font-vibes text-2xl text-crimson-goldLight">{rsvpCount}</span>
                        <button onClick={() => setRsvpCount((c) => Math.min(10, c + 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-crimson-goldLight to-crimson-red text-crimson-deep flex items-center justify-center"><Plus size={16} /></button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-crimson-gold/50 mb-2">{ARABIC_YOUR_NAME}</label>
                      <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="اكتب اسمك الكامل"
                        className="w-full bg-crimson-deep/80 border border-crimson-gold/25 text-crimson-goldLight placeholder:text-white/20 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-crimson-gold transition" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!rsvpStatus || !rsvpName.trim()} onClick={handleRSVP}
                      className="w-full py-3.5 rounded-xl font-reem text-base text-crimson-deep bg-gradient-to-br from-crimson-goldLight to-crimson-red disabled:opacity-40 disabled:cursor-not-allowed">
                      {ARABIC_CONFIRM}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center font-amiri text-crimson-gold/40 pb-8">مخطوطةٌ من مخملٍ وذهب</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
