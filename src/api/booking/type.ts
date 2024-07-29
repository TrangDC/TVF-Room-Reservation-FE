export interface IBookingAPI {
  id: string;
  office: IOfficeApi;
  room: IRoomApi;
  title: string;
  // startTime: string;
  // endTime: string;
  startDate: Date;
  endDate?: Date;
  user: IUserApi;
  isRepeat?: boolean;
}

interface IUserApi {
  id: string;
  name: string;
  workEmail: string;
}

interface IRoomApi {
  id: string;
  name: string;
  color: string;
  floor: string;
  officeId: string;
  description?: string;
  imageUrl?: string;
}

interface IOfficeApi {
  id: string;
  name: string;
  description: string;
}

export interface IBookingDto {
  title: string;
  officeId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  //startTime: string;
  //endTime: string;
  userId: string;
  isRepeat?: boolean;
}

export interface IBookingFilterAPi {
  startDate: Date;
  endDate?: Date;
  officeId: string;
  roomId?: string;
}
