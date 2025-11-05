import { useMemo } from "react";
// -----------------------------------------------------------------
// [ 核心修正 ]
// 1. 从 'date-fns' 中移除了 getDaysInMonth，因为它返回的是数字
import { format, startOfMonth } from "date-fns";
// 2. 显式地从我们自己的 constants 文件中导入，它返回的是数组
import { getDaysInMonth } from "../utils/constants";
// -----------------------------------------------------------------
import { useTimerStore } from "../context/useTimerStore";
import { getDayTypeForDate } from "../utils/helpers";
import { calculateWorkHours } from "../utils/timeCalculator";
import type { DayType, DailyCalculation } from "../types";

/**
 * 计算仪表盘统计数据的自定义 Hook
 * @param currentMonth - 当前查看的月份 (Date 对象)
 * @returns DashboardStats
 */
export const useDashboardStats = (currentMonth: Date) => {
  // 从 Zustand store 中获取所需的状态
  const { timeEntries, dayTypeMap, settings } = useTimerStore((state) => ({
    timeEntries: state.timeEntries,
    dayTypeMap: state.dayTypeMap,
    settings: state.settings,
  }));

  // 使用 useMemo 来缓存计算结果，仅在依赖项变化时重新计算
  const stats = useMemo(() => {
    const monthKey = format(currentMonth, "yyyy-MM");

    let totalWorkdayHours = 0;
    let totalWorkdayCount = 0;
    let totalWeekendHours = 0;
    let totalWeekendDayCount = 0;

    // 存储每天的计算结果，以便在 TimeInputList 中复用
    const dailyCalculations: Record<string, DailyCalculation> = {};

    // [ 修正后的导入 ]
    // getDaysInMonth 现在指向我们 constants.ts 中的函数，
    // 它返回一个字符串数组，是可遍历的 (iterable)。
    const daysInMonth = getDaysInMonth(startOfMonth(currentMonth));

    // [ 此处是报错行 ]
    // 因为 daysInMonth 现在是数组了，所以这里不再报错
    for (const dateString of daysInMonth) {
      const dayType = getDayTypeForDate(dateString, dayTypeMap);
      const timeEntry = timeEntries[dateString];

      // 核心计算逻辑
      const { effectiveHours } = calculateWorkHours(
        timeEntry,
        dayType,
        settings
      );

      // 存储当天的计算结果
      dailyCalculations[dateString] = {
        dayType,
        effectiveHours,
      };

      // 仅对已录入工时的日期进行统计
      if (effectiveHours > 0) {
        if (dayType === "workday" || dayType === "restday-work") {
          totalWorkdayHours += effectiveHours;
          totalWorkdayCount++;
        } else if (dayType === "weekend" || dayType === "holiday") {
          // 注意：calculateWorkHours 已经处理了 8h 封顶
          totalWeekendHours += effectiveHours;
          totalWeekendDayCount++;
        }
      }
    }

    // --- 计算最终统计数据 ---

    // 1. 日平均工时
    const averageHours =
      totalWorkdayCount > 0 ? totalWorkdayHours / totalWorkdayCount : 0;

    // 2. 工作日加班
    // (总工时 - 目标工时)
    const workdayOvertime = totalWorkdayHours - totalWorkdayCount * 8;

    // 3. 周末/节假日加班 (已在循环中累加)
    const weekendOvertime = totalWeekendHours;

    // 4. 总加班
    const totalOvertime = workdayOvertime + weekendOvertime;

    // 5. 亏欠工时 (仅在日均不足 8 小时且有工作日录入时计算)
    let deficitHours = 0;
    if (averageHours > 0 && averageHours < 8) {
      // (目标总工时 - 实际总工时)
      deficitHours = totalWorkdayCount * 8 - totalWorkdayHours;
    }

    return {
      monthKey,
      totalWorkdayCount,
      totalWeekendDayCount,
      averageHours,
      workdayOvertime,
      weekendOvertime,
      totalOvertime,
      isDeficit: deficitHours > 0,
      deficitHours,
      dailyCalculations, // 传递每天的计算结果
    };
  }, [currentMonth, timeEntries, dayTypeMap, settings]);

  return stats;
};
