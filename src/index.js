#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { z } from "zod";
import { config as dotenvConfig } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

dotenvConfig({ path: join(dirname(fileURLToPath(import.meta.url)), "..", ".env") });

const ITAD_BASE_URL = "https://api.isthereanydeal.com";
const API_KEY_ENV_NAMES = ["ITAD_API_KEY", "ISTHEREANYDEAL_API_KEY", "APIKEY", "apikey"];
const OAUTH_TOKEN_ENV_NAMES = ["ITAD_OAUTH_TOKEN", "ISTHEREANYDEAL_OAUTH_TOKEN"];

const ENDPOINTS = [
  { tool: "bundles_v1", method: "GET", path: "/bundles/v1", summary: "Bundle List", auth: "key" },
  { tool: "collection_copies_v1_delete", method: "DELETE", path: "/collection/copies/v1", summary: "Delete Copies", auth: "oauth" },
  { tool: "collection_copies_v1_get", method: "GET", path: "/collection/copies/v1", summary: "List Copies", auth: "oauth" },
  { tool: "collection_copies_v1_patch", method: "PATCH", path: "/collection/copies/v1", summary: "Update Copies", auth: "oauth" },
  { tool: "collection_copies_v1_post", method: "POST", path: "/collection/copies/v1", summary: "Add Copies", auth: "oauth" },
  { tool: "collection_games_v1_delete", method: "DELETE", path: "/collection/games/v1", summary: "Delete from Collection", auth: "oauth" },
  { tool: "collection_games_v1_get", method: "GET", path: "/collection/games/v1", summary: "Games in Collection", auth: "oauth" },
  { tool: "collection_games_v1_put", method: "PUT", path: "/collection/games/v1", summary: "Add to Collection", auth: "oauth" },
  { tool: "collection_groups_v1_delete", method: "DELETE", path: "/collection/groups/v1", summary: "Delete Categories", auth: "oauth" },
  { tool: "collection_groups_v1_get", method: "GET", path: "/collection/groups/v1", summary: "Get all Categories", auth: "oauth" },
  { tool: "collection_groups_v1_patch", method: "PATCH", path: "/collection/groups/v1", summary: "Update Categories", auth: "oauth" },
  { tool: "collection_groups_v1_post", method: "POST", path: "/collection/groups/v1", summary: "Create new Category", auth: "oauth" },
  { tool: "deals_post_v2", method: "POST", path: "/deals/v2", summary: "Deals List", auth: "key" },
  { tool: "deals_v2", method: "GET", path: "/deals/v2", summary: "Deals List", auth: "key" },
  { tool: "games_bundles_v2", method: "GET", path: "/games/bundles/v2", summary: "Bundles including Game", auth: "key" },
  { tool: "games_history_v2", method: "GET", path: "/games/history/v2", summary: "History log", auth: "key" },
  { tool: "games_historylow_v1", method: "POST", path: "/games/historylow/v1", summary: "History Low", auth: "key" },
  { tool: "games_info_v2", method: "GET", path: "/games/info/v2", summary: "Game Info", auth: "key" },
  { tool: "games_lookup_v1", method: "GET", path: "/games/lookup/v1", summary: "Lookup Game", auth: "key" },
  { tool: "games_overview_v2", method: "POST", path: "/games/overview/v2", summary: "Price Overview", auth: "key" },
  { tool: "games_prices_v3", method: "POST", path: "/games/prices/v3", summary: "Prices", auth: "key" },
  { tool: "games_search_v1", method: "GET", path: "/games/search/v1", summary: "Search", auth: "key" },
  { tool: "games_storelow_v2", method: "POST", path: "/games/storelow/v2", summary: "Store Low", auth: "key" },
  { tool: "games_subscriptions_v1", method: "POST", path: "/games/subs/v1", summary: "Game Subscriptions", auth: "key" },
  { tool: "internal_earlyaccess_v1", method: "GET", path: "/internal/early-access/v1", summary: "Early Access Games", auth: "key" },
  { tool: "internal_exfgls_v1", method: "GET", path: "/internal/exfgls/v1", summary: "Excluded from Family Sharing", auth: "key" },
  { tool: "internal_hltb_v1", method: "GET", path: "/internal/hltb/v1", summary: "HowLongToBeat Overview", auth: "key" },
  { tool: "internal_players_v1", method: "GET", path: "/internal/players/v1", summary: "Number of Players Statistics", auth: "key" },
  { tool: "internal_rates_v1", method: "GET", path: "/internal/rates/v1", summary: "Conversion Rates", auth: "key" },
  { tool: "internal_reviews_v1", method: "GET", path: "/internal/reviews/v1", summary: "Reviews Score", auth: "key" },
  { tool: "internal_twitchstream_v1", method: "GET", path: "/internal/twitch/stream/v1", summary: "Current stream of Twitch channel", auth: "key" },
  { tool: "internal_wsgf_v1", method: "GET", path: "/internal/wsgf/v1", summary: "WSGF Overview", auth: "key" },
  { tool: "lookup_gid_shopid_v1", method: "POST", path: "/lookup/id/shop/{shopId}/v1", summary: "Lookup ITAD game IDs by IDs on shop", auth: "optional_key" },
  { tool: "lookup_gid_title_v1", method: "POST", path: "/lookup/id/title/v1", summary: "Lookup ITAD game IDs by title", auth: "optional_key" },
  { tool: "lookup_shopid_gid_v1", method: "POST", path: "/lookup/shop/{shopId}/id/v1", summary: "Lookup game IDs on shop by ITAD game IDs", auth: "optional_key" },
  { tool: "ignored_games_v1_delete", method: "DELETE", path: "/ignored/games/v1", summary: "Delete from Ignore List", auth: "oauth" },
  { tool: "ignored_games_v1_get", method: "GET", path: "/ignored/games/v1", summary: "Games in Ignore List", auth: "oauth" },
  { tool: "ignored_games_v1_put", method: "PUT", path: "/ignored/games/v1", summary: "Add to Ignore List", auth: "oauth" },
  { tool: "notifications_list_v1_get", method: "GET", path: "/notifications/v1", summary: "List notifications", auth: "oauth" },
  { tool: "notifications_read_all_v1_put", method: "PUT", path: "/notifications/read/all/v1", summary: "Mark all notifications read", auth: "oauth" },
  { tool: "notifications_read_v1_put", method: "PUT", path: "/notifications/read/v1", summary: "Mark notification read", auth: "oauth" },
  { tool: "notifications_waitlist_v1_get", method: "GET", path: "/notifications/waitlist/v1", summary: "Waitlist notification detail", auth: "oauth" },
  { tool: "profiles_link_v1_delete", method: "DELETE", path: "/profiles/link/v1", summary: "Unlink profile", auth: "oauth" },
  { tool: "profiles_link_v1_put", method: "PUT", path: "/profiles/link/v1", summary: "Link profile", auth: "oauth" },
  { tool: "profiles_sync_collection_v1_put", method: "PUT", path: "/profiles/sync/collection/v1", summary: "Sync Collection", auth: "oauth" },
  { tool: "profiles_sync_waitlist_v1_put", method: "PUT", path: "/profiles/sync/waitlist/v1", summary: "Sync Waitlist", auth: "oauth" },
  { tool: "service_shops_map_v1", method: "GET", path: "/service/shops/map/v1", summary: "Shop Map", auth: "none" },
  { tool: "service_shops_v1", method: "GET", path: "/service/shops/v1", summary: "Active Shops", auth: "none" },
  { tool: "stats_most_collected_v1", method: "GET", path: "/stats/most-collected/v1", summary: "Most Collected", auth: "key" },
  { tool: "stats_most_popular_v1", method: "GET", path: "/stats/most-popular/v1", summary: "Most Popular", auth: "key" },
  { tool: "stats_most_waitlisted_v1", method: "GET", path: "/stats/most-waitlisted/v1", summary: "Most Waitlisted", auth: "key" },
  { tool: "stats_waitlist_v1", method: "GET", path: "/stats/waitlist/v1", summary: "Waitlist Stats", auth: "key" },
  { tool: "unstable_games_dots_v1", method: "GET", path: "/unstable/games/dots/v1", summary: "Game Changes", auth: "key" },
  { tool: "unstable_games_list_v1", method: "GET", path: "/unstable/games/list/v1", summary: "Game List", auth: "key" },
  { tool: "user_info_v2", method: "GET", path: "/user/info/v2", summary: "User Info", auth: "oauth" },
  { tool: "user_notes_v1_delete", method: "DELETE", path: "/user/notes/v1", summary: "Delete notes", auth: "oauth" },
  { tool: "user_notes_v1_get", method: "GET", path: "/user/notes/v1", summary: "Get notes", auth: "oauth" },
  { tool: "user_notes_v1_put", method: "PUT", path: "/user/notes/v1", summary: "Add or edit notes", auth: "oauth" },
  { tool: "waitlist_games_v1_delete", method: "DELETE", path: "/waitlist/games/v1", summary: "Delete from Waitlist", auth: "oauth" },
  { tool: "waitlist_games_v1_get", method: "GET", path: "/waitlist/games/v1", summary: "Games in Waitlist", auth: "oauth" },
  { tool: "waitlist_games_v1_put", method: "PUT", path: "/waitlist/games/v1", summary: "Add to Waitlist", auth: "oauth" },
  { tool: "webhooks_add_v1", method: "PUT", path: "/webhooks/v1", summary: "Add webhook", auth: "oauth" },
  { tool: "webhooks_delete_v1", method: "DELETE", path: "/webhooks/v1", summary: "Remove webhook", auth: "oauth" },
];

