'use client'

import Link from 'next/link'
import { ArrowLeft, Zap, MessageSquare, Bell, Users, BarChart3, Shield, Check, Clock, Target, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SolutionPage() {
  const features = [
    {
      icon: Zap,
      title: "AI-Powered Qualification",
      description: "Our advanced AI analyzes incoming leads and scores them based on 50+ criteria including budget signals, purchase readiness, and industry fit.",
      benefits: ["Instant lead scoring", "Priority ranking", "Conversion predictions"]
    },
    {
      icon: MessageSquare,
      title: "Unified Inbox",
      description: "Receive leads from WhatsApp, Email, Web Forms, and more - all in one centralized dashboard.",
      benefits: ["WhatsApp integration", "Email parsing", "Web form capture"]
    },
    {
      icon: Bell,
      title: "Real-time Notifications",
      description: "Never miss a hot lead. Get instant notifications when high-quality leads come in.",
      benefits: ["Instant alerts", "Customizable triggers", "Multi-channel delivery"]
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together efficiently with your team. Assign leads, share notes, and track progress.",
      benefits: ["Lead assignment", "Shared inbox", "Activity tracking"]
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Get insights into your lead pipeline with comprehensive dashboards and reports.",
      benefits: ["Conversion tracking", "Source analytics", "Performance metrics"]
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Your data is safe with us. GDPR compliant with German servers and end-to-end encryption.",
      benefits: ["GDPR compliant", "German hosting", "Data encryption"]
    }
  ]

  const useCases = [
    {
      title: "For Real Estate",
      description: "Qualify property inquiries instantly. Focus on buyers ready to make offers.",
      icon: Target
    },
    {
      title: "For Agencies",
      description: "Handle client onboarding at scale. Let AI filter out time-wasters.",
      icon: Users
    },
    {
      title: "For SaaS",
      description: "Identify trial users worth converting. Prioritize your sales efforts.",
      icon: Zap
    },
    {
      title: "For E-commerce",
      description: "Score wholesale inquiries. Find B2B partners worth pursuing.",
      icon: BarChart3
    }
  ]

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
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>

          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-emerald-600/20 bg-emerald-600/10">
              <Zap className="size-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">The AI Lead Solution</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Stop Qualifying Leads Manually.
              <br />
              <span className="text-emerald-400">Let AI Do It.</span>
            </h1>
            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              Aclea automatically scores and prioritizes your leads using advanced AI, 
              so you can focus on closing deals instead of sorting through inquiries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                <Link href="/contact">Get Started Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl">
                <Link href="/contact">Book a Demo</Link>
              </Button>
            </div>
          </div>

          {/* Problem/Solution */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5">
              <h3 className="text-lg font-semibold mb-4 text-red-400">The Problem</h3>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✕</span>
                  Spending hours reviewing every inquiry
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✕</span>
                  Missing hot leads in your inbox
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✕</span>
                  Following up with unqualified prospects
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✕</span>
                  No visibility into lead quality
                </li>
              </ul>
            </div>
            <div className="p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
              <h3 className="text-lg font-semibold mb-4 text-emerald-400">The Aclea Solution</h3>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  AI scores leads in seconds
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  Instant notifications for top leads
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  Auto-qualify with 50+ criteria
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  Real-time analytics dashboard
                </li>
              </ul>
            </div>
          </div>

          {/* Features */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-4 text-center">Powerful Features</h2>
            <p className="text-white/60 text-center mb-12 max-w-2xl mx-auto">
              Everything you need to automate lead qualification and close more deals.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-emerald-500/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600/20 flex items-center justify-center mb-4">
                    <feature.icon className="size-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white/60 text-sm mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-white/50">
                        <Check className="size-4 text-emerald-400" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-4 text-center">Built for Your Industry</h2>
            <p className="text-white/60 text-center mb-12 max-w-2xl mx-auto">
              Aclea adapts to your specific business needs.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {useCases.map((useCase, index) => (
                <div key={index} className="p-6 rounded-2xl border border-white/10 bg-white/5 text-center hover:bg-white/10 transition-colors">
                  <useCase.icon className="size-8 text-emerald-400 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-white/60 text-sm">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-4 text-center">How It Works</h2>
            <p className="text-white/60 text-center mb-12 max-w-2xl mx-auto">
              Get started in minutes, not days.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">Connect Your Channels</h3>
                <p className="text-white/60 text-sm">
                  Integrate WhatsApp, Email, Web Forms, or use our API to capture leads automatically.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">AI Qualifies Instantly</h3>
                <p className="text-white/60 text-sm">
                  Our AI analyzes each lead and scores them based on 50+ criteria in real-time.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Focus on Winners</h3>
                <p className="text-white/60 text-sm">
                  Get notified of high-quality leads and start closing deals faster than ever.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-emerald-400 mb-2">50+</div>
              <div className="text-white/60 text-sm">Qualification Criteria</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-emerald-400 mb-2">85%</div>
              <div className="text-white/60 text-sm">Time Saved</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-emerald-400 mb-2">3x</div>
              <div className="text-white/60 text-sm">More Conversions</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-emerald-400 mb-2">24/7</div>
              <div className="text-white/60 text-sm">AI Availability</div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center p-12 rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-600/10 to-transparent">
            <Clock className="size-12 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Ready to Qualify Leads Smarter?</h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Join hundreds of businesses using Aclea to save time and close more deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                <Link href="/contact">Start Free Trial</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl">
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-black/50 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-white/40 text-sm">
          &copy; {new Date().getFullYear()} Aclea GmbH. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
