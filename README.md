# isthereanydeal-mcp

An MCP (Model Context Protocol) server for the IsThereAnyDeal API.

## Design Principles

- No generic "call any API" tool
- **Each ITAD API operation maps to a dedicated MCP tool**
- Full coverage of all 53 operations in the official OpenAPI spec
- API key is passed via environment variable

## Features

### Input Structure (All Tools)

Every tool uses the following input fields (populate only what the endpoint requires):

- `pathParams`: Path parameter object (e.g. `{ "shopId": 61 }`)
- `query`: Query parameter object (e.g. `{ "id": "uuid", "country": "US" }`)
- `headers`: Request headers object (e.g. `{ "ITAD-Profile": "xxx" }`)
- `body`: Request body (object or array)
- `oauthToken`: OAuth token (OAuth endpoints only, optional)

Each tool validates required parameters automatically for its corresponding endpoint.

### Documentation

Full calling documentation (auth, response format, examples, required params per tool):

- [docs/CALLING_GUIDE.md](./docs/CALLING_GUIDE.md)

The server also exposes two MCP Resources so agents that can't read repository files still have access to calling information:

- `itad://guide/calling`: Markdown calling guide (human-readable)
- `itad://endpoints/index.json`: Machine-readable metadata for all 53 tools

## Requirements

- Node.js 18+
- IsThereAnyDeal API Key (register at <https://isthereanydeal.com/apps/my/>)

## Installation

```bash
npm install
```

## API Key Configuration (Environment Variables)

Key-auth endpoints require one of the following environment variables:

- `ITAD_API_KEY` (recommended)
- `ISTHEREANYDEAL_API_KEY`
- `APIKEY`
- `apikey`

Example:

```bash
export ITAD_API_KEY="your_isthereanydeal_api_key"
```

For OAuth endpoints:

```bash
export ITAD_OAUTH_TOKEN="your_oauth_token"
```

## Starting the Server

```bash
npm start
```

The server communicates with MCP clients over stdio.

## MCP Client Configuration Example

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

## Full Tool List (53 tools)

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
