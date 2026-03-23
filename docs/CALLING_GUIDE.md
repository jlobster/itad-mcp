# MCP 调用指南（IsThereAnyDeal）

本文档补充“如何调用 tool”的实操信息，适用于本仓库中 **53 个 API 对应 tool**。

## 1. 调用输入结构（统一）

所有 tool 的输入 schema 统一为：

```json
{
  "pathParams": {},
  "query": {},
  "headers": {},
  "body": null,
  "oauthToken": ""
}
```

字段含义：

- `pathParams`：路径参数，例如 `/lookup/id/shop/{shopId}/v1` 里的 `shopId`
- `query`：查询参数
- `headers`：请求头（如 `ITAD-Profile`）
- `body`：请求体（对象或数组）
- `oauthToken`：OAuth token（仅 OAuth 接口需要；也可用环境变量）

> 说明：按接口需要填写，不需要的字段可以省略。

---

## 2. 鉴权规则

- `auth = key`：必须有 API Key（自动从环境变量注入 `key` 查询参数）
- `auth = optional_key`：可选 API Key（有则自动注入）
- `auth = oauth`：必须有 OAuth token（优先 `oauthToken` 入参，其次环境变量）
- `auth = none`：无需鉴权

API Key 环境变量（任一）：

- `ITAD_API_KEY`（推荐）
- `ISTHEREANYDEAL_API_KEY`
- `APIKEY`
- `apikey`

OAuth 环境变量（任一）：

- `ITAD_OAUTH_TOKEN`
- `ISTHEREANYDEAL_OAUTH_TOKEN`

---

## 3. 返回与错误格式

成功时，MCP 返回：

```json
{
  "content": [
    { "type": "text", "text": "JSON字符串" }
  ]
}
```

失败时，MCP 返回：

```json
{
  "isError": true,
  "content": [
    { "type": "text", "text": "错误信息" }
  ]
}
```

---

## 4. 典型调用示例

### 4.1 查询慈善包/Bundle 内游戏（你提到的场景）

tool: `games_bundles_v2`  
endpoint: `GET /games/bundles/v2`  
鉴权：`key`  
必填：`query.id`

```json
{
  "query": {
    "id": "01849783-6a26-7147-ab32-71804ca47e8e",
    "country": "US",
    "expired": false
  }
}
```

### 4.2 搜索游戏

tool: `games_search_v1`  
endpoint: `GET /games/search/v1`  
鉴权：`key`  
必填：`query.title`

```json
{
  "query": {
    "title": "Baldur's Gate 3",
    "results": 10
  }
}
```

### 4.3 查询价格（批量）

tool: `games_prices_v3`  
endpoint: `POST /games/prices/v3`  
鉴权：`key`  
必填：`body`

```json
{
  "query": {
    "country": "US",
    "deals": true,
    "shops": [61, 35]
  },
  "body": [
    "01849783-6a26-7147-ab32-71804ca47e8e",
    "01849782-1017-7389-8de4-c97c587fd7e3"
  ]
}
```

### 4.4 Shop ID 反查（带 path 参数）

tool: `lookup_gid_shopid_v1`  
endpoint: `POST /lookup/id/shop/{shopId}/v1`  
鉴权：`optional_key`  
必填：`pathParams.shopId`、`body`

```json
{
  "pathParams": {
    "shopId": 61
  },
  "body": [
    "app/620",
    "app/730"
  ]
}
```

### 4.5 OAuth 接口示例（获取用户信息）

tool: `user_info_v2`  
endpoint: `GET /user/info/v2`  
鉴权：`oauth`

```json
{
  "oauthToken": "your_oauth_token"
}
```

### 4.6 查询游戏信息（`games_info_v2`）

tool: `games_info_v2`  
endpoint: `GET /games/info/v2`  
鉴权：`key`  
必填：`query.id`

```json
{
  "query": {
    "id": "01849783-6a26-7147-ab32-71804ca47e8e"
  }
}
```

> 注意：`games_info_v2` 的 `query.id` 仅支持单个字符串，不支持数组。批量场景请逐条调用。

---

## 5. 全量工具分组与必填参数

### Games / Deals / Lookup / Service / Stats / Internal（主要 API Key）

