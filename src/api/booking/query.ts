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

export const GET_BOOKING = gql`
  query GetBooking($bookingID: UUID!) {
    GetBooking(bookingID: $bookingID) {
      id
      office {
        id
        name
      }
      room {
        id
        name
        color
        description
        imageUrl
      }
      title
      startDate
      endDate
      user {
        id
        name
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

export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    CreateBooking(input: $input) {
      message
    }
  }
`;

export const UPDATE_BOOKING = gql`
  mutation UpdateBooking($input: UpdateBookingInput!) {
    UpdateBooking(input: $input) {
      message
    }
  }
`;

export const DELETE_BOOKING = gql`
  mutation CancelBooking($bookingID: UUID!) {
    CancelBooking(bookingID: $bookingID)
  }
`;
