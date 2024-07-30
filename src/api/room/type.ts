export interface IRoom {
  id: string;
  name: string;
  color: string;
  floor: string;
  status: boolean;
  description: string;
  imageUrl: string;
  officeId?: string;
}

export interface IFormAvailbleRoom {
  startDate: string;
  startTime: string;
  endTime: string;
  isRepeat: boolean;
  endDate: string;
  officeId: string;
}

export interface IFilterRoomAvailable {
  startDate: string;
  startTime: string;
  endTime: string;
  isRepeat: boolean;
  endDate?: string;
  officeId: string;
}
