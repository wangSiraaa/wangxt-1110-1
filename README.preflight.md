# Trae Preflight

This folder is prepared for `wangxt-1110-1`.

Use `.env` for stable local ports and compose project identity:

- APP_PORT: 18410
- API_PORT: 19410
- WEB_PORT: 20410
- DB_PORT: 21410
- REDIS_PORT: 22410

Smoke entry:

```bash
bash scripts/smoke.sh
```

The preflight files are environment scaffolding only. The generated business
project can replace or extend them when needed.
