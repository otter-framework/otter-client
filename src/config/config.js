export const RTCConfig = {
  iceServers: [
    {
      urls: [
        "turn:otter-coturn-nlb-21fdb672c4414a84.elb.us-east-2.amazonaws.com:80",
      ],
      username: null,
      credential: null,
    },
  ],
  iceCandidatePoolSize: 10,
};

export const WebSocketEndpoint =
  "wss://6a7c4fbrni.execute-api.us-east-2.amazonaws.com/dev";

export const RESTAPIEndpoint =
  "https://3y29hytrel.execute-api.us-east-2.amazonaws.com/dev";
