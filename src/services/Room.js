import {
  RTCConfig as P2P_CONFIG,
  WebSocketEndpoint as WEBSOCKET_GTW_ENDPOINT,
  RESTAPIEndpoint as HTTP_GTW_ENDPOINT,
} from "../config/config";

import APIClient from "./APIClient";
import SignalingChannel from "./SignalingChannel";
import P2P from "./P2P";
import MediaDevice from "./MediaDevice";

class Room {
  constructor() {
    this.id = this.getRoomIdFromURL();
    this.roomInfo = null;
    this.signalingChannel = new SignalingChannel(
      this.getId(),
      WEBSOCKET_GTW_ENDPOINT
    );
    this.p2p = new P2P(this.getId(), P2P_CONFIG);
    this.mediaDevice = new MediaDevice();
    this.APIClient = new APIClient(HTTP_GTW_ENDPOINT);
    this.setCallbacks();
  }

  setCallbacks() {
    // Set the handler to process incoming messages
    this.signalingChannel.setOnMessageCb(
      this.p2p.handleSignalingMessage.bind(this.p2p)
    );

    // Set the handler to send signaling messages
    this.p2p.setSendSignalingMessageCb(
      this.signalingChannel.sendMessage.bind(this.signalingChannel)
    );
  }

  setRoomInfo(roomInfo) {
    this.roomInfo = roomInfo;
  }

  setCredentials(credentials) {
    this.credentials = credentials;
  }

  getRoomIdFromURL() {
    const pathArr = window.location.pathname.split("/");
    const roomId = pathArr[2]; // only works if the path follows the format "/otter-meet/<Room UUID/..."
    return "rm_5c871e40-b844-4b6f-b1e1-d3ac73cc31ee"; // this needs to be removed - only for testing purposes
    return roomId;
  }

  getId() {
    return this.id;
  }

  getRoomInfo() {
    return this.roomInfo;
  }
}

export default Room;
