import { request } from "node:https";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";

const AUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
const BASE_URL = process.env.GIGACHAT_BASE_URL ?? "https://api.giga.chat/v1";

type Message = { role: "system" | "user" | "assistant"; content: string };

let ca: Buffer[] | undefined;
let cached: { token: string; expiresAt: number } | null = null;

const loadCa = () => {
  if (ca) return ca;
  ca = (process.env.GIGACHAT_CA_PATH ?? "")
    .split(",")
    .map((file) => file.trim())
    .filter(Boolean)
    .map((file) => readFileSync(path.resolve(process.cwd(), file)));
  return ca;
};

const send = (
  url: string,
  options: { method: string; headers: Record<string, string>; body?: string },
) =>
  new Promise<{ status: number; text: string }>((resolve, reject) => {
    const req = request(
      url,
      {
        method: options.method,
        headers: options.headers,
        ca: loadCa(),
        timeout: 30000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 0,
            text: Buffer.concat(chunks).toString("utf8"),
          }),
        );
      },
    );
    req.on("timeout", () => req.destroy(new Error("GigaChat timeout")));
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });

const getToken = async () => {
  if (cached && cached.expiresAt - Date.now() > 60000) return cached.token;

  const body = `scope=${encodeURIComponent(process.env.GIGACHAT_SCOPE ?? "GIGACHAT_API_PERS")}`;
  const res = await send(AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      RqUID: randomUUID(),
      Authorization: `Basic ${process.env.GIGACHAT_AUTH_KEY}`,
      "Content-Length": String(Buffer.byteLength(body)),
    },
    body,
  });
  if (res.status !== 200) {
    throw new Error(`GigaChat oauth ${res.status}: ${res.text.slice(0, 200)}`);
  }

  const data = JSON.parse(res.text);
  const expiresAt =
    data.expires_at < 1e12 ? data.expires_at * 1000 : data.expires_at;
  cached = { token: data.access_token, expiresAt };
  return cached.token;
};

export const askGigaChat = async (
  messages: Message[],
  maxTokens = 700,
  retry = true,
): Promise<string> => {
  const token = await getToken();
  const body = JSON.stringify({
    model: process.env.GIGACHAT_MODEL ?? "GigaChat",
    messages,
    temperature: 0.7,
    max_tokens: maxTokens,
    stream: false,
  });

  const res = await send(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Length": String(Buffer.byteLength(body)),
    },
    body,
  });

  if (res.status === 401 && retry) {
    cached = null;
    return askGigaChat(messages, maxTokens, false);
  }
  if (res.status !== 200) {
    throw new Error(`GigaChat chat ${res.status}: ${res.text.slice(0, 200)}`);
  }

  const data = JSON.parse(res.text);
  return data.choices?.[0]?.message?.content ?? "";
};