const REQUIRED_QUERY_PARAMS = {
  games_bundles_v2: ["id"],
  games_history_v2: ["id"],
  games_info_v2: ["id"],
  games_search_v1: ["title"],
  internal_hltb_v1: ["appid"],
  internal_players_v1: ["appid"],
  internal_reviews_v1: ["appid"],
  internal_twitchstream_v1: ["channel"],
  internal_wsgf_v1: ["appid"],
  notifications_read_v1_put: ["id"],
  notifications_waitlist_v1_get: ["id"],
  stats_waitlist_v1: ["id"],
};

const REQUIRED_HEADER_PARAMS = {
  profiles_link_v1_delete: ["ITAD-Profile"],
  profiles_sync_collection_v1_put: ["ITAD-Profile"],
  profiles_sync_waitlist_v1_put: ["ITAD-Profile"],
};

const REQUIRED_PATH_PARAMS = {
  lookup_gid_shopid_v1: ["shopId"],
  lookup_shopid_gid_v1: ["shopId"],
};

const BODY_REQUIRED_TOOLS = new Set([
  "deals_post_v2",
  "collection_copies_v1_delete",
  "collection_copies_v1_patch",
  "collection_copies_v1_post",
  "collection_games_v1_delete",
  "collection_games_v1_put",
  "collection_groups_v1_delete",
  "collection_groups_v1_patch",
  "collection_groups_v1_post",
  "games_historylow_v1",
  "games_overview_v2",
  "games_prices_v3",
  "games_storelow_v2",
  "games_subscriptions_v1",
  "ignored_games_v1_delete",
  "ignored_games_v1_put",
  "internal_exfgls_v1",
  "lookup_gid_shopid_v1",
  "lookup_gid_title_v1",
  "lookup_shopid_gid_v1",
  "profiles_link_v1_put",
  "profiles_sync_collection_v1_put",
  "profiles_sync_waitlist_v1_put",
  "user_notes_v1_delete",
  "user_notes_v1_put",
  "waitlist_games_v1_delete",
  "waitlist_games_v1_put",
  "webhooks_add_v1",
  "webhooks_delete_v1",
]);

