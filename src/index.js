import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const ITAD_BASE_URL = "https://api.isthereanydeal.com";
const API_KEY_ENV_NAMES = [
  "ITAD_API_KEY",
  "ISTHEREANYDEAL_API_KEY",
  "APIKEY",
  "apikey",
];

function getApiKey() {
  for (const envName of API_KEY_ENV_NAMES) {
    const value = process.env[envName];
    if (value && value.trim()) {
      return value.trim();
    }
  }

  throw new Error(
    `缺少 ITAD API Key。请设置环境变量之一: ${API_KEY_ENV_NAMES.join(", ")}`
  );
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

async function itadRequest(path, options = {}) {
  const {
    method = "GET",
    query = {},
    body,
    includeApiKey = true,
  } = options;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    appendQueryParam(params, key, value);
  }

  if (includeApiKey) {
    params.set("key", getApiKey());
  }

  const url = `${ITAD_BASE_URL}${path}${params.toString() ? `?${params.toString()}` : ""}`;
  const requestInit = {
    method,
    headers: {},
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

const server = new McpServer({
  name: "isthereanydeal-mcp",
  version: "0.1.0",
});

server.tool(
  "search_games",
  "按标题搜索 IsThereAnyDeal 游戏，返回匹配的游戏列表。",
  {
    title: z.string().min(1).describe("游戏标题关键字"),
    results: z.number().int().min(1).max(100).default(20).describe("返回结果数量，1-100"),
  },
  async ({ title, results }) => {
    try {
      const data = await itadRequest("/games/search/v1", {
        query: {
          title,
          results,
        },
      });

      return createTextResponse(data);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
);

server.tool(
  "get_game_prices",
  "查询一个或多个游戏在不同商店的价格信息。",
  {
    gameIds: z
      .array(z.string().uuid())
      .min(1)
      .max(200)
      .describe("游戏 UUID 列表，最多 200 个"),
    country: z.string().length(2).default("US").describe("国家代码，例如 US、CN"),
    dealsOnly: z.boolean().default(false).describe("仅返回在打折的价格"),
    vouchers: z.boolean().default(false).describe("是否允许带代金券价格"),
    capacity: z.number().int().min(0).default(0).describe("每个游戏返回的价格数量上限，0 表示不限制"),
    shops: z.array(z.number().int().positive()).optional().describe("可选商店 ID 列表"),
  },
  async ({ gameIds, country, dealsOnly, vouchers, capacity, shops }) => {
    try {
      const data = await itadRequest("/games/prices/v3", {
        method: "POST",
        query: {
          country: country.toUpperCase(),
          deals: dealsOnly,
          vouchers,
          capacity,
          shops,
        },
        body: gameIds,
      });

      return createTextResponse(data);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
);

server.tool(
  "list_deals",
  "获取当前优惠列表（对应 ITAD 网站 Deals 规则）。",
  {
    country: z.string().length(2).default("US").describe("国家代码，例如 US、CN"),
    offset: z.number().int().min(0).default(0).describe("分页偏移"),
    limit: z.number().int().min(1).max(200).default(20).describe("返回数量，1-200"),
    sort: z.string().optional().describe("排序，例如 -cut、price"),
    nondeals: z.boolean().default(false).describe("是否包含未打折价格"),
    mature: z.boolean().default(false).describe("是否包含成人内容"),
    shops: z.array(z.number().int().positive()).optional().describe("可选商店 ID 列表"),
    filter: z.string().optional().describe("ITAD 过滤表达式"),
  },
  async ({ country, offset, limit, sort, nondeals, mature, shops, filter }) => {
    try {
      const data = await itadRequest("/deals/v2", {
        query: {
          country: country.toUpperCase(),
          offset,
          limit,
          sort,
          nondeals,
          mature,
          shops,
          filter,
        },
      });

      return createTextResponse(data);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
);

server.tool(
  "list_shops",
  "获取 ITAD 支持的商店列表。",
  {
    country: z.string().length(2).default("US").describe("国家代码，例如 US、CN"),
  },
  async ({ country }) => {
    try {
      const data = await itadRequest("/service/shops/v1", {
        includeApiKey: false,
        query: {
          country: country.toUpperCase(),
        },
      });

      return createTextResponse(data);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
);

async function start() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

start().catch((error) => {
  console.error("MCP 服务启动失败:", error);
  process.exit(1);
});
