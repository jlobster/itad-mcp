#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
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
    for (const item of value) {
      params.append(key, String(item));
    }
    return;
  }

  params.set(key, String(value));
}

function appendQueryParamCsv(params, key, value) {
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
    queryArrayFormat = "csv",
  } = options;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (queryArrayFormat === "csv") {
      appendQueryParamCsv(params, key, value);
    } else {
      appendQueryParam(params, key, value);
    }
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
    // ITAD 内部接口 internal/exfgls/v1 在 OpenAPI 中定义为 GET + required body。
    // WHATWG fetch 会直接拒绝此组合，这里改用 node:http(s) 原始请求保持兼容。
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
      `ITAD API 请求失败 (${status} ${statusText}): ${typeof parsed === "string" ? parsed : JSON.stringify(parsed)}`
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
  return `[${endpoint.method}] ${endpoint.path} - ${endpoint.summary}。${requiredText}。${authHint}。可读取资源 itad://guide/calling 获取完整调用说明。`;
}

function buildNamedObjectSchema(requiredKeys, valueSchema, description) {
  if (!requiredKeys.length) {
    return z.record(z.string(), valueSchema).optional().describe(`${description}（可选）`);
  }

  const shape = {};
  for (const key of requiredKeys) {
    shape[key] = valueSchema;
  }

  return z
    .object(shape)
    .catchall(valueSchema)
    .describe(`${description}，必填: ${requiredKeys.join(", ")}`);
}

function buildToolInputSchema(endpoint) {
  const requiredPathParams = REQUIRED_PATH_PARAMS[endpoint.tool] ?? [];
  const requiredQueryParams = REQUIRED_QUERY_PARAMS[endpoint.tool] ?? [];
  const requiredHeaders = REQUIRED_HEADER_PARAMS[endpoint.tool] ?? [];

  return {
    pathParams: buildNamedObjectSchema(
      requiredPathParams,
      primitiveValueSchema,
      "路径参数对象"
    ),
    query: buildNamedObjectSchema(requiredQueryParams, queryValueSchema, "Query 参数对象"),
    headers: buildNamedObjectSchema(requiredHeaders, z.string(), "请求头对象"),
    body: BODY_REQUIRED_TOOLS.has(endpoint.tool)
      ? z.any().describe("请求体（此接口必填）")
      : z.any().optional().describe("请求体（可选）"),
    oauthToken:
      endpoint.auth === "oauth"
        ? z
            .string()
            .optional()
            .describe(
              `OAuth token（可选；如未传则读取环境变量 ${OAUTH_TOKEN_ENV_NAMES.join(", ")}）`
            )
        : z.string().optional().describe("OAuth token（非 oauth 接口可忽略）"),
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
    "# IsThereAnyDeal MCP 调用说明",
    "",
    "该服务按 ITAD OpenAPI 一一映射 tool（53 个），不提供通用 API 调用工具。",
    "",
    "## 统一输入字段",
    "- pathParams: 路径参数对象",
    "- query: 查询参数对象",
    "- headers: 请求头对象",
    "- body: 请求体（部分接口必填）",
    "- oauthToken: OAuth token（仅 oauth 接口）",
    "",
    "## 鉴权",
    `- key: 自动使用环境变量 ${API_KEY_ENV_NAMES.join(", ")}`,
    `- oauth: 使用 oauthToken 或环境变量 ${OAUTH_TOKEN_ENV_NAMES.join(", ")}`,
    "- optional_key: 有 key 则自动附加",
    "",
    "## 端点清单",
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
  name: "isthereanydeal-mcp",
  version: "0.2.0",
});

const endpointMetadata = buildEndpointMetadata();
const callingGuideMarkdown = buildCallingGuideMarkdown(endpointMetadata);

server.registerResource(
  "calling-guide",
  "itad://guide/calling",
  {
    title: "ITAD MCP 调用说明",
    description: "面向 Agent 的可调用信息（输入结构、鉴权、端点必填项）",
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
    title: "ITAD MCP 端点索引",
    description: "53 个 MCP tools 的机器可读元数据",
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
        const shouldTryBothArrayFormats =
          endpoint.tool === "games_info_v2" && Array.isArray(finalQuery.id) && finalQuery.id.length > 1;
        const formatsToTry = shouldTryBothArrayFormats ? ["repeat", "csv"] : ["csv"];
        let data;
        let lastError;

        for (const queryArrayFormat of formatsToTry) {
          try {
            data = await itadRequest(finalPath, {
              method: endpoint.method,
              query: finalQuery,
              headers: finalHeaders,
              body,
              queryArrayFormat,
            });
            break;
          } catch (error) {
            lastError = error;
          }
        }

        if (data === undefined && lastError) {
          throw lastError;
        }

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
