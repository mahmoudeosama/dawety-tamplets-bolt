import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Check, Minus, Plus, Heart, Navigation, Share2, CalendarPlus, Copy, Sparkles, ChevronDown } from 'lucide-react';
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
  ARABIC_OPEN_INVITATION,
  ARABIC_QURAN_VERSE,
  ARABIC_HONORED,
  ARABIC_GROOM_FATHER,
  ARABIC_BRIDE_FATHER,
  ARABIC_ADD_TO_CALENDAR,
  ARABIC_SHARE_INVITATION,
  ARABIC_SHARE_COPIED,
  ARABIC_CLOSING_MESSAGE,
  ARABIC_CLOSING_SUB,
  ARABIC_COUNTDOWN_TITLE_NIGHT,
  ARABIC_MEMORIES,
  ARABIC_MEMORIES_SUB,
  ARABIC_GET_DIRECTIONS,
  ARABIC_VENUE_SUB,
} from './shared/types';
import { useCountdown, useAmbientMusic, useLockBody, TimeLeft } from './shared/hooks';
import { MusicToggle } from './shared/MusicToggle';

const fmtDate = (d: string) =>
  new Intl.DateTimeFormat('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d));

/* ── Elegant flip-card countdown (unique to ElegantNights) ── */
function FlipCountdown({ time }: { time: TimeLeft }) {
  const units = [
    { value: time.days, label: ARABIC_DAYS },
    { value: time.hours, label: ARABIC_HOURS },
    { value: time.minutes, label: ARABIC_MINUTES },
    { value: time.seconds, label: ARABIC_SECONDS },
  ];
  return (
    <div className="flex justify-center gap-2 md:gap-4">
      {units.map((u) => (
        <div key={u.label} className="text-center">
          <div className="relative w-16 h-20 md:w-20 md:h-28 perspective-1000">
            <motion.div
              key={u.value}
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="absolute inset-0 preserve-3d backface-hidden rounded-xl border border-amber-300/30 bg-gradient-to-b from-stone-900 to-stone-950 flex items-center justify-center shadow-lg"
            >
              <div className="absolute top-1/2 left-0 right-0 h-px bg-amber-300/10" />
              <span
                className="font-cinzel text-2xl md:text-4xl text-amber-200"
                style={{ textShadow: '0 0 14px rgba(252,211,77,0.4)' }}
              >
                {String(u.value).padStart(2, '0')}
              </span>
            </motion.div>
          </div>
          <div className="mt-2 text-[10px] md:text-xs text-amber-200/50 font-reem">{u.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Timeline gallery (unique to ElegantNights) — horizontal scroll with snap ── */
function TimelineGallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
      >
        {images.map((src, i) => (
          <motion.button
            key={src + i}
            onClick={() => setLightbox(i)}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.04 }}
            className="relative shrink-0 snap-center w-44 h-56 md:w-56 md:h-72 overflow-hidden rounded-2xl border border-amber-300/20 group"
          >
            <img src={src} alt={`memory ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 right-3 text-amber-200/70 text-xs font-reem">ذكرى {i + 1}</div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[120] bg-stone-950/95 flex items-center justify-center p-4"
          >
            <button className="absolute top-5 right-5 text-amber-200/80 hover:text-amber-200" onClick={() => setLightbox(null)}>
              <X size={28} />
            </button>
            <motion.img
              key={lightbox}
              src={images[lightbox]}
              alt="preview"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-h-[82vh] max-w-[92vw] rounded-xl object-contain shadow-2xl border border-amber-300/20"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TemplateElegantNights(props: SharedInvitationProps) {
  const {
    groomName = DEFAULT_INVITATION.groomName,
    brideName = DEFAULT_INVITATION.brideName,
    groomFatherName = 'أحمد أحمد محمد الزلباني',
    brideFatherName = 'محمود السيد عبد السلام صبح',
    weddingDate = DEFAULT_INVITATION.weddingDate,
    time = DEFAULT_INVITATION.time,
    venueName = DEFAULT_INVITATION.venueName,
    venueAddress = DEFAULT_INVITATION.venueAddress,
    storyText = 'بكل الحب يتشرفان بدعوتكم لمشاركتنا فرحة ليلة العمر، ليلة لا تكتمل إلا بحضوركم.',
    quranVerse = ARABIC_QURAN_VERSE,
    latitude, longitude,
    galleryImages = DEFAULT_GALLERY,
    onRSVP,
  } = props;

  const [opened, setOpened] = useState(false);
  const timeLeft = useCountdown(weddingDate);
  const music = useAmbientMusic();
  useLockBody(!opened);

  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'declined' | null>(null);
  const [rsvpCount, setRsvpCount] = useState(1);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpDone, setRsvpDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const lat = latitude ?? 30.0074;
  const lng = longitude ?? 31.4913;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  // Add to calendar (.ics file)
  const calendarUrl = useMemo(() => {
    const dt = new Date(weddingDate);
    const dtEnd = new Date(dt.getTime() + 4 * 3600_000);
    const fmtICS = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dawety//Wedding//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@dawety.com`,
      `DTSTART:${fmtICS(dt)}`,
      `DTEND:${fmtICS(dtEnd)}`,
      `SUMMARY:زفاف ${groomName} و ${brideName}`,
      `LOCATION:${venueName}\\, ${venueAddress}`,
      'BEGIN:VALARM', 'TRIGGER:-PT24H', 'ACTION:DISPLAY', 'DESCRIPTION:تذكير: ليلة الزفاف غداً', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\n');
    return URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  }, [weddingDate, groomName, brideName, venueName, venueAddress]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `دعوة زفاف ${groomName} و ${brideName}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch { /* noop */ }
    }
  };

  return (
    <div className="relative min-h-screen bg-stone-950 text-amber-100 overflow-hidden font-reem" dir="rtl">
      {/* warm ambient glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-amber-400/8 blur-[130px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-rose-800/6 blur-[120px]" />
      </div>
      {/* subtle texture */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(rgba(252,211,77,0.4) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <MusicToggle playing={music.playing} toggle={music.toggle} accentSolid="bg-gradient-to-br from-amber-300 to-amber-600" ring="ring-2 ring-amber-300/40" />

      <AnimatePresence mode="wait">
        {!opened ? (
          /* ─────────── COVER ─────────── */
          <motion.div
            key="cover"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.7 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4"
          >
            {/* decorative frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative max-w-md w-full px-8 py-12 text-center"
            >
              {/* corner ornaments */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-300/30 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-300/30 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-amber-300/30 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-300/30 rounded-br-lg" />

              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-amiri text-sm text-amber-300/70 mb-6"
              >
                {BISMILLAH}
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-amber-200/60 text-sm mb-4"
              >
                دعوة زفاف
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="font-amiri text-5xl md:text-6xl text-amber-100"
                style={{ textShadow: '0 0 30px rgba(252,211,77,0.2)' }}
              >
                {groomName}
              </motion.h1>
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="font-vibes text-4xl text-amber-300 my-2"
                style={{ textShadow: '0 0 20px currentColor' }}
              >
                &amp;
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="font-amiri text-5xl md:text-6xl text-amber-100"
                style={{ textShadow: '0 0 30px rgba(252,211,77,0.2)' }}
              >
                {brideName}
              </motion.h1>

              <motion.button
                onClick={() => setOpened(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-10 px-8 py-3.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-stone-950 font-reem text-base shadow-[0_0_30px_rgba(252,211,77,0.3)] inline-flex items-center gap-2"
              >
                <Sparkles size={16} />
                {ARABIC_OPEN_INVITATION}
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          /* ─────────── INVITATION ─────────── */
          <motion.div
            key="invite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10 max-w-2xl mx-auto px-4 py-12 space-y-20"
          >
            {/* Quran verse centerpiece */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <p className="font-amiri text-lg md:text-xl text-amber-200/80 leading-loose max-w-lg mx-auto">
                {quranVerse}
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber-300/40" />
                <span className="text-amber-300/40 text-sm">❖</span>
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber-300/40" />
              </div>
            </motion.section>

            {/* Honored + names with parents */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-amber-200/60 text-sm mb-8">{ARABIC_HONORED}</p>

              {/* Groom with father */}
              <div className="mb-8">
                <h2 className="font-amiri text-4xl md:text-5xl text-amber-100 mb-2">{groomName}</h2>
                <p className="text-amber-200/40 text-xs mb-1">{ARABIC_GROOM_FATHER}</p>
                <p className="font-reem text-sm text-amber-200/60">{groomFatherName}</p>
              </div>

              {/* Ampersand */}
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="font-vibes text-5xl text-amber-300 my-4"
                style={{ textShadow: '0 0 24px currentColor' }}
              >
                &amp;
              </motion.div>

              {/* Bride with father */}
              <div className="mt-8">
                <h2 className="font-amiri text-4xl md:text-5xl text-amber-100 mb-2">{brideName}</h2>
                <p className="text-amber-200/40 text-xs mb-1">{ARABIC_BRIDE_FATHER}</p>
                <p className="font-reem text-sm text-amber-200/60">{brideFatherName}</p>
              </div>

              {/* Date */}
              <div className="mt-10 inline-block">
                <div className="flex items-center justify-center gap-4 text-amber-200/80">
                  <span className="font-reem text-lg">{fmtDate(weddingDate)}</span>
                  <span className="text-amber-300/30">•</span>
                  <span className="font-reem text-lg">{time}</span>
                </div>
              </div>
            </motion.section>

            {/* Countdown */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h3 className="font-amiri text-2xl text-amber-200 mb-2">{ARABIC_COUNTDOWN_TITLE_NIGHT}</h3>
              <p className="text-amber-200/40 text-sm mb-8">{ARABIC_MEMORIES}</p>
              <FlipCountdown time={timeLeft} />
            </motion.section>

            {/* Story */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-lg mx-auto"
            >
              <p className="font-amiri text-lg leading-loose text-amber-200/70">{storyText}</p>
            </motion.section>

            {/* Gallery — timeline */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-6">
                <h3 className="font-amiri text-2xl text-amber-200">{ARABIC_MEMORIES_SUB}</h3>
              </div>
              <TimelineGallery images={galleryImages} />
            </motion.section>

            {/* Venue */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-amber-200/50 text-sm mb-2">{ARABIC_GET_DIRECTIONS}</p>
              <h3 className="font-amiri text-2xl text-amber-200 mb-2">موقع حفل الزفاف</h3>
              <p className="text-amber-200/40 text-sm mb-6 max-w-md mx-auto">{ARABIC_VENUE_SUB}</p>

              <div className="glass-dark bg-stone-900/50 border border-amber-300/20 rounded-2xl p-6 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <MapPin size={18} className="text-amber-300" />
                  <p className="font-reem text-lg text-amber-100">{venueName}</p>
                </div>
                <p className="text-sm text-amber-200/50 mb-5">{venueAddress}</p>
                <motion.a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-stone-950 font-reem text-sm"
                >
                  <Navigation size={16} /> {ARABIC_OPEN_MAP}
                </motion.a>
              </div>
            </motion.section>

            {/* Add to calendar */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-amber-200/50 text-sm mb-2">لا تنسوا الموعد</p>
              <h3 className="font-amiri text-xl text-amber-200 mb-4">{ARABIC_ADD_TO_CALENDAR}</h3>
              <motion.a
                href={calendarUrl}
                download="wedding.ics"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-amber-300/30 text-amber-200 font-reem text-sm hover:bg-amber-300/10 transition"
              >
                <CalendarPlus size={18} />
                {ARABIC_ADD_TO_CALENDAR}
              </motion.a>
            </motion.section>

            {/* Share */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h3 className="font-amiri text-xl text-amber-200 mb-1">{ARABIC_SHARE_INVITATION}</h3>
              <p className="text-amber-200/40 text-xs mb-5">في إنستجرام وتيك توك سيتم نسخ رابط الدعوة تلقائياً.</p>
              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-amber-300/30 text-amber-200 font-reem text-sm hover:bg-amber-300/10 transition"
              >
                {copied ? <Copy size={18} /> : <Share2 size={18} />}
                {copied ? ARABIC_SHARE_COPIED : ARABIC_SHARE_INVITATION}
              </motion.button>
            </motion.section>

            {/* RSVP */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="glass-dark bg-stone-900/50 border border-amber-300/20 rounded-2xl p-6 md:p-8">
                <h3 className="text-center font-amiri text-2xl text-amber-200 mb-1">{ARABIC_RSVP}</h3>
                <p className="text-center text-sm text-amber-200/40 mb-6">يرجى تأكيد حضوركم قبل الموعد</p>
                <AnimatePresence mode="wait">
                  {rsvpDone ? (
                    <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                        className="mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center">
                        <Heart size={24} className="text-stone-950" fill="currentColor" />
                      </motion.div>
                      <p className="font-reem text-amber-100">{rsvpStatus === 'attending' ? ARABIC_THANKS_ATTENDING : ARABIC_THANKS_DECLINED}</p>
                      <p className="text-sm text-amber-200/30 mt-1">{rsvpName}</p>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setRsvpStatus('attending')}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'attending' ? 'bg-gradient-to-br from-amber-300 to-amber-600 text-stone-950 border-transparent' : 'border-amber-300/25 text-amber-100'}`}>
                          <Check size={18} /><span className="font-reem text-sm">{ARABIC_ATTENDING}</span>
                        </button>
                        <button onClick={() => setRsvpStatus('declined')}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${rsvpStatus === 'declined' ? 'bg-gradient-to-br from-amber-300 to-amber-600 text-stone-950 border-transparent' : 'border-amber-300/25 text-amber-100'}`}>
                          <X size={18} /><span className="font-reem text-sm">{ARABIC_DECLINED}</span>
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm text-amber-200/40 mb-2">{ARABIC_GUESTS}</label>
                        <div className="flex items-center justify-between bg-stone-950/60 border border-amber-300/25 rounded-xl px-4 py-2">
                          <button onClick={() => setRsvpCount((c) => Math.max(1, c - 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-stone-950 flex items-center justify-center"><Minus size={16} /></button>
                          <span className="font-cinzel text-2xl text-amber-200">{rsvpCount}</span>
                          <button onClick={() => setRsvpCount((c) => Math.min(10, c + 1))} className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-stone-950 flex items-center justify-center"><Plus size={16} /></button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-amber-200/40 mb-2">{ARABIC_YOUR_NAME}</label>
                        <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="اكتب اسمك الكامل"
                          className="w-full bg-stone-950/60 border border-amber-300/25 text-amber-100 placeholder:text-white/20 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-amber-300 transition" />
                      </div>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!rsvpStatus || !rsvpName.trim()}
                        onClick={() => { onRSVP?.(rsvpStatus!, rsvpCount, rsvpName.trim()); setRsvpDone(true); }}
                        className="w-full py-3.5 rounded-xl font-reem text-base text-stone-950 bg-gradient-to-br from-amber-300 to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed">
                        {ARABIC_CONFIRM}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>

            {/* Closing message */}
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center py-8"
            >
              <h3 className="font-amiri text-2xl text-amber-200 mb-2">{ARABIC_CLOSING_MESSAGE}</h3>
              <p className="text-amber-200/50 text-sm mb-4">{ARABIC_CLOSING_SUB}</p>
              <p className="font-vibes text-3xl text-amber-300/60">
                {groomName} <span className="text-rose-400/60">♡</span> {brideName}
              </p>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