const primitiveValueSchema = z.union([z.string(), z.number(), z.boolean()]);
const queryValueSchema = z.union([primitiveValueSchema, z.array(primitiveValueSchema)]);

function getFirstEnv(names) {
  for (const envName of names) {
    const value = process.env[envName];
    if (value && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function createTextResponse(payload) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

function createErrorResponse(error) {
  const message = error instanceof Error ? error.message : String(error);

  return {
    isError: true,
    content: [
      {
        type: "text",
        text: message,
      },
    ],
  };
}

function appendQueryParam(params, key, value) {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return;
    }

    params.set(key, value.join(","));
    return;
  }

  params.set(key, String(value));
}

function resolvePath(template, pathParams) {
  return template.replace(/\{([^}]+)\}/g, (_, key) => {
    if (pathParams[key] === undefined || pathParams[key] === null) {
      throw new Error(`Missing path parameter: ${key}`);
    }

    return encodeURIComponent(String(pathParams[key]));
  });
}

function ensureRequiredValues(tool, input) {
  const requiredPathParams = REQUIRED_PATH_PARAMS[tool] ?? [];
  const requiredQueryParams = REQUIRED_QUERY_PARAMS[tool] ?? [];
  const requiredHeaders = REQUIRED_HEADER_PARAMS[tool] ?? [];

  for (const key of requiredPathParams) {
    if (input.pathParams[key] === undefined || input.pathParams[key] === null) {
      throw new Error(`${tool} is missing required path parameter: ${key}`);
    }
  }

  for (const key of requiredQueryParams) {
    if (input.query[key] === undefined || input.query[key] === null) {
      throw new Error(`${tool} is missing required query parameter: ${key}`);
    }
  }

  for (const key of requiredHeaders) {
    if (!input.headers[key]) {
      throw new Error(`${tool} is missing required header: ${key}`);
    }
  }

  if (BODY_REQUIRED_TOOLS.has(tool) && input.body === undefined) {
    throw new Error(`${tool} requires a request body`);
  }

  if (tool === "games_info_v2" && Array.isArray(input.query.id)) {
    throw new Error("games_info_v2 query.id only supports a single string, not an array. Call it once per ID.");
  }
}

