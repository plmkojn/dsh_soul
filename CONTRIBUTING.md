# Contributing

Thanks for taking a look at `dsh-soul`.

## Development

There is no build step and no runtime dependency installation.

```powershell
npm run check
```

This runs `node --check` on the Host and Client halves. Please keep both files
loadable by a plain Node 24 process.

To try the plugin from a checkout:

1. Open DeepSeek Harness → Plugin Manager.
2. Choose **Install bundle** and select this directory.
3. Refresh the Web page.
4. The companion ball appears at the bottom-right of the page.

## Data and privacy

The plugin stores its state and diaries under `~/.dsh-soul` by default, outside
this repository. Never commit `state.json`, `diaries/`, `home/`, or screenshots
that contain private conversations or local paths.

## Pull requests

- Keep the plugin free of local computer-control tools (`bash`, `pwsh`, local
  file read/write/search, jobs, subagents, and similar).
- Keep `approval = ask` as the default.
- Update `CHANGELOG.md` for user-visible changes.
- Describe how you tested the change. There is no automated UI test suite, so a
  short manual checklist is useful.

## Persona content

Only submit original persona text or content you have the right to
redistribute. Do not add copyrighted character presets or game assets.
