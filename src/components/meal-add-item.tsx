import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ProductAutocomplete } from './product-autocomplete'
import type { ProductSuggestion } from '../lib/inputExperience'
import { searchProductSuggestions } from '../lib/productAutocomplete'
import type { WaitroseCatalogItem } from '../lib/waitroseCatalog'

type Props = {
  mealId: string
  mealTitle: string
  catalog: WaitroseCatalogItem[]
  disabled?: boolean
  onAddProduct: (mealId: string, suggestion: ProductSuggestion, query: string) => void
}

function isMobileAddItemViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
}

function stickyHeaderOffset(): number {
  const header = document.querySelector('[data-sticky-site-header]')
  return header instanceof HTMLElement ? Math.ceil(header.getBoundingClientRect().height) : 0
}

/**
 * Reuses Shopping Lists POPMAS autocomplete inside a single meal accordion.
 * On mobile, temporarily scrolls the Add Item area into the visual viewport
 * (below the Waitrose header, above the software keyboard).
 */
export function MealAddItem({
  mealId,
  mealTitle,
  catalog,
  disabled = false,
  onAddProduct,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(-1)
  const [panelMaxHeight, setPanelMaxHeight] = useState<number | null>(null)
  const listId = useId()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const suggestions = useMemo(
    () => (query.trim().length >= 1 ? searchProductSuggestions(query, catalog, 8) : []),
    [query, catalog],
  )
  const showPanel = open && query.trim().length >= 1 && suggestions.length > 0

  function updateSuggestionPanelHeight() {
    if (!isMobileAddItemViewport() || !inputRef.current) {
      setPanelMaxHeight(null)
      return
    }
    const vv = window.visualViewport
    const inputBottom = inputRef.current.getBoundingClientRect().bottom
    // Prefer visualViewport (shrinks when the software keyboard opens).
    const usableBottom = vv ? vv.offsetTop + vv.height : window.innerHeight
    const available = Math.floor(usableBottom - inputBottom - 16)
    // Cap so several suggestion rows remain readable above the keyboard.
    setPanelMaxHeight(Math.max(120, Math.min(available, 260)))
  }

  function positionAddItemInMobileViewport() {
    if (!isMobileAddItemViewport() || !rootRef.current) {
      setPanelMaxHeight(null)
      return
    }

    const el = rootRef.current
    const header = stickyHeaderOffset()
    const gap = 8
    // Keep the focused Add Item block clear of the sticky Waitrose header.
    el.style.scrollMarginTop = `${header + gap}px`

    el.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'auto' })

    // Correct residual offset after scrollIntoView (some browsers land under sticky header).
    const top = el.getBoundingClientRect().top
    const target = header + gap
    if (Math.abs(top - target) > 4) {
      window.scrollBy({ top: top - target, left: 0, behavior: 'auto' })
    }

    updateSuggestionPanelHeight()
  }

  useEffect(() => {
    if (!open) {
      setQuery('')
      setHighlight(-1)
      setPanelMaxHeight(null)
      document.getElementById('meal-add-item-scroll-room')?.remove()
      return
    }

    let cancelled = false
    let spacer: HTMLDivElement | null = null

    // Temporary bottom room so a low Add Item block can scroll under the sticky header.
    if (isMobileAddItemViewport()) {
      document.getElementById('meal-add-item-scroll-room')?.remove()
      spacer = document.createElement('div')
      spacer.id = 'meal-add-item-scroll-room'
      spacer.setAttribute('aria-hidden', 'true')
      const vv = window.visualViewport
      const vh = vv?.height ?? window.innerHeight
      spacer.style.height = `${Math.max(Math.floor(vh - 100), 280)}px`
      spacer.style.pointerEvents = 'none'
      document.body.appendChild(spacer)
    }

    const focusAndPosition = () => {
      if (cancelled) return
      inputRef.current?.focus({ preventScroll: true })
      positionAddItemInMobileViewport()
    }

    // Instant first pass, then re-run as the keyboard / visualViewport settles.
    const raf = window.requestAnimationFrame(focusAndPosition)
    const timeouts = [80, 220, 450, 700].map((ms) => window.setTimeout(focusAndPosition, ms))

    const onViewportChange = () => {
      if (!isMobileAddItemViewport()) {
        setPanelMaxHeight(null)
        return
      }
      if (spacer) {
        const vv = window.visualViewport
        const vh = vv?.height ?? window.innerHeight
        spacer.style.height = `${Math.max(Math.floor(vh - 100), 280)}px`
      }
      positionAddItemInMobileViewport()
    }

    const vv = window.visualViewport
    vv?.addEventListener('resize', onViewportChange)
    vv?.addEventListener('scroll', onViewportChange)
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('orientationchange', onViewportChange)

    return () => {
      cancelled = true
      window.cancelAnimationFrame(raf)
      timeouts.forEach((id) => window.clearTimeout(id))
      vv?.removeEventListener('resize', onViewportChange)
      vv?.removeEventListener('scroll', onViewportChange)
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('orientationchange', onViewportChange)
      spacer?.remove()
      document.getElementById('meal-add-item-scroll-room')?.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when open toggles
  }, [open])

  useEffect(() => {
    if (!open) return
    updateSuggestionPanelHeight()
  }, [open, query, suggestions.length])

  function close() {
    setOpen(false)
    setQuery('')
    setHighlight(-1)
    setPanelMaxHeight(null)
  }

  function select(suggestion: ProductSuggestion) {
    onAddProduct(mealId, suggestion, query.trim())
    close()
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
      return
    }
    if (!showPanel) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((i) => {
        const next = i < 0 ? 0 : Math.min(i + 1, suggestions.length - 1)
        return next
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && highlight >= 0) {
      e.preventDefault()
      const pick = suggestions[highlight]
      if (pick) select(pick)
    }
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[#ddd] bg-white px-4 py-3 md:px-5">
        <span className="text-[14px] leading-5 text-[#53565A]">Need anything else?</span>
        <button
          type="button"
          className="text-[14px] leading-5 text-[#333] underline decoration-solid underline-offset-[3px] disabled:opacity-50"
          disabled={disabled}
          aria-label={`Add item to ${mealTitle}`}
          onClick={() => setOpen(true)}
        >
          Add item
        </button>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      data-meal-add-item-focus
      className="border-t border-[#ddd] bg-white px-4 py-3 md:px-5"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[14px] leading-5 text-[#53565A]">Need anything else?</span>
        <button
          type="button"
          className="text-[14px] leading-5 text-[#53565A] underline decoration-solid underline-offset-[3px]"
          onClick={close}
          aria-label="Cancel add item"
        >
          Cancel
        </button>
      </div>
      <div className="relative">
        <input
          ref={inputRef}
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setHighlight(-1)
          }}
          onFocus={() => {
            if (isMobileAddItemViewport()) positionAddItemInMobileViewport()
          }}
          onKeyDown={onKeyDown}
          placeholder="Search for an item"
          aria-label={`Search for an item to add to ${mealTitle}`}
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls={showPanel ? listId : undefined}
          className="w-full border border-[#a9a9a9] bg-[#fafafa] px-3 py-2.5 text-[16px] leading-6 text-[#333] placeholder:text-[#53565A] focus:outline focus:outline-2 focus:outline-[#154734]"
        />
        <ProductAutocomplete
          query={query}
          suggestions={suggestions}
          highlightedIndex={highlight}
          open={showPanel}
          maxHeightPx={panelMaxHeight}
          onHighlight={setHighlight}
          onSelect={select}
          listId={listId}
        />
      </div>
    </div>
  )
}
