import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, MapPin, ChevronLeft, ChevronRight, X, Check, Minus, Plus, Heart, Clock } from 'lucide-react';
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

/* ── Royal Crown Crest SVG ── */
function RoyalCrest({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="text-royal-gold">
      <path d="M32 8 L36 20 L48 16 L42 28 L54 30 L42 34 L48 46 L36 42 L32 54 L28 42 L16 46 L22 34 L10 30 L22 28 L16 16 L28 20 Z"
        fill="currentColor" opacity="0.9" />
      <circle cx="32" cy="32" r="6" fill="#0a0807" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="2.5" fill="currentColor" />
    </svg>
  );
}

/* ── Clock-face countdown (unique to Royal) ── */
function ClockCountdown({ time }: { time: TimeLeft }) {
  const units = [
    { value: time.days, label: ARABIC_DAYS, angle: 0 },
    { value: time.hours, label: ARABIC_HOURS, angle: 90 },
    { value: time.minutes, label: ARABIC_MINUTES, angle: 180 },
    { value: time.seconds, label: ARABIC_SECONDS, angle: 270 },
  ];
  return (
    <div className="relative mx-auto w-72 h-72 md:w-80 md:h-80">
      {/* outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-royal-gold/30" />
      <div className="absolute inset-2 rounded-full border border-royal-gold/20" />
      {/* tick marks */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-0 origin-bottom"
          style={{
            height: i % 5 === 0 ? '14px' : '6px',
            width: '1px',
            transform: `rotate(${i * 6}deg) translateY(0)`,
            transformOrigin: `50% 144px`,
            background: i % 5 === 0 ? 'rgba(200,169,81,0.6)' : 'rgba(200,169,81,0.2)',
          }}
        />
      ))}
      {/* center crest */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <RoyalCrest size={36} />
      </div>
      {/* four values at compass points */}
      {units.map((u) => {
        const rad = (u.angle - 90) * (Math.PI / 180);
        const r = 110;
        const x = Math.cos(rad) * r;
        const y = Math.sin(rad) * r;
        return (
          <div
            key={u.label}
            className="absolute top-1/2 left-1/2 text-center"
            style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
          >
            <motion.div
              key={u.value}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-cinzel text-2xl md:text-3xl text-royal-goldLight"
            >
              {String(u.value).padStart(2, '0')}
            </motion.div>
            <div className="text-[9px] md:text-[10px] text-royal-gold/60 font-reem">{u.label}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Scattered polaroid gallery (unique to Royal) ── */
function PolaroidGallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const rotations = [-8, 5, -3, 7, -5, 3, -9, 4];
  const offsets = [
    { x: 0, y: 0 }, { x: 30, y: 20 }, { x: -25, y: 15 }, { x: 20, y: -10 },
    { x: -15, y: 25 }, { x: 25, y: -20 },
  ];

  return (
    <div className="w-full">
      <h3 className="text-center font-marcellus text-2xl text-royal-goldLight mb-8">{ARABIC_GALLERY}</h3>
      <div className="relative flex flex-wrap justify-center gap-4 md:gap-6 py-8">
        {images.slice(0, 6).map((src, i) => (
          <motion.button
            key={src + i}
            onClick={() => setLightbox(i)}
            initial={{ opacity: 0, y: 30, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: rotations[i % rotations.length] }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, type: 'spring' }}
            whileHover={{ scale: 1.12, rotate: 0, zIndex: 10 }}
            className="relative bg-gradient-to-b from-royal-gold/15 to-royal-gold/5 p-2 pb-8 rounded-sm shadow-2xl border border-royal-gold/20"
            style={{ width: 140, height: 180 }}
          >
            <img src={src} alt={`photo ${i + 1}`} loading="lazy" className="w-full h-[120px] object-cover" />
            <p className="text-center text-[10px] text-royal-gold/50 font-reem mt-2">ذكرى {i + 1}</p>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4"
          >
            <button className="absolute top-5 right-5 text-white/80 hover:text-white" onClick={() => setLightbox(null)}><X size={28} /></button>
            <motion.img
              key={lightbox}
              src={images[lightbox]} alt="preview"
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-h-[82vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Royal Decree story (unique to Royal) ── */
function RoyalDecree({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative max-w-lg mx-auto bg-gradient-to-b from-royal-gold/8 to-transparent border-2 border-royal-gold/30 rounded-lg p-8 text-center"
    >
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-royal-obsidian px-4">
        <RoyalCrest size={32} />
      </div>
      <h3 className="font-marcellus text-2xl text-royal-goldLight mb-4 mt-2">{ARABIC_OUR_STORY}</h3>
      <p className="font-amiri text-lg leading-loose text-royal-goldLight/75">{text}</p>
      <div className="mt-4 flex justify-center gap-2 text-royal-gold/40 text-xl">❖ ❖ ❖</div>
    </motion.div>
  );
}

export default function TemplateRoyalGold(props: SharedInvitationProps) {
  const {
    groomName = DEFAULT_INVITATION.groomName,
    brideName = DEFAULT_INVITATION.brideName,
    weddingDate = DEFAULT_INVITATION.weddingDate,
    time = DEFAULT_INVITATION.time,
    venueName = DEFAULT_INVITATION.venueName,
    venueAddress = DEFAULT_INVITATION.venueAddress,
    storyText = 'في ظلال الرحمة والمودة، التقينا لنكمل معاً حكاية جميلة. نسأل الله أن يبارك في زواجنا ويجمعنا على خير.',
    latitude, longitude,
    galleryImages = DEFAULT_GALLERY,
    onRSVP,
  } = props;

  const [opened, setOpened] = useState(false);
  const timeLeft = useCountdown(weddingDate);
  const music = useAmbientMusic();
  useLockBody(!opened);

  const particles = useMemo(
    () => Array.from({ length: 28 }, () => ({
      x: Math.random() * 100, delay: Math.random() * 3,
      duration: 2.5 + Math.random() * 3, size: 2 + Math.random() * 4,
    })), []
  );

  // RSVP state
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'declined' | null>(null);
  const [rsvpCount, setRsvpCount] = useState(1);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpDone, setRsvpDone] = useState(false);

  const lat = latitude ?? 30.0074;
  const lng = longitude ?? 31.4913;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="relative min-h-screen bg-royal-obsidian text-royal-goldLight overflow-hidden font-reem" dir="rtl">
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-royal-gold/10 blur-[120px]" />
      </div>
      <MusicToggle playing={music.playing} toggle={music.toggle} accentSolid="bg-gradient-to-br from-royal-goldLight to-royal-goldDeep" ring="ring-2 ring-royal-gold/40" />

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="gate" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4 perspective-2000">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8 text-center">
              <RoyalCrest size={56} />
              <p className="font-amiri text-2xl text-royal-gold mt-3">دعوة ملكية</p>
            </motion.div>

            <div className="relative w-[300px] h-[420px] md:w-[420px] md:h-[560px] preserve-3d">
              <div className="absolute inset-0 rounded-t-[200px] border-4 border-royal-gold shadow-[0_0_60px_rgba(200,169,81,0.4)]" />
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-royal-goldLight to-royal-goldDeep flex items-center justify-center shadow-lg">
                  <Crown size={28} className="text-royal-obsidian" />
                </div>
              </motion.div>
              <motion.div onClick={() => setOpened(true)} className="absolute top-0 right-1/2 w-1/2 h-full origin-right preserve-3d cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }} whileHover={{ rotateY: -6 }}
                animate={opened ? { rotateY: -105 } : {}} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}>
                <div className="absolute inset-0 bg-gradient-to-l from-royal-goldDeep/40 to-royal-gold/20 border-l border-royal-gold/60 rounded-tl-[200px] backdrop-blur-sm">
                  <div className="absolute inset-4 border border-royal-gold/40 rounded-tl-[180px]" />
                  <div className="absolute top-1/2 right-3 w-2 h-16 bg-royal-gold rounded-full" />
                </div>
              </motion.div>
              <motion.div onClick={() => setOpened(true)} className="absolute top-0 left-1/2 w-1/2 h-full origin-left preserve-3d cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }} whileHover={{ rotateY: 6 }}
                animate={opened ? { rotateY: 105 } : {}} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}>
                <div className="absolute inset-0 bg-gradient-to-r from-royal-goldDeep/40 to-royal-gold/20 border-r border-royal-gold/60 rounded-tr-[200px] backdrop-blur-sm">
                  <div className="absolute inset-4 border border-royal-gold/40 rounded-tr-[180px]" />
                  <div className="absolute top-1/2 left-3 w-2 h-16 bg-royal-gold rounded-full" />
                </div>
              </motion.div>
              <AnimatePresence>
                {opened && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none">
                    {particles.map((p, i) => (
                      <motion.span key={i} className="absolute rounded-full bg-royal-goldLight"
                        style={{ width: p.size, height: p.size, left: `${p.x}%` }}
                        initial={{ y: 0, opacity: 0 }} animate={{ y: [-20, 460], opacity: [0, 1, 0] }}
                        transition={{ duration: p.duration, delay: p.delay, repeat: Infinity }} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button onClick={() => setOpened(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-10 px-8 py-4 rounded-full bg-gradient-to-br from-royal-goldLight to-royal-goldDeep text-royal-obsidian font-reem text-lg shadow-[0_0_30px_rgba(200,169,81,0.5)] flex items-center gap-2">
              <Sparkles size={18} /> افتح الدعوة الملكية
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="invite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="relative z-10 max-w-2xl mx-auto px-4 py-12 space-y-16">

            {/* Bismillah as royal banner */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="inline-block px-8 py-3 border-y-2 border-royal-gold/40">
                <p className="font-amiri text-xl md:text-2xl text-royal-gold tracking-wide">{BISMILLAH}</p>
              </div>
            </motion.div>

            {/* Grand medallion hero — names in circular crest */}
            <div className="relative flex flex-col items-center py-8">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                className="relative w-72 h-72 md:w-96 md:h-96 rounded-full border-2 border-royal-gold/40 flex flex-col items-center justify-center">
                <div className="absolute inset-4 rounded-full border border-royal-gold/20" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"><RoyalCrest size={40} /></div>
                <p className="text-royal-gold/70 text-sm mb-2">{ARABIC_INVITES_YOU}</p>
                <h1 className="font-amiri text-4xl md:text-6xl text-gold-gradient">{groomName}</h1>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="font-vibes text-5xl md:text-7xl text-royal-gold my-1" style={{ textShadow: '0 0 24px currentColor' }}>&</motion.div>
                <h1 className="font-amiri text-4xl md:text-6xl text-gold-gradient">{brideName}</h1>
                <div className="mt-3 text-center">
                  <p className="font-reem text-royal-goldLight/90">{fmtDate(weddingDate)}</p>
                  <p className="font-reem text-royal-gold/70 text-sm">{time}</p>
                </div>
              </motion.div>
            </div>

            {/* Clock-face countdown */}
            <div className="text-center">
              <h3 className="font-marcellus text-2xl text-royal-goldLight mb-6">العد التنازلي للزفاف</h3>
              <ClockCountdown time={timeLeft} />
            </div>

            {/* Royal decree story */}
            <RoyalDecree text={storyText} />

            {/* Venue as royal scroll card */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-royal-obsidian/60 border-2 border-royal-gold/30 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <MapPin size={20} className="text-royal-gold" />
                <h3 className="font-marcellus text-xl text-royal-goldLight">موقع الحفل</h3>
              </div>
              <p className="font-reem text-lg text-royal-goldLight">{venueName}</p>
              <p className="text-sm text-royal-gold/60 mt-1">{venueAddress}</p>
              <motion.a href={mapsUrl} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-royal-goldLight to-royal-goldDeep text-royal-obsidian font-reem">
                <MapPin size={16} /> {ARABIC_OPEN_MAP}
              </motion.a>
            </motion.div>

            {/* Polaroid gallery */}
            <PolaroidGallery images={galleryImages} />

            {/* RSVP as royal seal form */}
            <div className="bg-royal-obsidian/60 border-2 border-royal-gold/30 rounded-lg p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="inline-block"><RoyalCrest size={36} /></div>
                <h3 className="font-marcellus text-2xl text-royal-goldLight mt-2">{ARABIC_RSVP}</h3>
                <p className="text-sm text-royal-gold/60 mt-1">يرجى تأكيد حضوركم قبل الموعد</p>
              </div>
              <AnimatePresence mode="wait">
                {rsvpDone ? (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                      className="mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br from-royal-goldLight to-royal-goldDeep flex items-center justify-center">
                      <Heart size={24} className="text-royal-obsidian" fill="currentColor" />
                    </motion.div>
                    <p className="font-reem text-royal-goldLight">{rsvpStatus === 'attending' ? ARABIC_THANKS_ATTENDING : ARABIC_THANKS_DECLINED}</p>
                    <p className="text-sm text-royal-gold/50 mt-1">{rsvpName}</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setRsvpStatus('attending')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'attending' ? 'bg-gradient-to-br from-royal-goldLight to-royal-goldDeep text-royal-obsidian border-transparent' : 'border-royal-gold/30 text-royal-goldLight'}`}>
                        <Check size={18} /><span className="font-reem text-sm">{ARABIC_ATTENDING}</span>
                      </button>
                      <button onClick={() => setRsvpStatus('declined')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'declined' ? 'bg-gradient-to-br from-royal-goldLight to-royal-goldDeep text-royal-obsidian border-transparent' : 'border-royal-gold/30 text-royal-goldLight'}`}>
                        <X size={18} /><span className="font-reem text-sm">{ARABIC_DECLINED}</span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-royal-gold/60 mb-2">{ARABIC_GUESTS}</label>
                      <div className="flex items-center justify-between bg-royal-obsidian/80 border border-royal-gold/30 rounded-xl px-4 py-2">
                        <button onClick={() => setRsvpCount((c) => Math.max(1, c - 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-royal-goldLight to-royal-goldDeep text-royal-obsidian flex items-center justify-center"><Minus size={16} /></button>
                        <span className="font-cinzel text-2xl text-royal-goldLight">{rsvpCount}</span>
                        <button onClick={() => setRsvpCount((c) => Math.min(10, c + 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-royal-goldLight to-royal-goldDeep text-royal-obsidian flex items-center justify-center"><Plus size={16} /></button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-royal-gold/60 mb-2">{ARABIC_YOUR_NAME}</label>
                      <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="اكتب اسمك الكامل"
                        className="w-full bg-royal-obsidian/80 border border-royal-gold/30 text-royal-goldLight placeholder:text-white/30 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-royal-gold transition" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!rsvpStatus || !rsvpName.trim()}
                      onClick={() => { onRSVP?.(rsvpStatus!, rsvpCount, rsvpName.trim()); setRsvpDone(true); }}
                      className="w-full py-3.5 rounded-xl font-reem text-base text-royal-obsidian bg-gradient-to-br from-royal-goldLight to-royal-goldDeep disabled:opacity-40 disabled:cursor-not-allowed">
                      {ARABIC_CONFIRM}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center font-amiri text-royal-gold/50 pb-8">نتطلع لمشاركتكم فرحتنا</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
