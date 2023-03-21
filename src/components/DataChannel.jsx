import { useState, useEffect } from "react";

const MAXIMUM_MESSAGE_SIZE = 65535;
const END_OF_FILE_MESSAGE = "EOF";
let file;

const DataChannel = ({ connection }) => {
  const [readyToSendMessages, setReadyToSendMessages] = useState(false);
  const [messages, setMessages] = useState([]); // list of objects with form {text, sender, date}
  const [localMessages, setLocalMessages] = useState([]);
  const [remoteMessages, setRemoteMessages] = useState([]);
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
    setOkButtonDisabled(!file);
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

  useEffect(() => {
    let messages = [
      ...localMessages.map((m) => ({ ...m, sender: "Me" })),
      ...remoteMessages.map((m) => ({ ...m, sender: "You" })),
    ];

    messages = messages.sort((a, b) => a.time.getTime() - b.time.getTime());

    setMessages(messages);
  }, [localMessages, remoteMessages]);

  return (
    <div>
      <div>
        {messages.map((msg, idx) => {
          return (
            <li key={idx} style={{ listStyle: "none" }}>
              {msg.sender} @ {msg.time.toLocaleTimeString()}:{" "}
              <strong>{msg.text}</strong>
            </li>
          );
        })}
      </div>
      {readyToSendMessages ? (
        <div>
          <label>Text message:</label>
          <input value={currentMessage} onChange={handleMessageChange} />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      ) : null}
      <div>
        {showShareFile ? (
          <button
            id="share-file-button"
            onClick={handleShareFileButtonClick}
            disabled={connection && connection.peerConnectionId === null}
          >
            <i>Click to Share a file</i>
          </button>
        ) : (
          <div id="select-file-dialog">
            <div id="dialog-content">
              <div id="select-file">
                <div id="label">Select a file:</div>
                <input
                  type="file"
                  id="select-file-input"
                  onChange={handleFileInputChange}
                />
              </div>
              <div id="dialog-footer">
                <button
                  id="ok-button"
                  disabled={okButtonDisable}
                  onClick={handleOkClick}
                >
                  Ok
                </button>
                <button id="cancel-button" onClick={handleCancelClick}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataChannel;
