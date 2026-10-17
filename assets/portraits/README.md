# Full-body transparent portraits (optional)

Place *verified* 3:4 canvas WebP/PNG renders (head to feet, alpha, without a painted background) in this folder. Then add each real filename to `src/portrait_media_manifest.mjs` under its Legend slug, for example:

```js
export const localPortraitFiles=Object.freeze({
  'mirage':'mirage.webp',
  'mad-maggie':'mad-maggie.png',
});
```

There are no bundled renders in this version, so the manifest is deliberately empty. This avoids broken network requests for absent files and keeps the existing external fallback portraits. CSS already applies identical sizing, placement and neutral transparent framing in picker, win, wheel and daily spotlight.

Use appropriate permissions and credit for any source art you add. A cropped portrait cannot be made into an authentic full-body image through CSS alone.
