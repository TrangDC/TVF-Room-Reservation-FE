import { gql } from "@apollo/client";

export const GET_OFFICES = gql`
  query GetOffices {
    GetOffices {
      id
      name
      description
      rooms {
        id
        name
        color
        floor
        officeId
        description
        imageUrl
      }
    }
  }
`;

export const GET_OFFICE = gql`
  query GetOffice($officeID: UUID!) {
    GetOffice(officeID: $officeID) {
      rooms {
        id
        name
        color
        floor
        officeId
        imageUrl
      }
    }
  }
`;
