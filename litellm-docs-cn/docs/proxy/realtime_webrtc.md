# /realtime：WebRTC 支持

浏览器或移动端客户端可以通过 WebRTC 连接 Realtime API。鉴权由 LiteLLM 处理，音频则直接流向 OpenAI/Azure。

**支持的提供商**：OpenAI · Azure

:::info[**WebRTC 与 WebSocket**]
- **WebSocket**（`/v1/realtime`）：面向服务器到服务器场景
- **WebRTC**（`/v1/realtime/client_secrets` + `/v1/realtime/calls`）：面向浏览器/移动端，延迟更低
:::

## 工作原理

LiteLLM 只负责签发令牌和转发 SDP；音频从不经过代理。

```
Browser                  LiteLLM Proxy              OpenAI/Azure
  |                           |                          |
  |-- POST client_secrets --->|-- POST sessions -------->|
  |<-- encrypted_token -------|<-- ek_... ---------------|
  |-- POST calls [SDP+token] ->|-- POST calls ----------->|
  |<-- SDP answer ------------|<-- SDP answer -----------|
  |===== audio P2P direct ===============================>|
```

## 代理配置

```yaml
model_list:
  - model_name: gpt-4o-realtime
    litellm_params:
      model: openai/gpt-4o-realtime-preview-2024-12-17
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      mode: realtime
```

**Azure**：改用 `model: azure/gpt-4o-realtime-preview`，并配好 `api_key` 和 `api_base`。

```bash
litellm --config /path/to/config.yaml
```

## 客户端用法

1. **获取令牌**：携带 LiteLLM 密钥和 `{ model }` 调用 `POST /v1/realtime/client_secrets`。
2. **建立 WebRTC**：创建 `RTCPeerConnection`，接入麦克风，建立数据通道 `oai-events`，然后向 `POST /v1/realtime/calls` 发送 SDP offer，请求头带上 `Authorization: Bearer <token>` 和 `Content-Type: application/sdp`。
3. **事件**：通过数据通道收发 `session.update` 等事件。

```javascript
const r = await fetch("http://proxy:4000/v1/realtime/client_secrets", {
  method: "POST",
  headers: { "Authorization": "Bearer sk-litellm-key", "Content-Type": "application/json" },
  body: JSON.stringify({ model: "gpt-4o-realtime" }),
});
const token = (await r.json()).client_secret.value;

const pc = new RTCPeerConnection();
const audio = document.createElement("audio");
audio.autoplay = true;
pc.ontrack = (e) => (audio.srcObject = e.streams[0]);
const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
pc.addTrack(ms.getTracks()[0]);
const dc = pc.createDataChannel("oai-events");
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const sdpRes = await fetch("http://proxy:4000/v1/realtime/calls", {
  method: "POST",
  headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/sdp" },
  body: offer.sdp,
});
await pc.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });

dc.send(JSON.stringify({ type: "session.update", session: { instructions: "..." } }));
```

## 常见问题

- **401 令牌过期**：在创建 WebRTC offer 之前先换取一个新令牌。
- **调用 `/calls` 该用哪个密钥**？用 `client_secrets` 返回的加密令牌，而不是原始密钥。
- **要传 `model` 吗**？不用，路由信息已经编码在令牌里。
- **Azure 的 `api-version`**：在 `litellm_params` 里设置 `api_version`，并确保 `api_base` 正确。
- **没有声音**：授予麦克风权限；确认 `pc.ontrack` 挂上了自动播放的音频元素；排查防火墙与 WebRTC 连通性；查看浏览器控制台。
