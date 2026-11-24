"""Optional browser smoke test: python -m pip install playwright; install Chromium or set CHROMIUM_PATH."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

html = Path(__file__).resolve().parents[1] / 'showcase' / 'index.html'
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        headless=True,
        executable_path=os.getenv('CHROMIUM_PATH') or None,
        args=['--no-sandbox', '--disable-dev-shm-usage'],
    )
    page = browser.new_page(viewport={'width': 1365, 'height': 900})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    # set_content avoids environments that prohibit file:// navigation.
    page.set_content(html.read_text(encoding='utf-8'), wait_until='domcontentloaded')
    assert page.locator('#total').inner_text() == '3'
    page.locator('#title').fill('Test research allocation')
    page.locator('#description').fill('Synthetic request for review flow testing')
    page.get_by_role('button', name='Create draft request').click()
    assert page.locator('#total').inner_text() == '4'
    page.get_by_role('button', name='Submit', exact=True).click()
    page.locator('#role').select_option('reviewer')
    page.get_by_role('button', name='Start review').last.click()
    page.get_by_role('button', name='Approve').last.click()
    assert page.locator('#approved').inner_text() == '2'
    assert page.locator('#events').inner_text() == '4'
    assert not errors, errors
    page.get_by_role('button', name='Reset demonstration').click()
    assert page.locator('#total').inner_text() == '3'
    assert page.locator('#events').inner_text() == '0'
    page.set_viewport_size({'width': 390, 'height': 844})
    assert page.locator('#requests').is_visible()
    print('PASS: create, submit, review, approve, audit count, reset, mobile viewport; no page errors')
    browser.close()
