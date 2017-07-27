'use strict';

const uuid4 = require('uuid/v4');

// JSTP Session class used to buffer and resend the messages on unexpected
// connection closes.
// Extends Map class and thus can be used to store the current session state
// independently of connection.
class Session extends Map {
  //   connection - Connection class object
  //   sessionId - used on client to represent session with corresponding id
  //               which exists on the server
  constructor(connection, sessionId) {
    super();

    this._isServer = !sessionId;

    this.id = sessionId || uuid4();
    this.connection = connection;
    this.username = null;

    this.guaranteedDeliveredCount = 0;
    this.buffer = new Map();

    this.recievedCount = 0;
    this.latestBufferedMessageId = 0;

    Object.preventExtensions(this);
  }

  _bufferMessage(id, message) {
    this.buffer.set(this._isServer ? -id : id, message);
    this.latestBufferedMessageId = id;
  }

  _onMessageRecieved(messageId) {
    this.recievedCount = this._isServer ? messageId : -messageId;
  }

  _onCallbackMessageRecieved(messageId) {
    if (!this._isServer) {
      messageId = -messageId;
    }
    for (let i = this.guaranteedDeliveredCount + 1; i <= messageId; i++) {
      this.buffer.delete(i);
    }
    this.guaranteedDeliveredCount = messageId;
  }

  _restoreSession(newConnection, recievedCount) {
    this.connection.close();
    this.connection = newConnection;
    for (let i = this.guaranteedDeliveredCount + 1; i <= recievedCount; i++) {
      this.buffer.delete(i);
    }
    this.guaranteedDeliveredCount = recievedCount;
  }

  _resendBufferedMessages() {
    this.buffer.forEach((message) => {
      this.connection._send(message);
    });
  }
}

module.exports = Session;
