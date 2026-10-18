# 首次安装与配置

> 目标：让本机的 Traffic Compass 服务能对外提供 `POST /api/extract`（抖音链接 → 文字）。
> 链路：抖音链接 →（Playwright + 抖音登录态 Cookie）抓视频直链 →（阿里云百炼 ASR）语音转文字。
> 本文涉及 `<项目>` / `<服务地址>` 三个占位符，含义见 SKILL.md 的「路径配置」。

## 前置条件

- **Traffic Compass 项目**已在本机（开源，MIT）。下文 `<项目>` 指它的实际路径。
- **Python 3.10+**
- 需要提取功能时还要 **ffmpeg**（音频转码）：macOS `brew install ffmpeg`。

## Step 1 · 安装依赖

```bash
cd <项目>/webapp

# 核心（服务本身）
pip install fastapi "uvicorn[standard]" httpx

# 链接提取所需（要用提取就必须装）
pip install "dashscope>=1.27" playwright
playwright install chromium      # 下载 playwright 的浏览器内核
```

## Step 2 · 配置 ASR 密钥（BAILIAN_KEY）

链接提取的语音转写走**阿里云百炼（DashScope）**的 Paraformer 模型。

1. 到阿里云百炼控制台开通服务，在「API-KEY 管理」生成一个 Key。
2. 配置（二选一，环境变量优先）：
   - 环境变量：`export BAILIAN_KEY=你的百炼密钥`
   - 或写进 `webapp/_data/apikeys.json`：
     ```json
     { "bailian": "你的百炼密钥" }
     ```
     （该文件不入 git，模板见 `webapp/_data/apikeys.example.json`）

> 本技能只做「提取 + 总结」，**不依赖** Traffic Compass 核心审核用的 `DEEPSEEK_KEY`。服务本身也不会因缺它而起不来。

## Step 3 · 授权抖音登录态（最关键）

服务需要一份抖音登录 Cookie，目标路径：

```
<项目>/webapp/_data/chrome_data/douyin_cookies.json
```

（若用户设了环境变量 `DOUYIN_COOKIE_BASE`，则在其下的 `chrome_data/douyin_cookies.json`。）

**格式要求**：必须是 **Cookie 数组**（`[{"name":"...","value":"...",...}]`），不是 `{cookies:[...]}` 包装格式——服务直接把它喂给 `context.add_cookies()`。登录判定看有没有 `uid_tt` 或 `sessionid`。

**方式 A（推荐，Playwright 登录取 Cookie）：**

```bash
python - <<'PY'
from playwright.sync_api import sync_playwright
import json, os
out = os.path.expanduser("<项目>/webapp/_data/chrome_data/douyin_cookies.json")
os.makedirs(os.path.dirname(out), exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(headless=False)
    ctx = b.new_context()
    pg = ctx.new_page()
    pg.goto("https://www.douyin.com")
    input(">>> 在弹出的浏览器里扫码登录抖音，登录成功后回到这里按回车…")
    json.dump(ctx.cookies(), open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    b.close()
print("cookie 已写入:", out)
PY
```

**方式 B（已有 Cookie 文件）：** 把已有的 `[{name,value,...}]` 格式抖音 Cookie JSON 放到上述路径即可。

> 抖音 Cookie 会过期。一旦报「cookie 失效 / 抓不到直链」，重跑方式 A 重新登录即可。

## Step 4 · 确认提取开关没被关掉

`/api/extract` 在设了环境变量 `DISABLE_EXTRACT=1` 时**会被直接关闭**（返回「暂未开放」）。要用提取功能就别设它（或设成非 1 的值）。

## Step 5 · 启动服务并验证

```bash
cd <项目>/webapp
python app.py
# → 服务跑在 <服务地址>（默认 http://127.0.0.1:8900）
```

需要常驻就启动成后台进程，并把日志落盘（不落盘时排障看不到 ASR 报错码）：

```bash
cd <项目>/webapp
nohup <项目>/.venv/bin/python app.py >> ~/Library/Logs/traffic-compass.log 2>&1 &
tail -f ~/Library/Logs/traffic-compass.log
```

改过 `extract.py` 等代码后**必须重启进程**（`uvicorn.run` 没开 reload，进程里缓存的是旧模块）：

```bash
pkill -f "webapp.*app.py"
```

验证：

```bash
curl -s -X POST <服务地址>/api/extract \
  -H "Content-Type: application/json" \
  -d '{"share_url":"<随便一个抖音分享链接>"}'
```

返回里能拿到 `data.text`（文案）就算通了。**服务需要常驻**——本技能每次提取都依赖它在跑。
