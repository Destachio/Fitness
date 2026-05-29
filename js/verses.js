// verses.js — curated NKJV verses shown at the end of each training day.
// Scripture quotations are from the New King James Version® (NKJV).
// Themed around strength, courage, perseverance, and discipline.

export const VERSES = [
  { ref: 'Philippians 4:13', text: 'I can do all things through Christ who strengthens me.' },
  { ref: 'Isaiah 40:31', text: 'But those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles, they shall run and not be weary, they shall walk and not faint.' },
  { ref: 'Joshua 1:9', text: 'Be strong and of good courage; do not be afraid, nor be dismayed, for the Lord your God is with you wherever you go.' },
  { ref: '1 Corinthians 9:27', text: 'But I discipline my body and bring it into subjection, lest, when I have preached to others, I myself should become disqualified.' },
  { ref: '1 Corinthians 10:31', text: 'Therefore, whether you eat or drink, or whatever you do, do all to the glory of God.' },
  { ref: 'Colossians 3:23', text: 'And whatever you do, do it heartily, as to the Lord and not to men.' },
  { ref: '2 Timothy 1:7', text: 'For God has not given us a spirit of fear, but of power and of love and of a sound mind.' },
  { ref: '1 Corinthians 16:13', text: 'Watch, stand fast in the faith, be brave, be strong.' },
  { ref: 'Philippians 3:14', text: 'I press toward the goal for the prize of the upward call of God in Christ Jesus.' },
  { ref: 'Galatians 6:9', text: 'And let us not grow weary while doing good, for in due season we shall reap if we do not lose heart.' },
  { ref: 'Proverbs 3:5', text: 'Trust in the Lord with all your heart, and lean not on your own understanding.' },
  { ref: 'Psalm 18:32', text: 'It is God who arms me with strength, and makes my way perfect.' },
  { ref: 'Psalm 28:7', text: 'The Lord is my strength and my shield; my heart trusted in Him, and I am helped.' },
  { ref: 'Isaiah 41:10', text: 'Fear not, for I am with you; be not dismayed, for I am your God. I will strengthen you, yes, I will help you, I will uphold you with My righteous right hand.' },
  { ref: 'Ephesians 6:10', text: 'Finally, my brethren, be strong in the Lord and in the power of His might.' },
  { ref: 'Hebrews 12:1', text: 'Let us run with endurance the race that is set before us.' },
  { ref: '1 Timothy 4:8', text: 'For bodily exercise profits a little, but godliness is profitable for all things, having promise of the life that now is and of that which is to come.' },
  { ref: 'Psalm 73:26', text: 'My flesh and my heart fail; but God is the strength of my heart and my portion forever.' },
  { ref: 'Deuteronomy 31:6', text: 'Be strong and of good courage, do not fear nor be afraid of them; for the Lord your God, He is the One who goes with you. He will not leave you nor forsake you.' },
  { ref: 'Nehemiah 8:10', text: 'Do not sorrow, for the joy of the Lord is your strength.' },
  { ref: 'Psalm 27:1', text: 'The Lord is my light and my salvation; whom shall I fear? The Lord is the strength of my life; of whom shall I be afraid?' },
  { ref: 'Romans 5:3-4', text: 'We also glory in tribulations, knowing that tribulation produces perseverance; and perseverance, character; and character, hope.' },
  { ref: 'James 1:12', text: 'Blessed is the man who endures temptation; for when he has been approved, he will receive the crown of life which the Lord has promised to those who love Him.' },
  { ref: 'Proverbs 27:17', text: 'As iron sharpens iron, so a man sharpens the countenance of his friend.' },
  { ref: '2 Timothy 4:7', text: 'I have fought the good fight, I have finished the race, I have kept the faith.' },
  { ref: 'Psalm 119:32', text: 'I will run the course of Your commandments, for You shall enlarge my heart.' },
  { ref: 'Habakkuk 3:19', text: 'The Lord God is my strength; He will make my feet like deer’s feet, and He will make me walk on my high hills.' },
  { ref: 'Mark 12:30', text: 'Love the Lord your God with all your heart, with all your soul, with all your mind, and with all your strength.' },
  { ref: 'Isaiah 40:29', text: 'He gives power to the weak, and to those who have no might He increases strength.' },
  { ref: 'Philippians 4:6-7', text: 'Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God; and the peace of God, which surpasses all understanding, will guard your hearts and minds through Christ Jesus.' },
  { ref: 'Psalm 46:1', text: 'God is our refuge and strength, a very present help in trouble.' },
  { ref: 'Romans 8:37', text: 'Yet in all these things we are more than conquerors through Him who loved us.' },
];

// Deterministic "verse of the day": same verse all day, rotates each calendar
// day, and cycles through the whole list before repeating.
export function verseForDate(date = new Date()) {
  const epochDay = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
  );
  return VERSES[((epochDay % VERSES.length) + VERSES.length) % VERSES.length];
}
