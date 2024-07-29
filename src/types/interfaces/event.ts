import { IRoom } from "../../api/room/type";

export interface IEvent {
  id: string;
  branchID: string;
  roomID: string;
  daysOfWeek?: string[];
  title: string;
  startTime: string;
  endTime: string;
  startRecur: Date;
  endRecur: Date;
  creatorEmail: string;
  backgroundColor: string;
  start: Date;
  end: Date;
}

export interface IFormData {
  title?: string;
  reservationDay?: string;
  startTime?: string;
  startDate?: string;
  officeId?: string | null;
  endTime?: string;
  endDate?: string;
  roomId?: string;
  isRepeat?: boolean;
}

export interface IFormEvent {
  title: string;
  roomId: string;
  officeId?: string;
  startDate: string;
  endDate: string;
  isRepeat: boolean;
  creatorEmail?: string;
}

export interface IFormEventEdit {
  id: string;
  room: IRoom;
  office: IOffice;
  title: string;
  startDate: string;
  endDate?: string;
  isRepeat: boolean;
}

export interface IRoomForm extends IRoom {
  officeId?: string;
}

interface IOffice {
  id: string;
  name: string;
  rooms: IRoom[];
}
