import { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MediaService from "../services/MediaService";
import WebRTCService from "../services/WebRTCServiceDropIn";
import APIClient from "../services/APIClientService";
import { dl } from "../utils/DateLog";
import { handleError } from "../utils/ErrorLog";
import { RESTAPIEndpoint } from "../configs/configs";
import ScreenShare from "./ScreenShare";
import DataChannel from "./DataChannel";

const Room = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [mic, setMic] = useState(true);
  const [vid, setVid] = useState(true);
  const location = useLocation();
  const roomId = location.pathname.split("/")[2]; // "url.com/otter-room/<uuid>"
  const token = location.search.split("=")[1];
  const apiRef = useRef(null);
  const pcRef = useRef(null);
  const dataFetchedRef = useRef(false); // stops useEffect from running twice
  const mediaService = new MediaService();

  const startRemoteStream = () => {
    const remote = mediaService.initRemoteStream();
    setRemoteStream(remote);
    pcRef.current.setRemoteStream(remote);
  };

  const startLocalStream = async () => {
    let local;
    try {
      local = await mediaService.getLocalStream(); // wait for permissions
    } catch (e) {
      handleError(e);
      alert(
        "Please allow your video or camera! Check your permissions and refresh the page"
      );
    } finally {
      if (local) {
        pcRef.current.setLocalStreams(local);
        pcRef.current.setupLocalMedia(); // add local tracks to peerConnection
        setLocalStream(local);
      }
    }
  };

  const toggleMuteAudio = () => {
    localStream &&
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    setMic(!mic);
  };

  const toggleMuteVideo = () => {
    localStream &&
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    setVid(!vid);
  };

  const fetchCredentials = async () => {
    const credentials = await apiRef.current.fetchCredentials();
    pcRef.current.setConfiguration(credentials);
    // dl("turn server set!");
  };

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    apiRef.current = new APIClient(RESTAPIEndpoint, token);
    pcRef.current = new WebRTCService(roomId, token);
    fetchCredentials();
    startRemoteStream();
    startLocalStream();
  }, []);

  return (
    <div>
      <div id="videos">
        <video
          className="video-player"
          id="local"
          muted
          autoPlay
          playsInline
          ref={(video) => {
            if (video) {
              video.srcObject = localStream;
            }
          }}
        />
        <video
          className="video-player"
          id="remote"
          autoPlay
          playsInline
          ref={(video) => {
            if (video) {
              video.srcObject = remoteStream;
            }
          }}
        />
      </div>

      <div id="controls">
        <div
          className="control-container"
          id="camera-btn"
          onClick={toggleMuteVideo}
        >
          <img
            src={
              vid
                ? "https://super.so/icon/dark/video.svg"
                : "https://super.so/icon/dark/video-off.svg"
            }
          />
        </div>
        <div
          className="control-container"
          id="audio-btn"
          onClick={toggleMuteAudio}
        >
          <img
            src={
              mic
                ? "https://super.so/icon/dark/volume-2.svg"
                : "https://super.so/icon/dark/volume-x.svg"
            }
          />
        </div>
      </div>
      <ScreenShare pc={pcRef.current} mediaService={mediaService} />
      <DataChannel connection={pcRef.current} />
    </div>
  );
};

export default Room;
