export function isValidChatMessage(message) {
  return typeof message === 'string' && message.trim().length > 0;
}

export default { isValidChatMessage };
