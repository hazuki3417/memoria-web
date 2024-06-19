import { gql } from "@apollo/client";

export const GQL = gql`
  query content($id: ID!) {
    content(id: $id) {
      id
      workspaceId
      tags
      createdAt
      updatedAt
    }
  }
`;
