import { ChatbotContext } from '../types';
import { queryKnowledgeEngine } from './knowledgeEngine';

/**
 * SahyogSeva AI Service
 * 
 * Powered by Google Gemini Flash Live API (gemini-3.6-flash) with fallback to local domain knowledge engine.
 */
class GeminiChatService {
  private getApiKey(): string | null {
    try {
      const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (
        envKey &&
        typeof envKey === 'string' &&
        envKey.trim().length > 10 &&
        !envKey.includes('paste-your-key') &&
        !envKey.includes('your-')
      ) {
        return envKey.trim();
      }
    } catch {
      // In environments where env is restricted
    }
    return null;
  }

  public isCloudAiConfigured(): boolean {
    return Boolean(this.getApiKey());
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
          return response.trim();
        }
      } catch (err: any) {
        console.error('[SahyogSeva AI] Gemini Live API call failed, falling back to local knowledge engine:', err?.message || err);
      }
    } else {
      console.info('[SahyogSeva AI] VITE_GEMINI_API_KEY is not configured or is a placeholder. Answering via local domain knowledge engine.');
    }

    // High-performance domain-grounded fallback (instant & reliable)
    await new Promise((resolve) => setTimeout(resolve, 250));
    return queryKnowledgeEngine(userMessage, context);
  }

  private async callGeminiApi(
    userMessage: string,
    apiKey: string,
    context?: ChatbotContext
  ): Promise<string> {
    const systemPrompt = `You are "Sahyog Assistant" (सहयोग सहायक), the friendly and knowledgeable AI assistant for SahyogSeva (सहयोग सेवा) — India's premier cooperative gig-services platform for doorstep artisan services.

Platform Rules & Knowledge:
1. Services offered: Electricians, Plumbers, Carpenters, Domestic Helpers & Maid services, Appliance Repair (AC, Refrigerator, Washing Machine), House Painting, Cleaning & Pest Control.
2. Verified Artisans: 100% police background verified with photo ID badges.
3. Cooperative Model: 0% platform commission taken from artisans (workers keep 100% of their earnings).
4. Fair Escrow Payments: Zero advance payment required from customers. Secure post-service payment via Cash or UPI after satisfactory job completion.
5. Rapid Response: 30-minute rapid emergency arrival available for electrical hazards and major plumbing leaks.
6. Current User: ${context?.userName || 'Customer'} (${context?.currentRole || 'Customer'}), on page: ${context?.currentPage || 'Home'}.
7. Guidelines:
   - Be friendly, polite, and concise. Use clear bullet points and bold formatting.
   - Answer in English or Hindi (matching user's query language).
   - If asked how to book, guide them step-by-step to tap the 'Book Service' button on the relevant worker card.
   - Never claim you have directly booked or altered their database record.`;

    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];
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
        temperature: 0.4,
        maxOutputTokens: 800,
      },
    };

    let lastError: any = null;

    for (const model of models) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBodyText = await response.text().catch(() => '<unable to read response body>');
          console.error(`[SahyogSeva AI] Gemini API [${model}] returned HTTP ${response.status}:`, errorBodyText);
          lastError = new Error(`HTTP ${response.status}: ${errorBodyText}`);
          continue; // Fallback to next model
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text;
        } else {
          console.warn(`[SahyogSeva AI] Gemini API [${model}] returned empty candidate text:`, data);
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          console.error(`[SahyogSeva AI] Gemini API [${model}] request timed out after 30 seconds.`);
          lastError = new Error(`Request timed out after 30 seconds for model ${model}`);
        } else {
          console.error(`[SahyogSeva AI] Network error calling Gemini API [${model}]:`, err);
          lastError = err;
        }
      }
    }

    throw lastError || new Error('All Gemini API models failed to return a response.');
  }
}

export const chatService = new GeminiChatService();
