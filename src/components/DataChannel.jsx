import { useState, useEffect } from "react";
import ChatBubble from "./ChatBubble";

const MAXIMUM_MESSAGE_SIZE = 65535;
const END_OF_FILE_MESSAGE = "EOF";
let file;

const DataChannel = ({ connection }) => {
  const [readyToSendMessages, setReadyToSendMessages] = useState(false);
  const [messages, setMessages] = useState([]); // list of objects with form {text, sender, date}
  const [localMessages, setLocalMessages] = useState([]);
  const [remoteMessages, setRemoteMessages] = useState([]);
  const [systemMessages, setSystemMessages] = useState([]);
  const [okButtonDisable, setOkButtonDisabled] = useState(true);
  const [selectFileInput, setSelectFileInput] = useState("");
  const [showShareFile, setShowShareFile] = useState(true);

  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    connection &&
      connection.dataChannel.setStateUpdatingFunc(
        setRemoteMessages,
        setReadyToSendMessages
      );
  }, [connection]);

  useEffect(() => {
    if (connection) {
      console.log("before data channel set up");
      console.log("set up on data channel");
      connection.pc.ondatachannel = (event) => {
        const { channel } = event;
        channel.binaryType = "arraybuffer";

        const receivedBuffers = [];
        channel.onmessage = async (event) => {
          const { data } = event;
          try {
            if (data !== END_OF_FILE_MESSAGE) {
              receivedBuffers.push(data);
            } else {
              const arrayBuffer = receivedBuffers.reduce((acc, arrayBuffer) => {
                const tmp = new Uint8Array(
                  acc.byteLength + arrayBuffer.byteLength
                );
                tmp.set(new Uint8Array(acc), 0);
                tmp.set(new Uint8Array(arrayBuffer), acc.byteLength);
                return tmp;
              }, new Uint8Array());
              const blob = new Blob([arrayBuffer]);
              downloadFile(blob, channel.label);
              channel.close();
            }
          } catch (err) {
            console.log("File transfer failed", err);
          }
        };
      };
    }
  }, [connection]);

  const handleMessageChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  const shareFile = () => {
    if (file) {
      const channelLabel = file.name;
      const channel = connection.pc.createDataChannel(channelLabel);
      channel.binaryType = "arraybuffer";

      channel.onopen = async () => {
        const arrayBuffer = await file.arrayBuffer();
        for (let i = 0; i < arrayBuffer.byteLength; i += MAXIMUM_MESSAGE_SIZE) {
          channel.send(arrayBuffer.slice(i, i + MAXIMUM_MESSAGE_SIZE));
        }
        channel.send(END_OF_FILE_MESSAGE);
        const sharedMsg = `Shared file: ${file.name}`;
        sendSystemMessage(sharedMsg);
      };

      channel.onclose = () => {
        closeDialog();
      };
    }
  };

  const downloadFile = (blob, fileName) => {
    const a = document.createElement("a");
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const closeDialog = () => {
    setOkButtonDisabled(true);
    setSelectFileInput("");
    setShowShareFile(true);
  };

  const handleShareFileButtonClick = () => {
    setShowShareFile(false);
  };

  const handleCancelClick = () => {
    closeDialog();
  };

  const handleFileInputChange = (event) => {
    file = event.target.files[0];
    shareFile();
    // setOkButtonDisabled(!file);
  };

  const handleOkClick = () => {
    shareFile();
  };

  const handleSendMessage = () => {
    connection.dataChannel.send(currentMessage);
    setCurrentMessage("");
    setLocalMessages(
      localMessages.concat({
        text: currentMessage,
        time: new Date(),
      })
    );
  };

  const sendSystemMessage = (msg) => {
    connection.dataChannel.send(msg);
    setSystemMessages(
      systemMessages.concat({
        text: msg,
        time: new Date(),
      })
    );
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  useEffect(() => {
    let messages = [
      ...localMessages.map((m) => ({ ...m, sender: "You" })),
      ...remoteMessages.map((m) => ({ ...m, sender: "Remote" })),
      ...systemMessages.map((m) => ({ ...m, sender: "System" })),
    ];

    messages = messages.sort((a, b) => a.time.getTime() - b.time.getTime());

    setMessages(messages);
  }, [localMessages, remoteMessages, systemMessages]);

  return (
    // <div className="grid grid-rows-6 grid-cols-1 gap-2 h-full bg-gray-50 rounded-md p-4">
    <div className="flex flex-col w-full h-4/6 bg-gray-50 rounded-md p-4 place-self-center">
      <p className="flex-none h-10 w-full text-xl font-medium">Chat Room</p>
      <div className="w-full flex-auto place-self-start overflow-y-auto">
        <div className="flex flex-col space-y-2 h-full">
          {messages.map((msg, idx) => {
            return (
              <ChatBubble
                key={idx}
                msg={msg.text}
                sender={msg.sender}
                time={msg.time.toLocaleTimeString()}
              />
            );
          })}
        </div>
      </div>
      {/* Chat controls */}
      <div className="w-full mt-2 h-12 flex-none place-self-end disabled">
        <div className="flex flex-row flex-nowrap items-center gap-1">
          <input
            className="rounded-lg border-0 focus:border-blue-500 bg-zinc-200 focus:outline-none w-full px-2 h-12 resize-none"
            placeholder="Type message"
            value={currentMessage}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            disabled={readyToSendMessages ? false : true}
          />
          <button
            className="w-6 mx-2 disabled:grayscale disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={readyToSendMessages ? false : true}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              className="w-6 h-6 stroke-blue-700 stroke-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
          <label
            className={`flex transition ease-in-out duration-500 rounded-full hover:bg-gray-200 hover:cursor-pointer w-14 h-12 justify-center items-center ${
              readyToSendMessages
                ? ""
                : "grayscale opacity-50 hover:bg-transparent hover:cursor-default"
            }`}
          >
            <input
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
              disabled={readyToSendMessages ? false : true}
            />

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 stroke-blue-700 stroke-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </label>
        </div>
      </div>
    </div>
  );
};

export default DataChannel;
