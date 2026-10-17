/** Five full-body model renders are transparently cut out at build time.
 * Their original PNGs include baked-in showcase scenes. We use U2Net to
 * remove those panels and platform props, then serve local RGBA PNG files.
 * Original game art belongs to Electronic Arts / Respawn Entertainment.
 * Older fallback sources remain for failed image requests.
 */
export const localPortraitFiles=Object.freeze({
  alter:'cutout-alter.png',
  ballistic:'cutout-ballistic.png',
  catalyst:'cutout-catalyst.png',
  conduit:'cutout-conduit.png',
  sparrow:'cutout-sparrow.png'
});
export const desiredFullBodySlugs=Object.freeze(['vantage','sparrow','rampart','revenant','loba','gibraltar','conduit','catalyst','ballistic','alter']);
