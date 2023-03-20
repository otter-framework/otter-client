export const RTCConfig = {
      iceServers: [
        {
          urls: [
            "turn:otter-coturn-nlb-3ff199339ae812ca.elb.us-east-1.amazonaws.com:80",
          ],
          username: "1679341410-:-DefaultName",
          credential: "9iNiJKJIpVC293f715Jf0+RdcMg=",
        },
      ],
      iceCandidatePoolSize: 10,
    };
    
  export const WebSocketEndpoint = "wss://n0u3c6o30g.execute-api.us-east-1.amazonaws.com/dev";
  export const RESTAPIEndpoint = "https://ckniny3ppb.execute-api.us-east-1.amazonaws.com/dev";