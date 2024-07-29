import { graphConfig } from "./request";
import axios from "axios";

/**
 * Attaches a given access token to a MS Graph API call. Returns information about the user
 * @param accessToken
 */

// change fecth to axios (zed.tran)
export async function callMsGraph(accessToken: string) {
  const headers = {
    Authorization: `Bearer ${accessToken}`
  };

  try {
    const response = await axios.get(graphConfig.graphMeEndpoint, { headers });
    return response.data;
  } catch (error) {
    // console.error(error);
    return null;
  }
}
