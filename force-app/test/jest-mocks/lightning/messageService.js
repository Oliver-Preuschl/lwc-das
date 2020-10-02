/**
 * For the original lightning/messageService (LMS) stub that comes by default with
 * @salesforce/sfdx-lwc-jest, see:
 * https://github.com/salesforce/sfdx-lwc-jest/blob/master/src/lightning-stubs/messageService/messageService.js
 */
export const APPLICATION_SCOPE = Symbol("APPLICATION_SCOPE");
export const createMessageChannel = jest.fn();
export const createMessageContext = jest.fn();
export const MessageContext = jest.fn();
export const releaseMessageContext = jest.fn();
export const unsubscribe = jest.fn();
// LMS stub implementation that lets you test a single message handler on a single channel
var _messageSubscriptions = {};
export const publish = jest.fn((messageContext, messageChannel, message) => {
  console.log("publish: " + messageChannel);
  if (_messageSubscriptions[messageChannel]) {
    _messageSubscriptions[messageChannel].forEach((messageHandler) => {
      console.log("calling subscribed handler");
      messageHandler(message);
    });
  }
});
export const subscribe = jest.fn(
  (messageContext, messageChannel, messageHandler) => {
    console.log("subscribe: " + messageChannel);
    if (!_messageSubscriptions[messageChannel]) {
      _messageSubscriptions[messageChannel] = [];
    }
    _messageSubscriptions[messageChannel].push(messageHandler);
  }
);
