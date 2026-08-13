import { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  Crown, Leaf, Heart, Star, Zap, Moon,
  PanelLeftOpen, Scroll, Gem, DoorOpen, Gift, Flower2, Mail, SplitSquareHorizontal, ScrollText,
  ChevronDown,
} from 'lucide-react';
import { SharedInvitationProps } from './templates/shared/types';

const TemplateRoyalGold = lazy(() => import('./templates/TemplateRoyalGold'));
const TemplateEmeraldSanctuary = lazy(() => import('./templates/TemplateEmeraldSanctuary'));
const TemplateSilkEnvelope = lazy(() => import('./templates/TemplateSilkEnvelope'));
const TemplatePearlScroll = lazy(() => import('./templates/TemplatePearlScroll'));
const TemplateModernMinimal = lazy(() => import('./templates/TemplateModernMinimal'));
const TemplateElegantNights = lazy(() => import('./templates/TemplateElegantNights'));
const TemplateVerticalGate = lazy(() => import('./templates/TemplateVerticalGate'));
const TemplateVintageFold = lazy(() => import('./templates/TemplateVintageFold'));
const TemplateRubyBox = lazy(() => import('./templates/TemplateRubyBox'));
const TemplateFrostedGlass = lazy(() => import('./templates/TemplateFrostedGlass'));
const TemplateMoroccanArch = lazy(() => import('./templates/TemplateMoroccanArch'));
const TemplateGoldenGiftbox = lazy(() => import('./templates/TemplateGoldenGiftbox'));
const TemplateFloralGate = lazy(() => import('./templates/TemplateFloralGate'));
const TemplateLilacEnvelope = lazy(() => import('./templates/TemplateLilacEnvelope'));
const TemplateOnyxMarble = lazy(() => import('./templates/TemplateOnyxMarble'));
const TemplateCrimsonScroll = lazy(() => import('./templates/TemplateCrimsonScroll'));

type TemplateId =
  | 'royal' | 'emerald' | 'silk' | 'pearl' | 'modern' | 'elegant'
  | 'vertical' | 'vintage' | 'ruby' | 'frosted' | 'moroccan' | 'giftbox'
  | 'floral' | 'lilac' | 'onyx' | 'crimson';

const TEMPLATES: {
  id: TemplateId;
  name: string;
  arabic: string;
  desc: string;
  icon: typeof Crown;
  accent: string;
  Component: React.LazyExoticComponent<(p: SharedInvitationProps) => JSX.Element>;
}[] = [
  { id: 'royal', name: 'Royal Palace Gold', arabic: 'القصر الملكي', desc: 'Obsidian & burnished gold gates', icon: Crown, accent: 'from-yellow-600 to-yellow-800', Component: TemplateRoyalGold },
  { id: 'emerald', name: 'Emerald Sanctuary', arabic: 'الملاذ الزمردي', desc: 'Forest green arabesque arch', icon: Leaf, accent: 'from-emerald-600 to-emerald-900', Component: TemplateEmeraldSanctuary },
  { id: 'silk', name: 'Silk Rose Envelope', arabic: 'الظرف الحريري', desc: 'Burgundy velvet & wax seal', icon: Heart, accent: 'from-rose-500 to-rose-900', Component: TemplateSilkEnvelope },
  { id: 'pearl', name: 'Celestial Pearl Scroll', arabic: 'المخطوطة اللؤلؤية', desc: 'Ivory parchment & starlight', icon: Star, accent: 'from-amber-400 to-amber-700', Component: TemplatePearlScroll },
  { id: 'modern', name: 'Modern Minimal Obsidian', arabic: 'الأوبسيديان الحديث', desc: 'Dark glass & laser shutter', icon: Zap, accent: 'from-zinc-500 to-zinc-900', Component: TemplateModernMinimal },
  { id: 'elegant', name: 'Elegant Nights', arabic: 'ليالي الأناقة', desc: 'Amber warmth, Quran verse & parents', icon: Moon, accent: 'from-amber-500 to-amber-800', Component: TemplateElegantNights },
  { id: 'vertical', name: 'Sapphire Vertical Gate', arabic: 'البوابة الياقوتية', desc: 'Sapphire blue, vertical slide gate', icon: PanelLeftOpen, accent: 'from-blue-600 to-blue-900', Component: TemplateVerticalGate },
  { id: 'vintage', name: 'Vintage Tri-Fold', arabic: 'الرسالة القديمة', desc: 'Sepia parchment, wax seal tri-fold', icon: Scroll, accent: 'from-amber-700 to-amber-900', Component: TemplateVintageFold },
  { id: 'ruby', name: 'Ruby Heart Jewelry Box', arabic: 'صندوق الياقوت', desc: 'Ruby red velvet, heart lock box', icon: Gem, accent: 'from-red-600 to-rose-900', Component: TemplateRubyBox },
  { id: 'frosted', name: 'Frosted Glass Shutter', arabic: 'الزجاج المضبب', desc: 'Glassmorphism, gold neon panels', icon: PanelLeftOpen, accent: 'from-cyan-600 to-blue-900', Component: TemplateFrostedGlass },
  { id: 'moroccan', name: 'Moroccan Mosaic Arch', arabic: 'الأقواس المغربية', desc: 'Teal & terracotta, arabesque doors', icon: DoorOpen, accent: 'from-teal-600 to-orange-800', Component: TemplateMoroccanArch },
  { id: 'giftbox', name: 'Luxury Golden Giftbox', arabic: 'الهدية الذهبية', desc: 'Platinum & champagne, cross fold', icon: Gift, accent: 'from-yellow-400 to-amber-700', Component: TemplateGoldenGiftbox },
  { id: 'floral', name: 'Floral Garden Archway', arabic: 'بوابة الحديقة', desc: 'Sage green, wrought-iron rose gates', icon: Flower2, accent: 'from-green-500 to-green-800', Component: TemplateFloralGate },
  { id: 'lilac', name: 'Vintage Lilac Envelope', arabic: 'ظرف اللافندر', desc: 'Soft lilac & gold, flap opens down', icon: Mail, accent: 'from-purple-400 to-purple-700', Component: TemplateLilacEnvelope },
  { id: 'onyx', name: 'Onyx Marble Archway', arabic: 'الرخام الأسود', desc: 'Nero marquina, gold veins, split slide', icon: SplitSquareHorizontal, accent: 'from-zinc-700 to-zinc-950', Component: TemplateOnyxMarble },
  { id: 'crimson', name: 'Crimson Velvet Scroll', arabic: 'المخطوطة القرمزية', desc: 'Crimson & gold, scroll unrolls', icon: ScrollText, accent: 'from-red-700 to-red-950', Component: TemplateCrimsonScroll },
];

