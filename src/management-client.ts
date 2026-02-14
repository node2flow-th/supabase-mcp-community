/**
 * Supabase Management API Client
 *
 * Handles account-level operations at api.supabase.com using personal access token.
 */

const MANAGEMENT_BASE = 'https://api.supabase.com';

export class ManagementClient {
  private accessToken: string;

  constructor(config: { accessToken: string }) {
    this.accessToken = config.accessToken;
  }

  private headers(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async request(
    method: string,
    path: string,
    opts?: { body?: unknown; query?: Record<string, string> }
  ): Promise<unknown> {
    let url = `${MANAGEMENT_BASE}${path}`;

    if (opts?.query) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(opts.query)) {
        if (v !== undefined && v !== '') params.append(k, v);
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }

    const res = await fetch(url, {
      method,
      headers: this.headers(),
      body: opts?.body ? JSON.stringify(opts.body) : undefined,
    });

    const text = await res.text();
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const err = JSON.parse(text);
        msg = err.message || err.error || err.msg || text;
      } catch {
        msg = text || msg;
      }
      throw new Error(msg);
    }

    if (!text) return { success: true, status: res.status };
    try {
      return JSON.parse(text);
    } catch {
      return { text };
    }
  }

  // ========== Projects ==========

  async listProjects(): Promise<unknown> {
    return this.request('GET', '/v1/projects');
  }

  async getProject(ref: string): Promise<unknown> {
    return this.request('GET', `/v1/projects/${encodeURIComponent(ref)}`);
  }

  async createProject(opts: {
    name: string;
    organization_id: string;
    region: string;
    plan?: string;
    db_pass: string;
  }): Promise<unknown> {
    return this.request('POST', '/v1/projects', { body: opts });
  }

  async pauseProject(ref: string): Promise<unknown> {
    return this.request('POST', `/v1/projects/${encodeURIComponent(ref)}/pause`);
  }

  async restoreProject(ref: string): Promise<unknown> {
    return this.request('POST', `/v1/projects/${encodeURIComponent(ref)}/restore`);
  }

  // ========== Database ==========

  async runQuery(ref: string, query: string): Promise<unknown> {
    return this.request('POST', `/v1/projects/${encodeURIComponent(ref)}/database/query`, {
      body: { query },
    });
  }

  async listMigrations(ref: string): Promise<unknown> {
    return this.request('GET', `/v1/projects/${encodeURIComponent(ref)}/database/migrations`);
  }

  async getTypescriptTypes(ref: string): Promise<unknown> {
    return this.request('GET', `/v1/projects/${encodeURIComponent(ref)}/types/typescript`);
  }

  // ========== Edge Functions ==========

  async listFunctions(ref: string): Promise<unknown> {
    return this.request('GET', `/v1/projects/${encodeURIComponent(ref)}/functions`);
  }

  async getFunction(ref: string, slug: string): Promise<unknown> {
    return this.request('GET', `/v1/projects/${encodeURIComponent(ref)}/functions/${encodeURIComponent(slug)}`);
  }

  // ========== Secrets ==========

  async listSecrets(ref: string): Promise<unknown> {
    return this.request('GET', `/v1/projects/${encodeURIComponent(ref)}/secrets`);
  }

  async createSecrets(ref: string, secrets: Array<{ name: string; value: string }>): Promise<unknown> {
    return this.request('POST', `/v1/projects/${encodeURIComponent(ref)}/secrets`, {
      body: secrets,
    });
  }

  async deleteSecrets(ref: string, names: string[]): Promise<unknown> {
    return this.request('DELETE', `/v1/projects/${encodeURIComponent(ref)}/secrets`, {
      body: names,
    });
  }

  // ========== API Keys ==========

  async listApiKeys(ref: string): Promise<unknown> {
    return this.request('GET', `/v1/projects/${encodeURIComponent(ref)}/api-keys`);
  }
}
