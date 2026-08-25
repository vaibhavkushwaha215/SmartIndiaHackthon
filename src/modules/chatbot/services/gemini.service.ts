import { ChatbotContext } from '../types';
import { queryKnowledgeEngine } from './knowledgeEngine';

/**
 * SahyogSeva AI Service Abstraction Layer
 * 
 * Secure, plug-and-play architecture:
 * UI -> gemini.service.ts -> Gemini API (if VITE_GEMINI_API_KEY is configured) or KnowledgeEngine fallback.
 * 
 * NEVER hardcodes any secrets in the codebase.
 */
class GeminiChatService {
  private getApiKey(): string | null {
    try {
      const key = (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (key && typeof key === 'string' && key.trim().length > 10 && !key.includes('your-')) {
        return key.trim();
      }
    } catch {
      // In environments where import.meta.env is restricted
    }
    return null;
  }

  public isCloudAiConfigured(): boolean {
    return this.getApiKey() !== null;
  }

  /**
   * Generates a conversational response for SahyogSeva inquiries.
   */
  public async generateResponse(userMessage: string, context?: ChatbotContext): Promise<string> {
    const apiKey = this.getApiKey();

    if (apiKey) {
      try {
        const response = await this.callGeminiApi(userMessage, apiKey, context);
        if (response && response.trim().length > 0) {
          return response;
        }
      } catch (err) {
        console.warn('[SahyogSeva AI] Gemini Cloud API unavailable, smoothly switching to local knowledge engine:', err);
      }
    }

    // High-performance domain-grounded fallback
    await new Promise((resolve) => setTimeout(resolve, 350));
    return queryKnowledgeEngine(userMessage, context);
  }

  private async callGeminiApi(
    userMessage: string,
    apiKey: string,
    context?: ChatbotContext
  ): Promise<string> {
    const systemPrompt = `You are "SahyogSeva Assistant", an AI helper for SahyogSeva, an Indian cooperative platform connecting verified local trade workers (electricians, plumbers, carpenters, cleaning, appliance repair, painters) with households.
Key principles:
1. 100% police background verified workers, 0% platform commission taken from artisans (workers retain 100% of earnings).
2. Users pay zero advance fee; payments are held in escrow and settled via Cash or UPI after doorstep work is completed.
3. Emergency 30-min SOS dispatch is available for urgent electrical and plumbing faults.
4. Current user role: ${context?.currentRole || 'Customer'}. Current location/page: ${context?.currentPage || 'Home'}.
5. IMPORTANT: You are an informational assistant. NEVER claim to have completed a booking, transaction, or account change yourself; always instruct the user to tap the relevant button in the app.
Keep your response polite, concise, structured with bullet points where helpful, and in English (or Hindi if requested).`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\nUser Question: ${userMessage}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Gemini API responded with HTTP status ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty text payload received from Gemini endpoint.');
    }

    return text;
  }
}

export const chatService = new GeminiChatService();
