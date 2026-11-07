# Security

## Reporting a vulnerability

Please use GitHub's **Report a vulnerability** flow (Security → Advisories) for
this repository. Do not open a public issue for a vulnerability that could put
users' local data at risk.

## Security model

- This plugin is intentionally **chat-only**. It does not expose local shell,
  local file read/write/search, job control, subagents, or workflow tools to the
  companion model.
- The companion can use web search/fetch and the plugin's own state tools
  (`soul_update`, `soul_clock`). The plugin writes diary files itself; the model
  cannot open or edit them.
- The panel API (`/soul-api`) is served by the local Harness Web server. It is
  intended for loopback use only. Do not expose the Harness Web UI to a LAN or
  the public internet while this plugin is enabled.
- Do not commit `~/.dsh-soul/state.json`, diary files, or screenshots containing
  private conversations.

## Supported versions

Only the latest published release is supported with security fixes.
