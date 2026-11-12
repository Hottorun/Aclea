import type { Metadata } from 'next'
import { LegalPageLayout, LegalSection } from '@/components/legal-page-layout'
import { legal } from '@/lib/legal'

export const metadata: Metadata = { title: 'Datenschutzerklärung – Aclea' }

const list = 'list-disc list-inside space-y-2 ml-2'

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Datenschutzerklärung" updated="November 2026">
      <LegalSection title="1. Verantwortlicher">
        <p className="mb-4">Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <p>{legal.name}</p>
          <p>{legal.street}</p>
          <p>{legal.postalCode} {legal.city}</p>
          <p>{legal.country}</p>
          <p className="mt-4">E-Mail: {legal.email}</p>
        </div>
        <p className="mt-4">
          Aclea ist ein privates, nicht-kommerzielles Demo-Projekt. Bitte geben Sie keine echten
          Daten über Dritte ein.
        </p>
      </LegalSection>

      <LegalSection title="2. Hosting und Server-Logs">
        <p className="mb-4">
          Diese Website wird bei Vercel Inc. (USA) gehostet. Beim Aufruf der Website werden automatisch technische Daten verarbeitet, die Ihr
          Browser übermittelt: IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Referrer sowie
          Browser- und Betriebssystemangaben.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt in der
          sicheren und stabilen Bereitstellung der Website.
        </p>
      </LegalSection>

      <LegalSection title="3. Reichweitenmessung (Vercel Web Analytics)">
        <p>
          Zur Messung der Seitenaufrufe wird Vercel Web Analytics eingesetzt. Dabei werden keine
          Cookies gesetzt und keine Daten auf Ihrem Endgerät gespeichert. Besucher werden nicht
          über mehrere Tage oder Websites hinweg wiedererkannt; es werden nur zusammengefasste
          Statistiken (z.&nbsp;B. aufgerufene Seiten, Herkunftsland, Gerätetyp) erstellt.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
        </p>
      </LegalSection>

      <LegalSection title="4. Benutzerkonto">
        <p className="mb-4">
          Wenn Sie ein Konto anlegen, werden Name, E-Mail-Adresse, Passwort (nur als Hash
          gespeichert) sowie Team-Zugehörigkeit und Einstellungen gespeichert. Für die Anmeldung
          wird ein technisch notwendiges Cookie gesetzt; Darstellungseinstellungen (z.&nbsp;B.
          Hell-/Dunkelmodus) werden im lokalen Speicher Ihres Browsers abgelegt (§ 25 Abs. 2 Nr. 2
          TDDDG).
        </p>
        <p>
          Die Daten werden bei Supabase, Inc. (USA) gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Sie können Ihr Konto
          jederzeit in den Einstellungen löschen; die Daten werden dann entfernt.
        </p>
      </LegalSection>

      <LegalSection title="5. In der App erfasste Lead-Daten">
        <p>
          Daten, die Sie in der App zu Leads erfassen (z.&nbsp;B. Name, E-Mail, Telefonnummer,
          Nachrichten), werden bei Supabase gespeichert. Wenn Sie Nachrichten über die App
          versenden, werden die dafür nötigen Kontaktdaten an einen Automatisierungsdienst (n8n)
          übergeben bzw. per E-Mail über Resend (siehe Abschnitt 6) versendet. Da es sich um ein
          Demo-Projekt handelt, verwenden Sie bitte ausschließlich Testdaten.
        </p>
      </LegalSection>

      <LegalSection title="6. Kontaktformular und E-Mail-Versand">
        <p>
          Wenn Sie das Kontaktformular nutzen, werden Ihr Name, Ihre E-Mail-Adresse, ggf. Ihr
          Unternehmen und Ihre Nachricht per E-Mail an mich weitergeleitet, um Ihre Anfrage zu
          beantworten (Art. 6 Abs. 1 lit. f DSGVO). System-E-Mails (z.&nbsp;B. zum Zurücksetzen
          des Passworts) und Kontaktanfragen werden über Resend (Plus Five Five, Inc., USA) versendet.
        </p>
      </LegalSection>

      <LegalSection title="7. Übermittlung in Drittländer">
        <p>
          Bei Vercel, Supabase und Resend kann eine Verarbeitung außerhalb der EU, insbesondere in
          den USA, stattfinden. Grundlage hierfür sind die EU-Standardvertragsklauseln (Art. 46
          Abs. 2 lit. c DSGVO) in den Auftragsverarbeitungsverträgen dieser Anbieter bzw., soweit
          der Anbieter zertifiziert ist, das EU-US Data Privacy Framework (Art. 45 DSGVO).
        </p>
      </LegalSection>

      <LegalSection title="8. Speicherdauer">
        <p>
          Kontodaten und Lead-Daten werden gespeichert, bis Sie Ihr Konto oder die Daten löschen.
          Kontaktanfragen werden gelöscht, sobald sie abschließend bearbeitet sind. Da es sich um
          ein Demo-Projekt handelt, können Daten auch vorher ohne Ankündigung gelöscht werden.
        </p>
      </LegalSection>

      <LegalSection title="9. Ihre Rechte">
        <p className="mb-4">Sie haben jederzeit das Recht auf:</p>
        <ul className={list}>
          <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (Art. 21 DSGVO)</li>
        </ul>
        <p className="mt-4">Wenden Sie sich dazu an {legal.email}.</p>
        <p className="mt-4">
          Außerdem haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren,
          insbesondere in dem Mitgliedstaat Ihres Aufenthaltsorts (Art. 77 DSGVO).
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
