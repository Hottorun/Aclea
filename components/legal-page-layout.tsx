import Link from 'next/link'
import { ArrowLeft, Zap } from 'lucide-react'

export function LegalPageLayout({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <header className="fixed z-20 w-full px-2">
        <nav className="mx-auto mt-2 max-w-6xl px-6 py-3 lg:py-4 border border-white/10 rounded-2xl bg-black/50 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600">
              <Zap className="size-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">Aclea</span>
          </Link>
        </nav>
      </header>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="size-4" />
            Zurück zur Startseite
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-8">{title}</h1>

          <div className="space-y-6 text-white/80">
            {children}
            <p className="text-sm text-white/40 mt-12">Stand: {updated}</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-black/50 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-x-6 gap-y-2 text-white/40 text-sm">
          <Link href="/imprint" className="hover:text-white">Impressum</Link>
          <Link href="/privacy" className="hover:text-white">Datenschutz</Link>
          <Link href="/terms" className="hover:text-white">Nutzungsbedingungen</Link>
        </div>
      </footer>
    </div>
  )
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-white">{title}</h2>
      {children}
    </section>
  )
}
