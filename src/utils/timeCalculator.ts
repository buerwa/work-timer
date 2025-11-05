import {
  parse,
  setHours,
  setMinutes,
  setSeconds,
  differenceInMinutes,
  isBefore,
  isAfter,
} from "date-fns";
// 修正：使用 'import type' 来导入纯类型
import type { TimeEntry, DayType, SettingsConfig } from "../types";

/**
 * 将 'HH:mm' 格式的字符串解析为今天的 Date 对象
 * @param timeStr - 'HH:mm' 格式的时间
 * @returns Date 对象
 */
export function parseTime(timeStr: string): Date | null {
  if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) {
    return null;
  }
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  // 设置秒和毫秒为 0，以便于比较
  return setSeconds(setMinutes(setHours(date, hours), minutes), 0);
}

/**
 * 计算两个时间点之间的分钟差（考虑跨天）
 * @param start - 开始时间 Date 对象
 * @param end - 结束时间 Date 对象
 * @returns 分钟数
 */
function diffInMinutesCrossDay(start: Date, end: Date): number {
  if (isAfter(start, end)) {
    // 跨天情况
    const midnight = setSeconds(setMinutes(setHours(start, 24), 0), 0);
    const minutesToEndOfDay = differenceInMinutes(midnight, start);
    const minutesFromStartOfDay = differenceInMinutes(end, setHours(start, 0));
    return minutesToEndOfDay + minutesFromStartOfDay;
  }
  return differenceInMinutes(end, start);
}

/**
 * 计算有效工时
 * @param timeEntry - { start, end }
 * @param dayType - 日期类型
 * @param settings - 配置项
 * @returns
 */
export function calculateWorkHours(
  timeEntry: TimeEntry | null | undefined,
  dayType: DayType,
  settings: SettingsConfig
) {
  if (!timeEntry?.start || !timeEntry.end) {
    return { totalHours: 0, effectiveHours: 0 };
  }

  const startTime = parseTime(timeEntry.start);
  const endTime = parseTime(timeEntry.end);

  if (!startTime || !endTime) {
    return { totalHours: 0, effectiveHours: 0 };
  }

  const totalMinutes = diffInMinutesCrossDay(startTime, endTime);
  let effectiveMinutes = totalMinutes;

  // 根据日期类型选择休息时间规则
  const isWorkday = dayType === "workday" || dayType === "restday-work";
  const restTimes = isWorkday
    ? settings.workdayRestTimes
    : settings.weekendRestTimes;

  // 减去休息时间
  for (const rest of restTimes) {
    const restStart = parseTime(rest.start);
    const restEnd = parseTime(rest.end);

    if (!restStart || !restEnd) continue;

    // 计算重叠时间
    const overlapStart = isAfter(startTime, restStart) ? startTime : restStart;
    const overlapEnd = isBefore(endTime, restEnd) ? endTime : restEnd;

    if (isAfter(overlapStart, overlapEnd)) {
      // 没有重叠
      continue;
    }

    const overlapMinutes = diffInMinutesCrossDay(overlapStart, overlapEnd);
    effectiveMinutes -= overlapMinutes;
  }

  let effectiveHours = Math.max(0, effectiveMinutes / 60);

  // 应用周末和节假日的 8 小时封顶规则
  if (!isWorkday && effectiveHours > settings.maxWeekendHours) {
    effectiveHours = settings.maxWeekendHours;
  }

  return {
    totalHours: totalMinutes / 60,
    effectiveHours: effectiveHours,
  };
}
