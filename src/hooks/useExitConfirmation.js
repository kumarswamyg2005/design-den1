import { useEffect, useCallback } from "react";

/**
 * Custom hook to show a confirmation dialog when the user tries to leave the website
 * @param {boolean} shouldConfirm - Whether to show the confirmation dialog
 * @param {string} message - Custom message to display (note: most browsers ignore this)
 */
const useExitConfirmation = (
  shouldConfirm = true,
  message = "Are you sure you want to leave? Your unsaved changes may be lost."
) => {
  const handleBeforeUnload = useCallback(
    (event) => {
      if (shouldConfirm) {
        // Standard way to trigger the browser's confirmation dialog
        event.preventDefault();
        // For older browsers
        event.returnValue = message;
        return message;
      }
    },
    [shouldConfirm, message]
  );

  useEffect(() => {
    if (shouldConfirm) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldConfirm, handleBeforeUnload]);

  // Also provide a way to manually trigger confirmation
  const confirmExit = useCallback(
    (callback) => {
      if (shouldConfirm) {
        const confirmed = window.confirm(
          "Are you sure you want to leave DesignDen?"
        );
        if (confirmed && callback) {
          callback();
        }
        return confirmed;
      }
      if (callback) callback();
      return true;
    },
    [shouldConfirm]
  );

  return { confirmExit };
};

export default useExitConfirmation;
