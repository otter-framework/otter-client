import axios from "axios";
import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MediaService from "../services/MediaService";
import WebRTCService from "../services/WebRTCServiceDropIn";
import { dl } from "../utils/DateLog";
import { RESTAPIEndpoint as baseURL } from "../configs/configs";
import ScreenShare from "./ScreenShare";

// use this for now (the useLocation when the final link is provided)
const roomId = window.location.pathname.split("/")[2];
const pc = new WebRTCService(roomId);

const Room = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  //   const location = useLocation();
  //   const roomId = location.search.split("=")[1];
  //   const { current: pc } = useRef(new WebRTCService(roomId));
  const navigate = useNavigate();
  const dataFetchedRef = useRef(false); // stops useEffect from running twice
  const mediaService = new MediaService();

  const startStream = async () => {
    console.log("start Stream");
    const local = await mediaService.getLocalStream();
    const remote = mediaService.initRemoteStream();
    pc.setStreams(local, remote);
    pc.setupLocalMedia(); // add local tracks to peerConnection
    setLocalStream(local);
    setRemoteStream(remote);
  };

  const toggleMuteAudio = () => {
    localStream &&
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
  };

  const toggleMuteVideo = () => {
    localStream &&
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
  };

  const handleJoinOrCreateRoom = async () => {
    try {
      dl("inside handleJoinOrCreateRoom");
      const response = await axios.post(`${baseURL}/createRoom`, {
        uniqueName: roomId,
      });
      dl(response, response.data);
      //   pc.joinOrCreateRoom(response.data.roomId);

      //   if (!["closed", "full"].includes(response.data.status)) {
      //     dl("joining or creating room");
      //     connection.joinOrCreateRoom(response.data.roomId);
      //   } else {
      //     setErrorMessage(
      //       `Sorry this room's status is ${response.data.status}.
      //       Try entering another room! Redirecting you to the home page...`
      //     );
      //     setTimeout(() => {
      //       navigate("/");
      //     }, 1000 * 3);
      //     return;
      //   }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    startStream();
  }, []);

  return (
    <div>
      {errorMessage.length > 0 ? (
        <h1>{errorMessage}</h1>
      ) : (
        <>
          <h2>{"Room: " + roomId}</h2>
          <div>
            <video
              autoPlay
              playsInline
              ref={(video) => {
                if (video) {
                  video.srcObject = localStream;
                }
              }}
            />
            <span>
              <button onClick={toggleMuteAudio}>Toggle Mute Audio</button>
              <button onClick={toggleMuteVideo}>Toggle Mute Video</button>
            </span>
          </div>

          <video
            autoPlay
            // muted
            playsInline
            ref={(video) => {
              if (video) {
                video.srcObject = remoteStream;
              }
            }}
          />
          {/* <ScreenShare pc={pc} mediaService={mediaService} /> */}
        </>
      )}
    </div>
  );
};

export default Room;
