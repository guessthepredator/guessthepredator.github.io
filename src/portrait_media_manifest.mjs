/** Five verified transparent full-body renders are fetched at build-time from
 * Apex Legends Wiki (game art: Electronic Arts / Respawn Entertainment).
 * The GitHub Pages artifact contains the resulting first-party PNGs, avoiding
 * the browser hotlink redirects that caused face-only fallbacks.
 * Source images: Original <Legend>.png via apexlegends.wiki.gg.
 * Other unverified portraits keep their existing safe fallback sources.
 */
export const localPortraitFiles=Object.freeze({
  alter:'original-alter.png',
  ballistic:'original-ballistic.png',
  catalyst:'original-catalyst.png',
  conduit:'original-conduit.png',
  sparrow:'original-sparrow.png'
});
export const desiredFullBodySlugs=Object.freeze(['vantage','sparrow','rampart','revenant','loba','gibraltar','conduit','catalyst','ballistic','alter']);
