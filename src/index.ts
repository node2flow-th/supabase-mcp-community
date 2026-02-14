#!/usr/bin/env node
/**
 * Supabase MCP Server
 *
 * Community edition — connects to Supabase REST API + Management API.
 *
 * Usage (stdio - for Claude Desktop / Cursor / VS Code):
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx npx @node2flow/supabase-mcp
 *
 * Usage (HTTP - Streamable HTTP transport):
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx npx @node2flow/supabase-mcp --http
 */

import { randomUUID } from 'node:crypto';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  StreamableHTTPServerTransport,
} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';

import { createServer } from './server.js';
import { TOOLS } from './tools.js';
import type { FullConfig } from './types.js';

/**
 * Read config from environment variables
 */
function getConfig(): FullConfig | null {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

  if (!url && !accessToken) {
    return null;
  }

  return {
    url: url || undefined,
    serviceRoleKey: serviceRoleKey || undefined,
    accessToken: accessToken || undefined,
  };
}

/**
 * Start in stdio mode (for Claude Desktop, Cursor, VS Code)
 */
async function startStdio() {
  const config = getConfig();
  const server = createServer(config ?? undefined);
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Supabase MCP Server running on stdio');
  console.error(`Supabase URL: ${config?.url || '(not configured)'}`);
  console.error(`Service Role Key: ${config?.serviceRoleKey ? '***configured***' : '(not configured)'}`);
  console.error(`Access Token: ${config?.accessToken ? '***configured***' : '(not configured — management API disabled)'}`);
  console.error(`Tools available: ${TOOLS.length}`);
  console.error('Ready for MCP client\n');
}

/**
 * Start in HTTP mode (Streamable HTTP transport)
 */
async function startHttp() {
  const port = parseInt(process.env.PORT || '3000', 10);
  const app = createMcpExpressApp({ host: '0.0.0.0' });

  const transports: Record<string, StreamableHTTPServerTransport> = {};

  app.post('/mcp', async (req: any, res: any) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const qUrl = url.searchParams.get('SUPABASE_URL');
    const qKey = url.searchParams.get('SUPABASE_SERVICE_ROLE_KEY');
    const qToken = url.searchParams.get('SUPABASE_ACCESS_TOKEN');
    if (qUrl) process.env.SUPABASE_URL = qUrl;
    if (qKey) process.env.SUPABASE_SERVICE_ROLE_KEY = qKey;
    if (qToken) process.env.SUPABASE_ACCESS_TOKEN = qToken;

    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    try {
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        transport = transports[sessionId];
      } else if (!sessionId && isInitializeRequest(req.body)) {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sid: string) => {
            transports[sid] = transport;
          },
        });

        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid && transports[sid]) {
            delete transports[sid];
          }
        };

        const config = getConfig();
        const server = createServer(config ?? undefined);
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return;
      } else {
        res.status(400).json({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Bad Request: No valid session ID provided' },
          id: null,
        });
        return;
      }

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    }
  });

  app.get('/mcp', async (req: any, res: any) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }
    await transports[sessionId].handleRequest(req, res);
  });

  app.delete('/mcp', async (req: any, res: any) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }
    await transports[sessionId].handleRequest(req, res);
  });

  app.get('/', (_req: any, res: any) => {
    res.json({
      name: 'supabase-mcp',
      version: '1.0.0',
      status: 'ok',
      tools: TOOLS.length,
      transport: 'streamable-http',
      endpoints: { mcp: '/mcp' },
    });
  });

  const config = getConfig();
  app.listen(port, () => {
    console.log(`Supabase MCP Server (HTTP) listening on port ${port}`);
    console.log(`Supabase URL: ${config?.url || '(not configured)'}`);
    console.log(`Service Role Key: ${config?.serviceRoleKey ? '***configured***' : '(not configured)'}`);
    console.log(`Access Token: ${config?.accessToken ? '***configured***' : '(not configured)'}`);
    console.log(`Tools available: ${TOOLS.length}`);
    console.log(`MCP endpoint: http://localhost:${port}/mcp`);
  });

  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    for (const sessionId in transports) {
      try {
        await transports[sessionId].close();
        delete transports[sessionId];
      } catch {
        // Ignore cleanup errors
      }
    }
    process.exit(0);
  });
}

async function main() {
  const useHttp = process.argv.includes('--http');
  if (useHttp) {
    await startHttp();
  } else {
    await startStdio();
  }
}

/**
 * Smithery default export
 */
export default function createSmitheryServer(opts?: {
  config?: { SUPABASE_URL?: string; SUPABASE_SERVICE_ROLE_KEY?: string; SUPABASE_ACCESS_TOKEN?: string };
}) {
  if (opts?.config?.SUPABASE_URL) process.env.SUPABASE_URL = opts.config.SUPABASE_URL;
  if (opts?.config?.SUPABASE_SERVICE_ROLE_KEY) process.env.SUPABASE_SERVICE_ROLE_KEY = opts.config.SUPABASE_SERVICE_ROLE_KEY;
  if (opts?.config?.SUPABASE_ACCESS_TOKEN) process.env.SUPABASE_ACCESS_TOKEN = opts.config.SUPABASE_ACCESS_TOKEN;
  const config = getConfig();
  return createServer(config ?? undefined);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