function applyAuth(endpoint, query, headers, oauthToken) {
  const apiKey = getFirstEnv(API_KEY_ENV_NAMES);

  if (endpoint.auth === "key") {
    if (!apiKey) {
      throw new Error(`Tool ${endpoint.tool} requires an API Key. Set one of these environment variables: ${API_KEY_ENV_NAMES.join(", ")}`);
    }

    query.key = apiKey;
    return;
  }

  if (endpoint.auth === "optional_key") {
    if (apiKey) {
      query.key = apiKey;
    }
    return;
  }

  if (endpoint.auth === "oauth") {
    const token = oauthToken?.trim() || getFirstEnv(OAUTH_TOKEN_ENV_NAMES);
    if (!token) {
      throw new Error(`Tool ${endpoint.tool} requires an OAuth Token. Pass oauthToken or set one of these environment variables: ${OAUTH_TOKEN_ENV_NAMES.join(", ")}`);
    }

    headers.Authorization = `Bearer ${token}`;
  }
}

async function itadRequest(path, options = {}) {
  const {
    method = "GET",
    query = {},
    body,
    headers = {},
  } = options;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    appendQueryParam(params, key, value);
  }

  const url = `${ITAD_BASE_URL}${path}${params.toString() ? `?${params.toString()}` : ""}`;
  const requestInit = {
    method,
    headers: { ...headers },
  };
  let bodyText;

  if (body !== undefined) {
    bodyText = JSON.stringify(body);
    requestInit.headers["Content-Type"] = "application/json";
    requestInit.headers["Content-Length"] = Buffer.byteLength(bodyText).toString();
    requestInit.body = bodyText;
  }
  let status;
  let statusText;
  let rawText;

  if ((method === "GET" || method === "HEAD") && bodyText !== undefined) {
    // The ITAD internal endpoint internal/exfgls/v1 is defined in the OpenAPI spec as GET with a required body.
    // WHATWG fetch rejects this combination, so we fall back to raw node:http(s) requests for compatibility.
    const requestFn = url.startsWith("https:") ? httpsRequest : httpRequest;
    const rawResponse = await new Promise((resolve, reject) => {
      const req = requestFn(url, { method, headers: requestInit.headers }, (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on("end", () => {
          resolve({
            status: res.statusCode ?? 0,
            statusText: res.statusMessage ?? "",
            rawText: Buffer.concat(chunks).toString("utf8"),
          });
        });
      });

      req.on("error", reject);
      req.write(bodyText);
      req.end();
    });

    status = rawResponse.status;
    statusText = rawResponse.statusText;
    rawText = rawResponse.rawText;
  } else {
    const response = await fetch(url, requestInit);
    status = response.status;
    statusText = response.statusText;
    rawText = await response.text();
  }

  let parsed;
  try {
    parsed = rawText ? JSON.parse(rawText) : null;
  } catch {
    parsed = rawText;
  }

  if (status < 200 || status >= 300) {
    throw new Error(
      `ITAD API request failed (${status} ${statusText}): ${typeof parsed === "string" ? parsed : JSON.stringify(parsed)}`
    );
  }

  return parsed;
}

