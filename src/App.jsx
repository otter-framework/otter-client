// The flow of the operations is as follows:

// 1. User clicks on the provided link to join a room
//    The URL should point to CloudFront and the path should include the UUID of the room (i.e., https://<CloudFront>/otter-meet/<Room UUID>)
//    We can set-up an S3 bucket to work with a wild card (i.e., the room UUID)
//    The UUID of the room is generated in advance by making an HTTP request to the "create-room" route
//    The user receives Otter Meet

// 2. We send an HTTP request to validate the room id
//    If the room id is not valid, we display an error page
//    If the room id is valid, we proceed with the session

// 3. Get the user media (i.e., audio and video)
//    GET /credentials in order to instantiate the RTCPeerConnection object with CoTURN config
//    Start the WebSocket connection

// 4. Instantiate the RTCPeerConnection object

// 5. ...

// We should display a preview of the camera to the user

import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import adapter from "webrtc-adapter";

import Room from "./services/Room";

import WaitingRoom from "./components/WaitingRoom";
import InvalidRoomId from "./components/InvalidRoomId";
import Session from "./components/Session";

import "./App.css";

const room = new Room();

const App = () => {
  const navigateTo = useNavigate();

  useEffect(() => {
    const fetchRoomInfo = async () => {
      const roomId = room.getId(); // only works if the URL is of the form "https://<CloudFront>/otter-meet/<Room UUID/..."
      const roomInfo = await room.APIClient.fetchRoomInfo(roomId);
      if (roomInfo) {
        room.setRoomInfo(roomInfo);
        navigateTo(`/otter-meet/${roomId}/live`);
      } else {
        navigateTo(`/invalid-room/${roomId}`);
      }
    };

    const fetchCredentials = async () => {
      const turnCredentials = await room.APIClient.fetchCredentials();
      room.p2p.setConfiguration(turnCredentials);
      room.p2p.setTurnIsReady();
    };

    room.setCallbacks();

    fetchRoomInfo();
    fetchCredentials();

    return () => {
      // Any clean-up needed when the app un-mounts?
      // Close WebSocket connection or send message to the other peer?
      // What if the user refreshes the page?
      // Destroy the media streams?
    };
  }, []);

  // The WaitingRoom could be just a spinner in the middle waiting for the room id validation
  return (
    <div>
      <h1>Otter Meet</h1>
      <Routes>
        <Route path="/" element={<WaitingRoom />} />
        <Route
          path="/invalid-room/:roomId"
          element={<InvalidRoomId room={room} />}
        />
        <Route
          path="/otter-meet/:roomId/live"
          element={<Session room={room} />}
        />
      </Routes>
    </div>
  );
};

export default App;
