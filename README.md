# Video Transcript

**[访问展示网站与完整配置教程 →](https://perpperqaq.github.io/video-transcript/)**

> 把抖音分享链接，变成一份结构化的视频文案总结。
> An Agent Skill that turns a Douyin (TikTok CN) share link into a structured transcript summary.

---

## 这是什么

一个 **Agent Skill**（兼容 HanaAgent / Claude Code 等支持 Skill 的 Agent）。给它一条抖音分享链接，它会：

1. 调用本地 **Traffic Compass** 服务，把视频语音转成文字（Playwright 抓直链 + 阿里云百炼 ASR）；
2. 通读全文，生成一份**结构化总结**（核心观点 / 详细观点拆解 / 原文金句 / 关键结论）；
3. 存成 Markdown（**上半是总结、下半是完整原文**），便于归档与二次引用。

它的定位很窄也很明确：**只做「抖音链接 → 文案 → 总结」这一件事，并把它做扎实。**

---

## ⚠️ 前置依赖：先部署 Traffic Compass

本 Skill 只是**调用方**，本身**不含视频提取能力**。它依赖一个在本地运行的 Traffic Compass 服务。

> Traffic Compass 项目：https://github.com/code-wahaha/traffic-compass

在装本 Skill 之前，请先在本机把 Traffic Compass 服务部署好（大致步骤，完整版见本项目 `references/setup.md`）：

- 安装依赖：`fastapi`、`uvicorn`、`httpx`、`dashscope>=1.27`、`playwright`（+ `playwright install chromium`），以及 `ffmpeg`
- 配置阿里云百炼 ASR 密钥（`BAILIAN_KEY`）
- 授权抖音登录态 Cookie（`douyin_cookies.json`）
- 启动服务（默认 `http://127.0.0.1:8900`）

---

## 安装本 Skill

**方式一（推荐）**：下载 `video-transcript.skill`，在 HanaAgent 里「设置 → 技能」将它拖入安装。

**方式二**：把整个 `video-transcript/` 目录放进技能目录（HanaAgent 为 `~/.hanako/skills/`）。

装好后，确认该 Skill 在你的 Agent 上处于**启用**状态。

---

## 使用

服务已在跑的前提下，把抖音分享链接发给 Agent，并说：

- 「帮我提取这个视频的文案」
- 「分析一下这个视频」
- 「这个视频讲了什么」

Agent 会自动触发本 Skill，完成提取 → 总结 → 存文件，并把结果交付给你。

---

## 配置

本 Skill 依赖以下几处配置（首次使用时 Agent 会向你确认）：

| 配置项 | 说明 |
|---|---|
| 项目路径 | Traffic Compass 项目根目录 |
| 服务地址 | 本地 API 地址，默认 `http://127.0.0.1:8900` |
| 输出目录 | 提取结果保存的位置（你指定） |
| `BAILIAN_KEY` | 阿里云百炼 ASR 密钥（**链接提取必需**） |
| `douyin_cookies.json` | 抖音登录态 Cookie（**链接提取必需**，会过期） |

详细的配置与获取方式见 **`references/setup.md`**。

---

## 工作原理

```
抖音分享链接
  → Playwright + 抖音登录态 Cookie 抓取视频直链
  → 阿里云百炼 Paraformer（ASR）语音转文字
  → Agent 通读全文，生成结构化总结
  → 存成 Markdown（总结 + 原文）
```

---

## 目录结构

```
video-transcript/
├── SKILL.md               # 核心：触发条件 + 提取 + 总结 + 保存
└── references/
    ├── setup.md           # 首次安装与配置（含抖音 Cookie 授权脚本）
    └── fallback.md        # 故障排查 + ASR 报错码含义 + 已知不可行路径
```

> 采用**渐进式披露**：`SKILL.md` 只保留核心工作流（触发即加载），安装与排错细节按需从 `references/` 读取——日常使用不会为用不到的内容付费。

---

## 常见问题

**Q：装好 Skill 了，但提取一直失败？**
多半是服务没跑起来、或抖音 Cookie 过期。先确认 `<服务地址>` 能访问，再对照 `references/fallback.md` 排查。

**Q：抖音视频已下架，抓不到怎么办？**
先向用户要其他可访问的来源。注意：百炼批量识别只接受公网 `http(s)` 直链，本地音频/上传文件的几种写法实测都会报 `DECODE_ERROR` 或 `SERVER_ERROR`（详见 `references/fallback.md`），不要假设「下载下来就能转」。

**Q：需要 DeepSeek Key 吗？**
不需要。本 Skill 只做提取 + 总结，不依赖 Traffic Compass 核心审核所用的 DeepSeek。

**Q：提取要多久？**
通常 30–120 秒，取决于视频时长。

---

## 致谢

- 视频提取与 ASR 链路基于开源项目 **Traffic Compass**（作者 code-wahaha，MIT）。
- 本 Skill 仅做流程编排与总结规范，不重复实现底层提取能力。

## License

MIT
