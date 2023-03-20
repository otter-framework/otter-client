import ReactPlayer from "react-player";

const DisplayMediaStreams = ({
  localStreams,
  remoteStreams,
  onMuteAudio,
  onStopVideo,
}) => {
  if (!localStreams) return;

  const audioVideoStream = localStreams["audioVideo"];
  // const screenShareStream = localStreams["screenShare"];

  const audioStatus = audioVideoStream.getAudioTracks()[0]?.enabled;
  const videoStatus = audioVideoStream.getVideoTracks()[0]?.enabled;

  const handleAudioChange = () => {
    // The stop button could be an icon
    onMuteAudio();
  };

  const handleVideoChange = () => {
    // The stop button could be an icon
    // We can display the Otter logo in the middle of the screen
    onStopVideo();
  };

  // const handleScreenShareChange = () => {};

  return (
    <div>
      <>
        <ReactPlayer
          url={audioVideoStream}
          playing={true}
          // width={640}
          // height={360}
          // wrapper={} // This is the component that will be used as the container of the player
          playsinline={true}
        />
        <button onClick={handleAudioChange}>
          {audioStatus ? "Mute audio" : "Unmute audio"}
        </button>
        <button onClick={handleVideoChange}>
          {videoStatus ? "Stop camera" : "Start camera"}
        </button>
      </>
      {remoteStreams ? (
        <ReactPlayer
          url={remoteStreams["audioVideo"]}
          playing={true}
          // width={640}
          // height={360}
          // wrapper={} // This is the component that will be used as the container of the player
          playsinline={true}
        />
      ) : null}
      {/* <button onClick={handleScreenShareChange}>Start screen-sharing</button> */}
    </div>
  );
};

export default DisplayMediaStreams;
