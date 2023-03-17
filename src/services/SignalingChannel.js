class SignalingChannel {
  constructor(roomId, endpoint) {
    this.ws = new WebSocket(`${endpoint}?roomId=${roomId}`);
    this.processSignalingMessage = null;
    this.setEventHandlers();
  }

  sendMessage(data) {
    const message = { action: "sendmessage", message: data };
    const stringifiedMessage = JSON.stringify(message);
    this.ws.send(stringifiedMessage);
  }

  closeConnection() {
    // When the app un-mounts?
    // What if the use refreshes the page?
    this.ws.close();
  }

  setEventHandlers() {
    this.ws.onopen = this.handleConnectionOpen.bind(this);
    this.ws.onmessage = this.handleConnectionMessage.bind(this);
    this.ws.onclose = this.handleConnectionClose.bind(this);
    this.ws.onerror = this.handleConnectionError.bind(this);
  }

  handleConnectionOpen(event) {
    console.log("WebSocket connection successfully established!");
  }

  async handleConnectionMessage(messageEvent) {
    const message = JSON.parse(messageEvent.data);
    await this.processSignalingMessage(message);
  }

  // What do we do here?
  handleConnectionClose(closeEvent) {
    // properties on the event
    // code
    // reason
    // wasClean
  }

  // What do we do here?
  handleConnectionError() {}

  setOnMessageCb(func) {
    this.processSignalingMessage = func;
  }
}

export default SignalingChannel;
