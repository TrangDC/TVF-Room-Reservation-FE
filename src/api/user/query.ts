import { gql } from "@apollo/client";

export const GET_ADMIN_USERS = gql`
  query GetAdminUsers($pagination: PaginationInput!, $keyword: String) {
    GetAdminUsers(pagination: $pagination, keyword: $keyword) {
      total
      data {
        id
        name
        workEmail
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
