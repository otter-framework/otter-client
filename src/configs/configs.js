export const RTCConfig = {
  iceServers: [
    {
      urls: [
        "turn:otter-coturn-nlb-21fdb672c4414a84.elb.us-east-2.amazonaws.com:80",
      ],
      username: "otter",
      credential: "abcde",
    },
  ],
  iceCandidatePoolSize: 10,
};

export const WebSocketEndpoint =
  // "wss://eoevuwoy1c.execute-api.us-east-2.amazonaws.com/dev";
  "wss://6a7c4fbrni.execute-api.us-east-2.amazonaws.com/dev";

export const RESTAPIEndpoint =
  // "https://qpbc772eia.execute-api.us-east-2.amazonaws.com/dev";
  "https://3y29hytrel.execute-api.us-east-2.amazonaws.com/dev";
