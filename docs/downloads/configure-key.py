"""Run from Traffic Compass's webapp directory. Store a Bailian key locally."""
import getpass
import json
import os
import tempfile
from pathlib import Path


def main():
    if not Path('app.py').is_file() or not Path('config.py').is_file():
        raise SystemExit('请先进入 traffic-compass/webapp 目录，再运行本脚本。')
    target = Path('_data/apikeys.json')
    target.parent.mkdir(parents=True, exist_ok=True)
    keys = json.loads(target.read_text(encoding='utf-8')) if target.exists() else {}
    if not isinstance(keys, dict):
        raise SystemExit('已有 apikeys.json 不是 JSON 对象，请先检查。未覆盖原文件。')
    value = getpass.getpass('粘贴 BAILIAN_KEY 后回车（输入不回显）：').strip()
    if not value:
        raise SystemExit('未输入密钥，未修改配置。')
    keys['bailian'] = value
    fd, temporary = tempfile.mkstemp(prefix='.apikeys-', dir=target.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as handle:
            json.dump(keys, handle, ensure_ascii=False, indent=2)
            handle.write('\n')
        os.replace(temporary, target)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)
    print('百炼密钥已保存：', target.resolve())
    print('请勿公开或上传此文件。密钥是否有效需要在提取测试中验证。')
    if os.getenv('BAILIAN_KEY'):
        print('注意：当前已设置 BAILIAN_KEY 环境变量，服务会优先使用环境变量。')


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError) as error:
        raise SystemExit(f'配置未完成，请检查文件权限和 JSON 格式（{type(error).__name__}）。')
