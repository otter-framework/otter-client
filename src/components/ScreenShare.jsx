import { useEffect, useState } from "react";
import { dl } from "../utils/DateLog";

const ScreenShare = ({ mediaService, pc }) => {
  const [localScreen, setLocalScreen] = useState(null);
  const [remoteScreen, setRemoteScreen] = useState(null);

  const startScreen = async () => {
    const local = await mediaService.getLocalScreen();
    pc.setLocalScreen(local);
    pc.setupLocalScreen(); // add local tracks to peerConnection
    setLocalScreen(local);
  };

  const startRemoteScreenOnMount = () => {
    if (!pc) return;
    const remote = mediaService.initRemoteStream();
    pc.setRemoteScreen(remote);
    setRemoteScreen(remote);
  };

  useEffect(() => {
    startRemoteScreenOnMount();
  }, []);

  const stopShare = () => {
    let tracks = localScreen.getTracks();
    tracks.forEach((track) => track.stop());
    setLocalScreen(null);
  };

  return (
    <div>
      {!!localScreen ? (
        <button onClick={stopShare}>Stop share</button>
      ) : (
        <button onClick={startScreen}>Share screen</button>
      )}
      <video
        className="screen-share"
        autoPlay
        muted
        ref={(video) => {
          if (video) video.srcObject = localScreen;
        }}
        playsInline
      />
      <video
        className="screen-share"
        autoPlay
        muted
        ref={(video) => {
          if (video) video.srcObject = remoteScreen;
        }}
        playsInline
      />
    </div>
  );
};

export default ScreenShare;
