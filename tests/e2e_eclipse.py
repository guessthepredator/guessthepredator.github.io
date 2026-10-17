"""Offline in-memory Chromium UI regression, not a network or license test.
This deliberately replaces POI source resolution with local SVG to test fallback.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'tests/browser_harness.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(1600,900),(390,844)]:
  page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
  errs=[]
  page.on('pageerror',lambda err:errs.append(str(err)))
  page.set_content(html,wait_until='domcontentloaded')
  page.locator('.gtp2-mode-card').first.wait_for()
  assert page.locator('.gtp2-mode-card').count()==6
  assert not page.locator('a[href*="MEDIA_STUDIO"]').count()
  assert page.locator('img#gtp2-backdrop').evaluate('(img)=>img.complete && img.naturalWidth>0')
  page.screenshot(path=str(root/'tests'/f'v24_home_{width}.png'),full_page=False)
  page.locator('.gtp2-mode-card[data-mode="map"]').click()
  page.locator('.map-photo').wait_for()
  page.wait_for_timeout(200)
  assert page.locator('.map-photo.has-map-art').count()==1,(width,'map fallback')
  assert page.locator('.map-img-candidate').evaluate('(img)=>img.naturalWidth>0'),(width,'map SVG')
  assert page.locator('.map-source-link').count()==1
  page.screenshot(path=str(root/'tests'/f'v24_map_{width}.png'),full_page=False)
  page.locator('[data-action="home"]').first.click()
  page.locator('.gtp2-mode-card[data-mode="pixel"]').click()
  page.locator('.visual-pixel').wait_for()
  assert page.locator('.pixel-preset button').count()==3
  page.screenshot(path=str(root/'tests'/f'v24_pixel_{width}.png'),full_page=False)
  page.locator('[data-action="picker"]').click()
  assert page.locator('.gtp2-picker .gtp2-legend-card').count()==28
  page.screenshot(path=str(root/'tests'/f'v24_picker_{width}.png'),full_page=False)
  assert not errs,(width,errs)
  print(f'PASS {width}x{height}: 6 modes, map SVG, pixel 3 modes, roster 28, no JS errors')
  page.close()
 browser.close()
