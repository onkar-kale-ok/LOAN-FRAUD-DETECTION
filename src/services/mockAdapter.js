import {
  mockScenarios,
  buildMockAnalysis,
  buildMockChatReply,
} from '../data/mockScenarios';

/**
 * Simulated backend responses used when the live API is offline.
 */
export const mockAdapter = {
  async analyzeApplication(payload) {
    await delay(450);
    return buildMockAnalysis(payload);
  },

  async getApplications() {
    await delay(250);
    return mockScenarios.map((s) => ({
      id: s.id,
      applicantName: s.applicantName,
      declaredIncome: s.declaredIncome,
      ocrIncome: s.ocrIncome,
      deviceId: s.deviceId,
      ipAddress: s.ipAddress,
      pan: s.pan,
      phone: s.phone,
      riskScore: s.riskScore,
      riskTier: s.riskTier,
      status: s.status,
      redFlags: s.redFlags,
      aiReviewerNote: s.aiReviewerNote,
    }));
  },

  async getApplicationById(id) {
    await delay(200);
    const found = mockScenarios.find((s) => s.id === id);
    if (!found) {
      throw new Error(`Application ${id} not found`);
    }
    return { ...found };
  },

  async sendAssistantQuery(id, message) {
    await delay(500);
    return buildMockChatReply(id, message);
  },
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default mockAdapter;
