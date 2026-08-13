import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, MapPin, X, Check, Minus, Plus, Heart, Navigation, Sparkles } from 'lucide-react';
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

/* ── Wax seal countdown (unique to VintageFold) ── */
function WaxSealCountdown({ time }: { time: TimeLeft }) {
  const units = [
    { value: time.days, label: ARABIC_DAYS },
    { value: time.hours, label: ARABIC_HOURS },
    { value: time.minutes, label: ARABIC_MINUTES },
    { value: time.seconds, label: ARABIC_SECONDS },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
      {units.map((u) => (
        <div key={u.label} className="relative bg-sepia-parchment/80 border-2 border-sepia-ink/30 rounded-lg p-3 text-center">
          <motion.div key={u.value} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="font-cinzel text-2xl text-sepia-ink">{String(u.value).padStart(2, '0')}</motion.div>
          <div className="text-[10px] text-sepia-ink/60 font-reem mt-1">{u.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Scrapbook gallery (unique to VintageFold) ── */
function ScrapbookGallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const rotations = [-4, 3, -2, 5, -3, 2];
  return (
    <div className="w-full">
      <h3 className="text-center font-amiri text-2xl text-sepia-ink mb-6">{ARABIC_GALLERY}</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {images.slice(0, 6).map((src, i) => (
          <motion.button key={src + i} onClick={() => setLightbox(i)}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.1, type: 'spring' }} whileHover={{ scale: 1.1, rotate: 0, zIndex: 10 }}
            className="relative bg-sepia-parchment p-1.5 pb-5 shadow-xl border border-sepia-ink/20"
            style={{ width: 110, height: 140, transform: `rotate(${rotations[i % 6]}deg)` }}>
            <img src={src} alt={`photo ${i + 1}`} loading="lazy" className="w-full h-[100px] object-cover sepia" />
            <p className="text-center text-[8px] text-sepia-ink/50 font-reem mt-1">ذكرى {i + 1}</p>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[120] bg-sepia-dark/95 flex items-center justify-center p-4">
            <button className="absolute top-5 right-5 text-sepia-parchment/80" onClick={() => setLightbox(null)}><X size={28} /></button>
            <motion.img key={lightbox} src={images[lightbox]} alt="preview" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-h-[82vh] max-w-[92vw] rounded-lg object-contain shadow-2xl border-2 border-sepia-parchment/30" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TemplateVintageFold(props: SharedInvitationProps) {
  const {
    groomName = DEFAULT_INVITATION.groomName, brideName = DEFAULT_INVITATION.brideName,
    weddingDate = DEFAULT_INVITATION.weddingDate, time = DEFAULT_INVITATION.time,
    venueName = DEFAULT_INVITATION.venueName, venueAddress = DEFAULT_INVITATION.venueAddress,
    storyText = 'كحكايةٍ من صميم الزمن القديم، كُتبت سطور محبتنا على رقٍّ من parchment. نسأل الله أن يديم بيننا المودة والرحمة.',
    latitude, longitude, galleryImages = DEFAULT_GALLERY, onRSVP,
  } = props;

  const [opened, setOpened] = useState(false);
  const [sealCracked, setSealCracked] = useState(false);
  const timeLeft = useCountdown(weddingDate);
  const music = useAmbientMusic();
  useLockBody(!opened);

  const dust = useMemo(() => Array.from({ length: 12 }, () => ({
    x: Math.random() * 100, delay: Math.random() * 5, duration: 6 + Math.random() * 4, size: 2 + Math.random() * 3,
  })), []);

  const handleSeal = () => { setSealCracked(true); setTimeout(() => setOpened(true), 1000); };

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
    <div className="relative min-h-screen bg-sepia-dark text-sepia-parchment overflow-hidden font-reem" dir="rtl"
      style={{ backgroundImage: 'radial-gradient(rgba(107,82,56,0.15) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      <div className="pointer-events-none fixed inset-0">
        {dust.map((d, i) => (
          <motion.span key={i} className="absolute rounded-full bg-sepia-light/30"
            style={{ left: `${d.x}%`, width: d.size, height: d.size }}
            animate={{ y: ['0vh', '110vh'], opacity: [0, 0.6, 0] }}
            transition={{ duration: d.duration, delay: d.delay, repeat: Infinity }} />
        ))}
      </div>
      <MusicToggle playing={music.playing} toggle={music.toggle} accentSolid="bg-gradient-to-br from-sepia-light to-sepia-ink" ring="ring-2 ring-sepia-ink/40" />

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="gate" exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.7 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
              <Scroll className="mx-auto text-sepia-light mb-3" size={40} />
              <p className="font-amiri text-2xl text-sepia-parchment">الرسالة القديمة</p>
            </motion.div>

            <div className="relative w-[280px] h-[400px] md:w-[360px] md:h-[480px]">
              {/* center letter */}
              <div className="absolute inset-0 bg-gradient-to-b from-sepia-parchment to-sepia-light/80 rounded-lg shadow-2xl border-2 border-sepia-ink/30"
                style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 28px, rgba(58,40,16,0.1) 29px)' }}>
                <div className="absolute inset-4 border border-sepia-ink/20 rounded-lg" />
                <div className="absolute inset-0 flex items-center justify-center text-center px-8">
                  <div>
                    <p className="font-amiri text-sm text-sepia-ink/60 mb-2">{BISMILLAH}</p>
                    <p className="font-amiri text-2xl text-sepia-ink">{groomName}</p>
                    <p className="font-vibes text-3xl text-sepia-light/60">&</p>
                    <p className="font-amiri text-2xl text-sepia-ink">{brideName}</p>
                  </div>
                </div>
              </div>

              {/* left flap */}
              <motion.div className="absolute top-0 left-0 w-1/3 h-full origin-left preserve-3d"
                animate={sealCracked ? { rotateY: -110 } : { rotateY: 0 }} transition={{ duration: 1, delay: 0.1 }}
                style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-sepia-mid to-sepia-dark border-r-2 border-sepia-ink/40 rounded-l-lg shadow-xl">
                  <div className="absolute inset-2 border border-sepia-ink/20 rounded-lg" />
                </div>
              </motion.div>
              {/* right flap */}
              <motion.div className="absolute top-0 right-0 w-1/3 h-full origin-right preserve-3d"
                animate={sealCracked ? { rotateY: 110 } : { rotateY: 0 }} transition={{ duration: 1, delay: 0.1 }}
                style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-gradient-to-l from-sepia-mid to-sepia-dark border-l-2 border-sepia-ink/40 rounded-r-lg shadow-xl">
                  <div className="absolute inset-2 border border-sepia-ink/20 rounded-lg" />
                </div>
              </motion.div>
              {/* bottom flap */}
              <motion.div className="absolute bottom-0 left-0 right-0 h-1/3 origin-bottom preserve-3d"
                animate={sealCracked ? { rotateX: 110 } : { rotateX: 0 }} transition={{ duration: 1, delay: 0.2 }}
                style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-sepia-mid to-sepia-dark border-t-2 border-sepia-ink/40 rounded-b-lg shadow-xl">
                  <div className="absolute inset-2 border border-sepia-ink/20 rounded-lg" />
                </div>
              </motion.div>

              {/* leather cord */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-sepia-ink/40 -translate-y-1/2 z-10" />
              {/* wax seal */}
              <AnimatePresence>
                {!sealCracked && (
                  <motion.button onClick={handleSeal} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    exit={{ scale: [1, 1.5, 0], opacity: 0, rotate: 20 }} transition={{ duration: 0.5 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-20 h-20 rounded-full bg-gradient-to-br from-sepia-light to-sepia-ink flex items-center justify-center shadow-[0_0_25px_rgba(107,82,56,0.5)] border-2 border-sepia-ink/40">
                    <Heart size={24} className="text-sepia-parchment" fill="currentColor" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <motion.button onClick={handleSeal} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-10 px-8 py-4 rounded-full bg-gradient-to-br from-sepia-light to-sepia-ink text-sepia-parchment font-reem text-lg shadow-xl flex items-center gap-2">
              <Sparkles size={18} /> اكسر الختم وافتح
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="invite" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 max-w-xl mx-auto px-4 py-12 space-y-12">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <p className="font-amiri text-xl text-sepia-ink/80">{BISMILLAH}</p>
            </motion.div>

            {/* Hero — calligraphy on parchment */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="relative bg-gradient-to-b from-sepia-parchment to-sepia-light/60 border-2 border-sepia-ink/30 rounded-lg p-8 text-center shadow-2xl"
              style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 28px, rgba(58,40,16,0.08) 29px)' }}>
              <div className="absolute inset-3 border border-sepia-ink/20 rounded-lg" />
              <p className="text-sepia-ink/60 text-sm mb-4">{ARABIC_INVITES_YOU}</p>
              <h1 className="font-amiri text-5xl text-sepia-ink">{groomName}</h1>
              <div className="font-vibes text-4xl text-sepia-light/60 my-2">&</div>
              <h1 className="font-amiri text-5xl text-sepia-ink">{brideName}</h1>
              <div className="mt-6 inline-block border-y border-sepia-ink/30 py-2 px-6">
                <p className="font-reem text-sepia-ink">{fmtDate(weddingDate)}</p>
                <p className="font-reem text-sepia-ink/60 text-sm">{time}</p>
              </div>
            </motion.div>

            {/* Wax seal countdown */}
            <div className="text-center">
              <h3 className="font-amiri text-2xl text-sepia-parchment mb-6">العد التنازلي للزفاف</h3>
              <WaxSealCountdown time={timeLeft} />
            </div>

            {/* Story on parchment */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-sepia-parchment/70 border-2 border-sepia-ink/20 rounded-lg p-8 text-center"
              style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 28px, rgba(58,40,16,0.08) 29px)' }}>
              <h3 className="font-amiri text-xl text-sepia-ink mb-4">{ARABIC_OUR_STORY}</h3>
              <p className="font-amiri text-lg leading-loose text-sepia-ink/70">{storyText}</p>
            </motion.div>

            {/* Scrapbook gallery */}
            <ScrapbookGallery images={galleryImages} />

            {/* Venue */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-sepia-parchment/70 border-2 border-sepia-ink/20 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <MapPin size={20} className="text-sepia-ink" />
                <h3 className="font-amiri text-xl text-sepia-ink">موقع الحفل</h3>
              </div>
              <p className="font-reem text-lg text-sepia-ink">{venueName}</p>
              <p className="text-sm text-sepia-ink/50 mt-1">{venueAddress}</p>
              <motion.a href={mapsUrl} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-sepia-light to-sepia-ink text-sepia-parchment font-reem">
                <Navigation size={16} /> {ARABIC_OPEN_MAP}
              </motion.a>
            </motion.div>

            {/* RSVP */}
            <div className="bg-sepia-parchment/70 border-2 border-sepia-ink/20 rounded-2xl p-6 md:p-8">
              <h3 className="text-center font-amiri text-2xl text-sepia-ink mb-1">{ARABIC_RSVP}</h3>
              <p className="text-center text-sm text-sepia-ink/50 mb-6">يرجى تأكيد حضوركم قبل الموعد</p>
              <AnimatePresence mode="wait">
                {rsvpDone ? (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                      className="mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br from-sepia-light to-sepia-ink flex items-center justify-center">
                      <Heart size={24} className="text-sepia-parchment" fill="currentColor" />
                    </motion.div>
                    <p className="font-reem text-sepia-ink">{rsvpStatus === 'attending' ? ARABIC_THANKS_ATTENDING : ARABIC_THANKS_DECLINED}</p>
                    <p className="text-sm text-sepia-ink/40 mt-1">{rsvpName}</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setRsvpStatus('attending')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'attending' ? 'bg-gradient-to-br from-sepia-light to-sepia-ink text-sepia-parchment border-transparent' : 'border-sepia-ink/25 text-sepia-ink'}`}>
                        <Check size={18} /><span className="font-reem text-sm">{ARABIC_ATTENDING}</span>
                      </button>
                      <button onClick={() => setRsvpStatus('declined')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'declined' ? 'bg-gradient-to-br from-sepia-light to-sepia-ink text-sepia-parchment border-transparent' : 'border-sepia-ink/25 text-sepia-ink'}`}>
                        <X size={18} /><span className="font-reem text-sm">{ARABIC_DECLINED}</span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-sepia-ink/50 mb-2">{ARABIC_GUESTS}</label>
                      <div className="flex items-center justify-between bg-sepia-dark/40 border border-sepia-ink/25 rounded-xl px-4 py-2">
                        <button onClick={() => setRsvpCount((c) => Math.max(1, c - 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-sepia-light to-sepia-ink text-sepia-parchment flex items-center justify-center"><Minus size={16} /></button>
                        <span className="font-cinzel text-2xl text-sepia-ink">{rsvpCount}</span>
                        <button onClick={() => setRsvpCount((c) => Math.min(10, c + 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-sepia-light to-sepia-ink text-sepia-parchment flex items-center justify-center"><Plus size={16} /></button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-sepia-ink/50 mb-2">{ARABIC_YOUR_NAME}</label>
                      <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="اكتب اسمك الكامل"
                        className="w-full bg-sepia-dark/40 border border-sepia-ink/25 text-sepia-ink placeholder:text-sepia-ink/30 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-sepia-ink transition" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!rsvpStatus || !rsvpName.trim()} onClick={handleRSVP}
                      className="w-full py-3.5 rounded-xl font-reem text-base text-sepia-parchment bg-gradient-to-br from-sepia-light to-sepia-ink disabled:opacity-40 disabled:cursor-not-allowed">
                      {ARABIC_CONFIRM}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center font-amiri text-sepia-parchment/40 pb-8">رسالةٌ من القلب</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
