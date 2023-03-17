class DataChannel {
  constructor(peerConnection) {
    this.peerConnection = peerConnection;
    this.channels = {};
    this.setEventHandlers();
  }

  createDataChannel(label) {
    // Each data channel has an ID property that uniquely identifies them
    // We can also decide to only allow data channels that have different names as shown here
    if (this.channelAlreadyExists(label)) return;
    const channel = this.peerConnection.createDataChannel(label);
    this.storeChannel(channel);
    this.setDataChannelEventHandlers(channel);
    return channel;
  }

  setEventHandlers() {
    this.peerConnection.ondatachannel = this.handleNewDataChannel.bind(this);
  }

  handleNewDataChannel(dataChannelEvent) {
    const { channel } = dataChannelEvent;
    this.storeChannel(channel);
    this.setDataChannelEventHandlers(channel);
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

  handleDataChannelOpen(dataChannelEvent) {
    const { channel } = dataChannelEvent;
    // ...
  }

  handleDataChannelMessage(messageEvent) {
    const { data } = messageEvent;
    // ...
  }

  handleDataChannelClose(event) {
    // const { channel } = event; // not sure the event provides the channel property
    // this.removeDataChannel(channel);
    // ...
  }

  storeChannel(channel) {
    this.channels[channel.label] = channel;
  }

  channelAlreadyExists(label) {
    return this.channels[label];
  }

  removeDataChannel(channel) {
    delete this.channels[channel.label];
  }

  getChannelBy(label) {
    return this.channels[label];
  }
}

export default DataChannel;
