"use client"

import Link from 'next/link'
import { UserPlus, Briefcase, Radio, Zap } from 'lucide-react'
import type { ComponentType } from 'react'

import { useTranslations } from 'next-intl'

// Quick-action shortcuts. Each navigates to the page that owns the
// relevant "create" flow. We deliberately don't try to auto-open any
// modal on the target page — that'd require touching those pages,
// which is out of scope here.
interface Action {
  labelKey: string
  href: string
  icon: ComponentType<{ className?: string }>
  tint: string
}

const ACTIONS: Action[] = [
  { labelKey: 'newContact', href: '/contacts', icon: UserPlus, tint: 'text-foreground' },
  { labelKey: 'newDeal', href: '/pipelines', icon: Briefcase, tint: 'text-foreground' },
  { labelKey: 'newBroadcast', href: '/broadcasts/new', icon: Radio, tint: 'text-foreground' },
  { labelKey: 'newAutomation', href: '/automations/new', icon: Zap, tint: 'text-foreground' },
]

export function QuickActions() {
  const t = useTranslations('Dashboard.quickActions')
  
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ACTIONS.map((a) => {
        const Icon = a.icon
        return (
          <Link
            key={a.href}
            href={a.href}
            className="group relative overflow-hidden flex items-center gap-3 rounded-full border border-border/80 bg-card px-4 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-surface-hover/50 hover:shadow-md hover:shadow-black/5 active:translate-y-0 active:scale-[0.98]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border/80 text-foreground shadow-xs transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6">
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-foreground transition-colors group-hover:text-foreground">{t(a.labelKey as string)}</span>
          </Link>
        )
      })}
    </div>
  )
}
