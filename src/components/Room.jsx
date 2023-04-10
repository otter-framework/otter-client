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
import Controls from "./Controls";

const Room = ({ toaster }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);
  const location = useLocation();
  const roomId = location.pathname.split("/")[2]; // "url.com/otter-room/<uuid>"
  const token = location.search.split("=")[1];
  const apiRef = useRef(null);
  const pcRef = useRef(null);
  const dataFetchedRef = useRef(false); // stops useEffect from running twice
  const mediaService = new MediaService();

  const notify = (msg, options) => toaster(msg, options);

  const startRemoteStream = () => {
    const remote = mediaService.initRemoteStream(); // new MediaStream
    setRemoteStream(remote);
    pcRef.current.setRemoteStream(remote);
    pcRef.current.setPeerConnectedHandler(setPeerConnected);
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

  const fetchCredentials = async () => {
    const credentials = await apiRef.current.fetchCredentials();
    pcRef.current.setConfiguration(credentials);
    dl("turn server set!");
  };

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    apiRef.current = new APIClient(RESTAPIEndpoint, token);
    pcRef.current = new WebRTCService(roomId, token);
    pcRef.current.setToaster(notify);
    (async () => {
      await fetchCredentials();
      startRemoteStream();
      startLocalStream();
    })();
  }, []);

  return (
    <div className="flex flex-wrap gap-4 w-full h-screen items-center relative overflow-hidden z-0 md:flex-nowrap md:flex-row flex-col place-content-center">
      <div
        className={
          "w-full place-self-center relative max-h-[85%] md:w-8/12" +
          (peerConnected ? "" : " hidden")
        }
      >
        <video
          autoPlay
          playsInline
          className="w-full h-full"
          ref={(video) => {
            if (video) {
              video.srcObject = remoteStream;
            }
          }}
        />
      </div>
      <div
        className={`place-self-center ${
          peerConnected ? "w-4/12" : "w-full"
        } relative max-h-full bg-cover bg-transparent transition-all ease-in-out duration-300 delay-75`}
      >
        <p className="absolute left-4 bottom-2 text-white [text-shadow:_1px_1px_5px_rgb(0_0_0_/_90%)]">
          You
        </p>
        <video
          className="w-full h-full"
          muted
          autoPlay
          playsInline
          ref={(video) => {
            if (video) {
              video.srcObject = localStream;
            }
          }}
        />
      </div>

      {/* Data Channel */}
      <div
        className={`${
          chatOpen ? "xl:w-96" : "xl:w-0"
        } overflow-hidden transition-all ease-in-out duration-300 h-full ${
          chatOpen ? "-translate-x-[26rem]" : ""
        } absolute -right-[26rem] w-[26rem] xl:relative xl:translate-x-0 xl:right-0`}
      >
        <div className="flex h-full w-full">
          <DataChannel connection={pcRef.current} />
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid absolute bottom-16 w-full">
        <Controls
          localStream={localStream}
          chatOpen={chatOpen}
          setChatOpen={setChatOpen}
        />
      </div>
    </div>

    // <div>
    //   <div id="videos">
    //     <video
    //       className="video-player"
    //       id="local"
    //       muted
    //       autoPlay
    //       playsInline
    //       ref={(video) => {
    //         if (video) {
    //           video.srcObject = localStream;
    //         }
    //       }}
    //     />
    //     <video
    //       className="video-player"
    //       id="remote"
    //       autoPlay
    //       playsInline
    //       ref={(video) => {
    //         if (video) {
    //           video.srcObject = remoteStream;
    //         }
    //       }}
    //     />
    //   </div>

    //   <div id="controls">
    //     <div
    //       className="control-container"
    //       id="camera-btn"
    //       onClick={toggleMuteVideo}
    //     >
    //       <img
    //         src={
    //           vid
    //             ? "https://super.so/icon/dark/video.svg"
    //             : "https://super.so/icon/dark/video-off.svg"
    //         }
    //       />
    //     </div>
    //     <div
    //       className="control-container"
    //       id="audio-btn"
    //       onClick={toggleMuteAudio}
    //     >
    //       <img
    //         src={
    //           mic
    //             ? "https://super.so/icon/dark/volume-2.svg"
    //             : "https://super.so/icon/dark/volume-x.svg"
    //         }
    //       />
    //     </div>
    //   </div>
    //   {/* {pcRef.current ? (
    //     <ScreenShare pc={pcRef.current} mediaService={mediaService} />
    //   ) : null} */}
    //   <DataChannel connection={pcRef.current} />
    // </div>
  );
};

export default Room;
