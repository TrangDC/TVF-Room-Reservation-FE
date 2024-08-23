export const dateToStringTime = (date: Date | null): string => {
  if (!date) return "";

  const formateDate = date?.toLocaleTimeString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  return formateDate
}

export function testing(dateString: string) {
  const date = new Date(dateString);

  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

export const formatDate = (date: Date) => {
  const currentDate = date.toISOString().split("T")[0];
  return currentDate;
};

export const getDateAfterDays = (daysRange: number, date: string = "") => {
  let newDate: Date;

  if (date) {
    newDate = new Date(date);
  } else {
    newDate = new Date();
  }

  newDate.setDate(newDate.getDate() + daysRange);
  return newDate.toISOString().split('T')[0];
};

export const stringToNumber = (hours: string | null, minutes: string | null) => {
  return Number(hours) * 60 + Number(minutes)
}