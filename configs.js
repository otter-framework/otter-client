export const RTCConfig = {
  iceServers: [
    {
      urls: [
        "turn:otter-coturn-nlb-77fc4f07ffb9968b.elb.us-east-1.amazonaws.com:80",
      ],
      username: "1679341410-:-DefaultName",
      credential: "9iNiJKJIpVC293f715Jf0+RdcMg=",
    },
  ],
  iceCandidatePoolSize: 10,
};

export const WebSocketEndpoint =
  "unsafe:wss://750gfq0nl5.execute-api.us-east-1.amazonaws.com/dev";
export const RESTAPIEndpoint =
  "https://nb4jhgw855.execute-api.us-east-1.amazonaws.com/dev";
