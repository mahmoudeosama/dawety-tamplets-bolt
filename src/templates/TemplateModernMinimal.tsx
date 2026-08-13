import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MapPin, X, Check, Minus, Plus, Heart, Navigation, ChevronDown, Calendar, Clock, Image, MessageSquare } from 'lucide-react';
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

/* ── LED segment countdown (unique to Modern) ── */
function LEDCountdown({ time }: { time: TimeLeft }) {
  const units = [
    { value: time.days, label: ARABIC_DAYS },
    { value: time.hours, label: ARABIC_HOURS },
    { value: time.minutes, label: ARABIC_MINUTES },
    { value: time.seconds, label: ARABIC_SECONDS },
  ];
  return (
    <div className="flex justify-center gap-2 md:gap-4">
      {units.map((u, i) => (
        <div key={u.label} className="text-center">
          <div className="relative bg-obsidian-black border border-obsidian-gold/30 rounded-lg px-3 py-4 md:px-6 md:py-6 min-w-[70px] md:min-w-[100px] overflow-hidden">
            {/* LED glow background */}
            <div className="absolute inset-0 bg-obsidian-gold/5" />
            {/* fake LED segments behind */}
            <div className="absolute inset-0 flex items-center justify-center text-obsidian-gold/5 font-cinzel text-5xl md:text-7xl select-none">88</div>
            <motion.div
              key={u.value}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative font-cinzel text-3xl md:text-5xl text-obsidian-gold"
              style={{ textShadow: '0 0 12px rgba(212,175,55,0.6)' }}
            >
              {String(u.value).padStart(2, '0')}
            </motion.div>
          </div>
          <div className="mt-2 text-[10px] md:text-xs text-obsidian-white/50 font-reem tracking-wider uppercase">{u.label}</div>
          {i < units.length - 1 && <div className="hidden md:block">:</div>}
        </div>
      ))}
    </div>
  );
}

