// Single source of truth for the operator details shown in the Impressum,
// the Datenschutzerklärung and the contact pages.
//
// This site is run privately as a demo, so the Impressum (§ 5 DDG) needs the
// real name and a postal address where you can be served (no PO box), plus an
// email address. A phone number is optional but recommended.
//
// The production build fails while any required field is empty, so the site
// can't go live with a missing or fake Impressum.

export const legal = {
  name: '', // full legal name, e.g. "Dimitris Mustername"
  street: '', // street + house number
  postalCode: '',
  city: '',
  country: 'Deutschland',
  email: '', // must actually be read; also receives contact form messages
  phone: '', // optional
}

const REQUIRED = ['name', 'street', 'postalCode', 'city', 'email'] as const

export function assertLegalInfoComplete() {
  const missing = REQUIRED.filter((key) => !legal[key].trim())
  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(
      `lib/legal.ts is missing: ${missing.join(', ')}. ` +
        'Fill in your real Impressum details before deploying.'
    )
  }
}
