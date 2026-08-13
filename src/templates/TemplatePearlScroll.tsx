import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, MapPin, X, Check, Minus, Plus, Heart, Navigation, Compass } from 'lucide-react';
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

/* ── Star-clock countdown (unique to Pearl) — 4 stars orbiting a center ── */
function StarClockCountdown({ time }: { time: TimeLeft }) {
  const units = [
    { value: time.days, label: ARABIC_DAYS, angle: 0 },
    { value: time.hours, label: ARABIC_HOURS, angle: 90 },
    { value: time.minutes, label: ARABIC_MINUTES, angle: 180 },
    { value: time.seconds, label: ARABIC_SECONDS, angle: 270 },
  ];
  return (
    <div className="relative mx-auto w-72 h-72 md:w-80 md:h-80">
      {/* orbit rings */}
      <div className="absolute inset-0 rounded-full border border-pearl-gold/20" />
      <div className="absolute inset-8 rounded-full border border-pearl-gold/15" />
      {/* center star */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Star size={28} className="text-pearl-gold" fill="currentColor" />
      </div>
      {/* orbiting stars */}
      {units.map((u) => {
        const rad = (u.angle - 90) * (Math.PI / 180);
        const r = 120;
        const x = Math.cos(rad) * r;
        const y = Math.sin(rad) * r;
        return (
          <div key={u.label} className="absolute top-1/2 left-1/2" style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}>
            {/* connecting line */}
            <div className="absolute top-1/2 left-1/2 w-px bg-pearl-gold/15"
              style={{ height: r, transformOrigin: 'top', transform: `rotate(${u.angle + 90}deg) translateX(-50%)` }} />
            <div className="relative text-center">
              <Star size={14} className="text-pearl-gold/50 mx-auto mb-1" fill="currentColor" />
              <motion.div key={u.value} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="font-cinzel text-xl md:text-2xl text-pearl-gold">
                {String(u.value).padStart(2, '0')}
              </motion.div>
              <div className="text-[9px] text-pearl-gold/50 font-reem">{u.label}</div>
            </div>
          </div>
        );
      })}
      {/* slow rotation indicator */}
      <motion.div className="absolute inset-0 rounded-full border-t border-pearl-gold/30"
        animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} />
    </div>
  );
}

