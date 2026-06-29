"""
QUID Telegram userbot sidecar.

Speaks MTProto via Telethon (the Bot HTTP API can't act as a user account).
The Java backend drives it over a small HTTP API:

  POST /auth/send-code   {phone}                                  -> {phoneCodeHash}
  POST /auth/sign-in     {phone, code, phoneCodeHash, password?}  -> {sessionId}
  POST /messages/send    {sessionId, peer, text}                  -> {ok}
  GET  /sessions/{id}                                             -> {sessionId, status}

Incoming messages are pushed to the Java backend:
  POST {BACKEND_URL}/api/userbot/inbound
       {sessionId, chatId, senderId, senderName, text}

Sessions persist as Telethon StringSessions under SESSIONS_DIR so clients
reconnect on restart. Auth is interactive, so send-code keeps a half-open
client in memory until sign-in completes.
"""

import os
import uuid
import asyncio
import logging

import httpx
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from telethon import TelegramClient, events
from telethon.sessions import StringSession
from telethon.errors import SessionPasswordNeededError, PhoneCodeInvalidError

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("userbot")

API_ID = int(os.environ.get("TELEGRAM_API_ID", "0"))
API_HASH = os.environ.get("TELEGRAM_API_HASH", "")
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8080")
INTERNAL_TOKEN = os.environ.get("INTERNAL_TOKEN", "")
SESSIONS_DIR = os.environ.get("SESSIONS_DIR", "./sessions")

os.makedirs(SESSIONS_DIR, exist_ok=True)

# phone -> connected-but-not-signed-in client (during the auth handshake)
pending: dict[str, TelegramClient] = {}
# sessionId -> signed-in, running client
active: dict[str, TelegramClient] = {}

app = FastAPI(title="QUID userbot")


def _check(token: str | None):
    if INTERNAL_TOKEN and token != INTERNAL_TOKEN:
        raise HTTPException(status_code=401, detail="bad internal token")


def _session_path(session_id: str) -> str:
    return os.path.join(SESSIONS_DIR, f"{session_id}.session")


def _save_session(session_id: str, client: TelegramClient):
    with open(_session_path(session_id), "w") as f:
        f.write(client.session.save())


async def _attach_and_run(session_id: str, client: TelegramClient):
    """Forward every incoming private/group message to the Java backend."""

    @client.on(events.NewMessage(incoming=True))
    async def handler(event):
        sender = await event.get_sender()
        name = getattr(sender, "first_name", None) or getattr(sender, "username", None) or "Unknown"
        payload = {
            "sessionId": session_id,
            "chatId": event.chat_id,
            "senderId": event.sender_id,
            "senderName": name,
            "text": event.raw_text or "",
        }
        try:
            async with httpx.AsyncClient(timeout=10) as http:
                headers = {"X-Internal-Token": INTERNAL_TOKEN} if INTERNAL_TOKEN else {}
                await http.post(f"{BACKEND_URL}/api/userbot/inbound", json=payload, headers=headers)
        except Exception as e:  # noqa: BLE001 - never let a delivery error kill the listener
            log.warning("inbound forward failed: %s", e)

    active[session_id] = client
    log.info("userbot %s is live", session_id)


class SendCodeReq(BaseModel):
    phone: str


class SignInReq(BaseModel):
    phone: str
    code: str
    phoneCodeHash: str
    password: str | None = None


class SendMessageReq(BaseModel):
    sessionId: str
    peer: str | int
    text: str


@app.on_event("startup")
async def startup():
    if not API_ID or not API_HASH:
        log.warning("TELEGRAM_API_ID / TELEGRAM_API_HASH not set — auth will fail until configured")
    # reconnect every persisted session
    for fname in os.listdir(SESSIONS_DIR):
        if not fname.endswith(".session"):
            continue
        session_id = fname[: -len(".session")]
        with open(_session_path(session_id)) as f:
            saved = f.read().strip()
        client = TelegramClient(StringSession(saved), API_ID, API_HASH)
        await client.connect()
        if await client.is_user_authorized():
            await _attach_and_run(session_id, client)
        else:
            log.warning("session %s no longer authorized; skipping", session_id)


@app.post("/auth/send-code")
async def send_code(req: SendCodeReq, x_internal_token: str | None = Header(default=None)):
    _check(x_internal_token)
    client = TelegramClient(StringSession(), API_ID, API_HASH)
    await client.connect()
    sent = await client.send_code_request(req.phone)
    pending[req.phone] = client
    return {"phoneCodeHash": sent.phone_code_hash}


@app.post("/auth/sign-in")
async def sign_in(req: SignInReq, x_internal_token: str | None = Header(default=None)):
    _check(x_internal_token)
    client = pending.get(req.phone)
    if client is None:
        raise HTTPException(status_code=400, detail="no pending auth for this phone; request a code first")
    try:
        try:
            await client.sign_in(req.phone, req.code, phone_code_hash=req.phoneCodeHash)
        except SessionPasswordNeededError:
            if not req.password:
                raise HTTPException(status_code=409, detail="2FA password required")
            await client.sign_in(password=req.password)
    except PhoneCodeInvalidError:
        raise HTTPException(status_code=400, detail="invalid code")

    session_id = str(uuid.uuid4())
    _save_session(session_id, client)
    pending.pop(req.phone, None)
    await _attach_and_run(session_id, client)
    return {"sessionId": session_id}


@app.post("/messages/send")
async def send_message(req: SendMessageReq, x_internal_token: str | None = Header(default=None)):
    _check(x_internal_token)
    client = active.get(req.sessionId)
    if client is None:
        raise HTTPException(status_code=404, detail="session not connected")
    await client.send_message(req.peer, req.text)
    return {"ok": True}


@app.get("/sessions/{session_id}")
async def session_status(session_id: str, x_internal_token: str | None = Header(default=None)):
    _check(x_internal_token)
    return {"sessionId": session_id, "status": "connected" if session_id in active else "offline"}


@app.get("/health")
async def health():
    return {"ok": True, "active": len(active)}
