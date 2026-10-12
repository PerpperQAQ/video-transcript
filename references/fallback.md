# 故障排查与兜底链路

提取失败时对照下面排查。占位符含义见 SKILL.md 的「路径配置」。

## 常见故障

| 现象 | 原因 | 处理 |
|---|---|---|
| 服务连不上（connection refused） | 没启动，或端口被占 | 到 `<项目>/webapp` 跑 `python app.py`；确认端口 |
| 返回「链接提取暂未开放」 | 设了 `DISABLE_EXTRACT=1` | 去掉该环境变量后重启服务 |
| 返回「抖音 cookie 失效」 | Cookie 过期 | 按 references/setup.md 的 Step 3 方式 A 重新登录导出 |
| 返回「ASR 转录为空 / 没抓到直链」 | 抖音原视频下架 / 受限 | 问用户是否有 B 站搬运链接，走下方兜底链路 |
| 百炼报鉴权错误 | `BAILIAN_KEY` 没配或写错 | 检查环境变量 / `webapp/_data/apikeys.json` |
| `ModuleNotFoundError: dashscope / playwright` | 可选依赖没装 | 回到 references/setup.md 的 Step 1 装依赖 |

## 抖音直链失效的兜底（B 站搬运链接）

抖音原视频若已下架/受限，浏览器打开会显示「视频不存在」，提取自然为空。此时可问用户是否有 B 站搬运链接，走这条链路：

1. 用 `https://api.bilibili.com/x/player/playurl?bvid={BV号}&cid={cid}&platform=android&fnver=0&fnval=4048` 获取音频流（`dash.audio[0].baseUrl`，无需登录）
2. 带 `Referer: https://www.bilibili.com` 头用 curl / python 下载该音频（m4s 格式）
3. `ffmpeg -i in.m4s -c copy out.m4a` 转码
4. 用 dashscope `Files.upload(purpose='inference')` 上传音频拿 file_id，再调 `Transcription.async_call(model='paraformer-v2', file_urls=[file_id])` 转写（直接传 B 站 CDN URL 会被 403 拒绝，必须走上传链路）
5. 轮询 `Transcription.fetch`，成功后取 `results[0].transcription_url` 拉取文本
