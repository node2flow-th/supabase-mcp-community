# @node2flow/supabase-mcp

[![npm version](https://img.shields.io/npm/v/@node2flow/supabase-mcp.svg)](https://www.npmjs.com/package/@node2flow/supabase-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP server for **Supabase** — 31 tools for database CRUD, storage management, auth admin, project management, edge functions, and secrets via the Model Context Protocol.

## Quick Start

### Claude Desktop / Cursor

Add to your MCP config:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@node2flow/supabase-mcp"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key",
        "SUPABASE_ACCESS_TOKEN": "your-personal-access-token"
      }
    }
  }
}
```

> **Note:** `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are needed for database, storage, and auth tools. `SUPABASE_ACCESS_TOKEN` is needed for project management tools. You can configure one or both.

### HTTP Mode

```bash
SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx npx @node2flow/supabase-mcp --http
```

MCP endpoint: `http://localhost:3000/mcp`

### Cloudflare Worker

Available at: `https://supabase-mcp-community.node2flow.net/mcp`

```
POST https://supabase-mcp-community.node2flow.net/mcp?SUPABASE_URL=https://xxx.supabase.co&SUPABASE_SERVICE_ROLE_KEY=xxx&SUPABASE_ACCESS_TOKEN=xxx
```

---

## Tools (31)

### Database — REST API (6)

| Tool | Description |
|------|-------------|
| `sb_list_records` | List records with PostgREST filters, select, order, pagination |
| `sb_insert_records` | Insert one or more records |
| `sb_update_records` | Update records matching a filter (filter required) |
| `sb_upsert_records` | Upsert — insert or update on conflict |
| `sb_delete_records` | Delete records matching a filter (filter required) |
| `sb_call_function` | Call stored PostgreSQL function (RPC) |

### Storage (6)

| Tool | Description |
|------|-------------|
| `sb_list_buckets` | List all storage buckets |
| `sb_create_bucket` | Create bucket with public/private, size limit, MIME types |
| `sb_delete_bucket` | Delete empty bucket |
| `sb_list_objects` | List objects with prefix, search, pagination |
| `sb_delete_objects` | Delete objects by file path |
| `sb_create_signed_url` | Create temporary signed URL for private files |

### Auth Admin (5)

| Tool | Description |
|------|-------------|
| `sb_list_users` | List users (paginated) |
| `sb_get_user` | Get user by ID |
| `sb_create_user` | Create user with email/password, metadata |
| `sb_update_user` | Update user metadata, role, ban status |
| `sb_delete_user` | Delete user permanently |

### Management — Projects (5)

| Tool | Description |
|------|-------------|
| `sb_list_projects` | List all projects in account |
| `sb_get_project` | Get project details |
| `sb_create_project` | Create new project |
| `sb_pause_project` | Pause project (stop all services) |
| `sb_restore_project` | Restore paused project |

### Management — Database (3)

| Tool | Description |
|------|-------------|
| `sb_run_query` | Execute SQL query on project database |
| `sb_list_migrations` | List database migrations |
| `sb_get_typescript_types` | Generate TypeScript types from schema |

### Management — Edge Functions (2)

| Tool | Description |
|------|-------------|
| `sb_list_functions` | List deployed edge functions |
| `sb_get_function` | Get edge function details |

### Management — Secrets & Keys (4)

| Tool | Description |
|------|-------------|
| `sb_list_secrets` | List project secrets (names only) |
| `sb_create_secrets` | Create or update secrets |
| `sb_delete_secrets` | Delete secrets by name |
| `sb_list_api_keys` | List project API keys (anon, service_role) |

---

## Filter Syntax

The REST API uses PostgREST filter syntax:

```
# Comparison
age=gt.18                    # greater than
status=eq.active             # equals
price=lte.100               # less than or equal

# Pattern matching
name=ilike.*john*            # case-insensitive LIKE
email=like.*@gmail.com       # case-sensitive LIKE

# Lists and NULL
id=in.(1,2,3)               # IN list
deleted_at=is.null           # NULL check

# Logic
or=(age.lt.18,age.gt.65)    # OR conditions

# Full-text search
content=fts.supabase         # full-text search
```

---

## Resource Embedding (JOINs)

Query related tables using the `select` parameter:

```
*,orders(*)                         — embed all columns from related table
id,name,orders(id,total,status)     — specific columns
id,author:user_id(name,email)       — renamed embed
```

---

## Configuration

| Parameter | Required | For | Description |
|-----------|----------|-----|-------------|
| `SUPABASE_URL` | Yes* | REST/Storage/Auth | Project URL (`https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes* | REST/Storage/Auth | Service role key (bypasses RLS) |
| `SUPABASE_ACCESS_TOKEN` | No | Management API | Personal access token from dashboard |

*Required for database, storage, and auth tools. Management tools only need `SUPABASE_ACCESS_TOKEN`.

### Getting Your Keys

1. **Project URL + Service Role Key**: Go to your Supabase project → Settings → API
2. **Access Token**: Go to [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) → Generate new token

---

## Safety

- **Update and Delete require a filter** — prevents accidental full-table operations
- **Use `sb_list_records`** to verify filter matches before delete
- **Use `return="representation"`** to see what was changed
- **Service role key bypasses RLS** — use with caution in production

---

## License

MIT
