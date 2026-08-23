/**
 * Utilities for formatting Date and Time into natural Nepali speech and text.
 */

const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export function toNepaliNumber(num: number | string): string {
  return String(num)
    .split('')
    .map((ch) => {
      const n = parseInt(ch, 10);
      return !isNaN(n) ? nepaliDigits[n] : ch;
    })
    .join('');
}

const nepaliDays = [
  'आइतबार',
  'सोमबार',
  'मंगलबार',
  'बुधबार',
  'बिहीबार',
  'शुक्रबार',
  'शनिबार',
];

const nepaliMonthsBikram = [
  'वैशाख',
  'जेठ',
  'असार',
  'साउन',
  'भदौ',
  'असोज',
  'कार्तिक',
  'मंसिर',
  'पुस',
  'माघ',
  'फागुन',
  'चैत',
];

export function getNaturalNepaliTime(date: Date = new Date()): {
  spokenText: string;
  formattedTime: string;
  period: string;
  hours: number;
  minutes: number;
} {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  let period = '';
  if (hours >= 4 && hours < 12) {
    period = 'बिहान';
  } else if (hours >= 12 && hours < 16) {
    period = 'दिउँसो';
  } else if (hours >= 16 && hours < 20) {
    period = 'साँझ';
  } else {
    period = 'राति';
  }

  const displayHours = hours % 12 || 12;
  let minPhrase = '';
  if (minutes === 0) {
    minPhrase = `${toNepaliNumber(displayHours)} बज्यो`;
  } else if (minutes === 15) {
    minPhrase = `सवा ${toNepaliNumber(displayHours)} बज्यो`;
  } else if (minutes === 30) {
    minPhrase = `साढे ${toNepaliNumber(displayHours)} बज्यो`;
  } else if (minutes === 45) {
    const nextHour = (hours + 1) % 12 || 12;
    minPhrase = `पौने ${toNepaliNumber(nextHour)} बज्यो`;
  } else {
    minPhrase = `${toNepaliNumber(displayHours)} बज्न ${toNepaliNumber(minutes)} मिनेट गयो`;
  }

  const spokenText = `अहिले ${period}को ${minPhrase}।`;
  const formattedTime = `${toNepaliNumber(displayHours.toString().padStart(2, '0'))}:${toNepaliNumber(minutes.toString().padStart(2, '0'))} ${period}`;

  return {
    spokenText,
    formattedTime,
    period,
    hours,
    minutes,
  };
}

export function getNaturalNepaliDate(date: Date = new Date()): {
  spokenText: string;
  dayName: string;
  fullDateNepali: string;
} {
  const dayIndex = date.getDay();
  const dayName = nepaliDays[dayIndex];

  // Bikram Sambat approximate calculation (+56/57 years)
  const gYear = date.getFullYear();
  const gMonth = date.getMonth();
  const gDate = date.getDate();

  // Approx BS conversion
  const bsYear = gYear + 56 + (gMonth > 3 || (gMonth === 3 && gDate > 13) ? 1 : 0);
  const bsMonthIdx = (gMonth + 8) % 12;
  const bsMonth = nepaliMonthsBikram[bsMonthIdx];
  const bsDay = ((gDate + 14) % 30) + 1;

  const fullDateNepali = `${toNepaliNumber(bsDay)} ${bsMonth} ${toNepaliNumber(bsYear)}`;
  const spokenText = `आज ${dayName}, ${fullDateNepali} गते हो।`;

  return {
    spokenText,
    dayName,
    fullDateNepali,
  };
}
