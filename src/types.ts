/**
 * Supabase MCP — Type definitions
 */

export interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

export interface ManagementConfig {
  accessToken: string;
}

export interface FullConfig {
  url?: string;
  serviceRoleKey?: string;
  accessToken?: string;
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  annotations: {
    title: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
}
