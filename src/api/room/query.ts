import { gql } from "@apollo/client";

export const GET_AVAILBLE_ROOM = gql(`
    query GetAvailableRooms($input: GetAvailableRoomInput!) {
        GetAvailableRooms(input: $input) {
            id
            name
            color
            floor
            officeId            
            description
            imageUrl
            status
        }
        
    }    
`);

export const CREATE_ROOM = gql`
  mutation CreateRoom($input: CreateRoomInput!) {
    CreateRoom(input: $input) {
      message
    }
  }
`;

export const UPDATE_ROOM = gql`
  mutation UpdateBooking($input: UpdateRoomInput!) {
    UpdateRoom(input: $input) {
      message
    }
  }
`;

export const DELETE_ROOM = gql`
  mutation DeleteRoom($roomID: UUID!) {
    DeleteRoom(roomID: $roomID)
  }
`;
