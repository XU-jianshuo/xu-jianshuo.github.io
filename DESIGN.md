# DESIGN.md

This site uses a professional profile system inspired by LinkedIn-style resume presentation.

## Principles

- Use a light gray application canvas with white profile cards as the primary surface.
- Use LinkedIn blue sparingly for primary actions, links, focus states, numbering, and active navigation.
- Use dark neutral text on light surfaces, with medium gray for supporting copy.
- Structure the homepage like a professional profile: intro, credentials, about, featured work, experience, skills, and contact.
- Preserve Chinese long-form readability with generous body line-height.
- Keep buttons at 8px radius and cards at 8-16px radius.
- Use thin borders and light shadows for hierarchy, matching a professional network profile page.
- Reserve pill shapes for credentials, tags, and compact status chips.

## Tokens

- Canvas: `#f4f2ee`
- Surface 1: `#ffffff`
- Surface 2: `#f8fafd`
- Surface 3: `#edf3f8`
- Hairline: `#d6d9dc`
- Primary: `#0a66c2`
- Primary hover: `#004182`
- Ink: `#191919`
- Muted ink: `#666666`
- Inverse canvas: `#ffffff`

## Components

- Navigation: compact sticky white bar with profile-style links and blue active states.
- Buttons: rectangular 8px controls, primary LinkedIn blue and secondary white or outlined.
- Cards: white panels with 1px hairline borders and subtle elevation.
- Timeline: white experience entries connected by light hairline rules.
- Work features: featured profile cards with readable public case summaries.
- Contact: white profile card with blue text links, not a decorative banner.

## Source References

- LinkedIn profile information architecture: About, Featured, Experience, Skills.
- `awesome-design-md` local design reference library.
