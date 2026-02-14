/**
 * Supabase MCP — 31 Tool Definitions
 */

import type { MCPToolDefinition } from './types.js';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Database — REST API (6) ==========
  {
    name: 'sb_list_records',
    description: 'List records from a Supabase table/view with PostgREST filtering, column selection, ordering, and pagination. Filter syntax: age=gt.18, status=eq.active, name=ilike.*john*, id=in.(1,2,3). Resource embedding (JOINs): select=*,orders(*)',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table or view name' },
        select: { type: 'string', description: 'Columns to return. Supports embedding: *,orders(*) or id,user:user_id(name,email)' },
        filter: { type: 'string', description: 'PostgREST filter string. Example: age=gt.18&status=eq.active&or=(role.eq.admin,role.eq.mod)' },
        order: { type: 'string', description: 'Sort order. Example: created_at.desc or name.asc.nullslast' },
        limit: { type: 'number', description: 'Maximum number of records to return' },
        offset: { type: 'number', description: 'Number of records to skip (for pagination)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response (Smithery quality param)' },
      },
      required: ['table'],
    },
    annotations: {
      title: 'List Records',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'sb_insert_records',
    description: 'Insert one or more records into a Supabase table. Pass a single object or an array of objects. Use return=representation to get the created records back.',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        records: { description: 'Single record object or array of record objects to insert' },
        return: { type: 'string', enum: ['representation', 'minimal', 'headers-only'], description: 'Return preference. representation=full record, minimal=no body, headers-only=headers' },
        select: { type: 'string', description: 'Columns to return when return=representation' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['table', 'records'],
    },
    annotations: {
      title: 'Insert Records',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  {
    name: 'sb_update_records',
    description: 'Update records in a Supabase table matching a filter. Filter is REQUIRED to prevent accidental full-table updates. Use return=representation to see what changed.',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        filter: { type: 'string', description: 'PostgREST filter (REQUIRED). Example: id=eq.123 or status=eq.draft' },
        data: { type: 'object', description: 'Fields to update as key-value pairs' },
        return: { type: 'string', enum: ['representation', 'minimal', 'headers-only'], description: 'Return preference' },
        select: { type: 'string', description: 'Columns to return when return=representation' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['table', 'filter', 'data'],
    },
    annotations: {
      title: 'Update Records',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'sb_upsert_records',
    description: 'Upsert (insert or update on conflict) records in a Supabase table. Uses merge-duplicates by default. Specify on_conflict for non-primary-key columns.',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        records: { description: 'Single record object or array of record objects to upsert' },
        resolution: { type: 'string', enum: ['merge-duplicates', 'ignore-duplicates'], description: 'Conflict resolution strategy (default: merge-duplicates)' },
        on_conflict: { type: 'string', description: 'Column(s) to detect conflicts on, if not primary key. Example: email' },
        return: { type: 'string', enum: ['representation', 'minimal', 'headers-only'], description: 'Return preference' },
        select: { type: 'string', description: 'Columns to return when return=representation' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['table', 'records'],
    },
    annotations: {
      title: 'Upsert Records',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'sb_delete_records',
    description: 'Delete records from a Supabase table matching a filter. Filter is REQUIRED to prevent accidental full-table deletion. Use sb_list_records first to verify which records will be deleted.',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        filter: { type: 'string', description: 'PostgREST filter (REQUIRED). Example: id=eq.123 or status=eq.archived' },
        return: { type: 'string', enum: ['representation', 'minimal', 'headers-only'], description: 'Return preference' },
        select: { type: 'string', description: 'Columns to return when return=representation' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['table', 'filter'],
    },
    annotations: {
      title: 'Delete Records',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'sb_call_function',
    description: 'Call a stored PostgreSQL function (RPC) in Supabase. Use method=GET for immutable functions, POST for volatile ones (default).',
    inputSchema: {
      type: 'object',
      properties: {
        function_name: { type: 'string', description: 'PostgreSQL function name' },
        params: { type: 'object', description: 'Function parameters as key-value pairs' },
        method: { type: 'string', enum: ['GET', 'POST'], description: 'HTTP method. GET for immutable, POST for volatile (default: POST)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['function_name'],
    },
    annotations: {
      title: 'Call Function (RPC)',
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },

  // ========== Storage API (6) ==========
  {
    name: 'sb_list_buckets',
    description: 'List all storage buckets in the Supabase project. Returns bucket name, public status, size limits, and allowed MIME types.',
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
    },
    annotations: {
      title: 'List Storage Buckets',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'sb_create_bucket',
    description: 'Create a new storage bucket in Supabase. Set public=true for publicly accessible files. Optionally set file size limit and allowed MIME types.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Bucket name (unique identifier)' },
        public: { type: 'boolean', description: 'Whether files are publicly accessible (default: false)' },
        file_size_limit: { type: 'number', description: 'Maximum file size in bytes (e.g. 1048576 for 1MB)' },
        allowed_mime_types: { type: 'array', items: { type: 'string' }, description: 'Allowed MIME types. Example: ["image/png", "image/jpeg"]' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['name'],
    },
    annotations: {
      title: 'Create Storage Bucket',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  {
    name: 'sb_delete_bucket',
    description: 'Delete a storage bucket from Supabase. The bucket must be empty before deletion. Use sb_delete_objects to remove files first.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket_id: { type: 'string', description: 'Bucket ID/name to delete' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['bucket_id'],
    },
    annotations: {
      title: 'Delete Storage Bucket',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'sb_list_objects',
    description: 'List objects (files) in a Supabase storage bucket. Supports prefix filtering, pagination, and search.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string', description: 'Bucket name' },
        prefix: { type: 'string', description: 'Filter by path prefix (folder). Example: images/ or uploads/2026/' },
        limit: { type: 'number', description: 'Maximum number of objects to return (default: 100)' },
        offset: { type: 'number', description: 'Number of objects to skip' },
        search: { type: 'string', description: 'Search term to filter objects by name' },
        sort_column: { type: 'string', description: 'Column to sort by: name, created_at, updated_at' },
        sort_order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort order (default: asc)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['bucket'],
    },
    annotations: {
      title: 'List Storage Objects',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'sb_delete_objects',
    description: 'Delete one or more objects from a Supabase storage bucket. Provide an array of file paths to delete.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string', description: 'Bucket name' },
        prefixes: { type: 'array', items: { type: 'string' }, description: 'Array of file paths to delete. Example: ["images/photo.jpg", "uploads/doc.pdf"]' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['bucket', 'prefixes'],
    },
    annotations: {
      title: 'Delete Storage Objects',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'sb_create_signed_url',
    description: 'Create a temporary signed URL for a private storage object. The URL expires after the specified duration.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string', description: 'Bucket name' },
        path: { type: 'string', description: 'Object file path within the bucket' },
        expires_in: { type: 'number', description: 'URL expiration time in seconds (e.g. 3600 for 1 hour)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['bucket', 'path', 'expires_in'],
    },
    annotations: {
      title: 'Create Signed URL',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },

  // ========== Auth Admin API (5) ==========
  {
    name: 'sb_list_users',
    description: 'List all users in the Supabase Auth system. Returns paginated results with user details including email, metadata, and creation date.',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (starts at 1)' },
        per_page: { type: 'number', description: 'Users per page (default: 50, max: 1000)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
    },
    annotations: {
      title: 'List Users',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'sb_get_user',
    description: 'Get a single user by ID from Supabase Auth. Returns full user details including metadata, identities, and last sign-in.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'string', description: 'User UUID' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['user_id'],
    },
    annotations: {
      title: 'Get User',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'sb_create_user',
    description: 'Create a new user in Supabase Auth. Set email_confirm=true to skip email verification. Use app_metadata for admin-controlled data (roles, permissions).',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'User email address' },
        phone: { type: 'string', description: 'User phone number (E.164 format)' },
        password: { type: 'string', description: 'User password' },
        email_confirm: { type: 'boolean', description: 'Auto-confirm email (skip verification, default: false)' },
        phone_confirm: { type: 'boolean', description: 'Auto-confirm phone (default: false)' },
        user_metadata: { type: 'object', description: 'User-editable metadata (name, avatar, etc.)' },
        app_metadata: { type: 'object', description: 'Admin-only metadata (role, permissions, etc.)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
    },
    annotations: {
      title: 'Create User',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  {
    name: 'sb_update_user',
    description: 'Update a user in Supabase Auth. Can change email, phone, password, metadata, or ban the user.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'string', description: 'User UUID to update' },
        email: { type: 'string', description: 'New email address' },
        phone: { type: 'string', description: 'New phone number' },
        password: { type: 'string', description: 'New password' },
        email_confirm: { type: 'boolean', description: 'Auto-confirm new email' },
        phone_confirm: { type: 'boolean', description: 'Auto-confirm new phone' },
        user_metadata: { type: 'object', description: 'User-editable metadata to update' },
        app_metadata: { type: 'object', description: 'Admin-only metadata to update' },
        ban_duration: { type: 'string', description: 'Ban duration (e.g. "24h", "none" to unban)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['user_id'],
    },
    annotations: {
      title: 'Update User',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'sb_delete_user',
    description: 'Delete a user from Supabase Auth. This permanently removes the user and all their auth data.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'string', description: 'User UUID to delete' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['user_id'],
    },
    annotations: {
      title: 'Delete User',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },

  // ========== Management API — Projects (5) ==========
  {
    name: 'sb_list_projects',
    description: 'List all Supabase projects in your account. Returns project name, ref, region, status, and database info. Requires SUPABASE_ACCESS_TOKEN.',
    inputSchema: {
      type: 'object',
      properties: {
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
    },
    annotations: {
      title: 'List Projects',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'sb_get_project',
    description: 'Get details of a specific Supabase project by reference ID. Returns name, region, status, database host, and API URL.',
    inputSchema: {
      type: 'object',
      properties: {
        project_ref: { type: 'string', description: 'Project reference ID (e.g. abcdefghijklmnop)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['project_ref'],
    },
    annotations: {
      title: 'Get Project',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'sb_create_project',
    description: 'Create a new Supabase project. Requires organization ID, region, and database password. Project creation takes a few minutes.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' },
        organization_id: { type: 'string', description: 'Organization ID (from sb_list_projects or dashboard)' },
        region: { type: 'string', description: 'AWS region. Examples: us-east-1, eu-west-1, ap-southeast-1' },
        db_pass: { type: 'string', description: 'Database password (min 8 chars)' },
        plan: { type: 'string', enum: ['free', 'pro'], description: 'Project plan (default: free)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['name', 'organization_id', 'region', 'db_pass'],
    },
    annotations: {
      title: 'Create Project',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'sb_pause_project',
    description: 'Pause a Supabase project. Paused projects stop all services (database, auth, storage) and free up resources. Free tier projects auto-pause after inactivity.',
    inputSchema: {
      type: 'object',
      properties: {
        project_ref: { type: 'string', description: 'Project reference ID to pause' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['project_ref'],
    },
    annotations: {
      title: 'Pause Project',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'sb_restore_project',
    description: 'Restore a paused Supabase project. Restarts all services including database, auth, and storage.',
    inputSchema: {
      type: 'object',
      properties: {
        project_ref: { type: 'string', description: 'Project reference ID to restore' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['project_ref'],
    },
    annotations: {
      title: 'Restore Project',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },

  // ========== Management API — Database (3) ==========
  {
    name: 'sb_run_query',
    description: 'Execute a SQL query on a Supabase project database via the Management API. Supports SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, and all SQL. Returns query results as JSON.',
    inputSchema: {
      type: 'object',
      properties: {
        project_ref: { type: 'string', description: 'Project reference ID' },
        query: { type: 'string', description: 'SQL query to execute. Example: SELECT * FROM users LIMIT 10' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['project_ref', 'query'],
    },
    annotations: {
      title: 'Run SQL Query',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'sb_list_migrations',
    description: 'List database migrations for a Supabase project. Shows migration version, name, and status.',
    inputSchema: {
      type: 'object',
      properties: {
        project_ref: { type: 'string', description: 'Project reference ID' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['project_ref'],
    },
    annotations: {
      title: 'List Migrations',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'sb_get_typescript_types',
    description: 'Generate TypeScript type definitions from the Supabase project database schema. Useful for type-safe database access.',
    inputSchema: {
      type: 'object',
      properties: {
        project_ref: { type: 'string', description: 'Project reference ID' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['project_ref'],
    },
    annotations: {
      title: 'Get TypeScript Types',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },

  // ========== Management API — Edge Functions (2) ==========
  {
    name: 'sb_list_functions',
    description: 'List all Edge Functions deployed to a Supabase project. Returns function slug, name, status, and creation date.',
    inputSchema: {
      type: 'object',
      properties: {
        project_ref: { type: 'string', description: 'Project reference ID' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['project_ref'],
    },
    annotations: {
      title: 'List Edge Functions',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'sb_get_function',
    description: 'Get details of a specific Edge Function by slug. Returns function metadata, status, version, and entry point.',
    inputSchema: {
      type: 'object',
      properties: {
        project_ref: { type: 'string', description: 'Project reference ID' },
        function_slug: { type: 'string', description: 'Edge Function slug (URL-friendly name)' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['project_ref', 'function_slug'],
    },
    annotations: {
      title: 'Get Edge Function',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },

  // ========== Management API — Secrets & Keys (4) ==========
  {
    name: 'sb_list_secrets',
    description: 'List all secrets (environment variables) for a Supabase project. Returns secret names only (values are never exposed).',
    inputSchema: {
      type: 'object',
      properties: {
        project_ref: { type: 'string', description: 'Project reference ID' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['project_ref'],
    },
    annotations: {
      title: 'List Secrets',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'sb_create_secrets',
    description: 'Create or update secrets (environment variables) for a Supabase project. If a secret with the same name exists, it will be overwritten.',
    inputSchema: {
      type: 'object',
      properties: {
        project_ref: { type: 'string', description: 'Project reference ID' },
        secrets: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, value: { type: 'string' } }, required: ['name', 'value'] }, description: 'Array of {name, value} pairs. Example: [{"name":"API_KEY","value":"sk-xxx"}]' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['project_ref', 'secrets'],
    },
    annotations: {
      title: 'Create/Update Secrets',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'sb_delete_secrets',
    description: 'Delete secrets (environment variables) from a Supabase project by name.',
    inputSchema: {
      type: 'object',
      properties: {
        project_ref: { type: 'string', description: 'Project reference ID' },
        names: { type: 'array', items: { type: 'string' }, description: 'Array of secret names to delete. Example: ["API_KEY", "WEBHOOK_URL"]' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['project_ref', 'names'],
    },
    annotations: {
      title: 'Delete Secrets',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'sb_list_api_keys',
    description: 'List API keys for a Supabase project. Returns anon key, service_role key, and any custom keys with their names and roles.',
    inputSchema: {
      type: 'object',
      properties: {
        project_ref: { type: 'string', description: 'Project reference ID' },
        _fields: { type: 'string', description: 'Comma-separated list of fields to include in the response' },
      },
      required: ['project_ref'],
    },
    annotations: {
      title: 'List API Keys',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
];
