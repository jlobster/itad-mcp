# isthereanydeal-mcp

基于 IsThereAnyDeal API 的 MCP（Model Context Protocol）服务，支持通过环境变量传入 API Key。

## 功能

当前提供 4 个 MCP Tools：

1. `search_games`：按标题搜索游戏  
2. `get_game_prices`：按游戏 UUID 查询价格  
3. `list_deals`：获取当前优惠列表  
4. `list_shops`：获取商店列表

## 环境要求

- Node.js 18+
- IsThereAnyDeal API Key（在 <https://isthereanydeal.com/apps/my/> 申请）

## 安装

```bash
npm install
```

## 配置 API Key（环境变量）

至少设置以下任意一个环境变量：

- `ITAD_API_KEY`（推荐）
- `ISTHEREANYDEAL_API_KEY`
- `APIKEY`
- `apikey`

例如：

```bash
export ITAD_API_KEY="你的_isthereanydeal_api_key"
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