import { useState, useEffect } from "react";

import MediaDeviceOptions from "./MediaDeviceOptions";

const Session = ({ room }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const handleSelectedMediaDevicesChange = (selectedMediaDevice) => {
    room.mediaDevice.setSelectedMediaDevice(selectedMediaDevice);
    // Need to add the logic to update the media tracks accordingly
  };

  return (
    <div>
      <p>The session has started!</p>
      <MediaDeviceOptions
        room={room}
        onChange={handleSelectedMediaDevicesChange}
      />
    </div>
  );
};

export default Session;
