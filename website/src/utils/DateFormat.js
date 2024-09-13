// utils/formatDate.js
import { parse, format, isToday, isYesterday } from 'date-fns';
import { DateTime } from 'luxon';
export const localDate = (data) => {
  const date = new Date(data).setUTCHours(0, 0, 0, 0);
  const localDate = new Date(date).toDateString();
  return localDate;
};

export const getMonthYear = (data) => {
  const date = new Date(data);
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  return `${month} ${year}`;
};

export const timeCal = (date1) => {
  var date2 = new Date().getTime();
  date1 = new Date(date1).getTime();
  var res = Math.abs(date2 - date1) / 1000;
  var days = Math.floor(res / 86400);
  var hours = Math.floor(res / 3600) % 24;
  var minutes = Math.floor(res / 60) % 60;
  var seconds = Math.floor(res % 60);
  var diff = "";
  if (days > 0) {
    diff = days + " days ";
  }
  if (hours > 0) {
    diff = diff + hours + " hours ";
  }
  if (days === 0 && minutes > 0) {
    diff = diff + minutes + " min ";
  }
  if (hours === 0 && seconds > 0) {
    diff = diff + seconds + " sec ";
  }
  return diff ? diff + "ago" : "recently";
};

export const groupMessagesByDate = (messages) => {
  return messages.reduce((acc, message) => {
    const date = formatDate(message.sentDate);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {});
};

export const formatDate = (dateString) => {
  try {
    // Parse the date string into a Date object
    const date = parse(dateString, 'dd-MM-yyyy', new Date());

    if (isToday(date)) {
      return 'Today';
    }

    if (isYesterday(date)) {
      return 'Yesterday';
    }

    // Format date as "Month day, year"
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};
