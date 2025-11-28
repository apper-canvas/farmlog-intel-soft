import { format, parseISO, isAfter, isBefore, addDays, differenceInDays } from "date-fns";

export const formatDate = (date, formatString = "MMM dd, yyyy") => {
  if (!date) return "";
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatString);
};

export const formatRelativeDate = (date) => {
  if (!date) return "";
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const today = new Date();
  const diffDays = differenceInDays(dateObj, today);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return formatDate(date, "MMM dd");
};

export const isOverdue = (date) => {
  if (!date) return false;
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return isBefore(dateObj, new Date());
};

export const isDueSoon = (date, days = 3) => {
  if (!date) return false;
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const threshold = addDays(new Date(), days);
  return isAfter(dateObj, new Date()) && isBefore(dateObj, threshold);
};