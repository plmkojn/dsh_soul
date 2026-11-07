# DSH Soul · 大肥鱼

[中文](README.zh-CN.md) | English

A persistent AI companion plugin for **DeepSeek Harness**. It gives one agent a face, a mood, a bond meter, a diary, switchable personas, and a small floating chat panel — without giving it control of your local computer.

> Unofficial community plugin. Not affiliated with DeepSeek.

## Features

- **Floating companion panel**: a mood orb in the bottom-right corner that opens into a status card and chat.
- **Living state**: mood (0–100), energy (0–90, shown on a 0–100 bar), affection (0–100), current activity, and inner thought.
- **Real clock awareness**: the panel shows the current time and period; the companion can call `soul_clock` for the exact time.
- **Daily rhythm**: energy starts at 90 at 08:00, falls to 10 at 23:00, and reaches 0 after enough late-night chats. At 0 the model is not woken; the panel shows a system reply instead.
- **Affection**: kind messages raise it by `+0.1` to `+0.5`; harsh messages lower it by `-0.2` to `-0.6`; silence drains it by `0.1` every 10 minutes.
- **Personas**: 大肥鱼 (default), 小深, 夜灯, plus a custom persona editor.
- **Per-persona diaries**: one local Markdown file per persona, with an index and an “open diary folder” action.
- **New chat**: clears the conversation while keeping diaries, mood, energy, affection, and the current persona.
- **No local computer control**: the companion has no shell, local file read/write/search, job, subagent, or workflow tools. It can chat, use web search/fetch, and update its own state.

## Install

Requirements:

- DeepSeek Harness `0.2.2-rc.1` or newer.
- A configured model in Harness.

From a checkout:

```powershell
git clone https://github.com/plmkojn/dsh_soul.git
```

1. Open DeepSeek Harness → **Plugin Manager**.
2. Choose **Install bundle** and select the cloned `dsh_soul` directory.
3. Refresh the Web page.

The companion ball appears at the bottom-right. Click it to open the panel.


## Data and privacy

State is stored outside this repository:

- `~/.dsh-soul/` by default.
- `$DSH_PROFILE_DIR/soul/` when Harness provides a profile directory.

Contents include `state.json`, the `home/` folder, and `diaries/`. The diary folder contains one file per persona and an `index.md`.

Never commit `state.json`, `diaries/`, or screenshots containing private chats.

## Security

- The companion is **chat-only**. It cannot run commands, read/write local files, control programs, spawn subagents, or run workflows.
- The panel API (`/soul-api`) is served by the local Harness Web server. It is intended for loopback use only. Do not expose the Harness Web UI to a LAN or the public internet while this plugin is enabled.
- The default tool approval policy is `ask`. You can change it in the panel settings.
- Web search/fetch remains available. If you do not want internet access either, deny those two tools in `index.js`.

## Compatibility

- Tested with DeepSeek Harness `0.2.2-rc.1`.
- Plain JavaScript, no build step, no runtime dependencies.
- The package declares `engines.dsh`.

## Development

```powershell
npm run check
```

The check runs `node --check` on `index.js` and `client.js`.

There is no automated UI test suite. For manual testing, verify:

- The orb appears and opens the panel.
- Chat sends and receives a reply.
- Persona switching and custom persona saving work.
- The diary folder opens and contains one file per persona.
- “New chat” clears messages but keeps the diary and current state.
- The companion cannot call shell or local file tools.

## License

MIT. See [LICENSE](LICENSE).

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
