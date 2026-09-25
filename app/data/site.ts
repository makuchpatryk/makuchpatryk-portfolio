import type { SiteData } from '../types/content'

// Placeholder values are bracketed on purpose: scripts/check-placeholders.mjs fails the launch gate on them.
export const site: SiteData = {
  handle: '[handle]',
  name: '[Full Name]',
  city: '[City]',
  email: '[email]',
  links: {
    github: 'https://github.com/[github-user]',
    linkedin: 'https://www.linkedin.com/in/[linkedin-user]'
  },
  photo: null,
  cv: 'cv.pdf'
}
