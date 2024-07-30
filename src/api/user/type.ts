export interface IRoleAPI {
  id: string;
  machineName: string;
}

export interface IAdminsAPI {
  id: string;
  name: string;
  workEmail: string;
  role: IRoleAPI;
}
