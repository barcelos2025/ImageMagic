# ImageMagic â€” Static, Netlify-ready

ImageMagic is a static, privacy-first, multi-language site for image processing in the browser: resize, convert, remove background, remove watermark, and AI upscale. Monetized with Google AdSense (medium density), with an optional premium ad-free plan via Netlify Identity + Stripe Checkout.

## Quick Start
- Deploy to Netlify (drag & drop or connect repo)
- Set environment variables in Netlify:
  - `STRIPE_SECRET_KEY`
  - `PRICE_ID_USD` (Stripe Price ID in USD for Premium)
  - `PRICE_ID_BRL` (Stripe Price ID in BRL â‰ˆ R$ 9,99)
  - Optional: `SUCCESS_URL`, `CANCEL_URL`
- Update AdSense and GA IDs:
  - In `index.html`: set `window.__AD_CLIENT__` and `window.__GA_ID__`
  - Ad slots use `data-ad-client="ca-pub-XXXXXXX"` placeholders across pages (search & replace)
- Enable Netlify Identity in site settings

## Pages
- `/` Home
- `/resize.html` Resize (presets + custom)
- `/convert.html` Convert (PNG/JPEG/WEBP/AVIF + GIF/BMP/TIFF via Squoosh)
- `/remove-bg.html` Remove Background (AI, ONNX Runtime + UÂ²-Net/BRIA RMBG)
- `/magic-paint.html` Inpainting (OpenCV.js Telea/NS)
- `/upscale.html` Upscale (AI up to 8Ã—, UpscalerJS + TensorFlow.js)
- `/pricing.html` Pricing (Premium ~$1.99, ~R$9,99)
- `/account.html` Account (Netlify Identity)
- `/about.html`, `/contact.html`, `/privacy.html`

## PWA
- `manifest.webmanifest`, `sw.js`, `offline.html`

## i18n
- English (default), Portuguese, Spanish â€” see `assets/js/i18n.js`

## Theme
- Dark/Light with toggle. Palette options in `assets/css/styles.css` (`.light-1/.dark-1`, `.light-2/.dark-2`, `.light-3/.dark-3`).

## Notes
- All processing is client-side. Heavy AI libraries/models load on demand from public CDNs or local copies (preferred for low traffic).
- To run with minimal network traffic, place local assets at:
  - ONNX Runtime WASM: `assets/vendors/onnxruntime-web/` (copy `.wasm` files from onnxruntime-web 1.19.x dist)
  - OpenCV.js: `assets/vendors/opencv/opencv.js`
  - RMBG model: `assets/models/rmbg/model.onnx`
  - Optional Upscaler model: `assets/models/upscaler/esrgan-thick/1x/model.json` (+ shard files)
  - Optional Squoosh lib: set `window.__SQUOOSH_BASE__ = '/assets/vendors/squoosh'`
- The app will try local paths first and fall back to CDN. You can also override via globals:
  - `window.__RMBG_MODEL__`, `window.__UPSCALER_LIB__`, `window.__TFJS_URL__`, `window.__UPSCALE_MODEL__`, `window.__SQUOOSH_BASE__`.
- AdSense loads only after consent; ads are hidden for logged-in premium users (placeholder logic, wire to real premium flag if needed).
- Stripe checkout session is created by `netlify/functions/create-checkout-session.js`.




