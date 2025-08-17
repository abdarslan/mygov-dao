// styles/positioning.ts
export interface ViewportDimensions {
  width: number;
  height: number;
}

export interface PopoverPositioning {
  maxWidth: string;
  maxHeight: string;
  width?: string;
  transform?: string;
}

export function getOptimalPopoverPosition(
  triggerElement?: HTMLElement,
  viewportDimensions?: ViewportDimensions
): PopoverPositioning {
  const viewport = viewportDimensions || {
    width: window.innerWidth,
    height: window.innerHeight
  }
  
  const isSmallScreen = viewport.width < 640
  const isShortScreen = viewport.height < 600
  const isMediumScreen = viewport.width < 1024

  // Base responsive sizing
  if (isSmallScreen) {
    return {
      maxWidth: '90vw',
      maxHeight: '70vh',
      width: 'auto'
    }
  }
  
  if (isMediumScreen) {
    return {
      maxWidth: '85vw',
      maxHeight: '75vh',
      width: 'auto'
    }
  }

  // Desktop sizing
  return {
    maxWidth: isShortScreen ? '380px' : '420px',
    maxHeight: isShortScreen ? '65vh' : '500px',
    width: 'auto'
  }
}

export function isInModalContext(): boolean {
  // Multiple ways to detect modal context
  const modalSelectors = [
    '[role="dialog"]',
    '[data-modal]',
    '.modal',
    '[aria-modal="true"]',
    '[data-radix-dialog-content]',
    '[data-state="open"][data-radix-dialog-overlay]',
    '.dialog',
    '.overlay'
  ]

  const modals = document.querySelectorAll(modalSelectors.join(', '))
  
  const hasActiveModal = Array.from(modals).some(modal => {
    const style = window.getComputedStyle(modal)
    return style.display !== 'none' && 
           style.visibility !== 'hidden' &&
           style.opacity !== '0'
  })

  // Additional checks
  const bodyHasModal = document.body.classList.contains('modal-open') || 
                      window.getComputedStyle(document.body).overflow === 'hidden'
                      
  const hasModalBackdrop = document.querySelector('.modal-backdrop, [data-radix-dialog-overlay]')

  return hasActiveModal || bodyHasModal || !!hasModalBackdrop
}

export function getModalAwareZIndex(forceHigh = false): number {
  if (forceHigh || isInModalContext()) {
    return 10000 // Higher than typical modal z-index
  }
  return 9999 // Default high z-index
}
