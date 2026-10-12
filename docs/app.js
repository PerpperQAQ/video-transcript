"use strict";
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escapeHTML = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const repo = "https://github.com/PerpperQAQ/video-transcript";
let toastTimer;
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3000);
}
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext)
      await navigator.clipboard.writeText(text);
    else {
      const field = document.createElement("textarea");
      field.value = text;
      field.style.cssText = "position:fixed;left:-9999px";
      document.body.append(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      if (!copied) throw new Error("copy unavailable");
    }
    toast("已复制，粘贴到对应位置即可。");
  } catch {
    toast("浏览器未允许复制，请选中文字手动复制。");
  }
}
function code(text, label = "终端") {
  return `<div class="code-block"><div class="code-bar"><span>${escapeHTML(label)}</span><button type="button" class="copy-code" aria-label="复制${escapeHTML(label)}代码">复制</button></div><pre><code>${escapeHTML(text)}</code></pre></div>`;
}
function success(text) {
  return `<div class="success-check"><strong>怎样判断成功？</strong>${text}</div>`;
}
function note(text) {
  return `<div class="guide-note">${text}</div>`;
}
function external(url, label) {
  return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
}

const flows = [
  [
    "01 / 发起",
    "把抖音分享链接或整段分享文案发给 Agent，再说「帮我提取这个视频的文案」。链接与明确的提取意图一起，才会触发 Skill。",
  ],
  [
    "02 / 转写",
    "本机的 Traffic Compass 使用 Playwright 和你的抖音登录态获取视频直链，再调用阿里云百炼 Paraformer 识别语音。接口返回的 data.text 就是转写文案。",
  ],
  [
    "03 / 理解",
    "Agent 先通读完整转写稿，再按 Skill 的规范整理核心观点、案例、金句与结论。案例里的数字、人物与场景保留下来；多期内容按期分别整理。",
  ],
  [
    "04 / 归档",
    "Agent 把结构化总结与完整原文保存到你指定的目录，文件名为「日期_作者或关键词_标题摘要.md」。支持附件交付的宿主可直接交付文件，其他宿主按其能力提供文件路径。",
  ],
];
$$("[data-flow]").forEach((button) =>
  button.addEventListener("click", () => {
    $$("[data-flow]").forEach((other) => {
      const active = other === button;
      other.classList.toggle("active", active);
      other.setAttribute("aria-pressed", String(active));
    });
    const flow = flows[Number(button.dataset.flow)];
    $("#flow-number").textContent = flow[0];
    $("#flow-description").textContent = flow[1];
  }),
);

const original =
  "我以前收藏了很多视频，但真到要用的时候，还是想不起它们讲了什么。后来我给自己定了一个小规则：每次只留一个最想记住的观点。比如看到一个讲用户访谈的视频，我会记下“先问对方上一次怎么做，而不是问他愿不愿意用”。然后把当时的案例也留在旁边，因为脱离场景的结论很容易被用错。最后，我会写一句：这能用到我手头的哪个问题上？对我来说，笔记的价值不在于攒了多少，而在于下一次做事时能不能拿出来用。";
