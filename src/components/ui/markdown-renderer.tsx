'use client'

import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Strip frontmatter if present
  let cleanContent = content
  if (cleanContent.startsWith('---')) {
    const endIdx = cleanContent.indexOf('---', 3)
    if (endIdx !== -1) {
      cleanContent = cleanContent.substring(endIdx + 3).trim()
    }
  }

  const lines = cleanContent.split('\n')
  const elements: React.ReactNode[] = []

  let inList = false
  let listItems: React.ReactNode[] = []

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-2 list-disc pl-5 space-y-1 text-sm text-foreground/90 leading-relaxed">
          {listItems}
        </ul>
      )
      listItems = []
      inList = false
    }
  }

  const formatInline = (text: string) => {
    // Bold **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    if (!trimmed) {
      flushList()
      return
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      flushList()
      const quoteText = trimmed.replace(/^>\s*/, '')
      elements.push(
        <div
          key={`quote-${index}`}
          className="my-3 rounded-lg border-l-4 border-amber-500/80 bg-amber-500/10 px-3.5 py-2.5 text-xs italic text-amber-200/90 leading-normal"
        >
          {formatInline(quoteText)}
        </div>
      )
      return
    }

    // H1
    if (trimmed.startsWith('# ')) {
      flushList()
      elements.push(
        <h1
          key={`h1-${index}`}
          className="mt-4 mb-2 text-base font-bold text-foreground border-b border-border/60 pb-1"
        >
          {trimmed.slice(2)}
        </h1>
      )
      return
    }

    // H2
    if (trimmed.startsWith('## ')) {
      flushList()
      elements.push(
        <h2
          key={`h2-${index}`}
          className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5"
        >
          <span className="size-1.5 rounded-full bg-primary inline-block" />
          {trimmed.slice(3)}
        </h2>
      )
      return
    }

    // H3
    if (trimmed.startsWith('### ')) {
      flushList()
      elements.push(
        <h3
          key={`h3-${index}`}
          className="mt-3 mb-1 text-xs font-medium text-foreground"
        >
          {trimmed.slice(4)}
        </h3>
      )
      return
    }

    // Bullet list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true
      listItems.push(
        <li key={`li-${index}`} className="text-xs text-foreground/80 leading-relaxed">
          {formatInline(trimmed.slice(2))}
        </li>
      )
      return
    }

    // Normal paragraph
    flushList()
    elements.push(
      <p key={`p-${index}`} className="my-1.5 text-xs text-foreground/85 leading-relaxed">
        {formatInline(trimmed)}
      </p>
    )
  })

  flushList()

  return <div className={`space-y-0.5 ${className}`}>{elements}</div>
}
