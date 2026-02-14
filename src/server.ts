/**
 * Shared MCP Server — used by both Node.js (index.ts) and CF Worker (worker.ts)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { SupabaseClient } from './supabase-client.js';
import { ManagementClient } from './management-client.js';
import { TOOLS } from './tools.js';
import type { FullConfig } from './types.js';

export function handleToolCall(
  toolName: string,
  args: Record<string, unknown>,
  supabase: SupabaseClient | null,
  management: ManagementClient | null
) {
  // Strip _fields param (Smithery quality — not a Supabase param)
  const { _fields, ...params } = args;

  // ========== Database — REST API (6) ==========
  switch (toolName) {
    case 'sb_list_records': {
      if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for database operations');
      return supabase.listRecords(params.table as string, {
        select: params.select as string | undefined,
        filter: params.filter as string | undefined,
        order: params.order as string | undefined,
        limit: params.limit as number | undefined,
        offset: params.offset as number | undefined,
      });
    }
    case 'sb_insert_records': {
      if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
      return supabase.insertRecords(params.table as string, params.records, {
        return: params.return as string | undefined,
        select: params.select as string | undefined,
      });
    }
    case 'sb_update_records': {
      if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
      return supabase.updateRecords(
        params.table as string,
        params.filter as string,
        params.data as Record<string, unknown>,
        {
          return: params.return as string | undefined,
          select: params.select as string | undefined,
        }
      );
    }
    case 'sb_upsert_records': {
      if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
      return supabase.upsertRecords(params.table as string, params.records, {
        resolution: params.resolution as string | undefined,
        return: params.return as string | undefined,
        select: params.select as string | undefined,
        onConflict: params.on_conflict as string | undefined,
      });
    }
    case 'sb_delete_records': {
      if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
      return supabase.deleteRecords(params.table as string, params.filter as string, {
        return: params.return as string | undefined,
        select: params.select as string | undefined,
      });
    }
    case 'sb_call_function': {
      if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
      return supabase.callFunction(params.function_name as string, {
        params: params.params as Record<string, unknown> | undefined,
        method: params.method as string | undefined,
      });
    }

    // ========== Storage API (6) ==========
    case 'sb_list_buckets': {
      if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for storage');
      return supabase.listBuckets();
    }
    case 'sb_create_bucket': {
      if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
      return supabase.createBucket({
        name: params.name as string,
        public: params.public as boolean | undefined,
        fileSizeLimit: params.file_size_limit as number | undefined,
        allowedMimeTypes: params.allowed_mime_types as string[] | undefined,
      });
    }
    case 'sb_delete_bucket': {
      if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
      return supabase.deleteBucket(params.bucket_id as string);
    }
    case 'sb_list_objects': {
      if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
      return supabase.listObjects(params.bucket as string, {
        prefix: params.prefix as string | undefined,
        limit: params.limit as number | undefined,
        offset: params.offset as number | undefined,
        search: params.search as string | undefined,
        sortBy: params.sort_column ? {
          column: params.sort_column as string,
          order: (params.sort_order as string) || 'asc',
        } : undefined,
      });
    }
    case 'sb_delete_objects': {
      if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
      return supabase.deleteObjects(params.bucket as string, params.prefixes as string[]);
    }
    case 'sb_create_signed_url': {
      if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
      return supabase.createSignedUrl(
        params.bucket as string,
        params.path as string,
        params.expires_in as number
      );
    }

    // ========== Auth Admin API (5) ==========
    case 'sb_list_users': {
      if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for auth admin');
      return supabase.listUsers({
        page: params.page as number | undefined,
        perPage: params.per_page as number | undefined,
      });
    }
    case 'sb_get_user': {
      if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
      return supabase.getUser(params.user_id as string);
    }
    case 'sb_create_user': {
      if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
      return supabase.createUser({
        email: params.email as string | undefined,
        phone: params.phone as string | undefined,
        password: params.password as string | undefined,
        emailConfirm: params.email_confirm as boolean | undefined,
        phoneConfirm: params.phone_confirm as boolean | undefined,
        userMetadata: params.user_metadata as Record<string, unknown> | undefined,
        appMetadata: params.app_metadata as Record<string, unknown> | undefined,
      });
    }
    case 'sb_update_user': {
      if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
      return supabase.updateUser(params.user_id as string, {
        email: params.email as string | undefined,
        phone: params.phone as string | undefined,
        password: params.password as string | undefined,
        emailConfirm: params.email_confirm as boolean | undefined,
        phoneConfirm: params.phone_confirm as boolean | undefined,
        userMetadata: params.user_metadata as Record<string, unknown> | undefined,
        appMetadata: params.app_metadata as Record<string, unknown> | undefined,
        banDuration: params.ban_duration as string | undefined,
      });
    }
    case 'sb_delete_user': {
      if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
      return supabase.deleteUser(params.user_id as string);
    }

    // ========== Management API — Projects (5) ==========
    case 'sb_list_projects': {
      if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required for management operations');
      return management.listProjects();
    }
    case 'sb_get_project': {
      if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
      return management.getProject(params.project_ref as string);
    }
    case 'sb_create_project': {
      if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
      return management.createProject({
        name: params.name as string,
        organization_id: params.organization_id as string,
        region: params.region as string,
        db_pass: params.db_pass as string,
        plan: params.plan as string | undefined,
      });
    }
    case 'sb_pause_project': {
      if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
      return management.pauseProject(params.project_ref as string);
    }
    case 'sb_restore_project': {
      if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
      return management.restoreProject(params.project_ref as string);
    }

    // ========== Management API — Database (3) ==========
    case 'sb_run_query': {
      if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required for database management');
      return management.runQuery(params.project_ref as string, params.query as string);
    }
    case 'sb_list_migrations': {
      if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
      return management.listMigrations(params.project_ref as string);
    }
    case 'sb_get_typescript_types': {
      if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
      return management.getTypescriptTypes(params.project_ref as string);
    }

    // ========== Management API — Edge Functions (2) ==========
    case 'sb_list_functions': {
      if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
      return management.listFunctions(params.project_ref as string);
    }
    case 'sb_get_function': {
      if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
      return management.getFunction(params.project_ref as string, params.function_slug as string);
    }

    // ========== Management API — Secrets & Keys (4) ==========
    case 'sb_list_secrets': {
      if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
      return management.listSecrets(params.project_ref as string);
    }
    case 'sb_create_secrets': {
      if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
      return management.createSecrets(
        params.project_ref as string,
        params.secrets as Array<{ name: string; value: string }>
      );
    }
    case 'sb_delete_secrets': {
      if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
      return management.deleteSecrets(params.project_ref as string, params.names as string[]);
    }
    case 'sb_list_api_keys': {
      if (!management) throw new Error('SUPABASE_ACCESS_TOKEN is required');
      return management.listApiKeys(params.project_ref as string);
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

export function createServer(config?: FullConfig) {
  const server = new McpServer({
    name: 'supabase-mcp',
    version: '1.0.0',
  });

  let supabase: SupabaseClient | null = null;
  let management: ManagementClient | null = null;

  // Register all 31 tools with annotations
  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema as any,
        annotations: tool.annotations,
      },
      async (args: Record<string, unknown>) => {
        // Initialize clients on first use
        const url = config?.url || (args as any).SUPABASE_URL;
        const key = config?.serviceRoleKey || (args as any).SUPABASE_SERVICE_ROLE_KEY;
        const token = config?.accessToken || (args as any).SUPABASE_ACCESS_TOKEN;

        if (url && key && !supabase) {
          supabase = new SupabaseClient({ url, serviceRoleKey: key });
        }
        if (token && !management) {
          management = new ManagementClient({ accessToken: token });
        }

        try {
          const result = await handleToolCall(tool.name, args, supabase, management);
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
            isError: false,
          };
        } catch (error) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
          };
        }
      }
    );
  }

  // Register prompts
  server.prompt(
    'explore-database',
    'Guide for exploring and querying a Supabase database',
    async () => {
      return {
        messages: [{
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: [
              'You are a Supabase database explorer. Help me discover and query data from a Supabase project.',
              '',
              'Available database tools:',
              '1. **sb_list_records** — List records with filters, select, order, pagination',
              '2. **sb_insert_records** — Insert one or more records',
              '3. **sb_update_records** — Update records matching a filter',
              '4. **sb_upsert_records** — Insert or update on conflict',
              '5. **sb_delete_records** — Delete records matching a filter',
              '6. **sb_call_function** — Call stored PostgreSQL functions via RPC',
              '',
              'PostgREST filter operators:',
              '- eq, neq, gt, gte, lt, lte — comparison',
              '- like, ilike — pattern matching (use * as wildcard)',
              '- in.(val1,val2) — IN list',
              '- is.null, is.true — NULL/boolean check',
              '- cs.{a,b}, cd.{a,b} — array contains/contained-by',
              '- fts.word — full-text search',
              '- or=(cond1,cond2) — OR logic',
              '',
              'Resource embedding (JOINs):',
              '- select=*,orders(*) — embed related table',
              '- select=id,user:user_id(name,email) — renamed embed',
              '',
              'Management tools:',
              '- **sb_run_query** — Execute raw SQL queries',
              '- **sb_get_typescript_types** — Generate TypeScript types from schema',
            ].join('\n'),
          },
        }],
      };
    },
  );

  server.prompt(
    'manage-project',
    'Guide for managing Supabase projects, storage, users, and secrets',
    async () => {
      return {
        messages: [{
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: [
              'You are a Supabase project manager. Help me manage my Supabase infrastructure.',
              '',
              'Storage tools:',
              '- **sb_list_buckets** / **sb_create_bucket** / **sb_delete_bucket** — Manage storage buckets',
              '- **sb_list_objects** / **sb_delete_objects** — Manage files in buckets',
              '- **sb_create_signed_url** — Generate temporary download URLs',
              '',
              'Auth Admin tools:',
              '- **sb_list_users** / **sb_get_user** — View users',
              '- **sb_create_user** / **sb_update_user** / **sb_delete_user** — Manage users',
              '- Use email_confirm=true to skip email verification',
              '- Use app_metadata for admin-only data (roles, permissions)',
              '',
              'Project Management tools (requires SUPABASE_ACCESS_TOKEN):',
              '- **sb_list_projects** / **sb_get_project** — View projects',
              '- **sb_create_project** — Create new project',
              '- **sb_pause_project** / **sb_restore_project** — Control project lifecycle',
              '',
              'Database Management:',
              '- **sb_run_query** — Execute SQL directly',
              '- **sb_list_migrations** — View migration history',
              '',
              'Edge Functions & Secrets:',
              '- **sb_list_functions** / **sb_get_function** — View deployed functions',
              '- **sb_list_secrets** / **sb_create_secrets** / **sb_delete_secrets** — Manage env vars',
              '- **sb_list_api_keys** — View project API keys',
            ].join('\n'),
          },
        }],
      };
    },
  );

  // Register resources
  server.resource(
    'server-info',
    'supabase://server-info',
    {
      description: 'Connection status and available tools for this Supabase MCP server',
      mimeType: 'application/json',
    },
    async () => {
      return {
        contents: [{
          uri: 'supabase://server-info',
          mimeType: 'application/json',
          text: JSON.stringify({
            name: 'supabase-mcp',
            version: '1.0.0',
            connected_project: !!config?.url,
            supabase_url: config?.url || '(not configured)',
            authenticated: !!config?.serviceRoleKey,
            management_api: !!config?.accessToken,
            tools_available: TOOLS.length,
            tool_categories: {
              database_rest: 6,
              storage: 6,
              auth_admin: 5,
              management_projects: 5,
              management_database: 3,
              management_functions: 2,
              management_secrets_keys: 4,
            },
          }, null, 2),
        }],
      };
    },
  );

  // Override tools/list handler to return raw JSON Schema with property descriptions.
  (server as any).server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: TOOLS.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      annotations: tool.annotations,
    })),
  }));

  return server;
}
