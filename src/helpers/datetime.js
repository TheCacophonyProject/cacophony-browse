export {
  toStringTodayYesterdayOrDate,
  toStringTodayYesterdayOrDateInNights,
  startOfDay,
  startOfHour,
  startOfEvening,
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

function toStringTodayYesterdayOrDateInNights(fromDate, toDate) {
  const todayStart = startOfEvening(new Date());
  const dateTime = fromDate.getTime();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = startOfEvening(yesterday);
  if (dateTime > todayStart.getTime()) {
    return "Last night";
  } else if (dateTime > yesterdayStart.getTime()) {
    return "Two nights ago";
  } else if (toDate) {
    return `${toNZDateString(startOfEvening(toDate))} &mdash; ${toNZDateString(
      startOfEvening(fromDate)
    )}`;
  } else {
    return toNZDateString(fromDate);
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

function startOfEvening(date, eveningHours = 16) {
  // Set the time to the earliest midday from the given date.
  if (date.getHours() < 12) {
    date = new Date(date.getTime());
    date.setDate(date.getDate() - 1);
  }
  const d = startOfHour(date);
  d.setHours(eveningHours);
  return d;
}

function toNZDateString(date) {
  return date.toLocaleDateString("en-NZ");
}
