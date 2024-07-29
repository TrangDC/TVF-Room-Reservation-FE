import { gql } from "@apollo/client";

export const GET_ADMINS = gql`
  query GetAdmins {
    GetAdmins {
      id
      name
      workEmail
      roles {
            id
            machineName
        }
    }
  }
`;

export const GET_ROLES = gql`
  query GetRoles {
    GetRoles {
        id
        machineName
        name
        description
    }
  }
`;

export const ASSIGN_ROLE = gql`
  mutation AssignRole($input: AssignRoleInput!) {
  AssignRole(input: $input) {
    message
  }
}
`;

export const UNASSIGN_ROLE = gql`
  mutation UnassignRole($input: UnassignRoleInput!) {
  UnassignRole(input: $input) {
    message
  }
}
`;
