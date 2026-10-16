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
  async createInstance(
    instanceName: string,
    webhookUrl?: string
  ): Promise<{ instance: { instanceName: string; status: string }; qrcode?: EvolutionQrCodeResponse }> {
    const res = await this.request<{ instance: { instanceName: string; status: string }; qrcode?: EvolutionQrCodeResponse }>('/instance/create', {
      method: 'POST',
      body: JSON.stringify({
        instanceName,
        integration: 'WHATSAPP-BAILEYS',
        token: this.apiKey,
        qrcode: true,
      }),
    });

    if (webhookUrl) {
      await this.setWebhook(instanceName, webhookUrl).catch(() => {});
    }

    return res;
  }

  /**
   * Configure webhook for an instance
   */
  async setWebhook(instanceName: string, webhookUrl: string): Promise<void> {
    await this.request(`/webhook/set/${encodeURIComponent(instanceName)}`, {
      method: 'POST',
      body: JSON.stringify({
        webhook: {
          url: webhookUrl,
          enabled: true,
          webhookByEvents: false,
          events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'MESSAGES_UPDATE'],
        },
      }),
    });
  }

  /**
   * Fetch QR code for scanning
   */
  async getQrCode(instanceName: string): Promise<EvolutionQrCodeResponse> {
    const raw = await this.request<Record<string, unknown>>(`/instance/connect/${encodeURIComponent(instanceName)}`, {
      method: 'GET',
    });
    const qrObj = (raw?.qrcode && typeof raw.qrcode === 'object') ? (raw.qrcode as Record<string, unknown>) : raw || {};
    return {
      pairingCode: (qrObj.pairingCode as string | undefined) || (raw?.pairingCode as string | undefined),
      code: (qrObj.code as string | undefined) || (raw?.code as string | undefined),
      base64: (qrObj.base64 as string | undefined) || (raw?.base64 as string | undefined),
      count: (qrObj.count as number | undefined) || (raw?.count as number | undefined),
      state: (raw?.state as string | undefined) || (qrObj.state as string | undefined),
    };
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
