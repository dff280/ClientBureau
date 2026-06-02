export const publicSocialLinks = [
  { label: "Facebook", url: process.env.NEXT_PUBLIC_FACEBOOK_URL },
  { label: "X", url: process.env.NEXT_PUBLIC_X_URL },
  { label: "Instagram", url: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
  { label: "YouTube", url: process.env.NEXT_PUBLIC_YOUTUBE_URL },
  { label: "LinkedIn", url: process.env.NEXT_PUBLIC_LINKEDIN_URL },
].filter((link): link is { label: string; url: string } => Boolean(link.url))

export const publicContactInfo = {
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE,
  street: process.env.NEXT_PUBLIC_CONTACT_STREET,
  city: process.env.NEXT_PUBLIC_CONTACT_CITY,
  state: process.env.NEXT_PUBLIC_CONTACT_STATE,
  zip: process.env.NEXT_PUBLIC_CONTACT_ZIP,
}
