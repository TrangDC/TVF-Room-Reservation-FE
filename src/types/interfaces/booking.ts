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
}
