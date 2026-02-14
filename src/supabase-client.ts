/**
 * Supabase Client — REST API + Storage + Auth Admin
 *
 * Handles project-level operations using apikey + Bearer auth.
 */

export class SupabaseClient {
  private url: string;
  private key: string;

  constructor(config: { url: string; serviceRoleKey: string }) {
    this.url = config.url.replace(/\/$/, '');
    this.key = config.serviceRoleKey;
  }

  private headers(): Record<string, string> {
    return {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
    };
  }

  private async request(
    method: string,
    path: string,
    opts?: {
      body?: unknown;
      headers?: Record<string, string>;
      query?: Record<string, string>;
    }
  ): Promise<unknown> {
    let url = `${this.url}${path}`;

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
      headers: { ...this.headers(), ...opts?.headers },
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

  // ========== REST API (Database CRUD) ==========

  async listRecords(table: string, opts?: {
    select?: string;
    filter?: string;
    order?: string;
    limit?: number;
    offset?: number;
  }): Promise<unknown> {
    const query: Record<string, string> = {};
    if (opts?.select) query['select'] = opts.select;
    if (opts?.order) query['order'] = opts.order;
    if (opts?.limit !== undefined) query['limit'] = String(opts.limit);
    if (opts?.offset !== undefined) query['offset'] = String(opts.offset);

    let path = `/rest/v1/${encodeURIComponent(table)}`;

    // Append PostgREST filters directly to the URL
    const params = new URLSearchParams(query);
    if (opts?.filter) {
      // filter is like "age=gt.18&status=eq.active"
      const filterParams = new URLSearchParams(opts.filter);
      for (const [k, v] of filterParams) {
        params.append(k, v);
      }
    }
    const qs = params.toString();
    if (qs) path += `?${qs}`;

    const res = await fetch(`${this.url}${path}`, {
      method: 'GET',
      headers: this.headers(),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    return JSON.parse(text);
  }

  async insertRecords(table: string, records: unknown, opts?: {
    return?: string;
    select?: string;
  }): Promise<unknown> {
    const headers: Record<string, string> = {};
    const prefer: string[] = [];
    if (opts?.return) prefer.push(`return=${opts.return}`);
    if (prefer.length) headers['Prefer'] = prefer.join(', ');

    const query: Record<string, string> = {};
    if (opts?.select) query['select'] = opts.select;

    return this.request('POST', `/rest/v1/${encodeURIComponent(table)}`, {
      body: records,
      headers,
      query,
    });
  }

  async updateRecords(table: string, filter: string, data: Record<string, unknown>, opts?: {
    return?: string;
    select?: string;
  }): Promise<unknown> {
    const headers: Record<string, string> = {};
    const prefer: string[] = [];
    if (opts?.return) prefer.push(`return=${opts.return}`);
    if (prefer.length) headers['Prefer'] = prefer.join(', ');

    // Build URL with filter params
    let path = `/rest/v1/${encodeURIComponent(table)}`;
    const params = new URLSearchParams(filter);
    const query: Record<string, string> = {};
    if (opts?.select) query['select'] = opts.select;
    for (const [k, v] of Object.entries(query)) {
      params.append(k, v);
    }
    const qs = params.toString();
    if (qs) path += `?${qs}`;

    const res = await fetch(`${this.url}${path}`, {
      method: 'PATCH',
      headers: { ...this.headers(), ...headers },
      body: JSON.stringify(data),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    if (!text) return { success: true };
    return JSON.parse(text);
  }

  async upsertRecords(table: string, records: unknown, opts?: {
    resolution?: string;
    return?: string;
    select?: string;
    onConflict?: string;
  }): Promise<unknown> {
    const headers: Record<string, string> = {};
    const prefer: string[] = [];
    prefer.push(`resolution=${opts?.resolution || 'merge-duplicates'}`);
    if (opts?.return) prefer.push(`return=${opts.return}`);
    headers['Prefer'] = prefer.join(', ');

    const query: Record<string, string> = {};
    if (opts?.select) query['select'] = opts.select;
    if (opts?.onConflict) query['on_conflict'] = opts.onConflict;

    return this.request('POST', `/rest/v1/${encodeURIComponent(table)}`, {
      body: records,
      headers,
      query,
    });
  }

  async deleteRecords(table: string, filter: string, opts?: {
    return?: string;
    select?: string;
  }): Promise<unknown> {
    const headers: Record<string, string> = {};
    const prefer: string[] = [];
    if (opts?.return) prefer.push(`return=${opts.return}`);
    if (prefer.length) headers['Prefer'] = prefer.join(', ');

    let path = `/rest/v1/${encodeURIComponent(table)}`;
    const params = new URLSearchParams(filter);
    const query: Record<string, string> = {};
    if (opts?.select) query['select'] = opts.select;
    for (const [k, v] of Object.entries(query)) {
      params.append(k, v);
    }
    const qs = params.toString();
    if (qs) path += `?${qs}`;

    const res = await fetch(`${this.url}${path}`, {
      method: 'DELETE',
      headers: { ...this.headers(), ...headers },
    });

    const text = await res.text();
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    if (!text) return { success: true };
    return JSON.parse(text);
  }

  async callFunction(functionName: string, opts?: {
    params?: Record<string, unknown>;
    method?: string;
  }): Promise<unknown> {
    const method = opts?.method || 'POST';
    const path = `/rest/v1/rpc/${encodeURIComponent(functionName)}`;

    if (method === 'GET') {
      const query: Record<string, string> = {};
      if (opts?.params) {
        for (const [k, v] of Object.entries(opts.params)) {
          query[k] = String(v);
        }
      }
      return this.request('GET', path, { query });
    }

    return this.request('POST', path, { body: opts?.params || {} });
  }

  // ========== Storage API ==========

  async listBuckets(): Promise<unknown> {
    return this.request('GET', '/storage/v1/bucket');
  }

  async createBucket(opts: {
    name: string;
    public?: boolean;
    fileSizeLimit?: number;
    allowedMimeTypes?: string[];
  }): Promise<unknown> {
    return this.request('POST', '/storage/v1/bucket', {
      body: {
        name: opts.name,
        public: opts.public ?? false,
        file_size_limit: opts.fileSizeLimit,
        allowed_mime_types: opts.allowedMimeTypes,
      },
    });
  }

  async deleteBucket(bucketId: string): Promise<unknown> {
    return this.request('DELETE', `/storage/v1/bucket/${encodeURIComponent(bucketId)}`);
  }

  async listObjects(bucket: string, opts?: {
    prefix?: string;
    limit?: number;
    offset?: number;
    search?: string;
    sortBy?: { column: string; order: string };
  }): Promise<unknown> {
    return this.request('POST', `/storage/v1/object/list/${encodeURIComponent(bucket)}`, {
      body: {
        prefix: opts?.prefix || '',
        limit: opts?.limit || 100,
        offset: opts?.offset || 0,
        search: opts?.search,
        sortBy: opts?.sortBy,
      },
    });
  }

  async deleteObjects(bucket: string, prefixes: string[]): Promise<unknown> {
    return this.request('DELETE', `/storage/v1/object/${encodeURIComponent(bucket)}`, {
      body: { prefixes },
    });
  }

  async createSignedUrl(bucket: string, path: string, expiresIn: number): Promise<unknown> {
    return this.request('POST', `/storage/v1/object/sign/${encodeURIComponent(bucket)}/${path}`, {
      body: { expiresIn },
    });
  }

  // ========== Auth Admin API ==========

  async listUsers(opts?: {
    page?: number;
    perPage?: number;
  }): Promise<unknown> {
    const query: Record<string, string> = {};
    if (opts?.page !== undefined) query['page'] = String(opts.page);
    if (opts?.perPage !== undefined) query['per_page'] = String(opts.perPage);
    return this.request('GET', '/auth/v1/admin/users', { query });
  }

  async getUser(userId: string): Promise<unknown> {
    return this.request('GET', `/auth/v1/admin/users/${encodeURIComponent(userId)}`);
  }

  async createUser(opts: {
    email?: string;
    phone?: string;
    password?: string;
    emailConfirm?: boolean;
    phoneConfirm?: boolean;
    userMetadata?: Record<string, unknown>;
    appMetadata?: Record<string, unknown>;
  }): Promise<unknown> {
    return this.request('POST', '/auth/v1/admin/users', {
      body: {
        email: opts.email,
        phone: opts.phone,
        password: opts.password,
        email_confirm: opts.emailConfirm,
        phone_confirm: opts.phoneConfirm,
        user_metadata: opts.userMetadata,
        app_metadata: opts.appMetadata,
      },
    });
  }

  async updateUser(userId: string, opts: {
    email?: string;
    phone?: string;
    password?: string;
    emailConfirm?: boolean;
    phoneConfirm?: boolean;
    userMetadata?: Record<string, unknown>;
    appMetadata?: Record<string, unknown>;
    banDuration?: string;
  }): Promise<unknown> {
    return this.request('PUT', `/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
      body: {
        email: opts.email,
        phone: opts.phone,
        password: opts.password,
        email_confirm: opts.emailConfirm,
        phone_confirm: opts.phoneConfirm,
        user_metadata: opts.userMetadata,
        app_metadata: opts.appMetadata,
        ban_duration: opts.banDuration,
      },
    });
  }

  async deleteUser(userId: string): Promise<unknown> {
    return this.request('DELETE', `/auth/v1/admin/users/${encodeURIComponent(userId)}`);
  }
}
