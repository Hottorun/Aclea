'use client'

import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'
import { AcleaLogo } from '@/components/aclea-logo'

export default function ImprintPage() {
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

          <h1 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight">Impressum</h1>

          <div className="space-y-6 text-[#6B728C]">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0B0B16]">Angaben gemäß § 5 TMG</h2>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="mb-2 font-medium text-[#0B0B16]">Aclea GmbH</p>
                <p className="mb-2">Friedrichstraße 123</p>
                <p className="mb-2">10117 Berlin</p>
                <p className="mb-4">Deutschland</p>

                <p className="mb-2"><strong className="text-[#0B0B16]">Geschäftsführer:</strong> Max Mustermann</p>
                <p className="mb-2"><strong className="text-[#0B0B16]">Handelsregister:</strong> Amtsgericht Berlin (Charlottenburg)</p>
                <p className="mb-2"><strong className="text-[#0B0B16]">Registernummer:</strong> HRB 123456</p>
                <p className="mb-2"><strong className="text-[#0B0B16]">USt-IdNr.:</strong> DE123456789</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0B0B16]">Kontakt</h2>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <Mail className="size-4 text-[#5c3fff]" />
                  E-Mail: contact@aclea.de
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="size-4 text-[#5c3fff]" />
                  Telefon: +49 (0) 30 123 456 78
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 text-[#5c3fff]" />
                  Adresse: Friedrichstraße 123, 10117 Berlin
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0B0B16]">Haftung für Inhalte</h2>
              <p className="mb-4">
                Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
                Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
                nach den allgemeinen Gesetzen verantwortlich.
              </p>
              <p className="mb-4">
                Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter nicht verpflichtet, übermittelte
                oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die
                auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0B0B16]">Haftung für Links</h2>
              <p className="mb-4">
                Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
                Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
                Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
                der Seiten verantwortlich.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0B0B16]">Urheberrecht</h2>
              <p className="mb-4">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
                dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
                der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
                Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#0B0B16]">Streitschlichtung</h2>
              <p className="mb-4">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                <a href="https://ec.europa.eu/consumers/odr" className="text-[#5c3fff] hover:underline ml-1">
                  https://ec.europa.eu/consumers/odr
                </a>
              </p>
              <p className="mb-4">
                Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
                sind wir nicht verpflichtet und nicht bereit.
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
