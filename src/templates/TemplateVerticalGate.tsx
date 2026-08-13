import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, MapPin, X, Check, Minus, Plus, Heart, Navigation, Sparkles } from 'lucide-react';
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

/* ── Pillar countdown (unique to VerticalGate) ── */
function PillarCountdown({ time }: { time: TimeLeft }) {
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
          <div className="relative w-16 h-20 md:w-20 md:h-24 bg-sapphire-mid border-2 border-sapphire-silver/30 rounded-t-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-sapphire-blue/20 to-transparent" />
            <motion.div key={u.value} initial={{ y: -15, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="relative h-full flex items-center justify-center font-cinzel text-2xl md:text-3xl text-sapphire-silverLight"
              style={{ textShadow: '0 0 12px rgba(192,200,212,0.4)' }}>
              {String(u.value).padStart(2, '0')}
            </motion.div>
          </div>
          <div className="mt-2 text-[10px] md:text-xs text-sapphire-silver/50 font-reem">{u.label}</div>
          {i < units.length - 1 && <div className="hidden" />}
        </div>
      ))}
    </div>
  );
}

/* ── Stacked gallery (unique to VerticalGate) ── */
function StackedGallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  return (
    <div className="w-full">
      <h3 className="text-center font-marcellus text-2xl text-sapphire-silverLight mb-6">{ARABIC_GALLERY}</h3>
      <div className="grid grid-cols-3 gap-2">
        {images.slice(0, 6).map((src, i) => (
          <motion.button key={src + i} onClick={() => setLightbox(i)}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.05, zIndex: 10 }}
            className={`relative overflow-hidden rounded-lg border border-sapphire-silver/20 ${i === 0 || i === 5 ? 'row-span-2 col-span-1' : ''}`}>
            <img src={src} alt={`photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover aspect-square" />
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[120] bg-sapphire-deep/95 flex items-center justify-center p-4">
            <button className="absolute top-5 right-5 text-sapphire-silverLight/80" onClick={() => setLightbox(null)}><X size={28} /></button>
            <motion.img key={lightbox} src={images[lightbox]} alt="preview" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-h-[82vh] max-w-[92vw] rounded-lg object-contain shadow-2xl border border-sapphire-silver/30" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TemplateVerticalGate(props: SharedInvitationProps) {
  const {
    groomName = DEFAULT_INVITATION.groomName, brideName = DEFAULT_INVITATION.brideName,
    weddingDate = DEFAULT_INVITATION.weddingDate, time = DEFAULT_INVITATION.time,
    venueName = DEFAULT_INVITATION.venueName, venueAddress = DEFAULT_INVITATION.venueAddress,
    storyText = 'في ليلةٍ من الياقوت والفضة، نلتقي لنكتب فصلاً جديداً من حكاية الحب. نسأل الله أن يبارك في جمعنا.',
    latitude, longitude, galleryImages = DEFAULT_GALLERY, onRSVP,
  } = props;

  const [opened, setOpened] = useState(false);
  const timeLeft = useCountdown(weddingDate);
  const music = useAmbientMusic();
  useLockBody(!opened);

  const sparkles = useMemo(() => Array.from({ length: 20 }, () => ({
    x: Math.random() * 100, delay: Math.random() * 3, duration: 2 + Math.random() * 3, size: 1 + Math.random() * 2,
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
    <div className="relative min-h-screen bg-sapphire-deep text-sapphire-silverLight overflow-hidden font-reem" dir="rtl">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-sapphire-blue/15 blur-[130px]" />
      </div>
      <MusicToggle playing={music.playing} toggle={music.toggle} accentSolid="bg-gradient-to-br from-sapphire-silverLight to-sapphire-blue" ring="ring-2 ring-sapphire-silver/40" />

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="gate" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
              <Sparkles className="mx-auto text-sapphire-silver mb-3" size={40} />
              <p className="font-amiri text-2xl text-sapphire-silverLight">البوابة الياقوتية</p>
            </motion.div>

            <div className="relative w-[280px] h-[440px] md:w-[360px] md:h-[520px] overflow-hidden rounded-xl">
              {/* top half slides up */}
              <motion.div onClick={() => setOpened(true)}
                animate={opened ? { y: '-105%' } : { y: 0 }} transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-sapphire-blue to-sapphire-mid border-b-2 border-sapphire-silver/50 cursor-pointer">
                <div className="absolute inset-3 border border-sapphire-silver/20 rounded-lg" />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-sapphire-silver/60">
                  <ChevronUp size={28} />
                </div>
              </motion.div>
              {/* bottom half slides down */}
              <motion.div onClick={() => setOpened(true)}
                animate={opened ? { y: '105%' } : { y: 0 }} transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-sapphire-blue to-sapphire-mid border-t-2 border-sapphire-silver/50 cursor-pointer">
                <div className="absolute inset-3 border border-sapphire-silver/20 rounded-lg" />
                <div className="absolute top-3 left-1/2 -translate-x-1/2 text-sapphire-silver/60">
                  <ChevronDown size={28} />
                </div>
              </motion.div>
              {/* center content */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="font-amiri text-3xl md:text-4xl text-sapphire-silverLight mb-2">{groomName}</p>
                  <p className="font-vibes text-4xl text-sapphire-silver">&</p>
                  <p className="font-amiri text-3xl md:text-4xl text-sapphire-silverLight mt-2">{brideName}</p>
                </div>
              </div>
              {/* center seal */}
              <motion.div onClick={() => setOpened(true)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 rounded-full bg-gradient-to-br from-sapphire-silverLight to-sapphire-blue flex items-center justify-center shadow-[0_0_30px_rgba(192,200,212,0.4)] cursor-pointer border-2 border-sapphire-silver/60">
                <Sparkles size={24} className="text-sapphire-deep" />
              </motion.div>
            </div>

            <motion.button onClick={() => setOpened(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-10 px-8 py-4 rounded-full bg-gradient-to-br from-sapphire-silverLight to-sapphire-blue text-sapphire-deep font-reem text-lg shadow-[0_0_30px_rgba(192,200,212,0.3)] flex items-center gap-2">
              <Sparkles size={18} /> افتح الدعوة
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="invite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 max-w-2xl mx-auto px-4 py-12 space-y-16">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <p className="font-amiri text-xl text-sapphire-silver tracking-wide">{BISMILLAH}</p>
            </motion.div>

            {/* Hero — vertical stacked names */}
            <div className="text-center py-8">
              <p className="text-sapphire-silver/60 mb-4">{ARABIC_INVITES_YOU}</p>
              <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="font-amiri text-5xl md:text-6xl text-sapphire-silverLight">{groomName}</motion.h1>
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="font-vibes text-5xl text-sapphire-silver my-2" style={{ textShadow: '0 0 20px currentColor' }}>&</motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="font-amiri text-5xl md:text-6xl text-sapphire-silverLight">{brideName}</motion.h1>
              <div className="mt-6 inline-block border-y border-sapphire-silver/20 py-2 px-6">
                <p className="font-reem text-sapphire-silverLight/90">{fmtDate(weddingDate)}</p>
                <p className="font-reem text-sapphire-silver/60 text-sm">{time}</p>
              </div>
            </div>

            {/* Pillar countdown */}
            <div className="text-center">
              <h3 className="font-marcellus text-2xl text-sapphire-silverLight mb-6">العد التنازلي للزفاف</h3>
              <PillarCountdown time={timeLeft} />
            </div>

            {/* Story */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-sapphire-mid/60 border border-sapphire-silver/20 rounded-2xl p-8 text-center">
              <h3 className="font-marcellus text-xl text-sapphire-silverLight mb-4">{ARABIC_OUR_STORY}</h3>
              <p className="font-amiri text-lg leading-loose text-sapphire-silverLight/70">{storyText}</p>
            </motion.div>

            {/* Stacked gallery */}
            <StackedGallery images={galleryImages} />

            {/* Venue */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-sapphire-mid/60 border border-sapphire-silver/20 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <MapPin size={20} className="text-sapphire-silver" />
                <h3 className="font-marcellus text-xl text-sapphire-silverLight">موقع الحفل</h3>
              </div>
              <p className="font-reem text-lg text-sapphire-silverLight">{venueName}</p>
              <p className="text-sm text-sapphire-silver/50 mt-1">{venueAddress}</p>
              <motion.a href={mapsUrl} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-sapphire-silverLight to-sapphire-blue text-sapphire-deep font-reem">
                <Navigation size={16} /> {ARABIC_OPEN_MAP}
              </motion.a>
            </motion.div>

            {/* RSVP */}
            <div className="bg-sapphire-mid/60 border border-sapphire-silver/20 rounded-2xl p-6 md:p-8">
              <h3 className="text-center font-marcellus text-2xl text-sapphire-silverLight mb-1">{ARABIC_RSVP}</h3>
              <p className="text-center text-sm text-sapphire-silver/50 mb-6">يرجى تأكيد حضوركم قبل الموعد</p>
              <AnimatePresence mode="wait">
                {rsvpDone ? (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                      className="mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br from-sapphire-silverLight to-sapphire-blue flex items-center justify-center">
                      <Heart size={24} className="text-sapphire-deep" fill="currentColor" />
                    </motion.div>
                    <p className="font-reem text-sapphire-silverLight">{rsvpStatus === 'attending' ? ARABIC_THANKS_ATTENDING : ARABIC_THANKS_DECLINED}</p>
                    <p className="text-sm text-sapphire-silver/40 mt-1">{rsvpName}</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setRsvpStatus('attending')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'attending' ? 'bg-gradient-to-br from-sapphire-silverLight to-sapphire-blue text-sapphire-deep border-transparent' : 'border-sapphire-silver/25 text-sapphire-silverLight'}`}>
                        <Check size={18} /><span className="font-reem text-sm">{ARABIC_ATTENDING}</span>
                      </button>
                      <button onClick={() => setRsvpStatus('declined')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'declined' ? 'bg-gradient-to-br from-sapphire-silverLight to-sapphire-blue text-sapphire-deep border-transparent' : 'border-sapphire-silver/25 text-sapphire-silverLight'}`}>
                        <X size={18} /><span className="font-reem text-sm">{ARABIC_DECLINED}</span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-sapphire-silver/50 mb-2">{ARABIC_GUESTS}</label>
                      <div className="flex items-center justify-between bg-sapphire-deep/80 border border-sapphire-silver/25 rounded-xl px-4 py-2">
                        <button onClick={() => setRsvpCount((c) => Math.max(1, c - 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-sapphire-silverLight to-sapphire-blue text-sapphire-deep flex items-center justify-center"><Minus size={16} /></button>
                        <span className="font-cinzel text-2xl text-sapphire-silverLight">{rsvpCount}</span>
                        <button onClick={() => setRsvpCount((c) => Math.min(10, c + 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-sapphire-silverLight to-sapphire-blue text-sapphire-deep flex items-center justify-center"><Plus size={16} /></button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-sapphire-silver/50 mb-2">{ARABIC_YOUR_NAME}</label>
                      <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="اكتب اسمك الكامل"
                        className="w-full bg-sapphire-deep/80 border border-sapphire-silver/25 text-sapphire-silverLight placeholder:text-white/25 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-sapphire-silver transition" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!rsvpStatus || !rsvpName.trim()} onClick={handleRSVP}
                      className="w-full py-3.5 rounded-xl font-reem text-base text-sapphire-deep bg-gradient-to-br from-sapphire-silverLight to-sapphire-blue disabled:opacity-40 disabled:cursor-not-allowed">
                      {ARABIC_CONFIRM}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center font-amiri text-sapphire-silver/40 pb-8">في ليلةٍ من الياقوت نلتقي</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
