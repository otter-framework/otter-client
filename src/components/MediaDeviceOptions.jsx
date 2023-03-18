import { useState, useEffect } from "react";
import SelectOptions from "./SelectOptions";

const MediaDeviceOptions = ({ room, onChange }) => {
  const [mediaDevices, setMediaDevices] = useState(null);

  useEffect(() => {
    const getUserMedia = async () => {
      room.mediaDevice.setStateUpdatingFunc(setMediaDevices);
      const mediaStream = await room.mediaDevice.getUserMedia();
      room.p2p.addMediaStreamTracks(mediaStream);
      await room.mediaDevice.getAllMediaDevices();
    };

    getUserMedia();
  }, []);

  return (
    <>
      {mediaDevices ? (
        <>
          <SelectOptions
            type="audio-input"
            text="Select a Microphone"
            availableDevices={mediaDevices.audioInputDevices}
            selectedDevice={mediaDevices.selectedAudioInputDevice.label}
            onChange={onChange}
          />
          <SelectOptions
            type="audio-output"
            text="Select a Speaker"
            availableDevices={mediaDevices.audioOutputDevices}
            selectedDevice={mediaDevices.selectedAudioOutputDevice.label}
            onChange={onChange}
          />
          <SelectOptions
            type="video-input"
            text="Select a Camera"
            availableDevices={mediaDevices.videoInputDevices}
            selectedDevice={mediaDevices.selectedVideoInputDevice.label}
            onChange={onChange}
          />
        </>
      ) : null}
    </>
  );
};

export default MediaDeviceOptions;
