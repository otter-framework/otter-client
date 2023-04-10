import { useState } from "react";
const Controls = ({ localStream, chatOpen, setChatOpen }) => {
  const [mic, setMic] = useState(true);
  const [vid, setVid] = useState(true);

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

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  const redirectFin = () => {
    document.location.href = "./fin";
  };

  const goFullScreen = () => {
    document.getElementById("root").requestFullscreen();
  };

  return (
    <div className="flex gap-3 px-4 py-3 justify-center backdrop-blur-lg w-fit rounded-full bg-white/30 place-self-center">
      <div className="tooltip" data-tip={mic ? "Mute" : "Unmute"}>
        <button
          className={`inline-block ${mic ? "" : "bg-red-600"} ${
            mic ? "hover:bg-gray-700" : "hover:bg-red-700"
          } p-3 rounded-full transition ease-in-out duration-200`}
          id="audio-btn"
          onClick={toggleMuteAudio}
        >
          {mic ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 stroke-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 stroke-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z"
              />
            </svg>
          )}
        </button>
      </div>

      <div className="tooltip" data-tip={vid ? "Stop camera" : "Start camera"}>
        <button
          className={`inline-block ${vid ? "" : "bg-red-600"} ${
            vid ? "hover:bg-gray-700" : "hover:bg-red-700"
          } p-3 rounded-full transition ease-in-out duration-200`}
          onClick={toggleMuteVideo}
        >
          {vid ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 stroke-white"
            >
              <path
                strokeLinecap="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 stroke-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 00-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409"
              />
            </svg>
          )}
        </button>
      </div>
      <div className="tooltip" data-tip={chatOpen ? "Close chat" : "Open chat"}>
        <button
          className={`inline-block ${chatOpen ? "bg-sky-600" : ""} ${
            chatOpen ? " hover:bg-sky-700" : " hover:bg-gray-700"
          } p-3 rounded-full transition-all ease-in-out duration-200`}
          onClick={toggleChat}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            className="w-8 h-8 stroke-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
        </button>
      </div>

      <div className="tooltip" data-tip="Enter fullscreen">
        <button
          className={`inline-block hover:bg-gray-700 p-3 rounded-full transition-all ease-in-out duration-200`}
          onClick={goFullScreen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 stroke-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
        </button>
      </div>

      <div className="tooltip" data-tip="Leave the room">
        <button
          onClick={redirectFin}
          className={`inline-block hover:bg-red-700 bg-red-600 py-3 px-6 rounded-full transition-all ease-in-out duration-200`}
        >
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 fill-white"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.535 14.214c.207.832.388 1.233.899 1.598.458.326 2.902.7 3.868.688.509-.007.952-.138 1.304-.462l.017-.016c.858-.851 1.034-3.173.753-4.411-.168-1.205-1.006-2.135-2.395-2.755l-.213-.09c-3.724-1.703-11.8-1.675-15.55.007-1.484.588-2.395 1.562-2.598 2.89-.27 1.067-.112 3.47.758 4.352.374.346.818.477 1.327.484.965.012 3.41-.362 3.867-.687.47-.334.66-.699.848-1.399l.067-.263c.126-.506.203-.652.394-.75 2.08-.95 4.164-.95 6.269.011.15.078.227.204.333.599l.052.204Zm-8.502-.43c.061-.247.147-.57.298-.858a1.97 1.97 0 0 1 .869-.862l.028-.014.03-.014c2.478-1.132 5.017-1.13 7.515.01l.031.015.03.016c.338.173.61.432.804.775.151.267.236.554.294.768l.002.01.057.223c.099.396.16.549.2.623a.206.206 0 0 0 .047.062c.053.018.131.042.237.07.252.066.583.134.951.196.76.127 1.508.2 1.857.196a.825.825 0 0 0 .248-.033.166.166 0 0 0 .044-.02.585.585 0 0 0 .044-.067c.035-.059.076-.143.118-.256.085-.229.157-.526.204-.868.097-.703.065-1.407-.027-1.813l-.015-.062-.008-.063c-.075-.532-.434-1.105-1.51-1.587l-.219-.093-.017-.008c-1.573-.72-4.269-1.134-7.14-1.13-2.868.004-5.58.427-7.173 1.141l-.03.014-.03.012c-1.137.45-1.568 1.06-1.67 1.721l-.01.072-.018.07c-.073.29-.114.953-.016 1.677.047.345.119.652.207.894.043.119.085.209.122.273.017.03.032.052.042.066.018.013.035.02.054.027.037.013.109.03.24.032.349.004 1.098-.069 1.857-.196.368-.062.7-.13.952-.196.105-.028.184-.051.237-.07a.174.174 0 0 0 .04-.05c.027-.044.08-.155.16-.454l.064-.25Z"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Controls;