function buildToolDescription(endpoint) {
  const requiredPathParams = REQUIRED_PATH_PARAMS[endpoint.tool] ?? [];
  const requiredQueryParams = REQUIRED_QUERY_PARAMS[endpoint.tool] ?? [];
  const requiredHeaders = REQUIRED_HEADER_PARAMS[endpoint.tool] ?? [];
  const required = [];

  if (requiredPathParams.length) {
    required.push(`path: ${requiredPathParams.join(", ")}`);
  }
  if (requiredQueryParams.length) {
    required.push(`query: ${requiredQueryParams.join(", ")}`);
  }
  if (requiredHeaders.length) {
    required.push(`headers: ${requiredHeaders.join(", ")}`);
  }
  if (BODY_REQUIRED_TOOLS.has(endpoint.tool)) {
    required.push("body");
  }

  let authHint = "No auth required";
  if (endpoint.auth === "key") {
    authHint = `Requires API Key (env: ${API_KEY_ENV_NAMES.join(", ")})`;
  } else if (endpoint.auth === "optional_key") {
    authHint = `Optional API Key (env: ${API_KEY_ENV_NAMES.join(", ")})`;
  } else if (endpoint.auth === "oauth") {
    authHint = `Requires OAuth Token (oauthToken param or env: ${OAUTH_TOKEN_ENV_NAMES.join(", ")})`;
  }

  const requiredText = required.length ? `Required: ${required.join(" | ")}` : "No additional required parameters";
  return `[${endpoint.method}] ${endpoint.path} - ${endpoint.summary}. ${requiredText}. ${authHint}. Read the itad://guide/calling resource for full usage documentation.`;
}

function buildNamedObjectSchema(requiredKeys, valueSchema, description) {
  if (!requiredKeys.length) {
    return z.record(z.string(), valueSchema).optional().describe(`${description} (optional)`);
  }

  const shape = {};
  for (const key of requiredKeys) {
    shape[key] = valueSchema;
  }

  return z
    .object(shape)
    .catchall(valueSchema)
    .describe(`${description}, required: ${requiredKeys.join(", ")}`);
}

function buildToolInputSchema(endpoint) {
  const requiredPathParams = REQUIRED_PATH_PARAMS[endpoint.tool] ?? [];
  const requiredQueryParams = REQUIRED_QUERY_PARAMS[endpoint.tool] ?? [];
  const requiredHeaders = REQUIRED_HEADER_PARAMS[endpoint.tool] ?? [];

  return {
    pathParams: buildNamedObjectSchema(
      requiredPathParams,
      primitiveValueSchema,
      "Path parameters"
    ),
    query: buildNamedObjectSchema(requiredQueryParams, queryValueSchema, "Query parameters"),
    headers: buildNamedObjectSchema(requiredHeaders, z.string(), "Request headers"),
    body: BODY_REQUIRED_TOOLS.has(endpoint.tool)
      ? z.any().describe("Request body (required for this endpoint)")
      : z.any().optional().describe("Request body (optional)"),
    oauthToken:
      endpoint.auth === "oauth"
        ? z
            .string()
            .optional()
            .describe(
              `OAuth token (optional; falls back to env vars ${OAUTH_TOKEN_ENV_NAMES.join(", ")})`
            )
        : z.string().optional().describe("OAuth token (ignored for non-OAuth endpoints)"),
  };
}

