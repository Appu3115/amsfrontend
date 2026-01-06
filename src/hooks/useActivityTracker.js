import { useEffect, useRef } from "react";
import api from "../api/axios";

const THROTTLE_MS = 5 * 60 * 1000; // 15 seconds (good for testing)

const useActivityTracker = (employeeId, enabled) => {
  const lastSentRef = useRef(0);

  useEffect(() => {
    if (!employeeId || !enabled) return;

    const sendPulse = () => {
      const now = Date.now();
      if (now - lastSentRef.current < THROTTLE_MS) return;

      lastSentRef.current = now;

      api.post("/attendance/activity", null, {
        params: {
          employeeId,
          type: "MOUSE",
        },
      }).catch(() => {});
    };

    window.addEventListener("mousemove", sendPulse);
    window.addEventListener("keydown", sendPulse);
    window.addEventListener("click", sendPulse);
    window.addEventListener("scroll", sendPulse);

    return () => {
      window.removeEventListener("mousemove", sendPulse);
      window.removeEventListener("keydown", sendPulse);
      window.removeEventListener("click", sendPulse);
      window.removeEventListener("scroll", sendPulse);
    };
  }, [employeeId, enabled]);
};

export default useActivityTracker;
