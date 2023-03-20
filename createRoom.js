import axios from "axios";

const HTTPEndpoint =
  "https://awp8bkb3x2.execute-api.us-east-2.amazonaws.com/dev";

const response = await axios.post(`${HTTPEndpoint}/createRoom`);

console.log(response.data.roomId);
