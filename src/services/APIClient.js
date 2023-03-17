import axios from "axios";

import { errorLogger } from "../utilities/logger";

class APIClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async fetchRoomInfo(roomId) {
    try {
      const response = await axios.get(`${this.endpoint}/room/${roomId}`);
      return response.data;
    } catch (error) {
      const statusCode = error.response.status;
      if ([400, 404].includes(statusCode)) {
        return null;
      } else if ([500].includes(statusCode)) {
        // We need to try again
        // We need to validate the room id before we can start the session
      } else {
        // How do we deal with unexpected errors
        errorLogger(error);
      }
    }
  }

  async fetchCredentials() {
    try {
      // Just for testing purposes - needs to be removed for production
      return {
        username: "1679092952-:-randomUserId",
        credential: "JIZ3DLVeJz8U5PnD4FtfS1nNX/w=",
      };
      // const response = await axios.get(`${this.endpoint}/credentials`);
      // return response.data;
    } catch (error) {
      const statusCode = error.response.status;
      if ([500].includes(statusCode)) {
        // We need to try again
        // If we don't have access to CoTURN, the session can't start
      } else {
        errorLogger(error);
      }
    }
  }
}

export default APIClient;
