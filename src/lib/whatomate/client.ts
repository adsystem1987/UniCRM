/**
 * Client for interacting with the Whatomate Voice Calling & IVR sidecar service.
 */

interface InitiateCallParams {
  toNumber: string;
  fromNumber?: string;
  metadata?: Record<string, unknown>;
}

interface WhatomateCallResponse {
  callId: string;
  status: string;
  webrtcToken?: string;
}

export class WhatomateClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(
    baseUrl = process.env.WHATOMATE_URL || 'http://localhost:8080',
    apiKey = process.env.WHATOMATE_API_KEY || ''
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`Whatomate request failed (${res.status}): ${errorText || res.statusText}`);
    }

    return res.json() as Promise<T>;
  }

  /**
   * Initiates an outbound WhatsApp voice call via Whatomate
   */
  async initiateCall(params: InitiateCallParams): Promise<WhatomateCallResponse> {
    return this.request<WhatomateCallResponse>('/api/calls', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Terminates an active call
   */
  async hangupCall(callId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/calls/${encodeURIComponent(callId)}/hangup`, {
      method: 'POST',
    });
  }

  /**
   * Health / ping check
   */
  async getHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health', {
      method: 'GET',
    });
  }
}

export const whatomate = new WhatomateClient();
