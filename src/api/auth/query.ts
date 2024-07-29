import { gql } from "@apollo/client";

export const GET_BOOKINGS = gql`
  query GetBookings($filter: BookingFilter!) {
    GetBookings(filter: $filter) {
      id
      office {
        id
        name
      }
      room {
        name
        color
        floor
      }
      title
      startDate
      endDate
      user {
        workEmail
      }
      isRepeat
    }
  }
`;

export const GET_ROLE_USER = gql`
  query GetUserByOID($oID: UUID!) {
    GetUserByOID(oID: $oID) {
      roles {
        id
        machineName
        name
        description
      }
    }
  }
`;
