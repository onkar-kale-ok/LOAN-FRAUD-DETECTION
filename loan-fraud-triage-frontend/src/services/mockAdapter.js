import { buildMockChatReply } from '../data/mockScenarios';

/**
 * Chat-only offline fallback. Evaluation never uses this adapter.
 */
export const mockAdapter = {
  async sendAssistantQuery(id, message) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return buildMockChatReply(id, message);
  },
};

export default mockAdapter;
