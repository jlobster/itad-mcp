# itad-mcp

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
git clone https://github.com/jlobster/itad-mcp.git
cd itad-mcp
npm install
pwd   # copy this path — you'll need it for the MCP client config
```

## Credentials

### Creating an app on IsThereAnyDeal

Both the API key and OAuth client ID come from the same app registration at <https://isthereanydeal.com/apps/my/>.

When creating the app:

- **App Name** — required; any name you like (e.g. `itad-mcp`)
- **Description** — optional
- **OAuth — app type** — select **"This app will NOT store OAuth secret securely"** (the implicit grant flow used here delivers the token directly in the redirect URL; no client secret exchange is needed)
- **Redirect URI** — set to `http://localhost`

After saving, the page shows your **Client ID** (used in the OAuth authorization URL below) and an **API Key**.

### API Key (price/deal endpoints)

Most read-only endpoints (prices, deals, search, game info) require an API key. Copy the API Key shown on your app's page.

### OAuth Token (account endpoints)

Endpoints that access your account — waitlist, collection, notes, notifications — require an OAuth token. The flow:

1. Create an app at <https://isthereanydeal.com/apps/my/> as described above (or use an existing one).
2. Open this URL in your browser, substituting your Client ID:
   ```
   https://isthereanydeal.com/oauth/authorize/?client_id=YOUR_CLIENT_ID&response_type=token&scope=waitlist_read+waitlist_write+collection_read+collection_write+notes_read+notes_write&redirect_uri=http://localhost
   ```
3. Authorize the app. ITAD redirects to `http://localhost` — the page won't load, but the access token is in the URL bar after `#access_token=`. Copy that token.

### Setting credentials via .env

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env   # macOS / Linux
copy .env.example .env  # Windows
```

`.env`:
```
ITAD_API_KEY=your_isthereanydeal_api_key
ITAD_OAUTH_TOKEN=your_oauth_token
```

The server loads this file automatically — no credentials needed in your MCP client config. `ITAD_OAUTH_TOKEN` is only needed if you use account endpoints.

Restrict the file to your user account only:

```bash
# macOS / Linux
chmod 600 .env

# Windows (PowerShell)
icacls .env /inheritance:r /grant:r "${env:USERNAME}:(R)"
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
      "args": ["/path/to/itad-mcp/src/index.js"]
    }
  }
}
```

The server loads credentials from the `.env` file in the project root automatically — no `env` block needed. If you prefer to set credentials as OS-level user environment variables instead of a `.env` file, those work too and take precedence.

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
