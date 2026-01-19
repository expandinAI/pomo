'use client';

import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Custom hook for trapping focus within a container element (e.g., modals)
 *
 * Features:
 * - Traps Tab/Shift+Tab navigation within container
 * - Saves and restores focus when modal opens/closes
 * - Focuses first focusable element on open
 *
 * @param containerRef - Ref to the container element
 * @param isActive - Whether the trap is active (modal open)
 * @param options - Configuration options
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  isActive: boolean,
  options: {
    initialFocusRef?: RefObject<HTMLElement | null>;
    restoreFocus?: boolean;
  } = {}
): void {
  const { initialFocusRef, restoreFocus = true } = options;
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Save the element that had focus before the modal opened
    triggerRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus initial element (custom or first focusable)
    const elementToFocus = initialFocusRef?.current || firstElement;
    // Use setTimeout to ensure the element is rendered
    setTimeout(() => elementToFocus?.focus(), 0);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      // Re-query focusable elements in case they changed
      const currentFocusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (currentFocusable.length === 0) return;

      const first = currentFocusable[0];
      const last = currentFocusable[currentFocusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: If on first element, wrap to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: If on last element, wrap to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the element that was focused before modal opened
      if (restoreFocus && triggerRef.current) {
        triggerRef.current.focus();
        triggerRef.current = null;
      }
    };
  }, [isActive, containerRef, initialFocusRef, restoreFocus]);
}
