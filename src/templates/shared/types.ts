export interface SharedInvitationProps {
  groomName?: string;
  brideName?: string;
  groomFatherName?: string;
  brideFatherName?: string;
  weddingDate?: string;
  time?: string;
  venueName?: string;
  venueAddress?: string;
  storyText?: string;
  quranVerse?: string;
  quranText?: string;
  invitationTitle?: string;
  coupleImageUrl?: string;
  latitude?: number;
  longitude?: number;
  galleryImages?: string[];
  guestToken?: string;
  onRSVP?: (status: 'attending' | 'declined', count: number, name: string) => void;
}

export const DEFAULT_INVITATION: Required<
  Pick<
    SharedInvitationProps,
    'groomName' | 'brideName' | 'weddingDate' | 'time' | 'venueName' | 'venueAddress'
  >
> = {
  groomName: 'أحـمد',
  brideName: 'فاطمة',
  weddingDate: '2026-10-15',
  time: '08:00 مساءً',
  venueName: 'فندق الماسة - القاعة الملكية',
  venueAddress: 'القاهرة - العاصمة الإدارية الجديدة',
};

export const DEFAULT_GALLERY: string[] = [
  'https://images.pexels.com/photos/29040997/pexels-photo-29040997.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/1702371/pexels-photo-1702371.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/32142686/pexels-photo-32142686.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/16935999/pexels-photo-16935999.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/17034946/pexels-photo-17034946.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/12876497/pexels-photo-12876497.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

export const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ';

export const ARABIC_DAYS = 'يوم';
export const ARABIC_HOURS = 'ساعة';
export const ARABIC_MINUTES = 'دقيقة';
export const ARABIC_SECONDS = 'ثانية';

export const ARABIC_ATTENDING = 'سأحضر';
export const ARABIC_DECLINED = 'لن أتمكن';
export const ARABIC_GUESTS = 'عدد الضيوف';
export const ARABIC_YOUR_NAME = 'الاسم';
export const ARABIC_CONFIRM = 'تأكيد الحضور';
export const ARABIC_THANKS_ATTENDING = 'شكراً! نتطلع لرؤيتكم في الحفل';
export const ARABIC_THANKS_DECLINED = 'شكراً! سنفتقد حضوركم';
export const ARABIC_OPEN_MAP = 'فتح الخريطة (Google Maps)';
export const ARABIC_VIEW_LOCATION = 'موقع الحفل';
export const ARABIC_GALLERY = 'معرض الصور';
export const ARABIC_RSVP = 'تأكيد الحضور';
export const ARABIC_COUNTDOWN_TITLE = 'العد التنازلي للزفاف';
export const ARABIC_WEDDING_INVITATION = 'دعوة زفاف';
export const ARABIC_INVITES_YOU = 'يسعدنا دعوتكم لمشاركتنا فرحة زفافنا';
export const ARABIC_OUR_STORY = 'قصتنا';
export const ARABIC_OPEN_INVITATION = 'اضغط لفتح الدعوة';
export const ARABIC_QURAN_VERSE = 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً';
export const ARABIC_HONORED = 'يتشرفان بدعوتكم';
export const ARABIC_GROOM_FATHER = 'والد العريس';
export const ARABIC_BRIDE_FATHER = 'والد العروس';
export const ARABIC_ADD_TO_CALENDAR = 'أضيفوا ليلة الفرح إلى التقويم';
export const ARABIC_SHARE_INVITATION = 'شارك الدعوة مع الأهل والأصدقاء';
export const ARABIC_SHARE_COPIED = 'تم نسخ رابط الدعوة';
export const ARABIC_CLOSING_MESSAGE = 'وجودكم يتمم فرحتنا';
export const ARABIC_CLOSING_SUB = 'ننتظركم بكل الحب في ليلة لا تكتمل إلا بحضوركم';
export const ARABIC_COUNTDOWN_TITLE_NIGHT = 'العد التنازلي لليلة العمر';
export const ARABIC_MEMORIES = 'لحظاتنا';
export const ARABIC_MEMORIES_SUB = 'بعض الذكريات الجميلة';
export const ARABIC_GET_DIRECTIONS = 'الوصول إلى مكان الحفل';
export const ARABIC_VENUE_SUB = 'يمكنك فتح الموقع مباشرة على خرائط Google أو مشاركة اللوكيشن مع الأهل والأصدقاء';
