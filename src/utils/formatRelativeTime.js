export function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000; // in seconds

    const units = [
        { max: 60, value: 1, unit: 'second' },       // 1초 이하
        { max: 3600, value: 60, unit: 'minute' },    // 1분 이하
        { max: 86400, value: 3600, unit: 'hour' },   // 1시간 이하
        { max: 2592000, value: 86400, unit: 'day' }, // 1일 이하
        { max: 31104000, value: 2592000, unit: 'month' }, // 1달 이하
        { max: Infinity, value: 31104000, unit: 'year' }, // 그 이상
    ];

    const unit = units.find(u => diff < u.max);
    const count = Math.floor(diff / unit.value);

    const rtf = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' });
    return rtf.format(-count, unit.unit);
}
