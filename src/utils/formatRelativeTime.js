export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now - date) / 1000; // in seconds

  console.log('--- formatRelativeTime Debug ---');
  console.log('dateString:', dateString);
  console.log('date (parsed):', date);
  console.log('now (current):', now);
  console.log('diff (seconds):', diff);
  console.log('------------------------------');

  // Invalid Date 체크
  if (isNaN(date.getTime())) {
    console.error('Invalid dateString provided to formatRelativeTime:', dateString);
    return '잘못된 날짜';
  }

  const units = [
    { max: 60, value: 1, unit: 'second' },       // 1분 미만
    { max: 3600, value: 60, unit: 'minute' },     // 1시간 미만
    { max: 86400, value: 3600, unit: 'hour' },   // 1일 미만
    { max: 2592000, value: 86400, unit: 'day' },  // 30일 미만 (약 1개월)
    { max: 31536000, value: 2592000, unit: 'month' }, // 12개월 미만 (약 1년)
    { max: Infinity, value: 31536000, unit: 'year' } // 그 이상
  ];

  for (let i = 0; i < units.length; i++) {
    if (Math.abs(diff) < units[i].max) {
      const count = Math.round(diff / units[i].value);
      const rtf = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' });
      // diff가 양수면 과거, 음수면 미래
      return rtf.format(-Math.abs(count), units[i].unit);
    }
  }
  return ''; // Fallback
}
