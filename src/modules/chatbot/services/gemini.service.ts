import { ChatbotContext } from '../types';
import { queryKnowledgeEngine } from './knowledgeEngine';

/**
 * SahyogSeva AI Service
 * 
 * Powered by Google Gemini Flash API with instantaneous fallback to local domain knowledge engine.
 * Guaranteed never to hang the UI: strict 4000ms timeout on network requests.
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
        console.warn('[SahyogSeva AI] Gemini Cloud API unavailable or timed out, smoothly answering via local knowledge engine:', err);
      }
    }

    // High-performance domain-grounded fallback (instant & reliable)
    await new Promise((resolve) => setTimeout(resolve, 300));
    return queryKnowledgeEngine(userMessage, context);
  }

  private async callGeminiApi(
    userMessage: string,
    apiKey: string,
    context?: ChatbotContext
  ): Promise<string> {
    const systemPrompt = `You are "Sahyog Assistant" (सहयोग सहायक), the friendly and knowledgeable AI assistant for SahyogSeva (सहयोग सेवा) — India's premier cooperative gig-services platform for doorstep artisan services.

Platform Highlights & Rules:
1. Services offered: Electricians, Plumbers, Carpenters, Domestic Helpers & Maid services, Appliance Repair (AC, Refrigerator, Washing Machine), House Painting, Cleaning & Pest Control.
2. Verified Artisans: 100% police background verified with photo ID badge and skill certifications.
3. Cooperative Model: 0% platform commission taken from artisans (workers retain 100% of their earnings).
4. Fair Escrow Payments: Zero advance payment required from customers. Secure post-service payment via Cash or UPI after satisfactory job completion.
5. Rapid Response: 30-minute rapid emergency arrival available for electrical hazards and major plumbing leaks.
6. Current Context:
   - User Name: ${context?.userName || 'Customer'}
   - User Role: ${context?.currentRole || 'Customer'}
   - Current Section/Page: ${context?.currentPage || 'Home'}
7. Response Guidelines:
   - Be helpful, polite, concise, and structured (use emojis, bullet points, and bold text for key terms).
   - Answer in English by default, or in Hindi / Hinglish if the user asks in Hindi.
   - If user asks how to book or apply, guide them step-by-step to use the app buttons.
   - Never claim you have directly booked the job in their system; direct them to tap 'Book Now' on the worker's card.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${encodeURIComponent(apiKey)}`;

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

    // Strict 3.5-second timeout to prevent UI hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

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

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}: ${errBody}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Empty text payload received from Gemini endpoint.');
      }

      return text;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const chatService = new GeminiChatService();
