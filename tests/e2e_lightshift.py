"""Browser checks for both failure and success of an image verification source.
The verified path uses a clearly labeled QA-only image, NOT an Apex screenshot.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(1600,900),(390,844)]:
  for scenario in ['offline','verified']:
   page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
   errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
   page.set_content((root/'tests'/f'v25_{scenario}_harness.html').read_text(),wait_until='domcontentloaded')
   page.locator('.gtp2-mode-card').first.wait_for(timeout=8000)
   page.wait_for_timeout(180)
   assert page.locator('.gtp2-mode-card').count()==6
   assert page.locator('img#gtp2-backdrop').count()==1
   mapbtn=page.locator('.gtp2-mode-card[data-mode="map"]')
   if scenario=='offline':
    assert mapbtn.is_disabled(),'Map must disable if no photo loaded'
    assert '5' in page.locator('.gtp2-progress strong').inner_text()
   else:
    assert mapbtn.is_enabled(),'Map should unlock on verified image'
    mapbtn.click();page.locator('.map-photo.has-map-art').wait_for(timeout=8000)
    assert page.locator('.map-img-candidate').evaluate('(img)=>img.naturalWidth')==800
    page.locator('.gtp2-brand').click()
   page.locator('[data-action="session"][data-session="unlimited"]').click()
   assert page.locator('[data-action="home-daily"]').count()==0, 'No Continue Daily in Free Play'
   assert 'START FREE PLAY' in page.locator('.gtp2-primary').inner_text()
   page.locator('.gtp2-mode-card[data-mode="pixel"]').click()
   page.locator('.visual-pixel').wait_for()
   page.locator('.pixel-preset button[data-style="soft"]').click()
   assert 'active' in page.locator('.pixel-preset button[data-style="soft"]').get_attribute('class')
   bg=page.locator('.gtp2-game-scene').evaluate('(el)=>getComputedStyle(el,":before").backgroundImage')
   assert 'linear-gradient' in bg and 'game-bg' not in bg,bg
   page.locator('[data-action="picker"]').click()
   assert page.locator('.gtp2-legend-card').count()==28
   assert not errors,(width,scenario,errors)
   if width==1600 and scenario=='offline':
    page.locator('[data-action="close-picker"]').click()
    page.screenshot(path=str(root/'tests/v25_light_game_preview.png'))
   print('PASS',width,scenario,'map gate, freeplay button, soft blur selection, light-game skin, 28 roster, 0 JS errors')
   page.close()
 browser.close()
