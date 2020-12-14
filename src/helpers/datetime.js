export {
  toStringTodayYesterdayOrDate,
  startOfDay,
  startOfHour,
  toNZDateString,
};

function toStringTodayYesterdayOrDate(dateObject) {
  const todayStart = startOfDay(new Date());
  const dateTime = dateObject.getTime();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = startOfDay(yesterday);
  if (dateTime > todayStart.getTime()) {
    return "Today";
  } else if (dateTime > yesterdayStart.getTime()) {
    return "Yesterday";
  } else {
    return toNZDateString(dateObject);
  }
}

function startOfHour(date) {
  const d = new Date(date.getTime());
  d.setSeconds(0);
  d.setMinutes(0);
  d.setMilliseconds(0);
  return d;
}

function startOfDay(date) {
  const d = startOfHour(date);
  d.setHours(0);
  return d;
}

function toNZDateString(date) {
  return date.toLocaleDateString("en-NZ");
}