const markdown = `# 让收藏真正变成收获

> 虚构短文示例，仅用于展示输出结构；不是某条真实视频的提取结果。

**来源：教学示例**
**提取日期：2026-10-12（示例）**
**原链接：无，本文为虚构示例**

---

## 核心观点
收藏不等于掌握。把观点、具体场景与自己的问题连起来，内容才更容易在需要时被用上。

## 观点详细拆解
### 1. 从一个观点开始
讲述者曾大量收藏却无法回忆内容，于是为自己设定每次只留一个最想记住的观点的规则，降低整理负担。

### 2. 把场景和案例一起留下
用户访谈的例子强调询问用户过去的真实行为，而不是假设性的使用意愿。保存案例有助于理解观点的适用情境。
> 先问对方上一次怎么做，而不是问他愿不愿意用。

### 3. 和手头的问题建立联系
整理后补上一句“这能用到我手头的哪个问题上？”，把信息从收藏对象转成行动参考。

## 金句摘录
- “每次只留一个最想记住的观点。” —— 讲述者为自己设定的整理规则。
- “脱离场景的结论很容易被用错。” —— 解释为什么保存案例和情境。
- “笔记的价值不在于攒了多少，而在于下一次做事时能不能拿出来用。” —— 评价笔记价值的标准。

注：此虚构短文仅展示 3 条摘录；正式输出通常按 Skill 要求摘录 5–10 条，不能为了凑数虚构原话。

## 关键结论
围绕真实问题整理笔记，并保留观点的来处。

---

<!-- 分隔线以下为原文 -->
${original}
`;
function renderDoc(mode) {
  const content = $("#doc-content");
  if (mode === "summary")
    content.innerHTML = `<h3>让收藏真正变成收获</h3><p class="doc-meta">教学示例 / 虚构短文 / 2026-10-12</p><h4>核心观点</h4><p>收藏不等于掌握。把观点、具体场景与自己的问题连起来，内容才更容易在需要时被用上。</p><h4>观点拆解</h4><p><b>01 · 从一个观点开始</b><br>每次只留一个最想记住的观点，降低整理负担。</p><p><b>02 · 把场景和案例一起留下</b><br>以用户访谈为例，询问过去的真实行为，而不是假设性的使用意愿。</p><blockquote>先问对方上一次怎么做，<br>而不是问他愿不愿意用。</blockquote><p><b>03 · 和手头的问题建立联系</b><br>补上一句「这能用到我手头的哪个问题上？」，让内容成为行动参考。</p><h4>金句摘录</h4><p>“每次只留一个最想记住的观点。”<br>—— 讲述者为自己设定的整理规则。</p><p>“脱离场景的结论很容易被用错。”<br>—— 说明保留案例的必要性。</p><p>“笔记的价值不在于攒了多少，而在于下一次做事时能不能拿出来用。”<br>—— 评价笔记价值的标准。</p><h4>关键结论</h4><p>围绕真实问题整理笔记，并保留观点的来处。</p>`;
  else if (mode === "original")
    content.innerHTML = `<h3>完整原文</h3><p class="doc-meta">虚构短文 · 未删减 · 未润色</p><p>${original}</p><h4>为什么保留原文？</h4><p>让每一条总结都有可回查的来源。语音识别可能存在同音错字，引用时仍建议结合原视频核对。</p>`;
  else content.innerHTML = `<pre>${escapeHTML(markdown)}</pre>`;
  content.scrollTop = 0;
  content.setAttribute("aria-labelledby", `tab-${mode}`);
  $$("[data-doc]").forEach((tab) => {
    const active = tab.dataset.doc === mode;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
}
$$("[data-doc]").forEach((tab, index, tabs) => {
  tab.addEventListener("click", () => renderDoc(tab.dataset.doc));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft")
      next = (index + tabs.length - 1) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      tabs[next].focus();
      renderDoc(tabs[next].dataset.doc);
    }
  });
});
$("#download-example").addEventListener("click", () => {
  const url = URL.createObjectURL(
    new Blob([markdown], { type: "text/markdown;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "2026-10-12_教学示例_让收藏真正变成收获.md";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("已生成示例 Markdown 文件。");
});
$("#copy-prompt").addEventListener("click", () =>
  copyText(
    "帮我提取这个视频的文案，并生成结构化总结：\n[粘贴你的抖音分享链接]",
  ),
);

const stepNames = [
  "准备本地环境",
  "配置百炼密钥",
  "登录抖音",
  "启动并验证服务",
  "安装并启用 Skill",
  "告诉 Agent 三个位置",
  "完成第一次提取",
];
let currentStep = 0;
let os = "mac";
let completed = [];
try {
  const saved = JSON.parse(localStorage.getItem("vt-guide-v1") || "{}");
  if (["mac", "windows", "linux"].includes(saved.os)) os = saved.os;
  if (Array.isArray(saved.completed))
    completed = saved.completed.filter(
      (x) => Number.isInteger(x) && x >= 0 && x < 7,
    );
} catch {}
$("#os-select").value = os;
function persist() {
  try {
    localStorage.setItem("vt-guide-v1", JSON.stringify({ os, completed }));
  } catch {}
}
function shellLabel() {
  return os === "windows" ? "PowerShell" : "终端";
}
function stepContent(index) {
  const windows = os === "windows";
  const py = windows ? "python" : "python3";
  const activation = windows
    ? ".\\.venv\\Scripts\\Activate.ps1"
    : "source .venv/bin/activate";
  if (index === 0) {
    const install =
      os === "mac"
        ? "brew install python git ffmpeg"
        : windows
          ? "winget install --id Python.Python.3.12 -e\nwinget install --id Git.Git -e\nwinget install --id Gyan.FFmpeg -e"
          : "sudo apt update\nsudo apt install python3 python3-venv python3-pip git ffmpeg";
    return `<p class="step-kicker">STEP 01 / ENVIRONMENT</p><h3>先给 Skill 准备一个搭档</h3><p>Traffic Compass 是实际提取视频的本地服务。你需要 Python 3.10+、Git、ffmpeg 和一个支持 Skill、能够运行本地命令的 Agent。</p><ol><li>${windows ? "打开「开始」菜单，搜索并打开 PowerShell。" : os === "mac" ? "按 Command + 空格，搜索并打开「终端」。" : "打开终端。下方系统安装命令适用于 Ubuntu / Debian，其他发行版请使用对应包管理器。"}</li><li>如果工具已经装好，可跳过系统安装。${os === "mac" ? `尚未安装 Homebrew？先按 ${external("https://brew.sh/", "Homebrew 官网")} 的说明安装。` : windows ? "下方使用系统的 winget；安装后重新打开 PowerShell。" : ""}</li></ol>${code(install, shellLabel())}<p>选择一个存放项目的文件夹，在该文件夹打开终端，逐段运行。目录已存在时直接进入已有项目，不要重复克隆。</p>${code(`git clone https://github.com/code-wahaha/traffic-compass.git\ncd traffic-compass/webapp\n${py} -m venv .venv\n${activation}\npython -m pip install fastapi "uvicorn[standard]" httpx dashscope playwright\npython -m playwright install chromium`, shellLabel())}${windows ? note("如果 PowerShell 阻止激活脚本，可改用 <code>.\\.venv\\Scripts\\python.exe</code> 替代后续命令中的 <code>python</code>，不必更改系统执行策略。") : os === "linux" ? note("Linux 如提示 Chromium 缺少系统依赖，可运行 <code>python -m playwright install --with-deps chromium</code>。抖音扫码登录需要图形桌面，纯 SSH 终端无法弹出登录窗口。") : ""}${success("运行 <code>python --version</code> 和 <code>ffmpeg -version</code> 均显示版本；Chromium 安装完成，终端仍位于 <code>traffic-compass/webapp</code>。")}`;
  }
  if (index === 1)
    return `<p class="step-kicker">STEP 02 / API KEY</p><h3>让语音识别连上百炼</h3><p>音频转文字由阿里云百炼的 Paraformer 完成。你需要自己的百炼 API Key。它与 Agent 的聊天模型 Key 是两回事。</p><ol><li>打开 ${external("https://bailian.console.aliyun.com/", "阿里云百炼控制台")}，登录并按页面提示开通服务。</li><li>选择<strong>华北 2（北京）</strong>地域，在 API Key 管理中创建密钥。当前服务使用北京 DashScope 接口，密钥地域必须匹配。${external("https://help.aliyun.com/zh/model-studio/get-api-key", "查看官方获取步骤")}</li><li>下载 <a href="./downloads/configure-key.py" download>configure-key.py</a>，把它放进 <code>traffic-compass/webapp</code>。</li><li>在刚才已激活虚拟环境的终端运行下面命令。按提示粘贴密钥后回车；输入不回显是正常现象。</li></ol>${code("python configure-key.py", shellLabel())}<p>脚本把密钥写入本机 <code>webapp/_data/apikeys.json</code> 的 <code>bailian</code> 字段，并保留已有其他字段。网页不收集密钥。识别调用可能产生费用，额度与计费以 ${external("https://help.aliyun.com/zh/model-studio/model-pricing", "百炼官方说明")} 为准。</p><details><summary>已有环境变量？了解读取优先级</summary><p>服务优先读取 <code>BAILIAN_KEY</code> 环境变量，然后读取本地 JSON 文件。如果环境变量存着旧 Key，会覆盖刚保存的新 Key。选择一种方式配置即可。当前终端清除旧变量：</p>${code(windows ? "Remove-Item Env:BAILIAN_KEY -ErrorAction SilentlyContinue" : "unset BAILIAN_KEY", shellLabel())}<p>此 Skill 不需要 <code>DEEPSEEK_KEY</code>；总结由你正在使用的 Agent 完成。</p></details>${success("脚本显示「百炼密钥已保存」。这说明配置已写入；密钥是否有效，将在第 4 步实际提取时验证。")}`;
  if (index === 2)
    return `<p class="step-kicker">STEP 03 / DOUYIN LOGIN</p><h3>登录一次，授权本地提取</h3><p>服务需要你的抖音登录态来访问视频。你将在本机弹出的浏览器里扫码登录，Cookie 也保存在本机。</p><ol><li>下载 <a href="./downloads/login-douyin.py" download>login-douyin.py</a>，放进 <code>traffic-compass/webapp</code>。</li><li>在已激活虚拟环境、且位于 <code>webapp</code> 的终端运行下面命令。</li><li>在弹出的浏览器中用自己的抖音扫码登录。</li><li>确认登录完成后，回到终端按回车，等待脚本保存并关闭浏览器。</li></ol>${code("python login-douyin.py", shellLabel())}<p>默认保存位置是 <code>webapp/_data/chrome_data/douyin_cookies.json</code>。脚本写出的是 Cookie 数组，并检查 <code>uid_tt</code> 或 <code>sessionid</code> 是否存在。不要分享或上传这个文件。</p><details><summary>已有 Cookie，或需要自定义保存目录？</summary><p>已有文件应是 <code>[{"name":"…","value":"…"}]</code> 数组，不能是 <code>{"cookies":[…]}</code>。把它放到默认位置即可。</p><p>当前上游代码使用 <code>DOUYIN_CHROME_DATA</code> 指定直接包含 <code>douyin_cookies.json</code> 的目录。本教程脚本也支持这个变量。Skill 旧文档里的 <code>DOUYIN_COOKIE_BASE</code> 与当前上游不一致，请以 ${external("https://github.com/code-wahaha/traffic-compass/blob/4a8e07f58a35f2238082214285ed5e0c595e3184/webapp/extract.py", "核对过的上游源码")} 为准。</p></details>${success("脚本显示「Cookie 已保存」及文件路径。Cookie 会过期；以后遇到登录失效，重新运行此步骤。")}`;
  if (index === 3) {
    const clear = windows
      ? "Remove-Item Env:DISABLE_EXTRACT -ErrorAction SilentlyContinue"
      : "unset DISABLE_EXTRACT";
    const verify = windows
      ? '$body = @{ share_url = "替换为真实抖音分享链接" } | ConvertTo-Json\n$result = Invoke-RestMethod -Uri "http://127.0.0.1:8900/api/extract" -Method Post -ContentType "application/json" -Body $body -TimeoutSec 300\n$result | ConvertTo-Json -Depth 10'
      : 'curl --max-time 300 -sS -X POST http://127.0.0.1:8900/api/extract \\\n  -H "Content-Type: application/json" \\\n  -d \'{"share_url":"替换为真实抖音分享链接"}\'';
    return `<p class="step-kicker">STEP 04 / RUN & VERIFY</p><h3>启动服务，真的提取一次</h3><p>仍在 <code>traffic-compass/webapp</code> 和已激活的虚拟环境中运行：</p>${code(`${clear}\npython app.py`, shellLabel())}${note("请保持这个终端窗口开启。服务必须常驻；关闭后 Skill 就无法提取。当前上游对任何非空的 <code>DISABLE_EXTRACT</code> 都会关闭本地提取，设成 <code>0</code> 也不行，所以这里直接清除。")}<h4>再打开一个终端，测试接口</h4><p>将下面占位文字替换成一条真实、可访问、有人声的抖音分享链接，再运行。完整分享文案也可以，但要注意 JSON 引号格式。</p>${code(verify, shellLabel())}<p>通常等待 30–120 秒；这里将超时设为 300 秒，为较长视频留出余量。只看到服务首页还不代表提取已成功。</p>${success("返回 JSON 中 <code>success</code> 为 <code>true</code>，且 <code>data.text</code> 有真实文案。失败时查看下方常见问题，并结合服务终端日志排查。")}`;
  }
  if (index === 4)
    return `<p class="step-kicker">STEP 05 / INSTALL SKILL</p><h3>把这份工作说明交给 Agent</h3><p>本地提取已跑通，现在安装 Video Transcript。初次使用推荐按仓库说明，在 HanaAgent 中导入。</p><ol><li>${external(`${repo}/raw/refs/heads/main/video-transcript.skill`, "下载 video-transcript.skill")}。</li><li>打开 HanaAgent →「设置」→「技能」，将文件拖入安装。</li><li>在技能列表中找到 <code>video-transcript</code>，<strong>确认它处于启用状态</strong>。Skill 元数据中默认启用为 <code>false</code>。</li></ol><details><summary>使用目录安装，或使用其他 Agent</summary><p>也可以把整个仓库作为 <code>video-transcript/</code> 目录放进 Agent 的技能目录。HanaAgent 文档中的目录为 <code>~/.hanako/skills/</code>；目录已存在时先检查，不要重复覆盖。</p>${code(windows ? 'git clone https://github.com/PerpperQAQ/video-transcript.git "$HOME/.hanako/skills/video-transcript"' : "git clone https://github.com/PerpperQAQ/video-transcript.git ~/.hanako/skills/video-transcript", shellLabel())}<p>仓库说明兼容 Claude Code 等支持 Skill 的 Agent。其他宿主的安装目录、启用方式和文件交付能力需按各自文档确认，不能直接照搬 HanaAgent 的路径。Agent 必须能调用你本机的服务；远程 Agent 的 <code>127.0.0.1</code> 并不指向你的电脑。</p></details>${success("Agent 的技能列表可以找到并启用 <code>video-transcript</code>。技能目录中有 <code>SKILL.md</code> 与 <code>references/</code>。")}`;
  if (index === 5) {
    const prompt =
      "我已安装并启用 video-transcript。请使用以下配置：\n\nTraffic Compass 项目路径：[替换为真实项目根目录，注意不是 webapp]\n服务地址：http://127.0.0.1:8900\n输出目录：[替换为想保存 Markdown 的目录]\n\n请先确认这三个值已确定，再调用服务。";
    return `<p class="step-kicker">STEP 06 / THREE LOCATIONS</p><h3>告诉 Agent，去哪里找和存</h3><p>第一次使用时，需要确定下面三个值。把模板中的方括号内容改成你自己的真实位置，再发给 Agent。这是对话配置，不是终端命令。</p>${code(prompt, "发给 Agent 的配置说明")}<ul><li><strong>项目路径：</strong>第 1 步克隆下来的 <code>traffic-compass</code> 根目录。</li><li><strong>服务地址：</strong>默认 <code>http://127.0.0.1:8900</code>。如果你改过端口，填写实际地址。</li><li><strong>输出目录：</strong>你希望保存笔记的文件夹，例如文档目录下的「视频笔记」。</li></ul><details><summary>不知道怎么找到完整路径？</summary><p>${windows ? "在资源管理器中打开文件夹，点击地址栏并复制完整路径。" : "macOS 可在 Finder 中选中文件夹，按 Option + Command + C 复制完整路径。Linux 可在文件管理器按 Ctrl + L，或在终端运行 pwd。"}</p><p>如果你当前在 <code>webapp</code>，需要的是它上一级 <code>traffic-compass</code> 的路径。路径有空格时，终端命令中应加引号。</p></details>${success("Agent 已拿到真实项目路径、可访问的服务地址和可写的输出目录；模板中的占位文字已全部替换。")}`;
  }
  return `<p class="step-kicker">STEP 07 / FIRST TRANSCRIPT</p><h3>发出链接，收到第一份笔记</h3><p>保持 Traffic Compass 服务运行，在已启用 Skill 的 Agent 对话中发送：</p>${code("帮我提取这个视频的文案，并生成结构化总结：\n[替换成你的抖音分享链接或完整分享文案]", "发给 Agent")}<h4>接下来会发生什么？</h4><ol><li>Agent 调用本地 <code>POST /api/extract</code> 接口，获取 <code>data.text</code>。</li><li>通读完整转写稿，整理核心观点、详细拆解、金句和关键结论。</li><li>保存 <code>YYYY-MM-DD_作者名或关键词_标题摘要.md</code> 到你的输出目录。</li><li>支持 <code>stage_files</code> 的宿主可交付文件附件；其他 Agent 依其能力提供附件或本地文件路径。</li></ol>${note("这是语音文案提取与整理，不包含视频画面、动作或镜头分析。ASR 可能出现同音错字；正式引用时，应结合原视频核对。音频转写会调用百炼云服务，总结还取决于你所用 Agent 的模型与数据设置。")}${success("你能打开输出的 Markdown：有来源、提取日期和原链接；上半是总结，下半完整保留转写原文。现在可以勾选完成，开始积累自己的视频笔记。")}`;
}
function updateProgress() {
  $("#setup-progress").textContent = `已完成 ${new Set(completed).size} / 7 步`;
  $("#step-complete").checked = completed.includes(currentStep);
  $$("#step-nav button").forEach((button, index) => {
    button.classList.toggle("done", completed.includes(index));
    button.querySelector("span").textContent = completed.includes(index)
      ? "✓"
      : String(index + 1).padStart(2, "0");
  });
}
function renderStep(index, focus = false) {
  currentStep = index;
  $("#guide-content").innerHTML = stepContent(index);
  $$("#step-nav button").forEach((button, i) => {
    if (i === index) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
  $("#step-prev").disabled = index === 0;
  $("#step-next").disabled = index === 6;
  $("#step-next").textContent = index === 6 ? "已到最后一步" : "下一步 ↗";
  updateProgress();
  if (focus) {
    $("#guide-content").focus({ preventScroll: true });
    if (innerWidth < 801)
      $("#guide-content").scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
  }
}
$("#step-nav").innerHTML = stepNames
  .map(
    (name, index) =>
      `<button type="button" data-step="${index}"${index === 0 ? ' aria-current="step"' : ""}><span>${String(index + 1).padStart(2, "0")}</span>${name}</button>`,
  )
  .join("");
$("#step-nav").addEventListener("click", (event) => {
  const button = event.target.closest("[data-step]");
  if (button) renderStep(Number(button.dataset.step));
});
$("#guide-content").addEventListener("click", (event) => {
  const button = event.target.closest(".copy-code");
  if (button)
    copyText(button.closest(".code-block").querySelector("code").textContent);
});
$("#step-prev").addEventListener("click", () => {
  if (currentStep > 0) renderStep(currentStep - 1, true);
});
$("#step-next").addEventListener("click", () => {
  if (currentStep < 6) renderStep(currentStep + 1, true);
});
$("#step-complete").addEventListener("change", (event) => {
  completed = completed.filter((x) => x !== currentStep);
  if (event.target.checked) completed.push(currentStep);
  persist();
  updateProgress();
});
$("#reset-progress").addEventListener("click", () => {
  completed = [];
  persist();
  updateProgress();
  toast("已重置配置进度。");
});
$("#os-select").addEventListener("change", (event) => {
  os = event.target.value;
  persist();
  renderStep(currentStep);
});

const faqs = [
  [
    "安装了 Skill，为什么还是不能提取？",
    "<p>Skill 负责告诉 Agent 怎么做，本身不包含视频提取服务。按顺序检查：Traffic Compass 是否正在运行、百炼 Key 是否有效、抖音 Cookie 是否可用，以及 Skill 是否已启用。只安装 .skill 文件还不够。</p>",
  ],
  [
    "提示 connection refused，服务连不上？",
    "<p>在 Traffic Compass 的 <code>webapp</code> 目录激活虚拟环境后，运行 <code>python app.py</code>，并保持终端开启。确认地址和端口与 Agent 配置一致，默认是 <code>http://127.0.0.1:8900</code>。若提示端口占用，先确认占用的程序，不要直接结束不认识的进程。</p><p>如果 Agent 运行在另一台电脑或云端，它不能通过自己的 127.0.0.1 访问你电脑上的服务。</p>",
  ],
  [
    "提示未登录、Cookie 失效，怎么处理？",
    "<p>回到配置第 3 步，重新运行登录脚本并扫码登录。Cookie 文件必须是数组格式，且包含有效的 <code>uid_tt</code> 或 <code>sessionid</code>。文件存在只代表保存过，不能证明登录仍有效。</p><p>自定义路径时，当前上游使用 <code>DOUYIN_CHROME_DATA</code>，其目录下直接放 <code>douyin_cookies.json</code>。不要把 Cookie 发到公开 Issue 或聊天中。</p>",
  ],
  [
    "百炼鉴权失败，或者 ASR 转录为空？",
    "<p>鉴权失败时，检查北京地域的 Key、服务是否已开通，以及环境变量 <code>BAILIAN_KEY</code> 是否覆盖了本地文件里的新 Key。</p><p>空转写还可能来自无人声、直链过期、视频被删除或设为私密，也可能是 ASR 请求失败。先用一条确定可访问、有人声的视频测试，再看服务终端日志区分原因；不要仅凭空文本认定视频已下架。</p>",
  ],
  [
    "提示提取未开放，DISABLE_EXTRACT 应该怎么设？",
    "<p>当前上游代码只要检测到非空的 <code>DISABLE_EXTRACT</code>，就不会走本地提取链路。请清除这个变量后重启服务，<strong>不要设成 0</strong>。macOS / Linux 使用 <code>unset DISABLE_EXTRACT</code>；PowerShell 使用 <code>Remove-Item Env:DISABLE_EXTRACT -ErrorAction SilentlyContinue</code>。</p>",
  ],
  [
    "出现 ModuleNotFoundError 或浏览器缺失？",
    "<p>确认你在第 1 步创建的虚拟环境里安装依赖，并且启动服务使用同一个环境的 Python。缺少 dashscope / playwright 时运行 <code>python -m pip install dashscope playwright</code>；缺少浏览器时运行 <code>python -m playwright install chromium</code>。</p><p>Linux 若缺系统库，使用 <code>python -m playwright install --with-deps chromium</code>。扫码登录需要能够打开图形浏览器。</p>",
  ],
  [
    "抖音原视频没了，能改用 B 站链接吗？",
    `<p>Skill 的日常入口是抖音分享链接。仓库另附了 B 站搬运视频的<strong>进阶兜底流程</strong>，需先由你提供对应的搬运链接，不能当成所有 B 站视频都能一键提取。</p><ol><li>从 BV 号和 cid 获取音频流，带 B 站 Referer 下载。</li><li>用 ffmpeg 把 m4s 重封装为 m4a。</li><li>上传音频后调用百炼异步转写，再轮询取结果。</li></ol><p>直接把 B 站 CDN 音频 URL 交给转写服务可能遭遇 403。此页面未实测该兜底链路，具体 SDK 和上传接口需结合当前服务确认。${external(`${repo}/blob/main/references/fallback.md`, "阅读仓库的兜底说明")}</p>`,
  ],
  [
    "需要 DeepSeek Key 吗？开源就等于全部免费吗？",
    `<p>这个 Skill 不依赖 Traffic Compass 审核功能使用的 DeepSeek Key。转写需要百炼 Key，总结由当前 Agent 完成。</p><p>Skill 以 MIT 协议开源。百炼语音识别和你使用的 Agent 可能收费，免费额度也有条件，请以各自账户与 ${external("https://help.aliyun.com/zh/model-studio/model-pricing", "百炼官方计费说明")} 为准。</p>`,
  ],
  [
    "数据会去哪里？能完全离线运行吗？",
    "<p>这个展示网页不收集密钥、Cookie 或视频内容，也不会调用你本机的提取接口。勾选的教程进度只保存在浏览器本地。</p><p>实际使用时：Cookie 保存在你的电脑，Playwright 使用它访问抖音；视频直链会提交到百炼做云端语音识别；转写稿交由当前 Agent 总结；Markdown 保存到你指定的目录。因此整个提取与总结流程不是完全离线。</p>",
  ],
  [
    "能理解视频画面吗？支持批量和所有平台吗？",
    "<p>当前 Skill 的明确范围是「抖音链接 → 语音文案 → 结构化总结」。没有承诺视频画面理解、镜头分析、时间轴字幕导出或任意平台支持，也没有独立的批量任务管理器。</p><p>规范支持把系列内容按期分别整理，但仍需要先逐条获取完整转写。提取通常 30–120 秒，较长视频、网络或平台限制可能让它更慢或失败。</p>",
  ],
];
$("#faq-list").innerHTML = faqs
  .map(
    ([question, answer], index) =>
      `<details class="faq-item" data-faq="${index}"><summary>${question}</summary><div class="faq-answer">${answer}</div></details>`,
  )
  .join("");
$("#faq-search").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  let count = 0;
  $$(".faq-item").forEach((item) => {
    const match = item.textContent.toLowerCase().includes(query);
    item.hidden = !match;
    if (match) count++;
  });
  $("#faq-empty").hidden = count !== 0;
});
renderDoc("summary");
renderStep(0);
