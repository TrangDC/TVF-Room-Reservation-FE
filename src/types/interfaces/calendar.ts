import { IRoomApi } from "../../api/office/type";

export interface IExtendedProps {
  branchID: string;
  creatorEmail?: string;
  dateEnd: string;
  name: string;
  floor: string;
  dateStart: string;
  eventName: string;
  isRepeat: boolean;
  roomID: string;
}

export interface ISelect {
  id: string;
  name: string;
  description: string;
  rooms: IRoomApi[];
}
