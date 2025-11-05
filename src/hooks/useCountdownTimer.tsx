import { useState, useEffect, useMemo } from "react";
import { differenceInMinutes } from "date-fns";

/**
 * Hook: 下班倒计时
 */
export const useCountdownTimer = (dynamicEndTime: Date | null) => {
  const [now, setNow] = useState(new Date());

  // 每秒更新一次当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const remaining = useMemo(() => {
    if (!dynamicEndTime) {
      return null; // 没有目标时间
    }

    // 计算总秒数差异
    const totalSeconds = Math.floor(
      (dynamicEndTime.getTime() - now.getTime()) / 1000
    );

    if (totalSeconds <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, isOver: true };
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds, isOver: false };
  }, [now, dynamicEndTime]);

  return remaining;
};
