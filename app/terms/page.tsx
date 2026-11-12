import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageLayout, LegalSection } from '@/components/legal-page-layout'

export const metadata: Metadata = { title: 'Nutzungsbedingungen – Aclea' }

export default function TermsPage() {
  return (
    <LegalPageLayout title="Nutzungsbedingungen" updated="November 2026">
      <LegalSection title="1. Demo-Projekt">
        <p>
          Aclea ist ein privates, nicht-kommerzielles Demo-Projekt. Die Nutzung ist kostenlos. Es
          wird kein Vertrag über eine entgeltliche Leistung geschlossen, und es besteht kein
          Anspruch auf Verfügbarkeit, Support oder bestimmte Funktionen.
        </p>
      </LegalSection>

      <LegalSection title="2. Keine echten personenbezogenen Daten">
        <p>
          Bitte importieren oder erfassen Sie keine echten Daten über Dritte (z.&nbsp;B. reale
          Kontakte oder Kundendaten). Verwenden Sie ausschließlich Testdaten. Für Daten, die Sie
          entgegen diesem Hinweis eingeben, sind Sie selbst verantwortlich.
        </p>
      </LegalSection>

      <LegalSection title="3. Löschung">
        <p>
          Konten und Daten können jederzeit und ohne Vorankündigung gelöscht werden. Sie können Ihr
          Konto und Ihre Daten außerdem jederzeit selbst in den Einstellungen löschen.
        </p>
      </LegalSection>

      <LegalSection title="4. Haftung">
        <p>
          Da die Nutzung unentgeltlich erfolgt, wird nur für Vorsatz und grobe Fahrlässigkeit
          gehaftet. Die Haftung für Schäden aus der Verletzung des Lebens, des Körpers oder der
          Gesundheit bleibt unberührt.
        </p>
      </LegalSection>

      <LegalSection title="5. Datenschutz">
        <p>
          Informationen zur Verarbeitung personenbezogener Daten finden Sie in der{' '}
          <Link href="/privacy" className="text-emerald-400 hover:underline">
            Datenschutzerklärung
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
