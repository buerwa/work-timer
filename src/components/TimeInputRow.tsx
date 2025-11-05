import React from "react";
import { format, parse, isValid } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useTimerActions, useSettings } from "../context/useTimerStore";
import { formatTime, formatHours } from "../utils/helpers";
import { DAY_TYPE_CONFIG } from "../utils/constants";
import { TimeInput } from "./TimeInput";
import type { DayType, TimeEntry, DailyCalculation } from "../types";

interface TimeInputRowProps {
  dateString: string;
  dayType: DayType;
  timeEntry: TimeEntry | null | undefined;
  calculation: DailyCalculation;
  onDayTypeConfigClick: (dateString: string) => void;
}

/**
 * 列表中的单日时间输入行
 */
export const TimeInputRow: React.FC<TimeInputRowProps> = React.memo(
  ({ dateString, dayType, timeEntry, calculation, onDayTypeConfigClick }) => {
    const { setTimeEntry } = useTimerActions();
    const { hourFormat } = useSettings();

    // [ 核心修正 ]
    // 1. 健壮性检查：如果 dateString 出了问题，立即返回 null
    if (!dateString) {
      return null;
    }

    // 2. 健壮性检查：确保 dateString 是有效的
    const date = parse(dateString, "yyyy-MM-dd", new Date());
    if (!isValid(date)) {
      console.error("Invalid dateString passed to TimeInputRow:", dateString);
      return null;
    }

    // [ 核心修正 ]
    // 3. 健壮性检查：确保 dayType 是有效的
    // 这里的 DAY_TYPE_CONFIG[dayType] 就是您错误中 'match' (或类似) 崩溃的地方
    const config = DAY_TYPE_CONFIG[dayType] || DAY_TYPE_CONFIG["workday"]; // 默认回退
    const { label, bg, text } = config;

    // 格式化日期 (例如: "10月25日 周三")
    // 移到 isValid 检查之后，确保 date 是 OK 的
    const formattedDate = format(date, "MM月dd日 EEE", { locale: zhCN });

    const handleStartChange = (value: string) => {
      setTimeEntry(dateString, { start: value, end: timeEntry?.end || "" });
    };

    const handleEndChange = (value: string) => {
      setTimeEntry(dateString, { start: timeEntry?.start || "", end: value });
    };

    // [ 健壮性 ] 确保 calculation 存在
    const effectiveHours = calculation?.effectiveHours || 0;

    return (
      <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
        <div className="col-span-12 sm:col-span-3 flex sm:flex-col justify-between items-center sm:items-start">
          <span className="font-semibold text-gray-900">{formattedDate}</span>
          <button
            onClick={() => onDayTypeConfigClick(dateString)}
            title="点击修改日期类型"
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}
          >
            {label}
          </button>
        </div>

        <div className="col-span-6 sm:col-span-2">
          <TimeInput
            value={timeEntry?.start || ""}
            onChange={handleStartChange}
          />
        </div>

        <div className="col-span-6 sm:col-span-2">
          <TimeInput value={timeEntry?.end || ""} onChange={handleEndChange} />
        </div>

        <div className="col-span-6 sm:col-span-3 text-center sm:text-left">
          <span className="text-lg font-medium text-blue-600">
            {formatHours(effectiveHours)}
          </span>
        </div>

        <div className="col-span-6 sm:col-span-2 text-right">
          {/* 占位符 */}
        </div>
      </div>
    );
  }
);
