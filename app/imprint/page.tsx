import type { Metadata } from 'next'
import { LegalPageLayout, LegalSection } from '@/components/legal-page-layout'
import { legal, assertLegalInfoComplete } from '@/lib/legal'

export const metadata: Metadata = { title: 'Impressum – Aclea' }

export default function ImprintPage() {
  assertLegalInfoComplete()

  return (
    <LegalPageLayout title="Impressum" updated="November 2026">
      {!legal.name && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">
          Angaben fehlen – bitte in <code>lib/legal.ts</code> eintragen.
        </p>
      )}

      <LegalSection title="Angaben gemäß § 5 DDG">
        <p>{legal.name}</p>
        <p>{legal.street}</p>
        <p>{legal.postalCode} {legal.city}</p>
        <p>{legal.country}</p>
      </LegalSection>

      <LegalSection title="Kontakt">
        <p>
          E-Mail:{' '}
          <a href={`mailto:${legal.email}`} className="text-emerald-400 hover:underline">
            {legal.email}
          </a>
        </p>
        {legal.phone && <p>Telefon: {legal.phone}</p>}
      </LegalSection>

      <LegalSection title="Hinweis">
        <p>
          Aclea ist ein privates, nicht-kommerzielles Demo-Projekt. Es werden keine Waren oder
          Dienstleistungen gegen Entgelt angeboten. Angaben zu Funktionen, Integrationen, Testzeiträumen
          oder Systemstatus auf dieser Website dienen ausschließlich der Veranschaulichung.
        </p>
      </LegalSection>

      <LegalSection title="Haftung für Links">
        <p>
          Diese Website enthält Links zu externen Webseiten Dritter, auf deren Inhalte ich keinen
          Einfluss habe. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
          verantwortlich. Bei Bekanntwerden von Rechtsverletzungen werden derartige Links umgehend
          entfernt.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
