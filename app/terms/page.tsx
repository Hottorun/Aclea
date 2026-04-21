'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { AcleaLogo } from '@/components/aclea-logo'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-[#0B0B16]">
      <header className="fixed z-50 top-0 left-0 right-0 px-4 pt-4">
        <nav className="mx-auto max-w-5xl rounded-2xl px-5 py-3.5 bg-white/60 backdrop-blur-xl border border-white/70">
          <Link href="/">
            <AcleaLogo markSize={24} fontSize={20} gap={9} />
          </Link>
        </nav>
      </header>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-[#6B728C] hover:text-[#0B0B16] mb-8 transition-colors text-sm">
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight">Allgemeine Geschäftsbedingungen (AGB)</h1>

          <div className="space-y-6 text-[#6B728C]">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0B0B16]">1. Geltungsbereich</h2>
              <p className="mb-4">
                Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen der
                Aclea GmbH (nachfolgend "Anbieter") und dem Kunden (nachfolgend "Kunde"),
                die über die Webseite www.aclea.de abgeschlossen werden.
              </p>
              <p className="mb-4">
                Abweichende, entgegenstehende oder ergänzende AGB des Kunden werden nicht Vertragsbestandteil,
                es sei denn, der Anbieter hat ihrer Geltung ausdrücklich schriftlich zugestimmt.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0B0B16]">2. Vertragsschluss</h2>
              <p className="mb-4">
                Die Präsentation der Leistungen auf der Webseite stellt kein Angebot im Sinne der §§ 145 ff. BGB dar,
                sondern eine unverbindliche Aufforderung an den Kunden, ein Angebot abzugeben.
              </p>
              <p className="mb-4">
                Durch Anklicken des Buttons "Jetzt kostenlos testen" oder "Kaufen" gibt der Kunde ein
                verbindliches Angebot zum Abschluss eines Vertrages ab. Der Vertrag kommt durch die
                Auftragsbestätigung des Anbieters zustande.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0B0B16]">3. Leistungen des Anbieters</h2>
              <p className="mb-4">Der Anbieter stellt folgende Leistungen zur Verfügung:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>KI-gestützte Lead-Qualifizierung</li>
                <li>Unified Inbox für Kommunikation</li>
                <li>CRM-Integration</li>
                <li>Echtzeit-Benachrichtigungen</li>
                <li>Datenspeicherung auf deutschen Servern</li>
              </ul>
              <p className="mt-4">
                Der genaue Leistungsumfang ergibt sich aus der jeweiligen Leistungsbeschreibung
                und dem gewählten Tarif.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0B0B16]">4. Nutzungsrechte</h2>
              <p className="mb-4">
                Der Anbieter gewährt dem Kunden ein einfaches, nicht übertragbares Recht zur
                Nutzung der Software während der Vertragslaufzeit.
              </p>
              <p className="mb-4">
                Der Kunde ist nicht berechtigt, die Software zu vervielfältigen, zu verändern,
                zu übersetzen, zurückzuentwickeln oder zu dekompilieren, soweit dies nicht nach
                § 69e Urhebergesetz zulässig ist.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0B0B16]">5. Pflichten des Kunden</h2>
              <p className="mb-4">Der Kunde verpflichtet sich:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Die Zugangsdaten vertraulich zu behandeln</li>
                <li>Die geltenden Gesetze, insbesondere das Datenschutzrecht, einzuhalten</li>
                <li>Keine rechtswidrigen Inhalte über die Plattform zu verbreiten</li>
                <li>Die Software nur im Rahmen der vertragsgemäßen Nutzung zu verwenden</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0B0B16]">6. Vergütung und Zahlung</h2>
              <p className="mb-4">
                Die Vergütung richtet sich nach dem gewählten Tarif. Die Preise sind in Euro
                angegeben und verstehen sich zzgl. der gesetzlichen Umsatzsteuer.
              </p>
              <p className="mb-4">
                Die Zahlung erfolgt monatlich im Voraus per Lastschrift, Kreditkarte oder
                auf Rechnung. Bei Zahlungsverzug behält sich der Anbieter das Recht vor,
                den Zugang zur Software zu sperren.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0B0B16]">7. Vertragslaufzeit und Kündigung</h2>
              <p className="mb-4">
                Der Vertrag wird auf unbestimmte Zeit geschlossen, sofern nichts anderes vereinbart ist.
              </p>
              <p className="mb-4">
                Beide Parteien können den Vertrag mit einer Frist von 14 Tagen zum Monatsende
                kündigen. Das Recht zur außerordentlichen Kündigung bleibt unberührt.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0B0B16]">8. Gewährleistung und Haftung</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <CheckCircle className="size-5 text-[#5c3fff] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#0B0B16] mb-1">Gewährleistung</p>
                    <p className="text-sm">Der Anbieter gewährleistet, dass die Software während der Vertragslaufzeit
                    funktionsfähig ist. Mängel werden nach Maßgabe der §§ 633 ff. BGB behoben.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <AlertTriangle className="size-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#0B0B16] mb-1">Haftung</p>
                    <p className="text-sm">Die Haftung des Anbieters ist auf vorsätzliches oder grob fahrlässiges
                    Handeln sowie auf die Verletzung wesentlicher Vertragspflichten beschränkt.
                    Die Haftung für mittelbare Schäden ist ausgeschlossen.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <XCircle className="size-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#0B0B16] mb-1">Haftungsausschluss</p>
                    <p className="text-sm">Der Anbieter haftet nicht für Schäden, die durch unsachgemäße
                    Nutzung der Software oder durch Dritte verursacht werden.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0B0B16]">9. Datenschutz</h2>
              <p className="mb-4">
                Der Anbieter verarbeitet personenbezogene Daten des Kunden ausschließlich
                im Rahmen der geltenden datenschutzrechtlichen Bestimmungen, insbesondere der DSGVO.
              </p>
              <p className="mb-4">
                Details zur Verarbeitung personenbezogener Daten sind in der
                <Link href="/privacy" className="text-[#5c3fff] hover:underline ml-1">Datenschutzerklärung</Link>
                beschrieben.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0B0B16]">10. Schlussbestimmungen</h2>
              <p className="mb-4">
                Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
                UN-Kaufrechts (CISG).
              </p>
              <p className="mb-4">
                Erfüllungsort und Gerichtsstand ist Berlin, sofern der Kunde Kaufmann ist
                oder keinen festen Wohnsitz in Deutschland hat.
              </p>
              <p className="mb-4">
                Sollte eine Bestimmung dieser AGB unwirksam sein oder werden, so wird
                die Wirksamkeit der übrigen Bestimmungen nicht berührt.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0B0B16]">11. Widerrufsrecht</h2>
              <p className="mb-4">
                Verbraucher haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
                diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem
                Tag des Vertragsschlusses.
              </p>
              <p className="mb-4">
                Um das Widerrufsrecht auszuüben, müssen Sie uns (Aclea GmbH, Friedrichstraße 123,
                10117 Berlin, contact@aclea.de) mittels einer eindeutigen Erklärung (z.B. ein mit
                der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag
                zu widerrufen, informieren.
              </p>
            </section>

            <p className="text-sm text-[#9AA0B5] mt-12">
              Stand: {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white py-8 px-6">
        <div className="max-w-4xl mx-auto text-center text-[#9AA0B5] text-sm">
          &copy; {new Date().getFullYear()} Aclea GmbH. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  )
}
