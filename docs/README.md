# Video Transcript website

Static, Chinese beginner-oriented introduction and configuration guide, published from this directory using `.github/workflows/pages.yml`.

## Local preview

From the repository root:

```sh
python3 -m http.server 5192 --bind 127.0.0.1 --directory docs
```

Open http://127.0.0.1:5192/. No npm installation or build is required.

- `index.html`: page layout and static content
- `style.css`: responsive orange/ink visual design
- `app.js`: workflow explanations, sample artifact, OS-aware setup guide, local checklist, FAQ search
- `downloads/`: optional local setup helpers; never run by the website
- `assets/`: locally served Barlow Condensed font (OFL license included) and favicon

The website does not perform transcription or collect keys, cookies, or URLs. Its sample is explicitly fictional. Only setup completion and OS selection are saved in localStorage. Native clipboard permissions apply.

## Content evidence

Reviewed 2026-10-12 against Skill commit `472d185cd037ff9a529c7a1060fa090e930398d4` (README, SKILL, setup, fallback and bundled .skill) and Traffic Compass commit `4a8e07f58a35f2238082214285ed5e0c595e3184` (app.py, extract.py, config.py).

Current upstream differs from the Skill setup document:

1. Use `DOUYIN_CHROME_DATA`, pointing directly at the cookie directory, not `DOUYIN_COOKIE_BASE`.
2. Clear `DISABLE_EXTRACT`; any nonempty value disables local extraction, including `0`.
3. Current upstream ASR uses REST; original dependency guidance is retained for compatibility and the advanced fallback.

These differences are explained in the guide. Skill source/package files have not been changed. The third-party transcription flow and advanced Bilibili fallback require user accounts and have not been end-to-end verified by website QA.

Installation helper behavior: `configure-key.py` preserves unrelated existing keys and atomically writes a private temporary file; `login-douyin.py` verifies a login cookie exists before replacing the local cookie file. Use your own accounts and do not upload these generated local files.
