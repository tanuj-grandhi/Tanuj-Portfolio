# Tanuj Grandhi — Personal Portfolio Website

A complete, responsive editorial-style personal portfolio and CV website for Tanuj Grandhi, a B.Tech Computer Science and Engineering student at Lovely Professional University.

## Design

The site uses an **Editorial Typography** design system:

| Token | Value |
|---|---|
| Primary background | `#F6F0E6` (warm cream) |
| Main text | `#171717` (near-black) |
| Accent orange | `#E76F32` |
| Secondary background | `#EEE5D8` |
| Muted text | `#69635D` |
| Borders | `#CFC5B8` |
| Dark sections | `#202020` |

**Fonts**: Playfair Display (display serif) · Space Grotesk (sans-serif) · JetBrains Mono (code)

## Project Structure

```
portfolio/
├── index.html          # Main HTML file (all sections, single-page)
├── styles.css          # Complete design system and responsive styles
├── script.js           # Vanilla JS — navigation, animations, interactions
├── cv/
│   └── Tanuj_Grandhi_CV.pdf   # ← Place your CV PDF here
└── README.md           # This file
```

## Local Setup

No build tools or dependencies required. This is a pure HTML/CSS/JS website.

1. **Clone or download** the repository files.
2. Open `index.html` in any modern browser — it works immediately.
3. For local development with live-reload, use VS Code's **Live Server** extension or any static file server:
   ```bash
   # Using Python (Python 3)
   python -m http.server 8080
   # Then open http://localhost:8080
   ```

## Adding Your CV

1. Place your CV PDF file at:
   ```
   portfolio/cv/Tanuj_Grandhi_CV.pdf
   ```
2. The "Download CV" button in the navigation and hero section will automatically serve this file.

> **Note:** Until the file is added, the download button links to the expected path but will return a 404. The path can be updated in `index.html` in the `<a href="cv/Tanuj_Grandhi_CV.pdf">` attributes if your file has a different name.

## Sections

| # | Section | ID |
|---|---|---|
| — | Navigation | `#hero` |
| — | Hero | `#hero` |
| 01 | About | `#about` |
| 02 | Skills | `#skills` |
| 03 | Featured Projects | `#projects` |
| 04 | More Experiments | `#more` |
| 05 | Training & Learning | `#experience` |
| 06 | Certifications | `#certifications` |
| 07 | Education | `#education` |
| 08 | Leadership | `#leadership` |
| 09 | Contact | `#contact` |

## Featured Projects

| Project | Repository |
|---|---|
| SmartStudy AI | https://github.com/tanuj-grandhi/SmartStudy-AI |
| ToneShift | https://github.com/tanuj-grandhi/ToneShift |
| Virtual Memory Optimization Simulator | https://github.com/tanuj-grandhi/Virtual-Memory-Optimization-Simulator- |

## Deployment

### GitHub Pages

1. Push all files to a GitHub repository (e.g., `tanuj-grandhi.github.io` or any repo).
2. Go to **Settings → Pages**.
3. Set **Source** to `main` branch, `/ (root)` folder.
4. Your site will be live at `https://tanuj-grandhi.github.io`.

### Netlify (Drag & Drop)

1. Go to [netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the entire `portfolio/` folder.
3. Netlify will deploy instantly and provide a live URL.

### Vercel

```bash
npx vercel --prod
```

## Accessibility

- All interactive elements have visible focus states
- All images and decorative elements have appropriate `aria-hidden` or `alt` attributes
- Mobile menu includes `aria-expanded` and `role="dialog"` for screen readers
- `prefers-reduced-motion` is respected — all animations are disabled when set
- Color contrast meets WCAG AA standards throughout

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge — all recent versions).

---

*Designed with curiosity. Built with code.*
