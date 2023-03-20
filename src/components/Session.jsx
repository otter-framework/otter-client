import { useState, useEffect } from "react";

import DisplayMediaStreams from "./DisplayMediaStreams";
import MediaDeviceOptions from "./MediaDeviceOptions";
import DataChannel from "./DataChannel";

const Session = ({ room }) => {
  const [mediaDevices, setMediaDevices] = useState(null);
  const [localStreams, setLocalStreams] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(null);

  useEffect(() => {
    const getUserMedia = async () => {
      const mediaStream = await room.mediaDevice.getUserMedia("audiovideo");
      room.p2p.stream.addLocalTracks(mediaStream);
      await room.mediaDevice.getAllMediaDevices();
      room.mediaDevice.setState();
      room.p2p.stream.setLocalStreams();
    };

    room.mediaDevice.setStateUpdatingFunc(setMediaDevices);
    room.p2p.stream.setStateUpdatingFunc(setLocalStreams, setRemoteStreams);

    getUserMedia();
  }, []);

  const handleSelectedMediaDevicesChange = async ({ kind, label }) => {
    room.mediaDevice.setSelectedMediaDevice(kind, label);
    if (/input/.test(kind)) {
      const mediaStream = await room.mediaDevice.getUserMedia(kind);
      await room.p2p.stream.switchTrack(mediaStream);
    } else {
      // When the user changes the audio output
      // We need to redirect the incoming audio track to the new selected audio output device
    }
    room.mediaDevice.setState();
    room.p2p.stream.setLocalStreams();
  };

  const handleOnMuteAudio = () => {
    room.p2p.stream.muteAudio();
    room.p2p.stream.setLocalStreams();
  };

  const handleOnStopVideo = () => {
    room.p2p.stream.stopVideo();
    room.p2p.stream.setLocalStreams();
  };

  return (
    <div>
      <p>The session has started!</p>
      <DisplayMediaStreams
        localStreams={localStreams}
        remoteStreams={remoteStreams}
        onMuteAudio={handleOnMuteAudio}
        onStopVideo={handleOnStopVideo}
      />
      <MediaDeviceOptions
        mediaDevices={mediaDevices}
        onChange={handleSelectedMediaDevicesChange}
      />
      <DataChannel room={room} />
    </div>
  );
};

export default Session;
