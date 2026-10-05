# swiftMed Kenya — Portfolio Demo Build

A production-shaped static site for a fictional Nairobi healthcare clinic,
built to demonstrate:

- Mobile-first responsive design
- Accessibility (WCAG 2.2 AA in practice, not just lip service)
- Core Web Vitals-aware engineering
- Kenya-specific UX patterns (WhatsApp-first, click-to-call, M-PESA)
- Progressive enhancement (the site works with JS disabled)

---

## Running locally

No build step. Serve the directory with any static server:

```bash
python3 -m http.server 8000
# or
npx serve .