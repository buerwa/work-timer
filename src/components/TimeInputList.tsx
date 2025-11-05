import React, { useMemo } from "react";
// [ 核心修正 ]
// 1. 从 'date-fns' 中移除了 getDaysInMonth
import { startOfMonth } from "date-fns";
// 2. 显式地从我们自己的 constants 文件中导入
import { getDaysInMonth } from "../utils/constants";
// [ 修正结束 ]
import { useTimerStore } from "../context/useTimerStore";
import { getDayTypeForDate } from "../utils/helpers";
import { TimeInputRow } from "./TimeInputRow";
import type { DailyCalculation } from "../types";

interface TimeInputListProps {
  currentMonth: Date;
  dailyCalculations: Record<string, DailyCalculation>;
  onDayTypeConfigClick: (dateString: string) => void;
}

/**
 * 组件: 月份的时间输入列表
 */
export const TimeInputList: React.FC<TimeInputListProps> = ({
  currentMonth,
  dailyCalculations,
  onDayTypeConfigClick,
}) => {
  // 从 store 获取（仅）需要的数据
  const { timeEntries, dayTypeMap } = useTimerStore((state) => ({
    timeEntries: state.timeEntries,
    dayTypeMap: state.dayTypeMap,
  }));

  // [ 核心修正 ]
  // 确保我们使用的是返回数组的 getDaysInMonth
  const daysInMonth = useMemo(() => {
    return getDaysInMonth(startOfMonth(currentMonth));
  }, [currentMonth]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200">
        {/* [ 核心修正 ]
                  因为 daysInMonth 现在是数组，.map 不会再崩溃
                */}
        {daysInMonth.map((dateString) => {
          // [ 健壮性 ]
          // 即使 dailyCalculations 尚未准备好，也提供一个回退
          const calculation = dailyCalculations[dateString] || {
            dayType: "workday",
            effectiveHours: 0,
          };

          // 确保 dayType 的计算是健壮的
          const dayType =
            calculation.dayType || getDayTypeForDate(dateString, dayTypeMap);
          const timeEntry = timeEntries[dateString];

          return (
            <TimeInputRow
              key={dateString}
              dateString={dateString}
              dayType={dayType}
              timeEntry={timeEntry}
              calculation={calculation}
              onDayTypeConfigClick={onDayTypeConfigClick}
            />
          );
        })}
      </div>
    </div>
  );
};
