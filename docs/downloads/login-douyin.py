"""Run in Traffic Compass's webapp directory using its Python environment."""
import json
import os
import tempfile
from pathlib import Path


def main():
    if not Path('app.py').is_file() or not Path('config.py').is_file():
        raise SystemExit('请先进入 traffic-compass/webapp 目录，再运行本脚本。')
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit('请先运行 python -m pip install playwright，再运行 python -m playwright install chromium。')
    directory = Path(os.environ.get('DOUYIN_CHROME_DATA') or '_data/chrome_data').expanduser()
    target = directory / 'douyin_cookies.json'
    directory.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=False)
        try:
            context = browser.new_context()
            page = context.new_page()
            page.goto('https://www.douyin.com', wait_until='domcontentloaded', timeout=60000)
            input('在弹出的浏览器中扫码登录。确认登录成功后，回到这里按回车…')
            cookies = context.cookies()
            if not any(cookie.get('name') in ('uid_tt', 'sessionid') and cookie.get('value') for cookie in cookies):
                raise SystemExit('未检测到登录 Cookie。未覆盖已有文件，请重新运行并完成登录。')
            fd, temporary = tempfile.mkstemp(prefix='.cookies-', dir=directory)
            try:
                with os.fdopen(fd, 'w', encoding='utf-8') as handle:
                    json.dump(cookies, handle, ensure_ascii=False, indent=2)
                    handle.write('\n')
                os.replace(temporary, target)
            finally:
                if os.path.exists(temporary):
                    os.unlink(temporary)
        finally:
            browser.close()
    print('Cookie 已保存：', target.resolve())
    print('只保留在本机，请勿公开或上传。若登录失效，请重新运行本脚本。')


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        raise SystemExit('\n已取消登录。')
