import { useState, useEffect } from "react";

import MediaDeviceOptions from "./MediaDeviceOptions";

const Session = ({ room }) => {
  const [mediaDevices, setMediaDevices] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    const getUserMedia = async () => {
      room.mediaDevice.setStateUpdatingFunc(setMediaDevices);
      const mediaStream = await room.mediaDevice.startMediaStream();
      await room.mediaDevice.getAllMediaDevices();
      room.p2p.addMediaStreamTracks(mediaStream);
    };

    const fetchCredentials = async () => {
      const turnCredentials = await room.APIClient.fetchCredentials();
      room.p2p.setConfiguration(turnCredentials);
      room.p2p.setTurnIsReady();
    };

    room.initSession();

    getUserMedia();
    fetchCredentials();

    return () => {
      // Do we need a clean-up here as well?
      // What if the user refreshes the page?
    };
  }, []);

  const handleSelectedMediaDevicesChange = (selectedMediaDevice) => {
    room.mediaDevice.setSelectedMediaDevice(selectedMediaDevice);
    // Need to add the logic to update the media tracks accordingly
  };

  return (
    <div>
      <p>The session has started!</p>
      {mediaDevices ? (
        <MediaDeviceOptions
          mediaDevices={mediaDevices}
          onChange={handleSelectedMediaDevicesChange}
        />
      ) : null}
    </div>
  );
};

export default Session;
