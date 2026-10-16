from pathlib import Path
from playwright.sync_api import sync_playwright
html=Path(__file__).resolve().parent.joinpath('browser_harness.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(1600,900),(390,844)]:
  page=browser.new_page(viewport={'width':width,'height':height})
  errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(html,wait_until='domcontentloaded');page.wait_for_timeout(140)
  assert page.locator('.gtp2-mode-card').count()==6
  assert page.locator('img#gtp2-backdrop').evaluate('(el)=>el.naturalWidth')==1672
  assert page.locator('#mirage-gaze').count()==0
  hero=page.locator('.gtp2-hero').bounding_box()
  assert abs(hero['x'])<2 and abs(hero['width']-width)<2,(width,hero)
  assert page.locator('.gtp2-mode-card[data-mode="map"]').count()==1
  for mode in ('classic','pixel','quote','ability','emoji','map'):
   page.locator(f'.gtp2-mode-card[data-mode="{mode}"]').click()
   assert page.locator('.game').count()==1,mode
   assert not errors,(width,mode,errors)
   page.locator('.gtp2-brand').click()
   assert page.locator('.gtp2-mode-card').count()==6
  page.locator('[data-action="session"][data-session="unlimited"]').click()
  assert 'active' in page.locator('[data-action="session"][data-session="unlimited"]').get_attribute('class')
  # No synthetic eye overlay remains; original Mirage artwork is the only portrait.
  assert page.locator('img#gtp2-backdrop').count()==1
  assert page.locator('#mirage-gaze').count()==0
  assert not errors,errors
  print(f'PASS {width}x{height}: borderless hero, six modes, Free Play, no artificial gaze, clean FX, zero JS errors')
  page.close()
 browser.close()
