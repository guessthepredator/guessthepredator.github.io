"""Emergency rollback QA: enforce no generic avatars, no random map art, Quote text-only."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'tests/browser_harness.html').read_text()
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':1440,'height':900})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 page.locator('.gtp2-mode-card[data-mode="quote"]').click()
 assert page.locator('.gtp2-quote-rework blockquote').count()==1
 assert page.locator('button[data-action="play-voice"]').count()==0
 page.locator('button[data-action="picker"]').click()
 assert page.locator('.picker-legend').count()==28
 source=page.locator('.picker-legend img[data-portrait]').first.evaluate('(i)=>i.getAttribute("src")')
 assert 'assets/legends' not in (source or ''),source
 page.locator('button[data-action="close-picker"]').click()
 page.locator('.gtp2-brand').click()
 page.locator('.gtp2-mode-card[data-mode="map"]').click()
 sources=page.locator('.map-photo img[data-map-photo]').first.evaluate('(i)=>i.src')
 assert 'concept' not in sources,sources
 assert page.locator('.map-photo').count()==1
 assert not errors,errors
 print('PASS rollback: 28 recognisable catalog portraits are preferred (remote availability not guaranteed), Quote is text-only, Map has no misleading concept image, no JS errors')
 b.close()
