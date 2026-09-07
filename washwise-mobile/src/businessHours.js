const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function formatClock(hour, minute) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const minutePart = minute ? `:${String(minute).padStart(2, '0')}` : '';
  return `${hour12}${minutePart}${period}`;
}

/**
 * Returns { isOpen, label } — e.g. { isOpen: true, label: 'Closes 9PM' } or
 * { isOpen: false, label: 'Opens 8AM' } — computed live from the device's
 * current time against the business's workingDays/openTime/closeTime.
 */
export function getOpenStatus(business) {
  if (!business.openTime || !business.closeTime || !business.workingDays?.length) {
    return { isOpen: false, label: 'Hours unavailable' };
  }

  const now = new Date();
  const today = DAY_NAMES[now.getDay()];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = business.openTime.split(':').map(Number);
  const [closeH, closeM] = business.closeTime.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  const isWorkingDay = business.workingDays.includes(today);
  const withinHours = nowMinutes >= openMinutes && nowMinutes < closeMinutes;

  if (isWorkingDay && withinHours) {
    return { isOpen: true, label: `Closes ${formatClock(closeH, closeM)}` };
  }
  return { isOpen: false, label: `Opens ${formatClock(openH, openM)}` };
}
