// styles/component-styles.ts
// Reusable component styling classes and variants

import { zIndex } from './theme'
import { cssAnimations, transitions } from './animations'

// Button variants
export const buttonStyles = {
  base: `inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${transitions.default}`,
  
  variants: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline"
  },
  
  sizes: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10"
  }
}

// Input field styles
export const inputStyles = {
  base: `flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${transitions.colors}`,
  
  variants: {
    default: "",
    error: "border-red-500 focus-visible:ring-red-500",
    success: "border-green-500 focus-visible:ring-green-500"
  }
}

// Card styles
export const cardStyles = {
  base: "rounded-lg border bg-card text-card-foreground shadow-md",
  header: "flex flex-col space-y-1.5 p-6",
  title: "text-2xl font-semibold leading-none tracking-tight",
  description: "text-sm text-muted-foreground",
  content: "p-6 pt-0",
  footer: "flex items-center p-6 pt-0"
}

// Modal/Dialog styles
export const modalStyles = {
  overlay: `fixed inset-0 bg-background/80 backdrop-blur-sm ${cssAnimations.fadeIn}`,
  content: `fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 ${cssAnimations.scaleIn} sm:rounded-lg`,
  header: "flex flex-col space-y-1.5 text-center sm:text-left",
  title: "text-lg font-semibold",
  description: "text-sm text-muted-foreground",
  footer: "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
}

// Popover styles with high z-index
export const popoverStyles = {
  content: `bg-popover text-popover-foreground w-72 rounded-md border p-4 shadow-md outline-none ${cssAnimations.popoverIn}`,
  contentWithHighZIndex: `bg-popover text-popover-foreground w-72 rounded-md border p-4 shadow-md outline-none ${cssAnimations.popoverIn}`,
  zIndex: zIndex.popover
}

// Form styles
export const formStyles = {
  fieldGroup: "space-y-2",
  label: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  description: "text-sm text-muted-foreground",
  message: "text-sm font-medium",
  messageError: "text-sm font-medium text-destructive",
  messageSuccess: "text-sm font-medium text-green-600"
}

// Date/Time picker specific styles
export const dateTimePickerStyles = {
  trigger: `flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${transitions.colors}`,
  
  popoverContent: `p-0 bg-white border border-gray-200 shadow-lg ${cssAnimations.popoverIn}`,
  
  // Responsive popover sizing
  popoverContentResponsive: `p-0 bg-white border border-gray-200 shadow-lg ${cssAnimations.popoverIn} max-w-[95vw] max-h-[80vh] overflow-auto`,
  
  calendar: "bg-white",
  
  timeSection: "flex items-center space-x-2 pt-2 border-t border-gray-200 bg-white px-3 pb-3",
  
  timeSelect: `border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${transitions.colors}`,
  
  // Container with constrained dimensions
  popoverContainer: "w-80 max-w-[95vw]",
  
  // Calendar container with scroll if needed
  calendarContainer: "p-3 max-h-80 overflow-y-auto",
  
  // Responsive calendar styles
  responsiveCalendar: {
    compact: {
      months: "flex flex-col space-y-1",
      month: "space-y-1",
      caption: "flex justify-center pt-1 relative items-center",
      caption_label: "text-xs font-medium",
      nav: "space-x-1 flex items-center",
      nav_button: "h-5 w-5 bg-transparent p-0 opacity-50 hover:opacity-100 text-xs",
      nav_button_previous: "absolute left-1",
      nav_button_next: "absolute right-1",
      table: "w-full border-collapse",
      head_row: "flex",
      head_cell: "text-muted-foreground rounded-md w-5 font-normal text-[0.6rem]",
      row: "flex w-full",
      cell: "relative p-0 text-center text-xs focus-within:relative focus-within:z-20",
      day: "h-5 w-5 p-0 font-normal aria-selected:opacity-100 text-[0.6rem]",
      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
      day_today: "bg-accent text-accent-foreground",
      day_outside: "text-muted-foreground opacity-50",
      day_disabled: "text-muted-foreground opacity-50",
      day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
      day_hidden: "invisible",
    },
    normal: {
      months: "flex flex-col space-y-2",
      month: "space-y-2",
      caption: "flex justify-center pt-1 relative items-center", 
      caption_label: "text-sm font-medium",
      nav: "space-x-1 flex items-center",
      nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100",
      nav_button_previous: "absolute left-1",
      nav_button_next: "absolute right-1",
      table: "w-full border-collapse",
      head_row: "flex",
      head_cell: "text-muted-foreground rounded-md w-6 font-normal text-[0.7rem]",
      row: "flex w-full mt-1",
      cell: "relative p-0 text-center text-xs focus-within:relative focus-within:z-20",
      day: "h-6 w-6 p-0 font-normal aria-selected:opacity-100 text-xs",
      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
      day_today: "bg-accent text-accent-foreground",
      day_outside: "text-muted-foreground opacity-50",
      day_disabled: "text-muted-foreground opacity-50",
      day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
      day_hidden: "invisible",
    }
  }
}

// Payment scheduler styles
export const paymentSchedulerStyles = {
  container: "space-y-4",
  scheduleItem: `p-4 border rounded-lg space-y-3 bg-white shadow-sm hover:shadow-md ${transitions.default} animate-in slide-in-from-left-1 duration-300`,
  scheduleItemRemoving: "animate-out slide-out-to-right-1 duration-200",
  scheduleHeader: "flex items-center justify-between",
  scheduleGrid: "grid grid-cols-1 md:grid-cols-2 gap-3",
  addButton: `w-full ${buttonStyles.variants.outline} ${buttonStyles.sizes.default} ${buttonStyles.base} ${transitions.default}`,
  removeButton: `${buttonStyles.variants.ghost} ${buttonStyles.sizes.sm} ${buttonStyles.base} text-red-600 hover:text-red-700 hover:bg-red-50 ${transitions.default}`,
  inputGroup: "space-y-1",
  amountInput: `w-full px-3 py-2 border rounded-md text-sm ${transitions.default} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`,
  datePickerContainer: "w-full"
}
