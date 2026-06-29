# QUID Telegram userbot sidecar

MTProto userbot service (Telethon) that the Java backend drives over HTTP.
Bot tokens can't act as a *user* account, so this runs as a separate process.

> ⚠️ Automating a Telegram **user** account can violate Telegram's ToS and risks
> account bans. Use a dedicated number.

## Setup
```bash
cd telegram-userbot
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # fill in TELEGRAM_API_ID / TELEGRAM_API_HASH from my.telegram.org
set -a && source .env && set +a
uvicorn app:app --port 8090
```

## API (called by the Java backend)
| Method | Path | Body | Returns |
|--------|------|------|---------|
| POST | `/auth/send-code` | `{phone}` | `{phoneCodeHash}` |
| POST | `/auth/sign-in` | `{phone, code, phoneCodeHash, password?}` | `{sessionId}` |
| POST | `/messages/send` | `{sessionId, peer, text}` | `{ok}` |
| GET | `/sessions/{id}` | — | `{sessionId, status}` |

Inbound messages are pushed to `POST {BACKEND_URL}/api/userbot/inbound`
`{sessionId, chatId, senderId, senderName, text}`.

Sessions persist under `SESSIONS_DIR/` and reconnect on restart.
