import { IconBin, IconChevronMeal } from './shopping-list-pods'

export type MealTag = {
  label: string
  tone?: 'kcal' | 'default' | 'allergen'
}

export type MealAccordionHeaderProps = {
  title: string
  expanded: boolean
  itemCount: number
  priceLabel: string
  onToggle: () => void
  onDelete: () => void
}

/**
 * Simplified LVP meal header: expand, title, item count, price, delete.
 * Calories / time / ratings / servings / diet chips stay out of the UI.
 */
export function MealAccordionHeader({
  title,
  expanded,
  itemCount,
  priceLabel,
  onToggle,
  onDelete,
}: MealAccordionHeaderProps) {
  const itemLabel = `${itemCount} item${itemCount === 1 ? '' : 's'}`

  return (
    <div className="flex items-start gap-3 px-4 py-3 md:items-center md:gap-4 md:px-5 md:py-3.5">
      <button
        type="button"
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#53565A] md:mt-0"
        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title}`}
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <IconChevronMeal expanded={expanded} />
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-normal leading-snug text-[#333]">{title}</p>
        <p className="mt-1 text-[14px] font-light leading-5 text-[#53565A] md:text-[16px] md:leading-6">
          <span>{itemLabel}</span>
          <span aria-hidden="true"> • </span>
          <span>{priceLabel}</span>
        </p>
      </div>

      <button
        type="button"
        className="mt-0.5 inline-flex shrink-0 items-center justify-center p-0.5 text-[#757575] md:mt-0"
        aria-label={`Delete ${title}`}
        onClick={onDelete}
      >
        <IconBin />
      </button>
    </div>
  )
}