/* ── Grid gallery (unique to Modern) — full-width tiles with hover expand ── */
function GridGallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
        {images.map((src, i) => (
          <motion.button
            key={src + i}
            onClick={() => setLightbox(i)}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.05 }}
            className={`relative overflow-hidden ${i === 0 || i === 3 ? 'row-span-2' : ''} aspect-square ${i === 0 ? 'md:col-span-1' : ''}`}
          >
            <img src={src} alt={`photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-obsidian-black/30 hover:bg-transparent transition-colors" />
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[120] bg-obsidian-black/95 flex items-center justify-center p-4">
            <button className="absolute top-5 right-5 text-obsidian-white/80 hover:text-white" onClick={() => setLightbox(null)}><X size={28} /></button>
            <motion.img key={lightbox} src={images[lightbox]} alt="preview"
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-h-[82vh] max-w-[92vw] rounded-lg object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TemplateModernMinimal(props: SharedInvitationProps) {
  const {
    groomName = DEFAULT_INVITATION.groomName,
    brideName = DEFAULT_INVITATION.brideName,
    weddingDate = DEFAULT_INVITATION.weddingDate,
    time = DEFAULT_INVITATION.time,
    venueName = DEFAULT_INVITATION.venueName,
    venueAddress = DEFAULT_INVITATION.venueAddress,
    storyText = 'في بساطةٍ تليق بالبدايات، التقينا لنكتب حكايةً جديدة. نسأل الله أن يبارك في زواجنا ويجعل حياتنا نوراً على نور.',
    latitude, longitude,
    galleryImages = DEFAULT_GALLERY,
    onRSVP,
  } = props;

  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const timeLeft = useCountdown(weddingDate);
  const music = useAmbientMusic();
  useLockBody(!opened);

  // Floating RSVP modal
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'declined' | null>(null);
  const [rsvpCount, setRsvpCount] = useState(1);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpDone, setRsvpDone] = useState(false);

  const handleOpen = () => { setOpening(true); setTimeout(() => setOpened(true), 1100); };

  const lat = latitude ?? 30.0074;
  const lng = longitude ?? 31.4913;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="relative min-h-screen bg-obsidian-black text-obsidian-white overflow-hidden font-reem" dir="rtl">
      {/* grid backdrop */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-obsidian-gold/10 blur-[120px]" />
      <MusicToggle playing={music.playing} toggle={music.toggle} accentSolid="bg-obsidian-gold" ring="ring-2 ring-obsidian-gold/50" />

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="gate" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
              <p className="font-cinzel text-sm tracking-[0.4em] text-obsidian-gold uppercase">Dawety</p>
            </motion.div>

            <div className="relative w-[280px] h-[380px] md:w-[380px] md:h-[500px] overflow-hidden rounded-2xl border border-obsidian-gold/30 bg-obsidian-graphite/40 backdrop-blur-sm">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <p className="font-cinzel text-obsidian-gold text-xs tracking-[0.3em] mb-3">INVITATION</p>
                <p className="font-amiri text-3xl md:text-4xl text-obsidian-white">{groomName} & {brideName}</p>
                <div className="mt-4 h-px w-16 bg-obsidian-gold/40" />
                <p className="mt-4 text-obsidian-white/60 text-sm">{fmtDate(weddingDate)}</p>
              </div>
              <motion.div animate={opening ? { opacity: 0 } : { opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-obsidian-gold" />
              <motion.div animate={opening ? { opacity: 0 } : { scale: [1, 1.6], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-obsidian-gold" />
              <motion.div className="absolute top-0 left-0 right-0 h-1/2 bg-obsidian-graphite border-b border-obsidian-gold/30"
                animate={opening ? { y: '-100%' } : { y: 0 }} transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}>
                <div className="absolute bottom-2 left-0 right-0 h-px bg-obsidian-gold shadow-[0_0_12px_rgba(212,175,55,0.8)]" />
              </motion.div>
              <motion.div className="absolute bottom-0 left-0 right-0 h-1/2 bg-obsidian-graphite border-t border-obsidian-gold/30"
                animate={opening ? { y: '100%' } : { y: 0 }} transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}>
                <div className="absolute top-2 left-0 right-0 h-px bg-obsidian-gold shadow-[0_0_12px_rgba(212,175,55,0.8)]" />
              </motion.div>
            </div>

            <motion.button onClick={handleOpen} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="mt-8 px-10 py-4 rounded-full bg-obsidian-gold text-obsidian-black font-reem text-lg font-semibold shadow-[0_0_30px_rgba(212,175,55,0.5)] flex items-center gap-2">
              <Zap size={18} /> افتح الدعوة
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="invite" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="relative z-10">

            {/* Snap-scroll full-screen sections */}
            <div className="snap-y snap-mandatory h-screen overflow-y-scroll scrollbar-hide">

              {/* Section 1: Split-screen hero */}
              <section className="snap-start min-h-screen flex items-center px-4 relative">
                <div className="max-w-4xl mx-auto w-full">
                  {/* Bismillah minimal */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
                    <p className="font-amiri text-lg md:text-xl text-obsidian-gold">{BISMILLAH}</p>
                  </motion.div>

                  {/* Split hero — left groom, right bride */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center">
                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                      className="glass-dark rounded-2xl p-8 text-center border-r-2 border-obsidian-gold">
                      <p className="font-cinzel text-xs tracking-[0.3em] text-obsidian-gold/60 uppercase mb-3">GROOM</p>
                      <h1 className="font-cinzel text-4xl md:text-6xl text-obsidian-white">{groomName}</h1>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                      className="glass-dark rounded-2xl p-8 text-center border-l-2 border-obsidian-gold">
                      <p className="font-cinzel text-xs tracking-[0.3em] text-obsidian-gold/60 uppercase mb-3">BRIDE</p>
                      <h1 className="font-cinzel text-4xl md:text-6xl text-obsidian-white">{brideName}</h1>
                    </motion.div>
                  </div>

                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="text-center my-6 font-vibes text-5xl text-obsidian-gold" style={{ textShadow: '0 0 24px currentColor' }}>&</motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                    className="text-center">
                    <p className="text-obsidian-white/60 mb-2">{ARABIC_INVITES_YOU}</p>
                    <div className="inline-flex items-center gap-4 text-obsidian-gold">
                      <Calendar size={16} />
                      <p className="font-reem text-lg">{fmtDate(weddingDate)}</p>
                      <Clock size={16} />
                      <p className="font-reem text-lg">{time}</p>
                    </div>
                  </motion.div>
                </div>

                {/* scroll hint */}
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 text-obsidian-gold/40">
                  <ChevronDown size={24} />
                </motion.div>
              </section>

              {/* Section 2: LED countdown */}
              <section className="snap-start min-h-screen flex flex-col items-center justify-center px-4">
                <motion.h3 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                  className="font-cinzel text-sm tracking-[0.4em] text-obsidian-gold/60 uppercase mb-10">COUNTDOWN</motion.h3>
                <LEDCountdown time={timeLeft} />
              </section>

              {/* Section 3: Story */}
              <section className="snap-start min-h-screen flex flex-col items-center justify-center px-4">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="max-w-lg text-center glass-dark rounded-2xl p-8 md:p-12">
                  <h3 className="font-cinzel text-xl tracking-widest text-obsidian-gold mb-4">{ARABIC_OUR_STORY}</h3>
                  <p className="font-reem text-base md:text-lg leading-relaxed text-obsidian-white/70">{storyText}</p>
                </motion.div>
              </section>

              {/* Section 4: Gallery */}
              <section className="snap-start min-h-screen flex flex-col items-center justify-center px-4 py-12">
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                  className="max-w-3xl w-full">
                  <div className="flex items-center justify-center gap-2 mb-8">
                    <Image size={18} className="text-obsidian-gold" />
                    <h3 className="font-cinzel text-sm tracking-[0.3em] text-obsidian-gold uppercase">{ARABIC_GALLERY}</h3>
                  </div>
                  <GridGallery images={galleryImages} />
                </motion.div>
              </section>

              {/* Section 5: Venue */}
              <section className="snap-start min-h-screen flex flex-col items-center justify-center px-4">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="max-w-lg w-full glass-dark rounded-2xl p-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <MapPin size={20} className="text-obsidian-gold" />
                    <h3 className="font-cinzel text-lg tracking-widest text-obsidian-gold">VENUE</h3>
                  </div>
                  <p className="font-reem text-xl text-obsidian-white mb-1">{venueName}</p>
                  <p className="text-sm text-obsidian-white/50 mb-6">{venueAddress}</p>
                  <motion.a href={mapsUrl} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-obsidian-gold text-obsidian-black font-reem">
                    <Navigation size={16} /> {ARABIC_OPEN_MAP}
                  </motion.a>
                </motion.div>
              </section>

              {/* Section 6: RSVP CTA */}
              <section className="snap-start min-h-screen flex flex-col items-center justify-center px-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                  className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <MessageSquare size={20} className="text-obsidian-gold" />
                    <h3 className="font-cinzel text-lg tracking-widest text-obsidian-gold">RSVP</h3>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                    onClick={() => setRsvpOpen(true)}
                    className="px-10 py-5 rounded-full bg-obsidian-gold text-obsidian-black font-reem text-xl font-semibold shadow-[0_0_40px_rgba(212,175,55,0.5)]">
                    {ARABIC_RSVP}
                  </motion.button>
                  <p className="mt-4 text-obsidian-white/40 text-sm">اضغط لتأكيد حضورك</p>
                </motion.div>

                <p className="mt-16 font-cinzel text-xs tracking-[0.3em] text-obsidian-white/20 uppercase pb-8">Dawety — Digital Invitations</p>
              </section>
            </div>

            {/* Floating RSVP trigger button (always visible) */}
            <motion.button
              onClick={() => setRsvpOpen(true)}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="fixed bottom-5 left-5 z-[80] px-5 py-3 rounded-full bg-obsidian-gold text-obsidian-black font-reem text-sm font-semibold shadow-xl flex items-center gap-2"
            >
              <Heart size={16} fill="currentColor" />
              {ARABIC_RSVP}
            </motion.button>

            {/* RSVP Modal */}
            <AnimatePresence>
              {rsvpOpen && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setRsvpOpen(false)}
                  className="fixed inset-0 z-[110] bg-obsidian-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="glass-dark border border-obsidian-gold/30 rounded-2xl p-6 md:p-8 max-w-md w-full"
                  >
                    <button onClick={() => setRsvpOpen(false)} className="absolute top-4 left-4 text-obsidian-white/60 hover:text-white">
                      <X size={24} />
                    </button>
                    <h3 className="text-center font-cinzel text-xl tracking-widest text-obsidian-gold mb-1">{ARABIC_RSVP}</h3>
                    <p className="text-center text-sm text-obsidian-white/40 mb-6">يرجى تأكيد حضوركم قبل الموعد</p>
                    <AnimatePresence mode="wait">
                      {rsvpDone ? (
                        <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                            className="mx-auto mb-3 w-14 h-14 rounded-full bg-obsidian-gold flex items-center justify-center">
                            <Heart size={24} className="text-obsidian-black" fill="currentColor" />
                          </motion.div>
                          <p className="font-reem text-obsidian-white">{rsvpStatus === 'attending' ? ARABIC_THANKS_ATTENDING : ARABIC_THANKS_DECLINED}</p>
                          <p className="text-sm text-obsidian-white/30 mt-1">{rsvpName}</p>
                        </motion.div>
                      ) : (
                        <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setRsvpStatus('attending')}
                              className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'attending' ? 'bg-obsidian-gold text-obsidian-black border-transparent' : 'border-obsidian-gold/25 text-obsidian-white'}`}>
                              <Check size={18} /><span className="font-reem text-sm">{ARABIC_ATTENDING}</span>
                            </button>
                            <button onClick={() => setRsvpStatus('declined')}
                              className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'declined' ? 'bg-obsidian-gold text-obsidian-black border-transparent' : 'border-obsidian-gold/25 text-obsidian-white'}`}>
                              <X size={18} /><span className="font-reem text-sm">{ARABIC_DECLINED}</span>
                            </button>
                          </div>
                          <div>
                            <label className="block text-sm text-obsidian-white/40 mb-2">{ARABIC_GUESTS}</label>
                            <div className="flex items-center justify-between bg-obsidian-black/60 border border-obsidian-gold/25 rounded-xl px-4 py-2">
                              <button onClick={() => setRsvpCount((c) => Math.max(1, c - 1))} className="w-9 h-9 rounded-full bg-obsidian-gold text-obsidian-black flex items-center justify-center"><Minus size={16} /></button>
                              <span className="font-cinzel text-2xl text-obsidian-gold">{rsvpCount}</span>
                              <button onClick={() => setRsvpCount((c) => Math.min(10, c + 1))} className="w-9 h-9 rounded-full bg-obsidian-gold text-obsidian-black flex items-center justify-center"><Plus size={16} /></button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-obsidian-white/40 mb-2">{ARABIC_YOUR_NAME}</label>
                            <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="اكتب اسمك الكامل"
                              className="w-full bg-obsidian-black/60 border border-obsidian-gold/25 text-obsidian-white placeholder:text-white/25 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-obsidian-gold transition" />
                          </div>
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!rsvpStatus || !rsvpName.trim()}
                            onClick={() => { onRSVP?.(rsvpStatus!, rsvpCount, rsvpName.trim()); setRsvpDone(true); }}
                            className="w-full py-3.5 rounded-xl font-reem text-base text-obsidian-black bg-obsidian-gold disabled:opacity-40 disabled:cursor-not-allowed">
                            {ARABIC_CONFIRM}
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