/* ── Constellation gallery (unique to Pearl) — images connected by lines ── */
function ConstellationGallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const positions = [
    { top: '5%', left: '10%' }, { top: '15%', left: '55%' },
    { top: '45%', left: '5%' }, { top: '40%', left: '45%' },
    { top: '50%', left: '75%' }, { top: '75%', left: '30%' },
  ];

  return (
    <div className="w-full">
      <h3 className="text-center font-marcellus text-2xl text-pearl-gold mb-6">{ARABIC_GALLERY}</h3>
      <div className="relative w-full h-[400px] md:h-[500px]">
        {/* connecting constellation lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {positions.slice(0, -1).map((p, i) => {
            const next = positions[i + 1];
            return (
              <motion.line
                key={i}
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.3 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.8 }}
                x1={`${parseFloat(p.left) + 10}%`} y1={p.top}
                x2={`${parseFloat(next.left) + 10}%`} y2={next.top}
                stroke="#c8a951" strokeWidth="1" strokeDasharray="4 4"
              />
            );
          })}
        </svg>
        {/* star nodes with images */}
        {images.slice(0, 6).map((src, i) => {
          const pos = positions[i % positions.length];
          return (
            <motion.button
              key={src + i}
              onClick={() => setLightbox(i)}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, type: 'spring' }}
              whileHover={{ scale: 1.15, zIndex: 10 }}
              className="absolute w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-pearl-gold/40 shadow-lg"
              style={{ top: pos.top, left: pos.left, zIndex: 1 }}
            >
              <img src={src} alt={`star ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-pearl-ivory/10" />
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[120] bg-pearl-ivory/95 flex items-center justify-center p-4">
            <button className="absolute top-5 right-5 text-pearl-gold/80 hover:text-pearl-gold" onClick={() => setLightbox(null)}><X size={28} /></button>
            <motion.img key={lightbox} src={images[lightbox]} alt="preview"
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-h-[82vh] max-w-[92vw] rounded-lg object-contain shadow-2xl border-2 border-pearl-gold/30" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TemplatePearlScroll(props: SharedInvitationProps) {
  const {
    groomName = DEFAULT_INVITATION.groomName,
    brideName = DEFAULT_INVITATION.brideName,
    weddingDate = DEFAULT_INVITATION.weddingDate,
    time = DEFAULT_INVITATION.time,
    venueName = DEFAULT_INVITATION.venueName,
    venueAddress = DEFAULT_INVITATION.venueAddress,
    storyText = 'كتبنا سطور المحبة على مخطوطةٍ من نور، نحفظها في طيات القلب. نسأل الله أن يبارك في جمعنا ويجعل حياتنا سكينةً وسلاماً.',
    latitude, longitude,
    galleryImages = DEFAULT_GALLERY,
    onRSVP,
  } = props;

  const [opened, setOpened] = useState(false);
  const [untying, setUntying] = useState(false);
  const timeLeft = useCountdown(weddingDate);
  const music = useAmbientMusic();
  useLockBody(!opened);

  const stars = useMemo(
    () => Array.from({ length: 30 }, () => ({
      x: Math.random() * 100, y: Math.random() * 100,
      delay: Math.random() * 4, duration: 2 + Math.random() * 3, size: 1 + Math.random() * 2.5,
    })), []
  );

  const handleUntie = () => { setUntying(true); setTimeout(() => setOpened(true), 1100); };

  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'declined' | null>(null);
  const [rsvpCount, setRsvpCount] = useState(1);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpDone, setRsvpDone] = useState(false);

  const lat = latitude ?? 30.0074;
  const lng = longitude ?? 31.4913;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="relative min-h-screen bg-pearl-ivory text-pearl-gold overflow-hidden font-reem" dir="rtl">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-pearl-cream via-pearl-ivory to-pearl-cream" />
        {stars.map((s, i) => (
          <motion.span key={i} className="absolute rounded-full bg-pearl-gold"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
            animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.4, 0.8] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity }} />
        ))}
      </div>
      <MusicToggle playing={music.playing} toggle={music.toggle} accentSolid="bg-gradient-to-br from-pearl-goldSoft to-pearl-gold" ring="ring-2 ring-pearl-gold/40" />

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="gate" exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.7 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
              <Star className="mx-auto text-pearl-gold mb-3" size={44} fill="currentColor" />
              <p className="font-amiri text-2xl text-pearl-gold">مخطوطة لؤلؤية</p>
            </motion.div>

            <div className="relative w-[260px] h-[380px] md:w-[340px] md:h-[480px] flex flex-col items-center">
              <div className="w-full h-10 rounded-full bg-gradient-to-b from-pearl-goldSoft to-pearl-gold shadow-lg border border-pearl-gold/40" />
              <motion.div initial={{ height: 0 }} animate={{ height: untying ? '100%' : 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full flex-1 bg-gradient-to-b from-pearl-cream to-pearl-ivory border-x-2 border-pearl-gold/30 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="font-amiri text-pearl-gold/40 text-center px-4">بسم الله<br />الرحمن الرحيم</p>
                </div>
              </motion.div>
              {!untying && (
                <div className="absolute top-10 left-0 right-0 bottom-0 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-b from-pearl-goldSoft/80 to-pearl-gold/60 rounded-b-lg border-x-2 border-pearl-gold/40 flex items-center justify-center">
                    <p className="font-amiri text-pearl-goldDeep text-lg rotate-90 whitespace-nowrap">المخطوطة اللؤلؤية</p>
                  </div>
                </div>
              )}
              <div className="w-full h-10 rounded-full bg-gradient-to-t from-pearl-goldSoft to-pearl-gold shadow-lg border border-pearl-gold/40" />
              <AnimatePresence>
                {!untying && (
                  <motion.div exit={{ opacity: 0, y: -20 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <motion.button onClick={handleUntie} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="relative">
                      <div className="w-32 h-6 rounded-full bg-gradient-to-r from-pearl-gold via-pearl-goldSoft to-pearl-gold shadow-[0_0_20px_rgba(200,169,81,0.5)] border border-pearl-goldDeep/30" />
                      <div className="absolute -top-2 left-2 w-6 h-6 rounded-full bg-pearl-goldSoft border border-pearl-gold/40" />
                      <div className="absolute -top-2 right-2 w-6 h-6 rounded-full bg-pearl-goldSoft border border-pearl-gold/40" />
                    </motion.button>
                    <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-7 left-1/2 -translate-x-1/2 font-amiri text-sm text-pearl-goldDeep whitespace-nowrap">
                      اضغطي على الشريط
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {untying && !opened && (
                  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    {[0, 1].map((i) => (
                      <motion.div key={i} className="absolute w-6 h-6 rounded-full bg-pearl-goldSoft border border-pearl-gold/40"
                        initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: i === 0 ? -80 : 80, y: -40, opacity: 0, rotate: 180 }}
                        transition={{ duration: 0.9 }} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button onClick={handleUntie} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-10 px-8 py-4 rounded-full bg-gradient-to-br from-pearl-goldSoft to-pearl-gold text-pearl-ivory font-reem text-lg shadow-[0_0_30px_rgba(200,169,81,0.4)] flex items-center gap-2">
              <Sparkles size={18} /> افتح المخطوطة اللؤلؤية
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="invite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 max-w-2xl mx-auto px-4 py-12 space-y-16">

            {/* Bismillah as starlit banner */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="flex items-center justify-center gap-3">
                <Star size={14} className="text-pearl-gold/50" fill="currentColor" />
                <p className="font-amiri text-xl md:text-2xl text-pearl-gold tracking-wide">{BISMILLAH}</p>
                <Star size={14} className="text-pearl-gold/50" fill="currentColor" />
              </div>
            </motion.div>

            {/* Hero as celestial pairing — two stars merging */}
            <div className="relative flex flex-col items-center py-8">
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                className="relative">
                <p className="text-pearl-gold/60 text-center mb-4">{ARABIC_INVITES_YOU}</p>
                {/* two stars with names */}
                <div className="flex items-center justify-center gap-6 md:gap-12">
                  <div className="text-center">
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                      <Star size={24} className="text-pearl-gold mx-auto mb-2" fill="currentColor" />
                    </motion.div>
                    <h1 className="font-amiri text-4xl md:text-6xl text-pearl-gold" style={{ textShadow: '0 0 24px rgba(200,169,81,0.3)' }}>{groomName}</h1>
                  </div>
                  <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} transition={{ duration: 6, repeat: Infinity }}
                    className="font-vibes text-4xl md:text-6xl text-pearl-gold" style={{ textShadow: '0 0 24px currentColor' }}>&</motion.div>
                  <div className="text-center">
                    <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                      <Star size={24} className="text-pearl-gold mx-auto mb-2" fill="currentColor" />
                    </motion.div>
                    <h1 className="font-amiri text-4xl md:text-6xl text-pearl-gold" style={{ textShadow: '0 0 24px rgba(200,169,81,0.3)' }}>{brideName}</h1>
                  </div>
                </div>
                {/* date below */}
                <div className="mt-6 text-center">
                  <div className="inline-block px-6 py-2 border-t border-b border-pearl-gold/30">
                    <p className="font-reem text-pearl-gold/90">{fmtDate(weddingDate)}</p>
                    <p className="font-reem text-pearl-gold/60 text-sm">{time}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Star-clock countdown */}
            <div className="text-center">
              <h3 className="font-marcellus text-2xl text-pearl-gold mb-6">العد التنازلي للزفاف</h3>
              <StarClockCountdown time={timeLeft} />
            </div>

            {/* Story as celestial manuscript */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="relative glass bg-white/40 border border-pearl-gold/30 rounded-2xl p-8 text-center">
              <Star size={20} className="text-pearl-gold/50 mx-auto mb-3" fill="currentColor" />
              <h3 className="font-marcellus text-xl text-pearl-gold mb-4">{ARABIC_OUR_STORY}</h3>
              <p className="font-amiri text-lg leading-loose text-pearl-gold/75">{storyText}</p>
              <Star size={20} className="text-pearl-gold/50 mx-auto mt-4" fill="currentColor" />
            </motion.div>

            {/* Constellation gallery */}
            <ConstellationGallery images={galleryImages} />

            {/* Venue as compass card */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="glass bg-white/40 border border-pearl-gold/30 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Compass size={22} className="text-pearl-gold" />
                <h3 className="font-marcellus text-xl text-pearl-gold">موقع الحفل</h3>
              </div>
              <p className="font-reem text-lg text-pearl-gold">{venueName}</p>
              <p className="text-sm text-pearl-gold/50 mt-1">{venueAddress}</p>
              <motion.a href={mapsUrl} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-pearl-goldSoft to-pearl-gold text-pearl-ivory font-reem">
                <Navigation size={16} /> {ARABIC_OPEN_MAP}
              </motion.a>
            </motion.div>

            {/* RSVP as celestial reply */}
            <div className="glass bg-white/40 border border-pearl-gold/30 rounded-2xl p-6 md:p-8">
              <h3 className="text-center font-marcellus text-2xl text-pearl-gold mb-1">{ARABIC_RSVP}</h3>
              <p className="text-center text-sm text-pearl-gold/50 mb-6">يرجى تأكيد حضوركم قبل الموعد</p>
              <AnimatePresence mode="wait">
                {rsvpDone ? (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                      className="mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br from-pearl-goldSoft to-pearl-gold flex items-center justify-center">
                      <Heart size={24} className="text-pearl-ivory" fill="currentColor" />
                    </motion.div>
                    <p className="font-reem text-pearl-gold">{rsvpStatus === 'attending' ? ARABIC_THANKS_ATTENDING : ARABIC_THANKS_DECLINED}</p>
                    <p className="text-sm text-pearl-gold/40 mt-1">{rsvpName}</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setRsvpStatus('attending')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'attending' ? 'bg-gradient-to-br from-pearl-goldSoft to-pearl-gold text-pearl-ivory border-transparent' : 'border-pearl-gold/30 text-pearl-gold'}`}>
                        <Check size={18} /><span className="font-reem text-sm">{ARABIC_ATTENDING}</span>
                      </button>
                      <button onClick={() => setRsvpStatus('declined')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'declined' ? 'bg-gradient-to-br from-pearl-goldSoft to-pearl-gold text-pearl-ivory border-transparent' : 'border-pearl-gold/30 text-pearl-gold'}`}>
                        <X size={18} /><span className="font-reem text-sm">{ARABIC_DECLINED}</span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-pearl-gold/50 mb-2">{ARABIC_GUESTS}</label>
                      <div className="flex items-center justify-between bg-white/60 border border-pearl-gold/30 rounded-xl px-4 py-2">
                        <button onClick={() => setRsvpCount((c) => Math.max(1, c - 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-pearl-goldSoft to-pearl-gold text-pearl-ivory flex items-center justify-center"><Minus size={16} /></button>
                        <span className="font-cinzel text-2xl text-pearl-gold">{rsvpCount}</span>
                        <button onClick={() => setRsvpCount((c) => Math.min(10, c + 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-pearl-goldSoft to-pearl-gold text-pearl-ivory flex items-center justify-center"><Plus size={16} /></button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-pearl-gold/50 mb-2">{ARABIC_YOUR_NAME}</label>
                      <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="اكتب اسمك الكامل"
                        className="w-full bg-white/60 border border-pearl-gold/30 text-pearl-gold placeholder:text-black/30 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-pearl-gold transition" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!rsvpStatus || !rsvpName.trim()}
                      onClick={() => { onRSVP?.(rsvpStatus!, rsvpCount, rsvpName.trim()); setRsvpDone(true); }}
                      className="w-full py-3.5 rounded-xl font-reem text-base text-pearl-ivory bg-gradient-to-br from-pearl-goldSoft to-pearl-gold disabled:opacity-40 disabled:cursor-not-allowed">
                      {ARABIC_CONFIRM}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center font-amiri text-pearl-gold/40 pb-8">نورٌ يهتدي به القلب</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
