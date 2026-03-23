# isthereanydeal-mcp

基于 IsThereAnyDeal API 的 MCP（Model Context Protocol）服务。

## 设计原则

- 不提供任何“通用 API 调用”工具
- **每个 ITAD API operation 对应一个独立 MCP tool**
- 当前对官方 OpenAPI 的 53 个 operation 全量覆盖
- `apikey` 通过环境变量传入

## 功能

### 输入结构（所有 tool 统一）

每个 tool 都使用以下输入字段（按接口需要填写）：

- `pathParams`: 路径参数对象（例如 `{ "shopId": 61 }`）
- `query`: query 参数对象（例如 `{ "id": "uuid", "country": "US" }`）
- `headers`: 请求头对象（例如 `{ "ITAD-Profile": "xxx" }`）
- `body`: 请求体（对象或数组）
- `oauthToken`: OAuth token（仅 oauth 接口可用，可选）

每个 tool 会按对应 endpoint 自动校验必填参数。

### 调用说明

已补充完整调用文档（含鉴权、返回格式、示例、每个 tool 的必填参数）：

- [docs/CALLING_GUIDE.md](./docs/CALLING_GUIDE.md)

另外，为了让“只看 MCP 能力而看不到仓库文件”的 Agent 也能获取说明，服务额外暴露了两个 MCP Resource：

- `itad://guide/calling`：Markdown 调用说明（人类可读）
- `itad://endpoints/index.json`：53 个 tool 的机器可读元数据

## 环境要求

- Node.js 18+
- IsThereAnyDeal API Key（在 <https://isthereanydeal.com/apps/my/> 申请）

## 安装

```bash
npm install
```

## 配置 API Key（环境变量）

Key 鉴权接口需要设置以下任意一个环境变量：

- `ITAD_API_KEY`（推荐）
- `ISTHEREANYDEAL_API_KEY`
- `APIKEY`
- `apikey`

例如：

```bash
export ITAD_API_KEY="你的_isthereanydeal_api_key"
```

OAuth 接口可使用：

```bash
export ITAD_OAUTH_TOKEN="你的_oauth_token"
```

## 启动

```bash
npm start
```

服务使用 stdio 方式与 MCP Client 通信。

## 在 MCP Client 中配置示例

```json
{
  "mcpServers": {
    "isthereanydeal": {
      "command": "node",
      "args": ["/path/to/isthereanydeal-mcp/src/index.js"],
      "env": {
        "ITAD_API_KEY": "your_api_key"
      }
    }
  }
}
```

## 全量工具清单（53 个）

- `collection_copies_v1_delete` -> DELETE /collection/copies/v1
- `collection_copies_v1_get` -> GET /collection/copies/v1
- `collection_copies_v1_patch` -> PATCH /collection/copies/v1
- `collection_copies_v1_post` -> POST /collection/copies/v1
- `collection_games_v1_delete` -> DELETE /collection/games/v1
- `collection_games_v1_get` -> GET /collection/games/v1
- `collection_games_v1_put` -> PUT /collection/games/v1
- `collection_groups_v1_delete` -> DELETE /collection/groups/v1
- `collection_groups_v1_get` -> GET /collection/groups/v1
- `collection_groups_v1_patch` -> PATCH /collection/groups/v1
- `collection_groups_v1_post` -> POST /collection/groups/v1
- `deals_v2` -> GET /deals/v2
- `games_bundles_v2` -> GET /games/bundles/v2
- `games_history_v2` -> GET /games/history/v2
- `games_historylow_v1` -> POST /games/historylow/v1
- `games_info_v2` -> GET /games/info/v2
- `games_lookup_v1` -> GET /games/lookup/v1
- `games_overview_v2` -> POST /games/overview/v2
- `games_prices_v3` -> POST /games/prices/v3
- `games_search_v1` -> GET /games/search/v1
- `games_storelow_v2` -> POST /games/storelow/v2
- `games_subscriptions_v1` -> POST /games/subs/v1
- `internal_earlyaccess_v1` -> GET /internal/early-access/v1
- `internal_exfgls_v1` -> GET /internal/exfgls/v1
- `internal_hltb_v1` -> GET /internal/hltb/v1
- `internal_players_v1` -> GET /internal/players/v1
- `internal_rates_v1` -> GET /internal/rates/v1
- `internal_reviews_v1` -> GET /internal/reviews/v1
- `internal_twitchstream_v1` -> GET /internal/twitch/stream/v1
- `internal_wsgf_v1` -> GET /internal/wsgf/v1
- `lookup_gid_shopid_v1` -> POST /lookup/id/shop/{shopId}/v1
- `lookup_gid_title_v1` -> POST /lookup/id/title/v1
- `lookup_shopid_gid_v1` -> POST /lookup/shop/{shopId}/id/v1
- `notifications_list_v1_get` -> GET /notifications/v1
- `notifications_read_all_v1_put` -> PUT /notifications/read/all/v1
- `notifications_read_v1_put` -> PUT /notifications/read/v1
- `notifications_waitlist_v1_get` -> GET /notifications/waitlist/v1
- `profiles_link_v1_delete` -> DELETE /profiles/link/v1
- `profiles_link_v1_put` -> PUT /profiles/link/v1
- `profiles_sync_collection_v1_put` -> PUT /profiles/sync/collection/v1
- `profiles_sync_waitlist_v1_put` -> PUT /profiles/sync/waitlist/v1
- `service_shops_v1` -> GET /service/shops/v1
- `stats_most_collected_v1` -> GET /stats/most-collected/v1
- `stats_most_popular_v1` -> GET /stats/most-popular/v1
- `stats_most_waitlisted_v1` -> GET /stats/most-waitlisted/v1
- `stats_waitlist_v1` -> GET /stats/waitlist/v1
- `user_info_v2` -> GET /user/info/v2
- `user_notes_v1_delete` -> DELETE /user/notes/v1
- `user_notes_v1_get` -> GET /user/notes/v1
- `user_notes_v1_put` -> PUT /user/notes/v1
- `waitlist_games_v1_delete` -> DELETE /waitlist/games/v1
- `waitlist_games_v1_get` -> GET /waitlist/games/v1
- `waitlist_games_v1_put` -> PUT /waitlist/games/v1