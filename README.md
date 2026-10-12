# K&S Construction — Website

Website for K&S Construction, a second-generation, family-owned residential construction and home improvement contractor in Waterloo, Illinois (licensed & insured). As visitors scroll, a procedurally generated 3D family home is built in real time: excavation → foundation → framing → roofing → windows → exterior finishes → deck, driveway, fence and landscaping. Scrolling back up reverses it.

**Stack:** React 19 · Vite · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · Three.js / React Three Fiber / Drei · Lucide icons

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
npm run lint       # oxlint
```

Requires Node 20.19+ (Node 22 recommended).

## Deploying

`npm run build` outputs a static site in `dist/`. The build uses relative asset paths (`base: './'`), so it can be uploaded to any static host (Netlify, Vercel, Cloudflare Pages, S3, a sub-folder on your own server) with no extra configuration.

## Business details & brand

- Phone **618-910-7886** (`tel:+16189107886`), name, location and tagline live in `src/lib/site.ts`. An optional `VITE_PHONE_NUMBER` repository variable overrides the phone at build time.
- Official logo: `src/assets/brand/logo-*.webp` (transparent cut-out of the supplied artwork at 160/320/640 px). Favicon, Apple touch icon and the social share image are in `public/`.
- Palette tokens in `src/index.css`: `brand` (deep metallic red), `brand-bright` (red for small text on black, WCAG AA), `steel` (silver), `ink` (charcoal), `bone` (white).

## Adding customer reviews

Add real, verified reviews to `src/data/testimonials.ts` (an example entry is in the comments). While the list is empty, the Reviews section shows an invitation instead of reviews.

## Connecting the quote form

The contact form validates fully on the client. **Until a backend is configured it runs in demo mode.** It says clearly that nothing was sent, and it never claims a message was delivered.

To receive real inquiries, copy `.env.example` to `.env` and set:

```
VITE_FORM_ENDPOINT=https://your-form-service.example/endpoint
```

The endpoint receives a JSON `POST` with `fullName, email, phone, projectType, location, budget, description, startDate`. Any JSON-accepting service works (Formspree, a serverless function, a CRM webhook). The integration lives in `src/lib/submitInquiry.ts`.

## Project structure

```
src/
  App.tsx                         page composition, smooth-scroll + ScrollTrigger refresh wiring
  lib/
    constructionStore.ts          shared scroll progress (0–1) + construction stage definitions
    gsap.ts / smoothScroll.ts     GSAP registration, Lenis driven by the GSAP ticker
    submitInquiry.ts              form integration point (demo mode by default)
    images.ts                     Unsplash photo IDs
  components/
    three/
      parts.ts                    procedural house: every component + its scroll window
      AnimatedParts.tsx           instanced renderer that poses parts for any progress value
      Building.tsx                materials and window panes that light up at dusk
      ConstructionScene.tsx       canvas, camera spline choreography, sky, lighting
    sections/                     Hero, ConstructionExperience, About, Services, Projects,
                                  Process, WhyChoose, Testimonials, Gallery, FAQ, Contact
    layout/                       Navbar (glass on scroll, mobile menu), Footer
    ui/                           MagneticButton, SectionHeading, Modal, SmartImage, …
  data/                           services, projects, process, testimonials, gallery, FAQ content
```

### How the scroll-driven construction works

1. `ConstructionExperience` pins a full-screen section for 5 viewport heights. A scrubbed GSAP timeline tweens `constructionStore.progress` from 0 to 1. The same timeline drives the headline, the HUD and the final "From vision to reality" reveal.
2. Every building element in `parts.ts` declares an install window `[t0, t1]`, an optional removal window (for scaffolding, the crane and site cabins) and a motion (`growY`, `drop`, `slide`, `rise`, `scale`).
3. Each render frame, `AnimatedParts` recomputes instance matrices from the current progress. This is a pure function of progress, so scrolling backwards reverses the build exactly.
4. The camera follows Catmull-Rom splines keyed to progress, and orbits subtly with the mouse.

To retime a stage, edit `T` in `parts.ts` and the matching `start` values in `CONSTRUCTION_STAGES`.

### Performance and accessibility

- Parts are batched into about 25 instanced meshes. The canvas only renders while the section is near the viewport.
- On low-power devices, shadows and antialiasing are turned off and the pixel ratio is capped.
- With `prefers-reduced-motion`, Lenis and decorative animations are disabled. The construction is still scroll-driven, but without smoothing.
- A 2D SVG elevation that also builds with scroll replaces the 3D scene if WebGL is unavailable.
- The site includes semantic landmarks, a skip link, focus-trapped dialogs, keyboard-navigable lightbox and slider, and accessible form errors.

## Content notes. Please read before going live.

- No email, street address or office hours have been invented.
- **Project and gallery images** are illustrative Unsplash stock photos and are labelled as such. Replace them with real K&S job photos when available (`src/lib/images.ts`, `src/data/projects.ts`, `src/data/gallery.ts`).
- **Reviews** are empty by design. Add only genuine reviews.
- **Social links** in the footer are placeholders. Add the real Facebook page URL when available.
- No years in business, certifications, awards or service areas beyond Waterloo, Illinois are claimed.
