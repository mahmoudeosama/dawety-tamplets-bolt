import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { ARABIC_OPEN_MAP, ARABIC_VIEW_LOCATION } from './types';

interface VenueProps {
  venueName: string;
  venueAddress: string;
  latitude?: number;
  longitude?: number;
  accent: string;
  accentSolid: string;
  text: string;
  subText: string;
  border: string;
  cardBg: string;
  iconBg: string;
}

export function VenueCard({
  venueName,
  venueAddress,
  latitude,
  longitude,
  accent,
  accentSolid,
  text,
  subText,
  border,
  cardBg,
  iconBg,
}: VenueProps) {
  const lat = latitude ?? 30.0074; // default Cairo area
  const lng = longitude ?? 31.4913;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className={`w-full ${cardBg} ${border} rounded-2xl p-6 md:p-8 shadow-xl`}>
      <div className="flex items-center gap-3 mb-4 justify-center">
        <span className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
          <MapPin size={20} className={accent.replace('ring-', 'text-')} />
        </span>
        <h3 className={`font-marcellus text-2xl md:text-3xl ${text}`}>{ARABIC_VIEW_LOCATION}</h3>
      </div>

      <p className={`text-center font-reem text-lg md:text-xl ${text}`}>{venueName}</p>
      <p className={`text-center text-sm md:text-base ${subText} mt-1`}>{venueAddress}</p>

      <motion.a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className={`mt-6 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-reem text-base text-white ${accentSolid} transition`}
      >
        <Navigation size={18} />
        {ARABIC_OPEN_MAP}
      </motion.a>
    </div>
  );
}