| tool | method | path | auth | 必填 |
|---|---|---|---|---|
| `deals_v2` | GET | `/deals/v2` | key | - |
| `games_bundles_v2` | GET | `/games/bundles/v2` | key | query:`id` |
| `games_history_v2` | GET | `/games/history/v2` | key | query:`id` |
| `games_historylow_v1` | POST | `/games/historylow/v1` | key | body |
| `games_info_v2` | GET | `/games/info/v2` | key | query:`id` |
| `games_lookup_v1` | GET | `/games/lookup/v1` | key | - |
| `games_overview_v2` | POST | `/games/overview/v2` | key | body |
| `games_prices_v3` | POST | `/games/prices/v3` | key | body |
| `games_search_v1` | GET | `/games/search/v1` | key | query:`title` |
| `games_storelow_v2` | POST | `/games/storelow/v2` | key | body |
| `games_subscriptions_v1` | POST | `/games/subs/v1` | key | body |
| `lookup_gid_shopid_v1` | POST | `/lookup/id/shop/{shopId}/v1` | optional_key | path:`shopId`, body |
| `lookup_gid_title_v1` | POST | `/lookup/id/title/v1` | optional_key | body |
| `lookup_shopid_gid_v1` | POST | `/lookup/shop/{shopId}/id/v1` | optional_key | path:`shopId`, body |
| `service_shops_v1` | GET | `/service/shops/v1` | none | - |
| `stats_most_collected_v1` | GET | `/stats/most-collected/v1` | key | - |
| `stats_most_popular_v1` | GET | `/stats/most-popular/v1` | key | - |
| `stats_most_waitlisted_v1` | GET | `/stats/most-waitlisted/v1` | key | - |
| `stats_waitlist_v1` | GET | `/stats/waitlist/v1` | key | query:`id` |
| `internal_earlyaccess_v1` | GET | `/internal/early-access/v1` | key | - |
| `internal_exfgls_v1` | GET | `/internal/exfgls/v1` | key | body |
| `internal_hltb_v1` | GET | `/internal/hltb/v1` | key | query:`appid` |
| `internal_players_v1` | GET | `/internal/players/v1` | key | query:`appid` |
| `internal_rates_v1` | GET | `/internal/rates/v1` | key | - |
| `internal_reviews_v1` | GET | `/internal/reviews/v1` | key | query:`appid` |
| `internal_twitchstream_v1` | GET | `/internal/twitch/stream/v1` | key | query:`channel` |
| `internal_wsgf_v1` | GET | `/internal/wsgf/v1` | key | query:`appid` |

### Collection / Waitlist / Notes / Notifications / Profiles / User（OAuth）

| tool | method | path | auth | 必填 |
|---|---|---|---|---|
| `collection_copies_v1_delete` | DELETE | `/collection/copies/v1` | oauth | body |
| `collection_copies_v1_get` | GET | `/collection/copies/v1` | oauth | - |
| `collection_copies_v1_patch` | PATCH | `/collection/copies/v1` | oauth | body |
| `collection_copies_v1_post` | POST | `/collection/copies/v1` | oauth | body |
| `collection_games_v1_delete` | DELETE | `/collection/games/v1` | oauth | body |
| `collection_games_v1_get` | GET | `/collection/games/v1` | oauth | - |
| `collection_games_v1_put` | PUT | `/collection/games/v1` | oauth | body |
| `collection_groups_v1_delete` | DELETE | `/collection/groups/v1` | oauth | body |
| `collection_groups_v1_get` | GET | `/collection/groups/v1` | oauth | - |
| `collection_groups_v1_patch` | PATCH | `/collection/groups/v1` | oauth | body |
| `collection_groups_v1_post` | POST | `/collection/groups/v1` | oauth | body |
| `notifications_list_v1_get` | GET | `/notifications/v1` | oauth | - |
| `notifications_read_all_v1_put` | PUT | `/notifications/read/all/v1` | oauth | - |
| `notifications_read_v1_put` | PUT | `/notifications/read/v1` | oauth | query:`id` |
| `notifications_waitlist_v1_get` | GET | `/notifications/waitlist/v1` | oauth | query:`id` |
| `profiles_link_v1_delete` | DELETE | `/profiles/link/v1` | oauth | headers:`ITAD-Profile` |
| `profiles_link_v1_put` | PUT | `/profiles/link/v1` | oauth | body |
| `profiles_sync_collection_v1_put` | PUT | `/profiles/sync/collection/v1` | oauth | headers:`ITAD-Profile`, body |
| `profiles_sync_waitlist_v1_put` | PUT | `/profiles/sync/waitlist/v1` | oauth | headers:`ITAD-Profile`, body |
| `user_info_v2` | GET | `/user/info/v2` | oauth | - |
| `user_notes_v1_delete` | DELETE | `/user/notes/v1` | oauth | body |
| `user_notes_v1_get` | GET | `/user/notes/v1` | oauth | - |
| `user_notes_v1_put` | PUT | `/user/notes/v1` | oauth | body |
| `waitlist_games_v1_delete` | DELETE | `/waitlist/games/v1` | oauth | body |
| `waitlist_games_v1_get` | GET | `/waitlist/games/v1` | oauth | - |
| `waitlist_games_v1_put` | PUT | `/waitlist/games/v1` | oauth | body |

---

## 6. 常见报错说明

- `缺少必填 query/path/header 参数`：按文档补齐对应字段
- `需要 body`：该接口必须传请求体
- `需要 API Key`：设置 `ITAD_API_KEY` 等环境变量
- `需要 OAuth Token`：传入 `oauthToken` 或设置 OAuth 环境变量
- `ITAD API 请求失败 (4xx/5xx)`：上游接口错误或参数不合法，查看返回文本
