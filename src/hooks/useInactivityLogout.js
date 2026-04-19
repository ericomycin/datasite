import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const WARNING_TIME = 60 * 1000; // Show warning 1 minute before logout

export const useInactivityLogout = () => {
  const { logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const resetInactivityTimer = useCallback(() => {
    // Clear all existing timers
    clearTimeout(timeoutRef.current);
    clearTimeout(warningTimeoutRef.current);
    clearInterval(countdownIntervalRef.current);

    // Hide warning if it's showing
    setShowWarning(false);
    setCountdown(0);

    // Set new warning timeout (9 minutes)
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(60);

      // Start countdown
      let remainingSeconds = 60;
      countdownIntervalRef.current = setInterval(() => {
        remainingSeconds -= 1;
        setCountdown(remainingSeconds);

        if (remainingSeconds <= 0) {
          clearInterval(countdownIntervalRef.current);
        }
      }, 1000);
    }, INACTIVITY_TIMEOUT - WARNING_TIME);

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      setShowWarning(false);
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [logout]);

  const handleExtendSession = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      clearTimeout(timeoutRef.current);
      clearTimeout(warningTimeoutRef.current);
      clearInterval(countdownIntervalRef.current);
    };
  }, [resetInactivityTimer]);

  // Separate effect to initialize timer on mount
  useEffect(() => {
    const initializeTimer = () => {
      clearTimeout(warningTimeoutRef.current);
      clearInterval(countdownIntervalRef.current);

      warningTimeoutRef.current = setTimeout(() => {
        setShowWarning(true);
        setCountdown(60);

        let remainingSeconds = 60;
        countdownIntervalRef.current = setInterval(() => {
          remainingSeconds -= 1;
          setCountdown(remainingSeconds);

          if (remainingSeconds <= 0) {
            clearInterval(countdownIntervalRef.current);
          }
        }, 1000);
      }, INACTIVITY_TIMEOUT - WARNING_TIME);

      timeoutRef.current = setTimeout(() => {
        setShowWarning(false);
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    initializeTimer();

    return () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(warningTimeoutRef.current);
      clearInterval(countdownIntervalRef.current);
    };
  }, [logout]);

  return {
    showWarning,
    countdown,
    handleExtendSession,
  };
};
