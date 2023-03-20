class DataChannel {
  constructor(peerConnection) {
    this.peerConnection = peerConnection;
    this.channel = this.initDataChannel();
    this.remoteMessages = [];
    this.updateRemoteTexts = null;
    this.readyToSendMessages = null;
  }

  initDataChannel() {
    const channel = this.peerConnection.createDataChannel("messages", {
      negotiated: true,
      id: 1,
    });
    this.setDataChannelEventHandlers(channel);
    return channel;
  }

  send(message) {
    this.channel.send(message);
  }

  handleDataChannelOpen() {
    this.readyToSendMessages(true);
  }

  handleDataChannelMessage(messageEvent) {
    const { data } = messageEvent;
    this.remoteMessages.push(data);
    this.updateRemoteTexts([...this.remoteMessages]);
  }

  handleDataChannelClose(event) {
    // const { channel } = event; // not sure the event provides the channel property
    // this.removeDataChannel(channel);
    // ...
  }

  setDataChannelEventHandlers(channel) {
    // We need to handle the following events as well:
    // closing => sent when the underlying data transport is about to start closing ... do we need this?
    // error => sent when an error occurs on the data channel
    // bufferedamountlow => ...

    channel.onopen = this.handleDataChannelOpen.bind(this);
    channel.onmessage = this.handleDataChannelMessage.bind(this);
    channel.onclose = this.handleDataChannelClose.bind(this);
  }

  setStateUpdatingFunc(updateRemoteTexts, readyToSendMessages) {
    this.updateRemoteTexts = updateRemoteTexts;
    this.readyToSendMessages = readyToSendMessages;
  }

  // handleNewDataChannel(dataChannelEvent) {
  // const { channel } = dataChannelEvent;
  // this.storeChannel(channel);
  // this.setDataChannelEventHandlers(channel);
  // ...
  // }

  // setEventHandlers() {
  //   this.peerConnection.ondatachannel = this.handleNewDataChannel.bind(this);
  // }

  // This function allows the creation of multiple channels
  // createDataChannel(label) {
  //   // Each data channel has an ID property that uniquely identifies them
  //   // We can also decide to only allow data channels that have different names as shown here
  //   if (this.channelAlreadyExists(label)) return;
  //   const channel = this.peerConnection.createDataChannel(label);
  //   this.storeChannel(channel);
  //   this.setDataChannelEventHandlers(channel);
  //   return channel;
  // }

  // storeChannel(channel) {
  //   this.channels[channel.label] = channel;
  // }

  // channelAlreadyExists(label) {
  //   return this.channels[label];
  // }

  // removeDataChannel(channel) {
  //   delete this.channels[channel.label];
  // }

  // getChannelBy(label) {
  //   return this.channels[label];
  // }
}

export default DataChannel;
