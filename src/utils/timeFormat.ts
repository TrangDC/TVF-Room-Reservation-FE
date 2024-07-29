export const dateToStringTime = (date: Date | null): string => {
  if (!date) return "";

  const formateDate = date?.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })

  return formateDate
}

export const stringToNumber = (hours: string | null, minutes: string | null) => {
  return Number(hours) * 60 + Number(minutes)
}