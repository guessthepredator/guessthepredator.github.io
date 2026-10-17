# Local transparent full-body portraits

This release does not bundle unverified full-body character artwork. The ten specifically requested targets are Vantage, Sparrow, Rampart, Revenant, Loba, Gibraltar, Conduit, Catalyst, Ballistic and Alter. The UI uses identical `object-fit: contain` transparent portrait frames and tries the existing sources, but those sources may be square or may have baked-in backgrounds.

To fully standardize, obtain approved/authorized transparent PNG/WebP full-body source files for each character, put them in this directory and add their filenames to `src/portrait_media_manifest.mjs` (key = legend slug). The loader prioritizes these verified local files automatically. Do not simply rename square portraits to imply full-body transparency.

Potential resource: [Apex Legends Renders](https://apexlegendsrenders.com/), which describes its PNG renders as transparent and available for fan content, subject to that site's terms and attribution.