const SAMPLE: SharedInvitationProps = {
  groomName: 'أحـمد',
  brideName: 'فاطمة',
  groomFatherName: 'أحمد أحمد محمد الزلباني',
  brideFatherName: 'محمود السيد عبد السلام صبح',
  weddingDate: '2026-10-15',
  time: '08:00 مساءً',
  venueName: 'فندق الماسة - القاعة الملكية',
  venueAddress: 'القاهرة - العاصمة الإدارية الجديدة',
  onRSVP: (status, count, name) => console.log('RSVP:', { status, count, name }),
};

export default function App() {
  const [active, setActive] = useState<TemplateId | null>(null);

  if (active) {
    const tpl = TEMPLATES.find((t) => t.id === active)!;
    const Comp = tpl.Component;
    return (
      <div className="relative">
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]">
          <button
            onClick={() => setActive(null)}
            className="px-5 py-2.5 rounded-full glass-dark text-white text-sm font-reem flex items-center gap-2 shadow-xl hover:scale-105 transition"
          >
            <ChevronDown size={16} className="rotate-90" />
            كل القوالب
          </button>
        </div>
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
          <Comp {...SAMPLE} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white" dir="rtl">
      <header className="relative overflow-hidden pt-20 pb-12 px-4 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-yellow-600/10 blur-[120px]" />
        </div>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-cinzel text-xs tracking-[0.5em] text-yellow-600 uppercase mb-4"
        >
          Dawety — Premium Arabic Invitations
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="font-amiri text-5xl md:text-7xl text-gold-gradient mb-3"
        >
          دعوة
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/60 max-w-xl mx-auto"
        >
          ستة عشر قالباً فاخراً لدعوات الزفاف الرقمية. اختر تصميماً لتجربة البوابة التفاعلية الكاملة.
        </motion.p>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.button
                key={t.id}
                onClick={() => setActive(t.id)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.8) }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-right transition hover:border-yellow-600/40"
              >
                <div className={`absolute -top-12 -left-12 w-40 h-40 rounded-full bg-gradient-to-br ${t.accent} opacity-20 blur-2xl group-hover:opacity-40 transition`} />
                <div className="relative">
                  <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${t.accent} items-center justify-center mb-4`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="font-amiri text-2xl mb-1">{t.arabic}</h3>
                  <p className="font-cinzel text-xs tracking-widest text-yellow-600/80 uppercase mb-2">{t.name}</p>
                  <p className="text-white/50 text-sm">{t.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-yellow-600 text-sm font-reem">
                    عرض القالب
                    <ChevronDown size={14} className="-rotate-90" />
                  </div>
                </div>
              </motion.button>
            );
          })}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="rounded-2xl border border-yellow-600/20 bg-yellow-600/[0.04] p-6"
          >
            <h3 className="font-amiri text-xl text-yellow-600 mb-3">مميزات القوالب</h3>
            <ul className="space-y-2 text-white/60 text-sm font-reem">
              <li>• بوابة افتتاح تفاعلية لكل قالب</li>
              <li>• آية قرآنية وأسماء الأهل (قالب ليالي الأناقة)</li>
              <li>• زر إضافة للتقويم ومشاركة الدعوة</li>
              <li>• عدّاد تنازلي مباشر للحفل</li>
              <li>• تأكيد حضور تفاعلي بعدد الضيوف</li>
              <li>• معرض صور مع عارض مكبّر</li>
              <li>• زر موسيقى محيطية عائم</li>
              <li>• زر فتح خرائط جوجل للموقع</li>
              <li>• تصميم متجاوب 100% للجوال</li>
              <li>• احتفال بالكونفيتي عند تأكيد الحضور</li>
            </ul>
          </motion.div>
        </div>
      </main>

      <footer className="text-center py-8 text-white/30 text-xs font-cinzel tracking-widest">
        DAWETY — LUXURY DIGITAL WEDDING INVITATIONS
      </footer>
    </div>
  );
}
