import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function formatRelativeTime(dateString) {
    const date = dayjs.utc(dateString).tz('Asia/Seoul'); // KST로 변환
    const now = dayjs().tz('Asia/Seoul');
    const diff = now.diff(date, 'second');

    const units = [
        { max: 60, value: 1, unit: 'second' },
        { max: 3600, value: 60, unit: 'minute' },
        { max: 86400, value: 3600, unit: 'hour' },
        { max: 2592000, value: 86400, unit: 'day' },
        { max: 31104000, value: 2592000, unit: 'month' },
        { max: Infinity, value: 31104000, unit: 'year' },
    ];

    const unit = units.find(u => diff < u.max);
    const count = Math.floor(diff / unit.value);

    const rtf = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' });
    return rtf.format(-count, unit.unit);
}
