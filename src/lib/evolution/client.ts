/**
 * Client for communicating with the WhatsApp Web Gateway service.
 * Handles instance creation, QR code generation, connection status, and message dispatch.
 */

export interface EvolutionInstanceStatus {
  instanceName: string;
  state: 'connecting' | 'open' | 'close';
}

export interface EvolutionQrCodeResponse {
  pairingCode?: string;
  code?: string;
  base64?: string;
  count?: number;
  state?: 'connecting' | 'open' | 'close' | string;
}

export const DEFAULT_EVOLUTION_GATEWAY = 'https://wa.dfydude.online';

export class EvolutionClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(
    baseUrl = process.env.EVOLUTION_URL || DEFAULT_EVOLUTION_GATEWAY,
    apiKey = process.env.EVOLUTION_API_KEY || 'unicrm-evolution-secret-key'
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        apikey: this.apiKey,
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      const cleanMsg = (err.includes('<html') || err.includes('<!DOCTYPE') || err.includes('<head'))
        ? `Endpoint returned HTTP ${res.status} ${res.statusText}. Please verify that this URL points to an active WhatsApp Web Gateway server.`
        : (err.slice(0, 200) || res.statusText);
      throw new Error(`WhatsApp Gateway error (${res.status}): ${cleanMsg}`);
    }

    return res.json() as Promise<T>;
  }

  /**
   * Create or initialize an instance for an account
   */
  async createInstance(instanceName: string, webhookUrl?: string): Promise<{ instance: { instanceName: string; status: string } }> {
    return this.request('/instance/create', {
      method: 'POST',
      body: JSON.stringify({
        instanceName,
        integration: 'WHATSAPP-BAILEYS',
        token: this.apiKey,
        qrcode: true,
        webhook: webhookUrl,
        webhook_by_events: false,
        events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'MESSAGES_UPDATE'],
      }),
    });
  }

  /**
   * Fetch QR code for scanning
   */
  async getQrCode(instanceName: string): Promise<EvolutionQrCodeResponse> {
    return this.request<EvolutionQrCodeResponse>(`/instance/connect/${encodeURIComponent(instanceName)}`, {
      method: 'GET',
    });
  }

  /**
   * Get connection state
   */
  async getConnectionState(instanceName: string): Promise<{ instance: EvolutionInstanceStatus }> {
    return this.request(`/instance/connectionState/${encodeURIComponent(instanceName)}`, {
      method: 'GET',
    });
  }

  /**
   * Send plain text message
   */
  async sendText(instanceName: string, number: string, text: string): Promise<{ key: { id: string } }> {
    return this.request(`/message/sendText/${encodeURIComponent(instanceName)}`, {
      method: 'POST',
      body: JSON.stringify({
        number,
        text,
      }),
    });
  }

  /**
   * Disconnect and logout instance
   */
  async logout(instanceName: string): Promise<{ status: string }> {
    return this.request(`/instance/logout/${encodeURIComponent(instanceName)}`, {
      method: 'DELETE',
    });
  }
}

export const evolution = new EvolutionClient();
