import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "relative overflow-hidden bg-primary text-primary-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.14)] active:translate-y-0 active:scale-[0.98] transition-all duration-200",
        cta:
          "btn-gold-gradient font-bold shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200",
        shimmer:
          "relative overflow-hidden bg-primary text-primary-foreground font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-[0_0_24px_rgba(255,255,255,0.2)] active:translate-y-0 active:scale-[0.98] transition-all duration-200 unicrm-shimmer",
        glow:
          "relative overflow-hidden bg-primary text-primary-foreground font-semibold shadow-[0_0_16px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_28px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_32px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200",
        outline:
          "border-border bg-background text-foreground hover:border-border-strong hover:bg-surface-hover active:bg-surface-active aria-expanded:border-border-strong aria-expanded:bg-surface-hover dark:bg-transparent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-surface-hover hover:border-border-strong aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-surface-hover hover:text-foreground active:bg-surface-active aria-expanded:bg-surface-hover aria-expanded:text-foreground",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 active:bg-destructive/30 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3.5 text-sm has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-5 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xl: "h-12 gap-2.5 px-6 text-base font-semibold has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-9 rounded-full",
        "icon-xs": "size-6 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-full [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
