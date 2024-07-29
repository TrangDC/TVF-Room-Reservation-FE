export interface IOfficeApi {
  id: string;
  name: string;
  description: string;
  rooms: IRoomApi[];
}

export interface IRoomApi {
  id: string;
  name: string;
  color: string;
  officeId: string;
  description: string;
  imageUrl: string;
  floor: string;
}
