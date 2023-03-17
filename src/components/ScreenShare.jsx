import { useEffect, useState } from "react";
import { dl } from "../utils/DateLog";

const ScreenShare = ({ mediaService, pc }) => {
  const [screen, setScreen] = useState(null);

  const [localScreen, setLocalScreen] = useState(null);
  const [remoteScreen, setRemoteScreen] = useState(null);

  const startScreen = async () => {
    const local = await mediaService.getLocalScreen();
    pc.setLocalScreen(local);
    pc.setupLocalScreen(); // add local tracks to peerConnection
    setLocalScreen(local);
  };

  const startRemoteScreenOnMount = () => {
    const remote = mediaService.initRemoteStream();
    pc.setRemoteScreen(remote);
    setRemoteScreen(remote);
  };

  useEffect(() => {
    startRemoteScreenOnMount();

    return () => {
      setRemoteScreen(null);
    };
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
        autoPlay
        muted
        ref={(video) => {
          if (video) video.srcObject = localScreen;
        }}
        playsInline
      />
      <video
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
