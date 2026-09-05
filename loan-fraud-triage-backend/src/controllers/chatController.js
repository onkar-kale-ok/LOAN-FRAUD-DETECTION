import { DATA_FILES, readJson, updateEvaluationById } from '../services/storageService.js';
import { askAssistant, getChatHistory } from '../services/aiAssistantService.js';
import { LlmClientError } from '../services/llmClient.js';
import { isValidChatMessage } from '../utils/chatValidation.js';

export async function postChat(req, res, next) {
  try {
    const id = req.params.id;
    const message = req.body?.message;

    if (!isValidChatMessage(message)) {
      return res.status(400).json({
        success: false,
        message: 'A valid user message is required.',
      });
    }

    const stored = await readJson(DATA_FILES.evaluations, []);
    const list = Array.isArray(stored) ? stored : [];
    const record = list.find((row) => row?.applicationId === id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Application record not found.',
      });
    }

    const trimmed = message.trim();
    const timestamp = new Date().toISOString();
    const replyText = await askAssistant(record, trimmed);

    const userEntry = {
      role: 'user',
      content: trimmed,
      timestamp,
    };
    const assistantEntry = {
      role: 'assistant',
      content: replyText,
      timestamp: new Date().toISOString(),
    };

    await updateEvaluationById(id, (current) => ({
      ...current,
      chatHistory: [...(Array.isArray(current.chatHistory) ? current.chatHistory : []), userEntry, assistantEntry],
    }));

    return res.status(200).json({
      success: true,
      reply: replyText,
      data: assistantEntry,
    });
  } catch (error) {
    if (error instanceof LlmClientError) {
      return res.status(error.status || 502).json({
        success: false,
        message: error.message,
      });
    }
    return next(error);
  }
}

export async function getHistory(req, res, next) {
  try {
    const stored = await readJson(DATA_FILES.evaluations, []);
    const list = Array.isArray(stored) ? stored : [];
    const record = list.find((row) => row?.applicationId === req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Application record not found.',
      });
    }

    const history = await getChatHistory(record);
    return res.status(200).json({ success: true, history });
  } catch (error) {
    return next(error);
  }
}

export default { postChat, getHistory };
