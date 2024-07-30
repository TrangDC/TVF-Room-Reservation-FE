export interface IBooking {
  id: string;
  roomID: string;
  branchID: string;
  daysOfWeek: string[];
  eventName: string;
  startTime: string;
  endTime: string;
  dateStart?: Date;
  dateEnd?: Date;
  startRecur: Date;
  endRecur: Date;
  color: string;
  creatorEmail?: string;
  isRepeat: boolean;
  title: string;
  start: string;
  end: string;
  name: string;
  floor: string;
  backgroundColor: string;
}

export interface IDateRange {
  startDate: string;
  endDate: string;
}
