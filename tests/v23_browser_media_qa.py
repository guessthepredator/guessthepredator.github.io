"""Browser integration test against a virtual HTTPS Pages site with local media served from the repo.
The remote character portraits are *not* mocked as real images; they remain a documented external dependency.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'tests/browser_harness.html').read_text().replace('<head>','<head><base href="https://gtp-test.example/">',1)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for viewport in [(1600,900),(390,844)]:
  page=b.new_page(viewport={'width':viewport[0],'height':viewport[1]})
  errors=[];page.on('pageerror',lambda ex:errors.append(str(ex)))
  def route(req):
   from urllib.parse import unquote,urlparse
   url=req.request.url
   path=unquote(urlparse(url).path).lstrip('/')
   f=ROOT/path
   if path.startswith('assets/') and f.is_file():
    mime='image/svg+xml' if f.suffix=='.svg' else 'image/webp' if f.suffix=='.webp' else 'audio/wav' if f.suffix=='.wav' else 'application/json'
    req.fulfill(status=200,body=f.read_bytes(),content_type=mime)
   else:req.abort()
  page.route('**/*',route)
  page.set_content(html,wait_until='domcontentloaded')
  assert page.locator('.gtp2-mode-card').count()==6
  assert page.locator('#mirage-gaze').count()==0
  page.locator('.gtp2-mode-card[data-mode="map"]').click()
  page.wait_for_function("document.querySelector('.map-photo')?.classList.contains('has-map-art')",timeout=8000)
  assert page.locator('.map-photo.recon-art').count()==1
  assert page.locator('img[data-map-photo]').evaluate('(el)=>el.naturalWidth')==1000
  assert page.locator('.map-credit').inner_text().find('RECONSTRUCTION')>=0
  if viewport[0]==1600:
   page.screenshot(path=str(ROOT/'tests/v23_map_preview.png'),full_page=True)
  page.locator('.gtp2-brand').click()
  page.locator('.gtp2-mode-card[data-mode="classic"]').click()
  page.locator('button[data-action="picker"]').first.click()
  assert page.locator('.gtp2-legend-card').count()==28
  # Actual character portraits are external and intentionally blocked in this offline QA.
  # Assert 28 distinct REAL-source catalog entries instead, without inventing local avatars.
  assert page.locator('.gtp2-legend-card').count()==28
  assert page.evaluate('Object.keys(artCatalog).length')==28
  assert page.locator('img[src*="/assets/legends/"]').count()==0
  if viewport[0]==1600:page.screenshot(path=str(ROOT/'tests/v23_picker_preview.png'))
  assert not errors,errors
  print('PASS',viewport,'POI-specific recon SVG loads, all 28 character cards, no synthetic avatars or eye overlays')
  page.close()
 b.close()
