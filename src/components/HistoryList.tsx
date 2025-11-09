import React, { useMemo } from "react";
import {
  format,
  parse,
  startOfMonth,
  isSameMonth,
  compareDesc,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import { History } from "lucide-react";
import { useTimerStore } from "../context/useTimerStore";
import { getDayTypeForDate, formatHours } from "../utils/helpers";
import { DAY_TYPE_CONFIG } from "../utils/constants";
import type { DailyCalculation } from "../types";

interface HistoryListProps {
  currentMonth: Date;
  dailyCalculations: Record<string, DailyCalculation>;
}

/**
 * 组件: 历史记录列表 (仅展示已录入数据的日期)
 */
export const HistoryList: React.FC<HistoryListProps> = ({
  currentMonth,
  dailyCalculations,
}) => {
  const { timeEntries, dayTypeMap } = useTimerStore((state) => ({
    timeEntries: state.timeEntries,
    dayTypeMap: state.dayTypeMap,
  }));

  // 获取本月已录入的所有日期，并按倒序排列（最近的在最前）
  const historyDates = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    return Object.keys(timeEntries)
      .filter((dateStr) => {
        const date = parse(dateStr, "yyyy-MM-dd", new Date());
        // 必须是当月，且有有效的开始或结束时间
        return (
          isSameMonth(date, monthStart) &&
          (timeEntries[dateStr].start || timeEntries[dateStr].end)
        );
      })
      .sort((a, b) =>
        compareDesc(
          parse(a, "yyyy-MM-dd", new Date()),
          parse(b, "yyyy-MM-dd", new Date())
        )
      );
  }, [currentMonth, timeEntries]);

  if (historyDates.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500 border border-gray-100 border-dashed">
        <History className="mx-auto mb-2 opacity-50" size={32} />
        <p>本月暂无打卡记录</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center">
        <History className="mr-2 text-gray-500" size={18} />
        <h3 className="text-gray-700 font-medium">
          本月打卡记录 ({historyDates.length} 条)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日期
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                类型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                打卡时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                有效工时
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {historyDates.map((dateStr) => {
              const entry = timeEntries[dateStr];
              const calculation = dailyCalculations[dateStr] || {
                effectiveHours: 0,
              };
              const dayType = getDayTypeForDate(dateStr, dayTypeMap);
              const dayConfig = DAY_TYPE_CONFIG[dayType];
              const dateObj = parse(dateStr, "yyyy-MM-dd", new Date());

              return (
                <tr
                  key={dateStr}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {format(dateObj, "MM-dd EEE", { locale: zhCN })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${dayConfig.bg} ${dayConfig.text}`}
                    >
                      {dayConfig.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {entry.start || "--:--"}{" "}
                    <span className="mx-1 text-gray-300">|</span>{" "}
                    {entry.end || "--:--"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {formatHours(calculation.effectiveHours)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
