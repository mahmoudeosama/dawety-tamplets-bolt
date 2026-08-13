import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, MapPin, X, Check, Minus, Plus, Heart, Navigation, Sparkles } from 'lucide-react';
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

/* ── Golden frame countdown (unique to GoldenGiftbox) ── */
function GoldenFrameCountdown({ time }: { time: TimeLeft }) {
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
          <div className="relative w-16 h-20 md:w-20 md:h-24 bg-platinum-cream border-2 border-platinum-gold/40 rounded-lg overflow-hidden">
            <div className="absolute inset-1 border border-platinum-gold/20 rounded-md" />
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-platinum-gold/10 to-transparent" />
            <motion.div key={u.value} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="relative h-full flex items-center justify-center font-cinzel text-2xl md:text-3xl text-platinum-gold">
              {String(u.value).padStart(2, '0')}
            </motion.div>
          </div>
          <div className="mt-2 text-[10px] md:text-xs text-platinum-gold/50 font-reem">{u.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Diamond grid gallery (unique to GoldenGiftbox) ── */
function DiamondGridGallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  return (
    <div className="w-full">
      <h3 className="text-center font-marcellus text-2xl text-platinum-gold mb-6">{ARABIC_GALLERY}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.slice(0, 6).map((src, i) => (
          <motion.button key={src + i} onClick={() => setLightbox(i)}
            initial={{ opacity: 0, rotate: -5, scale: 0.9 }} whileInView={{ opacity: 1, rotate: 0, scale: 1 }} viewport={{ once: true }}
            transition={{ delay: i * 0.08, type: 'spring' }} whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden rounded-xl border-2 border-platinum-gold/30 shadow-lg aspect-square">
            <img src={src} alt={`photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-platinum-white/30 to-transparent" />
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[120] bg-platinum-white/95 flex items-center justify-center p-4">
            <button className="absolute top-5 right-5 text-platinum-gold/80" onClick={() => setLightbox(null)}><X size={28} /></button>
            <motion.img key={lightbox} src={images[lightbox]} alt="preview" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-h-[82vh] max-w-[92vw] rounded-xl object-contain shadow-2xl border-2 border-platinum-gold/30" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TemplateGoldenGiftbox(props: SharedInvitationProps) {
  const {
    groomName = DEFAULT_INVITATION.groomName, brideName = DEFAULT_INVITATION.brideName,
    weddingDate = DEFAULT_INVITATION.weddingDate, time = DEFAULT_INVITATION.time,
    venueName = DEFAULT_INVITATION.venueName, venueAddress = DEFAULT_INVITATION.venueAddress,
    storyText = 'كهديةٍ ملفوفة بحريرٍ وشمعبان، نقدم لكم دعوتنا بكل حب. نسأل الله أن يبارك في جمعنا ويجعل ليلتنا فرحةً لا تنسى.',
    latitude, longitude, galleryImages = DEFAULT_GALLERY, onRSVP,
  } = props;

  const [opened, setOpened] = useState(false);
  const [untying, setUntying] = useState(false);
  const timeLeft = useCountdown(weddingDate);
  const music = useAmbientMusic();
  useLockBody(!opened);

  const sparkles = useMemo(() => Array.from({ length: 18 }, () => ({
    x: Math.random() * 100, y: Math.random() * 100, delay: Math.random() * 3, duration: 2 + Math.random() * 3, size: 1 + Math.random() * 3,
  })), []);

  const handleUntie = () => { setUntying(true); setTimeout(() => setOpened(true), 1200); };

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
    <div className="relative min-h-screen bg-platinum-cream text-platinum-gold overflow-hidden font-reem" dir="rtl"
      style={{ backgroundImage: 'radial-gradient(rgba(192,160,96,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-platinum-gold/15 blur-[130px]" />
      </div>
      <div className="pointer-events-none fixed inset-0">
        {sparkles.map((s, i) => (
          <motion.span key={i} className="absolute rounded-full bg-platinum-gold" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
            animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.5, 1.3, 0.5] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity }} />
        ))}
      </div>
      <MusicToggle playing={music.playing} toggle={music.toggle} accentSolid="bg-gradient-to-br from-platinum-goldLight to-platinum-gold" ring="ring-2 ring-platinum-gold/40" />

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="gate" exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.7 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4 perspective-2000">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
              <Gift className="mx-auto text-platinum-gold mb-3" size={40} />
              <p className="font-amiri text-2xl text-platinum-gold">الهدية الذهبية</p>
            </motion.div>

            <div className="relative w-[260px] h-[260px] md:w-[340px] md:h-[340px] perspective-2000">
              {/* center box */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-gradient-to-b from-platinum-white to-platinum-cream border-2 border-platinum-gold/40 rounded-lg shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <p className="font-amiri text-sm md:text-lg text-platinum-gold">{groomName}</p>
                  <p className="font-vibes text-xl text-platinum-gold/60">&</p>
                  <p className="font-amiri text-sm md:text-lg text-platinum-gold">{brideName}</p>
                </div>
              </div>
              {/* silk ribbon vertical */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 bg-gradient-to-b from-platinum-goldLight via-platinum-gold to-platinum-goldLight" />
              {/* silk ribbon horizontal */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-4 bg-gradient-to-r from-platinum-goldLight via-platinum-gold to-platinum-goldLight" />
              {/* ribbon bow */}
              <AnimatePresence>
                {!untying && (
                  <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                    exit={{ scale: 0, opacity: 0, rotate: 180 }} transition={{ duration: 0.6 }}>
                    <div className="relative w-16 h-12">
                      <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-gradient-to-br from-platinum-goldLight to-platinum-gold border border-platinum-gold/40" />
                      <div className="absolute right-0 top-0 w-7 h-7 rounded-full bg-gradient-to-bl from-platinum-goldLight to-platinum-gold border border-platinum-gold/40" />
                      <div className="absolute left-1/2 top-3 -translate-x-1/2 w-3 h-4 rounded-full bg-platinum-gold" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 4 flaps fold out in cross pattern */}
              {/* top flap */}
              <motion.div className="absolute top-0 left-1/4 right-1/4 h-1/2 origin-bottom preserve-3d"
                animate={untying ? { rotateX: 170 } : { rotateX: 0 }} transition={{ duration: 1, delay: 0.1 }}
                style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-platinum-white to-platinum-cream border-2 border-platinum-gold/30 rounded-t-lg shadow-xl" />
              </motion.div>
              {/* bottom flap */}
              <motion.div className="absolute bottom-0 left-1/4 right-1/4 h-1/2 origin-top preserve-3d"
                animate={untying ? { rotateX: -170 } : { rotateX: 0 }} transition={{ duration: 1, delay: 0.1 }}
                style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-gradient-to-b from-platinum-white to-platinum-cream border-2 border-platinum-gold/30 rounded-b-lg shadow-xl" />
              </motion.div>
              {/* left flap */}
              <motion.div className="absolute left-0 top-1/4 bottom-1/4 w-1/2 origin-right preserve-3d"
                animate={untying ? { rotateY: 170 } : { rotateY: 0 }} transition={{ duration: 1, delay: 0.2 }}
                style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-gradient-to-l from-platinum-white to-platinum-cream border-2 border-platinum-gold/30 rounded-l-lg shadow-xl" />
              </motion.div>
              {/* right flap */}
              <motion.div className="absolute right-0 top-1/4 bottom-1/4 w-1/2 origin-left preserve-3d"
                animate={untying ? { rotateY: -170 } : { rotateY: 0 }} transition={{ duration: 1, delay: 0.2 }}
                style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-platinum-white to-platinum-cream border-2 border-platinum-gold/30 rounded-r-lg shadow-xl" />
              </motion.div>
            </div>

            <motion.button onClick={handleUntie} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-10 px-8 py-4 rounded-full bg-gradient-to-br from-platinum-goldLight to-platinum-gold text-platinum-white font-reem text-lg shadow-[0_0_30px_rgba(192,160,96,0.4)] flex items-center gap-2">
              <Sparkles size={18} /> افتح الهدية
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="invite" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 max-w-xl mx-auto px-4 py-12 space-y-12">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <p className="font-amiri text-xl text-platinum-gold">{BISMILLAH}</p>
            </motion.div>

            {/* Hero — gift card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="relative bg-gradient-to-b from-platinum-white to-platinum-cream border-2 border-platinum-gold/30 rounded-2xl p-8 text-center shadow-2xl">
              <div className="absolute inset-3 border border-platinum-gold/20 rounded-xl" />
              <p className="text-platinum-gold/60 mb-4">{ARABIC_INVITES_YOU}</p>
              <h1 className="font-amiri text-5xl text-platinum-gold">{groomName}</h1>
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="font-vibes text-5xl text-platinum-goldLight my-2" style={{ textShadow: '0 0 20px currentColor' }}>&</motion.div>
              <h1 className="font-amiri text-5xl text-platinum-gold">{brideName}</h1>
              <div className="mt-6 inline-block border-y border-platinum-gold/30 py-2 px-6">
                <p className="font-reem text-platinum-gold">{fmtDate(weddingDate)}</p>
                <p className="font-reem text-platinum-gold/60 text-sm">{time}</p>
              </div>
            </motion.div>

            {/* Golden frame countdown */}
            <div className="text-center">
              <h3 className="font-marcellus text-2xl text-platinum-gold mb-6">العد التنازلي للزفاف</h3>
              <GoldenFrameCountdown time={timeLeft} />
            </div>

            {/* Story */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-platinum-white/60 border border-platinum-gold/20 rounded-2xl p-8 text-center">
              <h3 className="font-marcellus text-xl text-platinum-gold mb-4">{ARABIC_OUR_STORY}</h3>
              <p className="font-amiri text-lg leading-loose text-platinum-gold/70">{storyText}</p>
            </motion.div>

            {/* Diamond grid gallery */}
            <DiamondGridGallery images={galleryImages} />

            {/* Venue */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-platinum-white/60 border border-platinum-gold/20 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <MapPin size={20} className="text-platinum-gold" />
                <h3 className="font-marcellus text-xl text-platinum-gold">موقع الحفل</h3>
              </div>
              <p className="font-reem text-lg text-platinum-gold">{venueName}</p>
              <p className="text-sm text-platinum-gold/50 mt-1">{venueAddress}</p>
              <motion.a href={mapsUrl} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-platinum-goldLight to-platinum-gold text-platinum-white font-reem">
                <Navigation size={16} /> {ARABIC_OPEN_MAP}
              </motion.a>
            </motion.div>

            {/* RSVP */}
            <div className="bg-platinum-white/60 border border-platinum-gold/20 rounded-2xl p-6 md:p-8">
              <h3 className="text-center font-marcellus text-2xl text-platinum-gold mb-1">{ARABIC_RSVP}</h3>
              <p className="text-center text-sm text-platinum-gold/50 mb-6">يرجى تأكيد حضوركم قبل الموعد</p>
              <AnimatePresence mode="wait">
                {rsvpDone ? (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                      className="mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br from-platinum-goldLight to-platinum-gold flex items-center justify-center">
                      <Heart size={24} className="text-platinum-white" fill="currentColor" />
                    </motion.div>
                    <p className="font-reem text-platinum-gold">{rsvpStatus === 'attending' ? ARABIC_THANKS_ATTENDING : ARABIC_THANKS_DECLINED}</p>
                    <p className="text-sm text-platinum-gold/30 mt-1">{rsvpName}</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setRsvpStatus('attending')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'attending' ? 'bg-gradient-to-br from-platinum-goldLight to-platinum-gold text-platinum-white border-transparent' : 'border-platinum-gold/25 text-platinum-gold'}`}>
                        <Check size={18} /><span className="font-reem text-sm">{ARABIC_ATTENDING}</span>
                      </button>
                      <button onClick={() => setRsvpStatus('declined')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'declined' ? 'bg-gradient-to-br from-platinum-goldLight to-platinum-gold text-platinum-white border-transparent' : 'border-platinum-gold/25 text-platinum-gold'}`}>
                        <X size={18} /><span className="font-reem text-sm">{ARABIC_DECLINED}</span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-platinum-gold/50 mb-2">{ARABIC_GUESTS}</label>
                      <div className="flex items-center justify-between bg-platinum-cream border border-platinum-gold/25 rounded-xl px-4 py-2">
                        <button onClick={() => setRsvpCount((c) => Math.max(1, c - 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-platinum-goldLight to-platinum-gold text-platinum-white flex items-center justify-center"><Minus size={16} /></button>
                        <span className="font-cinzel text-2xl text-platinum-gold">{rsvpCount}</span>
                        <button onClick={() => setRsvpCount((c) => Math.min(10, c + 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-platinum-goldLight to-platinum-gold text-platinum-white flex items-center justify-center"><Plus size={16} /></button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-platinum-gold/50 mb-2">{ARABIC_YOUR_NAME}</label>
                      <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="اكتب اسمك الكامل"
                        className="w-full bg-platinum-cream border border-platinum-gold/25 text-platinum-gold placeholder:text-black/25 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-platinum-gold transition" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!rsvpStatus || !rsvpName.trim()} onClick={handleRSVP}
                      className="w-full py-3.5 rounded-xl font-reem text-base text-platinum-white bg-gradient-to-br from-platinum-goldLight to-platinum-gold disabled:opacity-40 disabled:cursor-not-allowed">
                      {ARABIC_CONFIRM}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center font-amiri text-platinum-gold/40 pb-8">هديةٌ من القلب</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
