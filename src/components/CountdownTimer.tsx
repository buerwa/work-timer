import React from "react";
import { format } from "date-fns";
import { useCountdownTimer } from "../hooks/useCountdownTimer";
// highlight-start
// 修正：不再导入 useHourFormat
import { useSettings } from "../context/useTimerStore";
// highlight-end

interface CountdownTimerProps {
  dynamicEndTime: Date | null;
  standardEndTime: Date | null;
}

/**
 * 组件: 下班倒计时
 */
export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  dynamicEndTime,
  standardEndTime,
}) => {
  const remaining = useCountdownTimer(dynamicEndTime);

  // highlight-start
  // 修正：从 useSettings() 中解构出 hourFormat
  const { hourFormat } = useSettings();
  // highlight-end

  // 格式化时间 (HH:mm:ss 或 hh:mm:ss a)
  const formatTimeStr = (time: Date | null) => {
    if (!time) return "";
    return format(time, hourFormat === "12h" ? "hh:mm:ss a" : "HH:mm:ss");
  };

  return (
    <div className="mb-6 p-5 bg-indigo-600 text-white rounded-lg shadow-lg text-center">
      {/* 正在倒计时 */}
      {remaining && !remaining.isOver && dynamicEndTime && (
        <>
          <div className="text-3xl font-bold tracking-tight">
            <span>{String(remaining.hours).padStart(2, "0")}</span>
            <span className="animate-pulse mx-1">:</span>
            <span>{String(remaining.minutes).padStart(2, "0")}</span>
            <span className="animate-pulse mx-1">:</span>
            <span>{String(remaining.seconds).padStart(2, "0")}</span>
          </div>
          <div className="text-indigo-100 text-sm mt-1">
            动态下班时间: <strong>{formatTimeStr(dynamicEndTime)}</strong>
            {/* 如果动态时间与标准时间不同，则显示标准时间 */}
            {standardEndTime &&
              dynamicEndTime.getTime() !== standardEndTime.getTime() && (
                <span className="ml-2 opacity-80">
                  (标准: {formatTimeStr(standardEndTime)})
                </span>
              )}
          </div>
        </>
      )}

      {/* 已到下班时间 */}
      {remaining && remaining.isOver && (
        <div className="text-2xl font-bold">🎉 你已经下班啦！</div>
      )}

      {/* 今天未录入 */}
      {!remaining && (
        <div className="text-xl font-semibold">
          请录入今天的工时以开始倒计时
        </div>
      )}
    </div>
  );
};
