import { WebSocketEndpoint } from "../configs/configs";
import { dl } from "../utils/DateLog";

class WebSocketService {
  constructor(roomId, queryToken) {
    this.websocket = new WebSocket(
      `${WebSocketEndpoint}?roomId=${roomId}&token=${queryToken}`
    );
    this.websocket.onopen = this.onOpen.bind(this);
    this.messageHandler = null;
  }

  onOpen() {
    dl("WebSocket connection established");
  }

  async onMessage(event) {
    const data = JSON.parse(event.data);
    dl("new message", data);
    await this.messageHandler(data);
  }

  setMessageHandler(func) {
    this.messageHandler = func;
    this.websocket.onmessage = this.onMessage.bind(this);
  }

  sendMessage(payload) {
    const message = { action: "sendmessage", message: payload };
    this.websocket.send(JSON.stringify(message));
  }
}

export default WebSocketService;
