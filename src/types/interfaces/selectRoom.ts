export interface ISelectRoom {
  roomName: string;
  description: string;
  roomImage: string;
  roomID: string;
  branchID: string;
  branchColor: string;
}

export interface IRoomsFilterParams {
  branchID: string;
  floor: string;
}