function buildEndpointMetadata() {
  return ENDPOINTS.map((endpoint) => ({
    ...endpoint,
    requiredPathParams: REQUIRED_PATH_PARAMS[endpoint.tool] ?? [],
    requiredQueryParams: REQUIRED_QUERY_PARAMS[endpoint.tool] ?? [],
    requiredHeaders: REQUIRED_HEADER_PARAMS[endpoint.tool] ?? [],
    bodyRequired: BODY_REQUIRED_TOOLS.has(endpoint.tool),
  }));
}

function buildCallingGuideMarkdown(metadata) {
  const lines = [
    "# IsThereAnyDeal MCP Calling Guide",
    "",
    "This server maps each ITAD OpenAPI operation to a dedicated MCP tool (63 total). No generic API call tool is provided.",
    "",
    "## Unified Input Fields",
    "- pathParams: path parameter object",
    "- query: query parameter object",
    "- headers: request headers object",
    "- body: request body (required for some endpoints)",
    "- oauthToken: OAuth token (OAuth endpoints only)",
    "",
    "## Authentication",
    `- key: API key injected automatically from env vars ${API_KEY_ENV_NAMES.join(", ")}`,
    `- oauth: uses oauthToken param or env vars ${OAUTH_TOKEN_ENV_NAMES.join(", ")}`,
    "- optional_key: API key injected if present",
    "",
    "## Endpoint List",
  ];

  for (const endpoint of metadata) {
    const required = [];
    if (endpoint.requiredPathParams.length) {
      required.push(`path:${endpoint.requiredPathParams.join(",")}`);
    }
    if (endpoint.requiredQueryParams.length) {
      required.push(`query:${endpoint.requiredQueryParams.join(",")}`);
    }
    if (endpoint.requiredHeaders.length) {
      required.push(`headers:${endpoint.requiredHeaders.join(",")}`);
    }
    if (endpoint.bodyRequired) {
      required.push("body");
    }

    lines.push(
      `- \`${endpoint.tool}\` -> ${endpoint.method} ${endpoint.path} | auth=${endpoint.auth} | required=${required.length ? required.join(" | ") : "-"}`
    );
  }

  return lines.join("\n");
}

const server = new McpServer({
  name: "itad-mcp",
  version: "0.2.0",
});

const endpointMetadata = buildEndpointMetadata();
const callingGuideMarkdown = buildCallingGuideMarkdown(endpointMetadata);

server.registerResource(
  "calling-guide",
  "itad://guide/calling",
  {
    title: "ITAD MCP Calling Guide",
    description: "Agent-facing calling reference (input structure, auth, required params per endpoint)",
    mimeType: "text/markdown",
  },
  async () => ({
    contents: [
      {
        uri: "itad://guide/calling",
        mimeType: "text/markdown",
        text: callingGuideMarkdown,
      },
    ],
  })
);

server.registerResource(
  "endpoint-index",
  "itad://endpoints/index.json",
  {
    title: "ITAD MCP Endpoint Index",
    description: "Machine-readable metadata for all 63 MCP tools",
    mimeType: "application/json",
  },
  async () => ({
    contents: [
      {
        uri: "itad://endpoints/index.json",
        mimeType: "application/json",
        text: JSON.stringify(endpointMetadata, null, 2),
      },
    ],
  })
);

for (const endpoint of ENDPOINTS) {
  server.tool(
    endpoint.tool,
    buildToolDescription(endpoint),
    buildToolInputSchema(endpoint),
    async ({ pathParams = {}, query = {}, headers = {}, body, oauthToken }) => {
      try {
        ensureRequiredValues(endpoint.tool, { pathParams, query, headers, body });

        const finalQuery = { ...query };
        const finalHeaders = { ...headers };
        applyAuth(endpoint, finalQuery, finalHeaders, oauthToken);
        const finalPath = resolvePath(endpoint.path, pathParams);
        const data = await itadRequest(finalPath, {
          method: endpoint.method,
          query: finalQuery,
          headers: finalHeaders,
          body,
        });

        return createTextResponse(data);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );
}

async function start() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

start().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
