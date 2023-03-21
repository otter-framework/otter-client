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

  useEffect(() => {
    const startRemoteScreenOnMount = () => {
      const remote = mediaService.initRemoteStream();
      pc.setRemoteScreen(remote);
      setRemoteScreen(remote);
    };
    startRemoteScreenOnMount();
  }, []);

  const stopShare = () => {
    let tracks = localScreen.getTracks();
    tracks.forEach((track) => {
      let sender = pc.pc.getSenders().find((s) => {
        return s.track === track;
      });
      pc.pc.removeTrack(sender);
      track.stop();
    });
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
