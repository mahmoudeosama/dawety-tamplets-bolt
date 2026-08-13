import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DoorOpen, MapPin, X, Check, Minus, Plus, Heart, Navigation, Sparkles, Flame } from 'lucide-react';
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

/* ── Lantern countdown (unique to MoroccanArch) ── */
function LanternCountdown({ time }: { time: TimeLeft }) {
  const units = [
    { value: time.days, label: ARABIC_DAYS },
    { value: time.hours, label: ARABIC_HOURS },
    { value: time.minutes, label: ARABIC_MINUTES },
    { value: time.seconds, label: ARABIC_SECONDS },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
      {units.map((u) => (
        <div key={u.label} className="relative bg-moroccan-deep/60 border border-moroccan-gold/25 rounded-xl p-4 text-center overflow-hidden">
          <motion.div key={u.value} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="font-cinzel text-3xl text-moroccan-gold"
            style={{ textShadow: '0 0 14px rgba(212,160,96,0.4)' }}>
            {String(u.value).padStart(2, '0')}
          </motion.div>
          <div className="text-xs text-moroccan-gold/50 font-reem mt-1">{u.label}</div>
          <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-moroccan-gold/20 blur-lg" />
        </div>
      ))}
    </div>
  );
}

/* ── Mosaic tile gallery (unique to MoroccanArch) ── */
function MosaicGallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  return (
    <div className="w-full">
      <h3 className="text-center font-amiri text-2xl text-moroccan-gold mb-6">{ARABIC_GALLERY}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {images.slice(0, 6).map((src, i) => (
          <motion.button key={src + i} onClick={() => setLightbox(i)}
            initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ delay: i * 0.08, type: 'spring' }} whileHover={{ scale: 1.05 }}
            className={`relative overflow-hidden rounded-xl border border-moroccan-gold/20 ${i === 0 ? 'col-span-2 row-span-1' : ''} aspect-video`}>
            <img src={src} alt={`photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-moroccan-deep/50 to-transparent" />
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[120] bg-moroccan-deep/95 flex items-center justify-center p-4">
            <button className="absolute top-5 right-5 text-moroccan-gold/80" onClick={() => setLightbox(null)}><X size={28} /></button>
            <motion.img key={lightbox} src={images[lightbox]} alt="preview" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-h-[82vh] max-w-[92vw] rounded-xl object-contain shadow-2xl border border-moroccan-gold/30" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TemplateMoroccanArch(props: SharedInvitationProps) {
  const {
    groomName = DEFAULT_INVITATION.groomName, brideName = DEFAULT_INVITATION.brideName,
    weddingDate = DEFAULT_INVITATION.weddingDate, time = DEFAULT_INVITATION.time,
    venueName = DEFAULT_INVITATION.venueName, venueAddress = DEFAULT_INVITATION.venueAddress,
    storyText = 'في ظلال الأقواس المغربية، حيث تتراقش الزخارف وتتوهج الفوانيس، نكتب فصلاً جديداً من حكايتنا. نسأل الله أن يبارك في جمعنا.',
    latitude, longitude, galleryImages = DEFAULT_GALLERY, onRSVP,
  } = props;

  const [opened, setOpened] = useState(false);
  const timeLeft = useCountdown(weddingDate);
  const music = useAmbientMusic();
  useLockBody(!opened);

  const lanterns = useMemo(() => Array.from({ length: 8 }, () => ({
    x: 10 + Math.random() * 80, delay: Math.random() * 3, duration: 3 + Math.random() * 3,
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
    <div className="relative min-h-screen bg-moroccan-deep text-moroccan-gold overflow-hidden font-reem" dir="rtl">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-moroccan-teal/15 blur-[130px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-moroccan-terracotta/10 blur-[120px]" />
      </div>
      {/* floating lanterns */}
      <div className="pointer-events-none fixed inset-0">
        {lanterns.map((l, i) => (
          <motion.div key={i} className="absolute" style={{ left: `${l.x}%`, top: `${10 + i * 10}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: l.duration, delay: l.delay, repeat: Infinity }}>
            <Flame size={16} className="text-moroccan-gold/40" />
          </motion.div>
        ))}
      </div>
      <MusicToggle playing={music.playing} toggle={music.toggle} accentSolid="bg-gradient-to-br from-moroccan-gold to-moroccan-terracotta" ring="ring-2 ring-moroccan-gold/40" />

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="gate" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4 perspective-2000">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
              <DoorOpen className="mx-auto text-moroccan-gold mb-3" size={40} />
              <p className="font-amiri text-2xl text-moroccan-gold">الأقواس المغربية</p>
            </motion.div>

            <div className="relative w-[280px] h-[440px] md:w-[380px] md:h-[540px] perspective-2000">
              {/* arch backdrop */}
              <div className="absolute inset-0 bg-moroccan-mid border-2 border-moroccan-gold/30 rounded-t-[50%] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'repeating-conic-gradient(rgba(212,160,96,0.3) 0deg 15deg, transparent 15deg 30deg)' }} />
                <div className="absolute inset-4 border border-moroccan-gold/20 rounded-t-[48%]" />
                <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                  <div>
                    <p className="font-amiri text-3xl md:text-4xl text-moroccan-gold">{groomName}</p>
                    <p className="font-vibes text-4xl text-moroccan-terracotta/60">&</p>
                    <p className="font-amiri text-3xl md:text-4xl text-moroccan-gold">{brideName}</p>
                  </div>
                </div>
              </div>
              {/* left door rotates out */}
              <motion.div className="absolute top-0 left-0 w-1/2 h-full origin-left preserve-3d cursor-pointer"
                onClick={() => setOpened(true)}
                animate={opened ? { rotateY: -105 } : { rotateY: 0 }} transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-moroccan-teal to-moroccan-deep border-2 border-moroccan-gold/40 rounded-tl-[50%] shadow-xl">
                  <div className="absolute inset-3 border border-moroccan-gold/20 rounded-tl-[48%]" />
                  <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'repeating-conic-gradient(rgba(212,160,96,0.4) 0deg 10deg, transparent 10deg 20deg)' }} />
                </div>
              </motion.div>
              {/* right door rotates out */}
              <motion.div className="absolute top-0 right-0 w-1/2 h-full origin-right preserve-3d cursor-pointer"
                onClick={() => setOpened(true)}
                animate={opened ? { rotateY: 105 } : { rotateY: 0 }} transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-gradient-to-l from-moroccan-teal to-moroccan-deep border-2 border-moroccan-gold/40 rounded-tr-[50%] shadow-xl">
                  <div className="absolute inset-3 border border-moroccan-gold/20 rounded-tr-[48%]" />
                  <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'repeating-conic-gradient(rgba(212,160,96,0.4) 0deg 10deg, transparent 10deg 20deg)' }} />
                </div>
              </motion.div>
            </div>

            <motion.button onClick={() => setOpened(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-10 px-8 py-4 rounded-full bg-gradient-to-br from-moroccan-gold to-moroccan-terracotta text-moroccan-deep font-reem text-lg shadow-[0_0_30px_rgba(212,160,96,0.4)] flex items-center gap-2">
              <Sparkles size={18} /> افتح الأقواس
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="invite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 max-w-2xl mx-auto px-4 py-12 space-y-16">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <p className="font-amiri text-xl text-moroccan-gold">{BISMILLAH}</p>
            </motion.div>

            {/* Hero — inside arch */}
            <div className="relative text-center py-8">
              <div className="relative inline-block px-12 py-8">
                <div className="absolute inset-0 bg-moroccan-mid/50 border-2 border-moroccan-gold/30 rounded-t-[50%]" />
                <div className="absolute inset-3 border border-moroccan-gold/15 rounded-t-[48%]" />
                <div className="relative">
                  <p className="text-moroccan-gold/60 mb-4">{ARABIC_INVITES_YOU}</p>
                  <h1 className="font-amiri text-5xl text-moroccan-gold">{groomName}</h1>
                  <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="font-vibes text-5xl text-moroccan-terracotta my-2" style={{ textShadow: '0 0 20px currentColor' }}>&</motion.div>
                  <h1 className="font-amiri text-5xl text-moroccan-gold">{brideName}</h1>
                  <div className="mt-6 inline-block border-y border-moroccan-gold/30 py-2 px-6">
                    <p className="font-reem text-moroccan-gold/90">{fmtDate(weddingDate)}</p>
                    <p className="font-reem text-moroccan-gold/60 text-sm">{time}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lantern countdown */}
            <div className="text-center">
              <h3 className="font-amiri text-2xl text-moroccan-gold mb-6">العد التنازلي للزفاف</h3>
              <LanternCountdown time={timeLeft} />
            </div>

            {/* Story */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-moroccan-mid/60 border border-moroccan-gold/20 rounded-2xl p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'repeating-conic-gradient(rgba(212,160,96,0.3) 0deg 15deg, transparent 15deg 30deg)' }} />
              <h3 className="relative font-amiri text-xl text-moroccan-gold mb-4">{ARABIC_OUR_STORY}</h3>
              <p className="relative font-amiri text-lg leading-loose text-moroccan-gold/70">{storyText}</p>
            </motion.div>

            {/* Mosaic gallery */}
            <MosaicGallery images={galleryImages} />

            {/* Venue */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-moroccan-mid/60 border border-moroccan-gold/20 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <MapPin size={20} className="text-moroccan-gold" />
                <h3 className="font-amiri text-xl text-moroccan-gold">موقع الحفل</h3>
              </div>
              <p className="font-reem text-lg text-moroccan-gold">{venueName}</p>
              <p className="text-sm text-moroccan-gold/50 mt-1">{venueAddress}</p>
              <motion.a href={mapsUrl} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-moroccan-gold to-moroccan-terracotta text-moroccan-deep font-reem">
                <Navigation size={16} /> {ARABIC_OPEN_MAP}
              </motion.a>
            </motion.div>

            {/* RSVP */}
            <div className="bg-moroccan-mid/60 border border-moroccan-gold/20 rounded-2xl p-6 md:p-8">
              <h3 className="text-center font-amiri text-2xl text-moroccan-gold mb-1">{ARABIC_RSVP}</h3>
              <p className="text-center text-sm text-moroccan-gold/50 mb-6">يرجى تأكيد حضوركم قبل الموعد</p>
              <AnimatePresence mode="wait">
                {rsvpDone ? (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                      className="mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br from-moroccan-gold to-moroccan-terracotta flex items-center justify-center">
                      <Heart size={24} className="text-moroccan-deep" fill="currentColor" />
                    </motion.div>
                    <p className="font-reem text-moroccan-gold">{rsvpStatus === 'attending' ? ARABIC_THANKS_ATTENDING : ARABIC_THANKS_DECLINED}</p>
                    <p className="text-sm text-moroccan-gold/30 mt-1">{rsvpName}</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setRsvpStatus('attending')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'attending' ? 'bg-gradient-to-br from-moroccan-gold to-moroccan-terracotta text-moroccan-deep border-transparent' : 'border-moroccan-gold/25 text-moroccan-gold'}`}>
                        <Check size={18} /><span className="font-reem text-sm">{ARABIC_ATTENDING}</span>
                      </button>
                      <button onClick={() => setRsvpStatus('declined')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'declined' ? 'bg-gradient-to-br from-moroccan-gold to-moroccan-terracotta text-moroccan-deep border-transparent' : 'border-moroccan-gold/25 text-moroccan-gold'}`}>
                        <X size={18} /><span className="font-reem text-sm">{ARABIC_DECLINED}</span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-moroccan-gold/50 mb-2">{ARABIC_GUESTS}</label>
                      <div className="flex items-center justify-between bg-moroccan-deep/80 border border-moroccan-gold/25 rounded-xl px-4 py-2">
                        <button onClick={() => setRsvpCount((c) => Math.max(1, c - 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-moroccan-gold to-moroccan-terracotta text-moroccan-deep flex items-center justify-center"><Minus size={16} /></button>
                        <span className="font-cinzel text-2xl text-moroccan-gold">{rsvpCount}</span>
                        <button onClick={() => setRsvpCount((c) => Math.min(10, c + 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-moroccan-gold to-moroccan-terracotta text-moroccan-deep flex items-center justify-center"><Plus size={16} /></button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-moroccan-gold/50 mb-2">{ARABIC_YOUR_NAME}</label>
                      <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="اكتب اسمك الكامل"
                        className="w-full bg-moroccan-deep/80 border border-moroccan-gold/25 text-moroccan-gold placeholder:text-white/20 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-moroccan-gold transition" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!rsvpStatus || !rsvpName.trim()} onClick={handleRSVP}
                      className="w-full py-3.5 rounded-xl font-reem text-base text-moroccan-deep bg-gradient-to-br from-moroccan-gold to-moroccan-terracotta disabled:opacity-40 disabled:cursor-not-allowed">
                      {ARABIC_CONFIRM}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center font-amiri text-moroccan-gold/40 pb-8">في ظلال الأقواس نلتقي</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
