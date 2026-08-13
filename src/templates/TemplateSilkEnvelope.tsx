import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, MapPin, X, Check, Minus, Plus, Navigation } from 'lucide-react';
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
} from './shared/types';
import { useCountdown, useAmbientMusic, useLockBody, TimeLeft } from './shared/hooks';
import { MusicToggle } from './shared/MusicToggle';

const fmtDate = (d: string) =>
  new Intl.DateTimeFormat('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d));

const PETAL_EMOJIS = ['🌸', '🌹', '🌺', '🌷'];

/* ── Ribbon countdown (unique to Silk) — vertical ribbon with hanging tags ── */
function RibbonCountdown({ time }: { time: TimeLeft }) {
  const units = [
    { value: time.days, label: ARABIC_DAYS },
    { value: time.hours, label: ARABIC_HOURS },
    { value: time.minutes, label: ARABIC_MINUTES },
    { value: time.seconds, label: ARABIC_SECONDS },
  ];
  return (
    <div className="relative flex justify-center">
      {/* vertical ribbon */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1.5 bg-gradient-to-b from-silk-roseGold via-silk-rose to-silk-roseGold rounded-full" />
      <div className="relative flex flex-col gap-6 py-4">
        {units.map((u, i) => (
          <motion.div
            key={u.label}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center gap-4 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
          >
            {/* tag */}
            <div className="relative bg-silk-burgundyLight/60 border border-silk-roseGold/30 rounded-lg px-5 py-3 shadow-lg">
              <motion.div
                key={u.value}
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="font-vibes text-3xl text-silk-roseGold"
              >
                {String(u.value).padStart(2, '0')}
              </motion.div>
              <div className="text-[10px] text-silk-rose/60 font-reem text-center">{u.label}</div>
              {/* string to ribbon */}
              <div className={`absolute top-1/2 ${i % 2 === 0 ? 'right-full' : 'left-full'} w-4 h-px bg-silk-roseGold/40`} />
            </div>
            {/* knot on ribbon */}
            <div className="relative z-10 w-3 h-3 rounded-full bg-silk-roseGold shadow-md shrink-0" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Heart collage gallery (unique to Silk) ── */
function HeartCollageGallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Heart-shaped grid using CSS grid areas
  const heartLayout = [
    'col-start-1 col-span-1 row-start-1',
    'col-start-2 col-span-1 row-start-1',
    'col-start-4 col-span-1 row-start-1',
    'col-start-5 col-span-1 row-start-1',
    'col-start-1 col-span-1 row-start-2',
    'col-start-2 col-span-1 row-start-2',
    'col-start-3 col-span-1 row-start-2',
    'col-start-4 col-span-1 row-start-2',
    'col-start-5 col-span-1 row-start-2',
    'col-start-2 col-span-1 row-start-3',
    'col-start-3 col-span-1 row-start-3',
    'col-start-4 col-span-1 row-start-3',
    'col-start-3 col-span-1 row-start-4',
  ];

  return (
    <div className="w-full">
      <h3 className="text-center font-vibes text-3xl text-silk-roseGold mb-8">{ARABIC_GALLERY}</h3>
      <div className="grid grid-cols-5 gap-1.5 max-w-md mx-auto">
        {images.slice(0, 6).map((src, i) => {
          const pos = heartLayout[i] || heartLayout[i % heartLayout.length];
          return (
            <motion.button
              key={src + i}
              onClick={() => setLightbox(i)}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.1, zIndex: 10 }}
              className={`relative overflow-hidden rounded-lg border border-silk-roseGold/20 ${pos} aspect-square`}
            >
              <img src={src} alt={`photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-silk-burgundy/20" />
            </motion.button>
          );
        })}
        {/* decorative heart in center */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="col-start-3 row-start-1 row-span-1 flex items-center justify-center"
        >
          <Heart size={20} className="text-silk-roseGold/40" fill="currentColor" />
        </motion.div>
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[120] bg-silk-burgundy/95 flex items-center justify-center p-4">
            <button className="absolute top-5 right-5 text-silk-rose/80 hover:text-silk-rose" onClick={() => setLightbox(null)}><X size={28} /></button>
            <motion.img key={lightbox} src={images[lightbox]} alt="preview"
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-h-[82vh] max-w-[92vw] rounded-lg object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TemplateSilkEnvelope(props: SharedInvitationProps) {
  const {
    groomName = DEFAULT_INVITATION.groomName,
    brideName = DEFAULT_INVITATION.brideName,
    weddingDate = DEFAULT_INVITATION.weddingDate,
    time = DEFAULT_INVITATION.time,
    venueName = DEFAULT_INVITATION.venueName,
    venueAddress = DEFAULT_INVITATION.venueAddress,
    storyText = 'كحكاية الورد، بدأت قصتنا بتفتّحٍ هادئ، ثم أينعت محبةً لا تذبل. نسأل الله أن يديم بيننا المودة والرحمة.',
    latitude, longitude,
    galleryImages = DEFAULT_GALLERY,
    onRSVP,
  } = props;

  const [opened, setOpened] = useState(false);
  const [sealCracked, setSealCracked] = useState(false);
  const timeLeft = useCountdown(weddingDate);
  const music = useAmbientMusic();
  useLockBody(!opened);

  const petals = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({
      id: i, emoji: PETAL_EMOJIS[i % PETAL_EMOJIS.length],
      left: Math.random() * 100, delay: Math.random() * 8,
      duration: 7 + Math.random() * 6, size: 16 + Math.random() * 16,
    })), []
  );

  const sparkles = useMemo(
    () => Array.from({ length: 14 }, () => ({
      x: 40 + Math.random() * 20, y: 40 + Math.random() * 20, delay: Math.random() * 0.5,
    })), []
  );

  const handleSeal = () => {
    setSealCracked(true);
    setTimeout(() => setOpened(true), 900);
  };

  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'declined' | null>(null);
  const [rsvpCount, setRsvpCount] = useState(1);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpDone, setRsvpDone] = useState(false);

  const lat = latitude ?? 30.0074;
  const lng = longitude ?? 31.4913;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="relative min-h-screen bg-silk-burgundy text-silk-rose overflow-hidden font-reem" dir="rtl">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-silk-burgundyLight/30 via-transparent to-silk-burgundyLight/20" />
      </div>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {petals.map((p) => (
          <motion.span key={p.id} className="absolute top-0" style={{ left: `${p.left}%`, fontSize: p.size }}
            animate={{ y: ['0vh', '110vh'], x: [0, 30, -20, 10], rotate: [0, 360], opacity: [0, 1, 1, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}>
            {p.emoji}
          </motion.span>
        ))}
      </div>
      <MusicToggle playing={music.playing} toggle={music.toggle} accentSolid="bg-gradient-to-br from-silk-roseGold to-silk-burgundyLight" ring="ring-2 ring-silk-roseGold/40" />

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="gate" exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.7 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4 perspective-2000">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
              <Heart className="mx-auto text-silk-roseGold mb-3" size={44} fill="currentColor" />
              <p className="font-vibes text-3xl text-silk-rose">ظرف حريري</p>
            </motion.div>

            <div className="relative w-[300px] h-[240px] md:w-[400px] md:h-[320px]">
              <div className="absolute inset-0 bg-gradient-to-b from-silk-burgundyLight to-silk-burgundy rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-silk-roseGold/20" />
              <div className="absolute inset-x-4 bottom-4 top-16 bg-silk-burgundy/60 rounded-lg" />
              <motion.div className="absolute top-0 left-0 right-0 origin-top preserve-3d"
                style={{ width: 0, height: 0, borderLeft: '150px solid transparent', borderRight: '150px solid transparent', borderTop: '130px solid rgba(42,18,31,0.95)', transformStyle: 'preserve-3d' }}
                animate={sealCracked ? { rotateX: 175 } : { rotateX: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
                <div className="absolute top-[-130px] left-[-150px] w-full h-full flex items-end justify-center">
                  <div className="w-full h-1/2 bg-gradient-to-b from-silk-burgundyLight/50 to-transparent" />
                </div>
              </motion.div>
              <AnimatePresence>
                {!sealCracked && (
                  <motion.button onClick={handleSeal} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                    exit={{ scale: [1, 1.6, 0], opacity: 0, rotate: 20 }} transition={{ duration: 0.6 }}
                    className="absolute top-[90px] left-1/2 -translate-x-1/2 z-20 w-20 h-20 rounded-full bg-gradient-to-br from-silk-roseGold to-silk-burgundy flex items-center justify-center shadow-[0_0_30px_rgba(183,110,121,0.6)] border-2 border-silk-rose/40">
                    <Heart size={28} className="text-silk-burgundy" fill="currentColor" />
                  </motion.button>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {sealCracked && !opened && (
                  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-[110px] left-1/2 -translate-x-1/2 pointer-events-none">
                    {sparkles.map((s, i) => (
                      <motion.span key={i} className="absolute text-silk-roseGold"
                        initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                        animate={{ x: (s.x - 50) * 3, y: (s.y - 50) * 3, opacity: 0, scale: [0, 1.2, 0] }}
                        transition={{ duration: 0.9, delay: s.delay }}>
                        <Sparkles size={14} />
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              {!sealCracked && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 font-vibes text-xl text-silk-rose/70 whitespace-nowrap">
                  اضغطي على الختم
                </motion.p>
              )}
            </div>

            <motion.button onClick={handleSeal} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-10 px-8 py-4 rounded-full bg-gradient-to-br from-silk-roseGold to-silk-burgundyLight text-silk-burgundy font-reem text-lg shadow-[0_0_30px_rgba(183,110,121,0.4)] flex items-center gap-2">
              <Sparkles size={18} /> افتح الظرف الحريري
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="invite" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 max-w-xl mx-auto px-4 py-12 space-y-10">

            {/* Bismillah as love letter header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <Heart size={16} className="text-silk-roseGold/50 mx-auto mb-2" fill="currentColor" />
              <p className="font-vibes text-2xl text-silk-roseGold">{BISMILLAH}</p>
              <Heart size={16} className="text-silk-roseGold/50 mx-auto mt-2" fill="currentColor" />
            </motion.div>

            {/* Love letter format — handwriting style on parchment paper */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="relative bg-gradient-to-b from-silk-burgundyLight/40 to-silk-burgundy/40 border border-silk-roseGold/20 rounded-lg p-8 shadow-2xl">
              {/* paper texture lines */}
              <div className="absolute inset-0 opacity-5 rounded-lg"
                style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(183,110,121,0.5) 32px)' }} />
              <div className="relative text-center">
                <p className="font-vibes text-xl text-silk-rose/70 mb-4">حبيبي العزيز،</p>
                <p className="font-vibes text-2xl text-silk-rose/80 leading-relaxed">
                  يسعدنا أن ندعوك لمشاركتنا<br />فرحة زفافنا
                </p>
                {/* Names in large calligraphy */}
                <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
                  className="font-vibes text-6xl md:text-7xl text-silk-roseGold mt-6" style={{ textShadow: '0 0 30px rgba(183,110,121,0.5)' }}>
                  {groomName}
                </motion.h1>
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="font-vibes text-5xl text-silk-roseGold my-2" style={{ textShadow: '0 0 24px currentColor' }}>&</motion.div>
                <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
                  className="font-vibes text-6xl md:text-7xl text-silk-roseGold" style={{ textShadow: '0 0 30px rgba(183,110,121,0.5)' }}>
                  {brideName}
                </motion.h1>
                {/* Date as postmark */}
                <div className="mt-6 inline-block border-2 border-silk-roseGold/30 rounded-full px-6 py-2">
                  <p className="font-vibes text-xl text-silk-rose">{fmtDate(weddingDate)}</p>
                  <p className="font-reem text-sm text-silk-rose/60">{time}</p>
                </div>
              </div>
            </motion.div>

            {/* Ribbon countdown */}
            <div>
              <h3 className="text-center font-vibes text-2xl text-silk-roseGold mb-6">العد التنازلي للزفاف</h3>
              <RibbonCountdown time={timeLeft} />
            </div>

            {/* Story as love letter continuation */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-silk-burgundyLight/30 border border-silk-roseGold/20 rounded-lg p-8">
              <h3 className="text-center font-vibes text-2xl text-silk-roseGold mb-4">{ARABIC_OUR_STORY}</h3>
              <p className="font-vibes text-xl text-silk-rose/80 leading-loose text-center">{storyText}</p>
              <div className="text-center mt-4 text-silk-roseGold/40 text-xl">♥ ♥ ♥</div>
            </motion.div>

            {/* Heart collage gallery */}
            <HeartCollageGallery images={galleryImages} />

            {/* Venue as love note card */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-silk-burgundyLight/40 border border-silk-roseGold/25 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <MapPin size={20} className="text-silk-roseGold" />
                <h3 className="font-vibes text-2xl text-silk-roseGold">موقع الحفل</h3>
              </div>
              <p className="font-vibes text-xl text-silk-rose">{venueName}</p>
              <p className="text-sm text-silk-rose/50 mt-1">{venueAddress}</p>
              <motion.a href={mapsUrl} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-silk-roseGold to-silk-burgundyLight text-silk-burgundy font-reem">
                <Navigation size={16} /> {ARABIC_OPEN_MAP}
              </motion.a>
            </motion.div>

            {/* RSVP as reply card */}
            <div className="bg-silk-burgundyLight/40 border border-silk-roseGold/25 rounded-2xl p-6 md:p-8">
              <h3 className="text-center font-vibes text-2xl text-silk-roseGold mb-1">{ARABIC_RSVP}</h3>
              <p className="text-center text-sm text-silk-rose/50 mb-6">يرجى تأكيد حضوركم قبل الموعد</p>
              <AnimatePresence mode="wait">
                {rsvpDone ? (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                      className="mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br from-silk-roseGold to-silk-burgundyLight flex items-center justify-center">
                      <Heart size={24} className="text-silk-burgundy" fill="currentColor" />
                    </motion.div>
                    <p className="font-vibes text-xl text-silk-rose">{rsvpStatus === 'attending' ? ARABIC_THANKS_ATTENDING : ARABIC_THANKS_DECLINED}</p>
                    <p className="text-sm text-silk-rose/40 mt-1">{rsvpName}</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setRsvpStatus('attending')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'attending' ? 'bg-gradient-to-br from-silk-roseGold to-silk-burgundyLight text-silk-burgundy border-transparent' : 'border-silk-roseGold/25 text-silk-rose'}`}>
                        <Check size={18} /><span className="font-reem text-sm">{ARABIC_ATTENDING}</span>
                      </button>
                      <button onClick={() => setRsvpStatus('declined')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'declined' ? 'bg-gradient-to-br from-silk-roseGold to-silk-burgundyLight text-silk-burgundy border-transparent' : 'border-silk-roseGold/25 text-silk-rose'}`}>
                        <X size={18} /><span className="font-reem text-sm">{ARABIC_DECLINED}</span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-silk-rose/50 mb-2">{ARABIC_GUESTS}</label>
                      <div className="flex items-center justify-between bg-silk-burgundy/80 border border-silk-roseGold/25 rounded-xl px-4 py-2">
                        <button onClick={() => setRsvpCount((c) => Math.max(1, c - 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-silk-roseGold to-silk-burgundyLight text-silk-burgundy flex items-center justify-center"><Minus size={16} /></button>
                        <span className="font-vibes text-3xl text-silk-roseGold">{rsvpCount}</span>
                        <button onClick={() => setRsvpCount((c) => Math.min(10, c + 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-silk-roseGold to-silk-burgundyLight text-silk-burgundy flex items-center justify-center"><Plus size={16} /></button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-silk-rose/50 mb-2">{ARABIC_YOUR_NAME}</label>
                      <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="اكتب اسمك الكامل"
                        className="w-full bg-silk-burgundy/80 border border-silk-roseGold/25 text-silk-rose placeholder:text-white/25 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-silk-roseGold transition" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!rsvpStatus || !rsvpName.trim()}
                      onClick={() => { onRSVP?.(rsvpStatus!, rsvpCount, rsvpName.trim()); setRsvpDone(true); }}
                      className="w-full py-3.5 rounded-xl font-reem text-base text-silk-burgundy bg-gradient-to-br from-silk-roseGold to-silk-burgundyLight disabled:opacity-40 disabled:cursor-not-allowed">
                      {ARABIC_CONFIRM}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center font-vibes text-2xl text-silk-roseGold/50 pb-8">بمحبةٍ لا تنتهي</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
