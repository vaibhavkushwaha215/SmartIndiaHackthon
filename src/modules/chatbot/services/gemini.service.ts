import { ChatbotContext } from '../types';
import { queryKnowledgeEngine } from './knowledgeEngine';

/**
 * SahyogSeva AI Service
 * 
 * Powered by Google Gemini Flash API with instantaneous fallback to local domain knowledge engine.
 */
class GeminiChatService {
  private getApiKey(): string | null {
    try {
      const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (envKey && typeof envKey === 'string' && envKey.trim().length > 5 && !envKey.includes('your-')) {
        return envKey.trim();
      }
      const storedKey = sessionStorage.getItem('sahyog_gemini_api_key') || localStorage.getItem('sahyog_gemini_api_key');
      if (storedKey && storedKey.trim().length > 5) {
        return storedKey.trim();
      }
    } catch {
      // In environments where storage/env is restricted
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
      } catch (err) {
        console.warn('[SahyogSeva AI] Cloud API unavailable or timed out, smoothly answering via local knowledge engine:', err);
      }
    }

    // High-performance domain-grounded fallback (instant & reliable)
    await new Promise((resolve) => setTimeout(resolve, 200));
    return queryKnowledgeEngine(userMessage, context);
  }

  private async callGeminiApi(
    userMessage: string,
    apiKey: string,
    context?: ChatbotContext
  ): Promise<string> {
    const systemPrompt = `You are "Sahyog Assistant" (सहयोग सहायक), the helpful AI assistant for SahyogSeva (सहयोग सेवा) — India's premier cooperative gig-services platform for doorstep artisan services.

Platform Rules & Knowledge:
1. Services offered: Electricians, Plumbers, Carpenters, Domestic Helpers & Maid services, Appliance Repair (AC, Refrigerator, Washing Machine), House Painting, Cleaning & Pest Control.
2. Verified Artisans: 100% police background verified with photo ID badges.
3. Cooperative Model: 0% platform commission taken from artisans (workers keep 100% of their earnings).
4. Fair Escrow Payments: Zero advance payment required from customers. Secure post-service payment via Cash or UPI after satisfactory job completion.
5. Rapid Response: 30-minute rapid emergency arrival available for electrical hazards and major plumbing leaks.
6. Current User: ${context?.userName || 'Customer'} (${context?.currentRole || 'Customer'}), on page: ${context?.currentPage || 'Home'}.
7. Guidelines:
   - Be friendly, polite, and concise. Use clear bullet points and bold formatting.
   - Answer in English or Hindi (depending on user's query language).
   - If asked how to book, guide them to tap the 'Book Service' button on any worker card.`;

    const endpoints = [
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${encodeURIComponent(apiKey)}`
    ];

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
        maxOutputTokens: 600,
      },
    };

    let lastError: any = null;

    for (const endpoint of endpoints) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7500);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
          },
          body: JSON.stringify(payload),
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return text;
          }
        } else {
          const errBody = await response.text().catch(() => '');
          lastError = new Error(`HTTP ${response.status}: ${errBody}`);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err;
      }
    }

    throw lastError || new Error('Failed to generate response from Gemini API');
  }
}

export const chatService = new GeminiChatService();
