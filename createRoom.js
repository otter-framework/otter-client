import axios from "axios";

const HTTPEndpoint =
  "https://nb4jhgw855.execute-api.us-east-1.amazonaws.com/dev";

const response = await axios.post(`${HTTPEndpoint}/createRoom`);

console.log(response.data.roomId);
