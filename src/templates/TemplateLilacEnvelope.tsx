import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, X, Check, Minus, Plus, Heart, Navigation, Sparkles } from 'lucide-react';
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

/* ── Stamp countdown (unique to LilacEnvelope) ── */
function StampCountdown({ time }: { time: TimeLeft }) {
  const units = [
    { value: time.days, label: ARABIC_DAYS },
    { value: time.hours, label: ARABIC_HOURS },
    { value: time.minutes, label: ARABIC_MINUTES },
    { value: time.seconds, label: ARABIC_SECONDS },
  ];
  return (
    <div className="flex justify-center gap-3 md:gap-4">
      {units.map((u) => (
        <div key={u.label} className="text-center">
          <div className="relative w-16 h-20 md:w-18 md:h-24 bg-lilac-mid border-2 border-lilac-gold/30 rounded-lg p-2">
            {/* perforated edge */}
            <div className="absolute inset-0 rounded-lg" style={{ border: '2px dashed rgba(192,176,112,0.2)' }} />
            <motion.div key={u.value} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="relative h-full flex items-center justify-center font-cinzel text-xl md:text-2xl text-lilac-light">
              {String(u.value).padStart(2, '0')}
            </motion.div>
          </div>
          <div className="mt-2 text-[10px] md:text-xs text-lilac-gold/50 font-reem">{u.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Rounded oval gallery (unique to LilacEnvelope) ── */
function OvalGallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  return (
    <div className="w-full">
      <h3 className="text-center font-amiri text-2xl text-lilac-light mb-6">{ARABIC_GALLERY}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.slice(0, 6).map((src, i) => (
          <motion.button key={src + i} onClick={() => setLightbox(i)}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden rounded-full border-2 border-lilac-gold/30 shadow-lg aspect-square">
            <img src={src} alt={`photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[120] bg-lilac-deep/95 flex items-center justify-center p-4">
            <button className="absolute top-5 right-5 text-lilac-light/80" onClick={() => setLightbox(null)}><X size={28} /></button>
            <motion.img key={lightbox} src={images[lightbox]} alt="preview" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-h-[82vh] max-w-[92vw] rounded-lg object-contain shadow-2xl border border-lilac-gold/30" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TemplateLilacEnvelope(props: SharedInvitationProps) {
  const {
    groomName = DEFAULT_INVITATION.groomName, brideName = DEFAULT_INVITATION.brideName,
    weddingDate = DEFAULT_INVITATION.weddingDate, time = DEFAULT_INVITATION.time,
    venueName = DEFAULT_INVITATION.venueName, venueAddress = DEFAULT_INVITATION.venueAddress,
    storyText = 'كظرفٍ يحمل شذى اللافندر، نبعث إليكم دعوتنا المليئة بالحب. نسأل الله أن يبارك في جمعنا ويجعل ليلتنا فرحةً لا تنسى.',
    latitude, longitude, galleryImages = DEFAULT_GALLERY, onRSVP,
  } = props;

  const [opened, setOpened] = useState(false);
  const [flapOpen, setFlapOpen] = useState(false);
  const timeLeft = useCountdown(weddingDate);
  const music = useAmbientMusic();
  useLockBody(!opened);

  const sparkles = useMemo(() => Array.from({ length: 14 }, () => ({
    x: Math.random() * 100, y: Math.random() * 100, delay: Math.random() * 3, duration: 2 + Math.random() * 3, size: 1 + Math.random() * 2,
  })), []);

  const handleFlap = () => { setFlapOpen(true); setTimeout(() => setOpened(true), 1000); };

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
    <div className="relative min-h-screen bg-lilac-deep text-lilac-light overflow-hidden font-reem" dir="rtl">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-lilac-lilac/15 blur-[130px]" />
      </div>
      <div className="pointer-events-none fixed inset-0">
        {sparkles.map((s, i) => (
          <motion.span key={i} className="absolute rounded-full bg-lilac-gold" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
            animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.5, 1.3, 0.5] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity }} />
        ))}
      </div>
      <MusicToggle playing={music.playing} toggle={music.toggle} accentSolid="bg-gradient-to-br from-lilac-gold to-lilac-lilac" ring="ring-2 ring-lilac-gold/40" />

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="gate" exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.7 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4 perspective-2000">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
              <Mail className="mx-auto text-lilac-gold mb-3" size={40} />
              <p className="font-amiri text-2xl text-lilac-light">ظرف اللافندر</p>
            </motion.div>

            <div className="relative w-[280px] h-[200px] md:w-[380px] md:h-[280px] perspective-2000">
              {/* envelope body */}
              <div className="absolute inset-0 bg-gradient-to-b from-lilac-mid to-lilac-deep border-2 border-lilac-gold/30 rounded-lg shadow-2xl">
                <div className="absolute inset-3 border border-lilac-gold/20 rounded-lg" />
                <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                  <div>
                    <p className="font-amiri text-2xl md:text-3xl text-lilac-light">{groomName}</p>
                    <p className="font-vibes text-3xl text-lilac-gold/60">&</p>
                    <p className="font-amiri text-2xl md:text-3xl text-lilac-light">{brideName}</p>
                  </div>
                </div>
              </div>
              {/* flap opens downward */}
              <motion.div className="absolute top-0 left-0 right-0 origin-top preserve-3d"
                animate={flapOpen ? { rotateX: 175 } : { rotateX: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: 'preserve-3d' }}>
                <div className="relative w-full h-[100px] md:h-[140px] bg-gradient-to-b from-lilac-lilac/60 to-lilac-mid border-2 border-lilac-gold/30 rounded-t-lg">
                  <div className="absolute inset-3 border border-lilac-gold/20 rounded-t-lg" />
                  {/* lavender seal */}
                  <AnimatePresence>
                    {!flapOpen && (
                      <motion.button onClick={handleFlap} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        exit={{ scale: [1, 1.5, 0], opacity: 0 }} transition={{ duration: 0.5 }}
                        className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 z-20 w-14 h-14 rounded-full bg-gradient-to-br from-lilac-gold to-lilac-lilac flex items-center justify-center shadow-[0_0_25px_rgba(192,176,112,0.5)] border-2 border-lilac-light/30">
                        <Heart size={20} className="text-lilac-deep" fill="currentColor" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            <motion.button onClick={handleFlap} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-10 px-8 py-4 rounded-full bg-gradient-to-br from-lilac-gold to-lilac-lilac text-lilac-deep font-reem text-lg shadow-[0_0_30px_rgba(192,176,112,0.4)] flex items-center gap-2">
              <Sparkles size={18} /> افتح الظرف
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="invite" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 max-w-xl mx-auto px-4 py-12 space-y-12">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <p className="font-amiri text-xl text-lilac-gold">{BISMILLAH}</p>
            </motion.div>

            {/* Hero — letter card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="relative bg-gradient-to-b from-lilac-mid to-lilac-deep border-2 border-lilac-gold/30 rounded-lg p-8 text-center shadow-2xl">
              <div className="absolute inset-3 border border-lilac-gold/20 rounded-lg" />
              <p className="text-lilac-gold/60 mb-4">{ARABIC_INVITES_YOU}</p>
              <h1 className="font-amiri text-5xl text-lilac-light">{groomName}</h1>
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="font-vibes text-5xl text-lilac-gold my-2" style={{ textShadow: '0 0 20px currentColor' }}>&</motion.div>
              <h1 className="font-amiri text-5xl text-lilac-light">{brideName}</h1>
              <div className="mt-6 inline-block border-y border-lilac-gold/30 py-2 px-6">
                <p className="font-reem text-lilac-light">{fmtDate(weddingDate)}</p>
                <p className="font-reem text-lilac-gold/60 text-sm">{time}</p>
              </div>
            </motion.div>

            {/* Stamp countdown */}
            <div className="text-center">
              <h3 className="font-amiri text-2xl text-lilac-light mb-6">العد التنازلي للزفاف</h3>
              <StampCountdown time={timeLeft} />
            </div>

            {/* Story */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-lilac-mid/60 border border-lilac-gold/20 rounded-2xl p-8 text-center">
              <h3 className="font-amiri text-xl text-lilac-light mb-4">{ARABIC_OUR_STORY}</h3>
              <p className="font-amiri text-lg leading-loose text-lilac-light/70">{storyText}</p>
            </motion.div>

            {/* Oval gallery */}
            <OvalGallery images={galleryImages} />

            {/* Venue */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-lilac-mid/60 border border-lilac-gold/20 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <MapPin size={20} className="text-lilac-gold" />
                <h3 className="font-amiri text-xl text-lilac-light">موقع الحفل</h3>
              </div>
              <p className="font-reem text-lg text-lilac-light">{venueName}</p>
              <p className="text-sm text-lilac-gold/50 mt-1">{venueAddress}</p>
              <motion.a href={mapsUrl} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-lilac-gold to-lilac-lilac text-lilac-deep font-reem">
                <Navigation size={16} /> {ARABIC_OPEN_MAP}
              </motion.a>
            </motion.div>

            {/* RSVP */}
            <div className="bg-lilac-mid/60 border border-lilac-gold/20 rounded-2xl p-6 md:p-8">
              <h3 className="text-center font-amiri text-2xl text-lilac-light mb-1">{ARABIC_RSVP}</h3>
              <p className="text-center text-sm text-lilac-gold/50 mb-6">يرجى تأكيد حضوركم قبل الموعد</p>
              <AnimatePresence mode="wait">
                {rsvpDone ? (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                      className="mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br from-lilac-gold to-lilac-lilac flex items-center justify-center">
                      <Heart size={24} className="text-lilac-deep" fill="currentColor" />
                    </motion.div>
                    <p className="font-reem text-lilac-light">{rsvpStatus === 'attending' ? ARABIC_THANKS_ATTENDING : ARABIC_THANKS_DECLINED}</p>
                    <p className="text-sm text-lilac-gold/30 mt-1">{rsvpName}</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setRsvpStatus('attending')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'attending' ? 'bg-gradient-to-br from-lilac-gold to-lilac-lilac text-lilac-deep border-transparent' : 'border-lilac-gold/25 text-lilac-light'}`}>
                        <Check size={18} /><span className="font-reem text-sm">{ARABIC_ATTENDING}</span>
                      </button>
                      <button onClick={() => setRsvpStatus('declined')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'declined' ? 'bg-gradient-to-br from-lilac-gold to-lilac-lilac text-lilac-deep border-transparent' : 'border-lilac-gold/25 text-lilac-light'}`}>
                        <X size={18} /><span className="font-reem text-sm">{ARABIC_DECLINED}</span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-lilac-gold/50 mb-2">{ARABIC_GUESTS}</label>
                      <div className="flex items-center justify-between bg-lilac-deep/80 border border-lilac-gold/25 rounded-xl px-4 py-2">
                        <button onClick={() => setRsvpCount((c) => Math.max(1, c - 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-lilac-gold to-lilac-lilac text-lilac-deep flex items-center justify-center"><Minus size={16} /></button>
                        <span className="font-cinzel text-2xl text-lilac-light">{rsvpCount}</span>
                        <button onClick={() => setRsvpCount((c) => Math.min(10, c + 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-lilac-gold to-lilac-lilac text-lilac-deep flex items-center justify-center"><Plus size={16} /></button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-lilac-gold/50 mb-2">{ARABIC_YOUR_NAME}</label>
                      <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="اكتب اسمك الكامل"
                        className="w-full bg-lilac-deep/80 border border-lilac-gold/25 text-lilac-light placeholder:text-white/20 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-lilac-gold transition" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!rsvpStatus || !rsvpName.trim()} onClick={handleRSVP}
                      className="w-full py-3.5 rounded-xl font-reem text-base text-lilac-deep bg-gradient-to-br from-lilac-gold to-lilac-lilac disabled:opacity-40 disabled:cursor-not-allowed">
                      {ARABIC_CONFIRM}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center font-amiri text-lilac-gold/40 pb-8">شذى اللافندر يحمل دعوتنا</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
