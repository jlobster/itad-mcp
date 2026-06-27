# MCP Calling Guide (IsThereAnyDeal)

This document covers practical calling information for the **53 API tools** in this repository.

## 1. Input Structure (All Tools)

All tools share the same input schema:

```json
{
  "pathParams": {},
  "query": {},
  "headers": {},
  "body": null,
  "oauthToken": ""
}
```

Field descriptions:

- `pathParams`: Path parameters, e.g. `shopId` in `/lookup/id/shop/{shopId}/v1`
- `query`: Query string parameters
- `headers`: Request headers (e.g. `ITAD-Profile`)
- `body`: Request body (object or array)
- `oauthToken`: OAuth token (OAuth endpoints only; can also be set via environment variable)

> Only populate the fields required by the endpoint — unused fields can be omitted.

---

## 2. Authentication Rules

- `auth = key`: API Key required (injected automatically as `key` query param from env var)
- `auth = optional_key`: Optional API Key (injected if present)
- `auth = oauth`: OAuth token required (`oauthToken` param takes priority, then env var)
- `auth = none`: No authentication required

API Key environment variables (any one):

- `ITAD_API_KEY` (recommended)
- `ISTHEREANYDEAL_API_KEY`
- `APIKEY`
- `apikey`

OAuth environment variables (any one):

- `ITAD_OAUTH_TOKEN`
- `ISTHEREANYDEAL_OAUTH_TOKEN`

---

## 3. Response and Error Format

On success, MCP returns:

```json
{
  "content": [
    { "type": "text", "text": "<JSON string>" }
  ]
}
```

On failure, MCP returns:

```json
{
  "isError": true,
  "content": [
    { "type": "text", "text": "<error message>" }
  ]
}
```

---

## 4. Example Calls

### 4.1 Query Bundles Containing a Game

tool: `games_bundles_v2`  
endpoint: `GET /games/bundles/v2`  
auth: `key`  
required: `query.id`

```json
{
  "query": {
    "id": "01849783-6a26-7147-ab32-71804ca47e8e",
    "country": "US",
    "expired": false
  }
}
```

### 4.2 Search for a Game

tool: `games_search_v1`  
endpoint: `GET /games/search/v1`  
auth: `key`  
required: `query.title`

```json
{
  "query": {
    "title": "Baldur's Gate 3",
    "results": 10
  }
}
```

### 4.3 Batch Price Query

tool: `games_prices_v3`  
endpoint: `POST /games/prices/v3`  
auth: `key`  
required: `body`

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

### 4.4 Reverse Shop ID Lookup (with path parameter)

tool: `lookup_gid_shopid_v1`  
endpoint: `POST /lookup/id/shop/{shopId}/v1`  
auth: `optional_key`  
required: `pathParams.shopId`, `body`

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

### 4.5 OAuth Endpoint Example (Get User Info)

tool: `user_info_v2`  
endpoint: `GET /user/info/v2`  
auth: `oauth`

```json
{
  "oauthToken": "your_oauth_token"
}
```

### 4.6 Query Game Info (`games_info_v2`)

tool: `games_info_v2`  
endpoint: `GET /games/info/v2`  
auth: `key`  
required: `query.id`

```json
{
  "query": {
    "id": "01849783-6a26-7147-ab32-71804ca47e8e"
  }
}
```

> Note: `games_info_v2` `query.id` only supports a single string, not an array. For multiple games, call it once per ID.

---

## 5. Full Tool List with Required Parameters

### Games / Deals / Lookup / Service / Stats / Internal (API Key)

| tool | method | path | auth | required |
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

### Collection / Waitlist / Notes / Notifications / Profiles / User (OAuth)

| tool | method | path | auth | required |
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

## 6. Common Errors

- `missing required query/path/header parameter`: Supply the missing field per the docs above
- `requires a request body`: This endpoint must receive a body
- `requires an API Key`: Set `ITAD_API_KEY` or one of the other API key env vars
- `requires an OAuth Token`: Pass `oauthToken` or set an OAuth env var
- `ITAD API request failed (4xx/5xx)`: Upstream error or invalid parameters — check the response text
