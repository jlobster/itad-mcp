import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const ITAD_BASE_URL = "https://api.isthereanydeal.com";
const API_KEY_ENV_NAMES = ["ITAD_API_KEY", "ISTHEREANYDEAL_API_KEY", "APIKEY", "apikey"];
const OAUTH_TOKEN_ENV_NAMES = ["ITAD_OAUTH_TOKEN", "ISTHEREANYDEAL_OAUTH_TOKEN"];

const ENDPOINTS = [
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
  { tool: "notifications_list_v1_get", method: "GET", path: "/notifications/v1", summary: "List notifications", auth: "oauth" },
  { tool: "notifications_read_all_v1_put", method: "PUT", path: "/notifications/read/all/v1", summary: "Mark all notifications read", auth: "oauth" },
  { tool: "notifications_read_v1_put", method: "PUT", path: "/notifications/read/v1", summary: "Mark notification read", auth: "oauth" },
  { tool: "notifications_waitlist_v1_get", method: "GET", path: "/notifications/waitlist/v1", summary: "Waitlist notification detail", auth: "oauth" },
  { tool: "profiles_link_v1_delete", method: "DELETE", path: "/profiles/link/v1", summary: "Unlink profile", auth: "oauth" },
  { tool: "profiles_link_v1_put", method: "PUT", path: "/profiles/link/v1", summary: "Link profile", auth: "oauth" },
  { tool: "profiles_sync_collection_v1_put", method: "PUT", path: "/profiles/sync/collection/v1", summary: "Sync Collection", auth: "oauth" },
  { tool: "profiles_sync_waitlist_v1_put", method: "PUT", path: "/profiles/sync/waitlist/v1", summary: "Sync Waitlist", auth: "oauth" },
  { tool: "service_shops_v1", method: "GET", path: "/service/shops/v1", summary: "Get Shops", auth: "none" },
  { tool: "stats_most_collected_v1", method: "GET", path: "/stats/most-collected/v1", summary: "Most Collected", auth: "key" },
  { tool: "stats_most_popular_v1", method: "GET", path: "/stats/most-popular/v1", summary: "Most Popular", auth: "key" },
  { tool: "stats_most_waitlisted_v1", method: "GET", path: "/stats/most-waitlisted/v1", summary: "Most Waitlisted", auth: "key" },
  { tool: "stats_waitlist_v1", method: "GET", path: "/stats/waitlist/v1", summary: "Waitlist Stats", auth: "key" },
  { tool: "user_info_v2", method: "GET", path: "/user/info/v2", summary: "User Info", auth: "oauth" },
  { tool: "user_notes_v1_delete", method: "DELETE", path: "/user/notes/v1", summary: "Delete notes", auth: "oauth" },
  { tool: "user_notes_v1_get", method: "GET", path: "/user/notes/v1", summary: "Get notes", auth: "oauth" },
  { tool: "user_notes_v1_put", method: "PUT", path: "/user/notes/v1", summary: "Add or edit notes", auth: "oauth" },
  { tool: "waitlist_games_v1_delete", method: "DELETE", path: "/waitlist/games/v1", summary: "Delete from Waitlist", auth: "oauth" },
  { tool: "waitlist_games_v1_get", method: "GET", path: "/waitlist/games/v1", summary: "Games in Waitlist", auth: "oauth" },
  { tool: "waitlist_games_v1_put", method: "PUT", path: "/waitlist/games/v1", summary: "Add to Waitlist", auth: "oauth" },
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
]);

const primitiveValueSchema = z.union([z.string(), z.number(), z.boolean()]);
const queryValueSchema = z.union([primitiveValueSchema, z.array(primitiveValueSchema)]);

const endpointInputSchema = {
  pathParams: z.record(z.string(), primitiveValueSchema).optional().describe("路径参数对象，只有带 {param} 的端点需要"),
  query: z.record(z.string(), queryValueSchema).optional().describe("Query 参数对象"),
  headers: z.record(z.string(), z.string()).optional().describe("请求头对象（如 ITAD-Profile）"),
  body: z.any().optional().describe("请求体（对象或数组）"),
  oauthToken: z.string().optional().describe("OAuth token；oauth 接口可传入，或使用环境变量"),
};

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
      throw new Error(`缺少路径参数: ${key}`);
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
      throw new Error(`${tool} 缺少必填 path 参数: ${key}`);
    }
  }

  for (const key of requiredQueryParams) {
    if (input.query[key] === undefined || input.query[key] === null) {
      throw new Error(`${tool} 缺少必填 query 参数: ${key}`);
    }
  }

  for (const key of requiredHeaders) {
    if (!input.headers[key]) {
      throw new Error(`${tool} 缺少必填 header: ${key}`);
    }
  }

  if (BODY_REQUIRED_TOOLS.has(tool) && input.body === undefined) {
    throw new Error(`${tool} 需要 body`);
  }
}

function applyAuth(endpoint, query, headers, oauthToken) {
  const apiKey = getFirstEnv(API_KEY_ENV_NAMES);

  if (endpoint.auth === "key") {
    if (!apiKey) {
      throw new Error(`接口 ${endpoint.tool} 需要 API Key，请设置环境变量: ${API_KEY_ENV_NAMES.join(", ")}`);
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
      throw new Error(`接口 ${endpoint.tool} 需要 OAuth Token。请传入 oauthToken 或设置环境变量: ${OAUTH_TOKEN_ENV_NAMES.join(", ")}`);
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

  if (body !== undefined) {
    requestInit.headers["Content-Type"] = "application/json";
    requestInit.body = JSON.stringify(body);
  }

  const response = await fetch(url, requestInit);
  const rawText = await response.text();

  let parsed;
  try {
    parsed = rawText ? JSON.parse(rawText) : null;
  } catch {
    parsed = rawText;
  }

  if (!response.ok) {
    throw new Error(
      `ITAD API 请求失败 (${response.status} ${response.statusText}): ${typeof parsed === "string" ? parsed : JSON.stringify(parsed)}`
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

  let authHint = "无需鉴权";
  if (endpoint.auth === "key") {
    authHint = `需要 API Key（环境变量: ${API_KEY_ENV_NAMES.join(", ")}）`;
  } else if (endpoint.auth === "optional_key") {
    authHint = `可选 API Key（环境变量: ${API_KEY_ENV_NAMES.join(", ")}）`;
  } else if (endpoint.auth === "oauth") {
    authHint = `需要 OAuth Token（oauthToken 或环境变量: ${OAUTH_TOKEN_ENV_NAMES.join(", ")}）`;
  }

  const requiredText = required.length ? `必填: ${required.join(" | ")}` : "无额外必填参数";
  return `[${endpoint.method}] ${endpoint.path} - ${endpoint.summary}。${requiredText}。${authHint}。`;
}

const server = new McpServer({
  name: "isthereanydeal-mcp",
  version: "0.2.0",
});

for (const endpoint of ENDPOINTS) {
  server.tool(
    endpoint.tool,
    buildToolDescription(endpoint),
    endpointInputSchema,
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
  console.error("MCP 服务启动失败:", error);
  process.exit(1);
});
