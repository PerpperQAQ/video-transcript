# 故障排查与兜底链路

提取失败时对照下面排查。占位符含义见 SKILL.md 的「路径配置」。

## 常见故障

| 现象 | 原因 | 处理 |
|---|---|---|
| 服务连不上（connection refused） | 没启动，或端口被占 | 到 `<项目>/webapp` 跑 `python app.py`；确认端口 |
| 返回「链接提取暂未开放」 | 设了 `DISABLE_EXTRACT=1` | 去掉该环境变量后重启服务 |
| 返回「抖音 cookie 失效」 | Cookie 过期 | 按 references/setup.md 的 Step 3 方式 A 重新登录导出 |
| 返回「ASR 转录未完成：ASR FAILED code=…」 | 直链被 CDN 拒 / 签名过期 / 偶发抽风 | 服务已自动换候选直链并重新解析重试；仍失败就稍后重试或换链接 |
| 返回「ASR 转录未完成：…无文本」 | 视频全程无人声（纯字幕/配乐） | 无文案可提取，换视频 |
| 返回「没抓到视频直链」 | 视频下架 / 私密 / 链接失效 | 问用户是否有其他来源，走下方兜底链路 |
| 百炼报鉴权错误 | `BAILIAN_KEY` 没配或写错 | 检查环境变量 / `webapp/_data/apikeys.json` |
| `ModuleNotFoundError: dashscope / playwright` | 可选依赖没装 | 回到 references/setup.md 的 Step 1 装依赖 |

## 关于本地音频（2026-10-17 实测，别走老路）

`paraformer-v2` 批量识别**只接受公网 `http(s)` 直链**。以下写法实测全部失败，不要再试：

| 写法 | 结果 |
|---|---|
| `Files.upload()` 拿 file_id 后 `file_urls=[file_id]` | `SERVER_ERROR`（秒失败） |
| `file_urls=["file://" + file_id]`（含 `X-DashScope-OssResourceResolve: enable` 头） | `DECODE_ERROR`（秒失败） |
| `OssUtils.upload()` 得到 `oss://dashscope-instant/...` 再提交 | `SERVER_ERROR`（秒失败） |
| OpenAI 兼容口 `/compatible-mode/v1/audio/transcriptions` | 404，该路由不存在 |

**能用**的本地文件通道只有实时识别 `paraformer-realtime-v2`（`Recognition(...).call(file=...)`，结果在 `out.output["sentence"]`，回调不会触发，要读返回值）：

- 需 `dashscope>=1.27`（1.26 的同步 call 有 `'RecognitionResult' object has no attribute 'headers'` 的 bug）
- 速度约 1 倍实时：10 分钟音频跑 10 分钟以上，只适合短片段

所以对长音频，正确做法是**保住可访问的 http 直链**（抖音直链可直传），而不是下载到本地。

## 抖音直链失效的兜底（换源）

抖音原视频若已下架/受限，浏览器打开会显示「视频不存在」，此时：

1. 先问用户有没有其他来源（B 站搬运、网页版、别人转存）。
2. B 站音频直链带 `Referer: https://www.bilibili.com` 能下载到本地（`https://api.bilibili.com/x/player/playurl?bvid={BV}&cid={cid}&platform=android&fnver=0&fnval=4048` → `dash.audio[0].baseUrl`，`ffmpeg -i in.m4s -c copy out.m4a`），**但它不是公网可匿名取的 URL，喂不进批量识别**——只能切段走实时识别，或者直接让用户给原文。
3. 拿不到可访问直链时，不要假称提取成功，说明原因让用户选择：换链接 / 贴原文 / 自己听。
