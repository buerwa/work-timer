import { format, parse, isWeekend, isValid } from "date-fns";
import { parseTime } from "./timeCalculator";
// 修正：使用 'import type' 来导入纯类型
import type { DayType, DayTypeMap } from "../types";

/**
 * [新添加的函数]
 * 尝试将 12 小时制字符串 (如 "1:30 pm", "01:30 p") 解析为 "HH:mm"
 * @param timeStr
 * @returns "HH:mm" 格式的字符串，如果无效则返回 null
 */
export function parse12hTime(timeStr: string): string | null {
  if (!timeStr) return null;

  // 1. 检查是否已经是 24h 格式 (HH:mm)
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    const [h, m] = timeStr.split(":").map(Number);
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return timeStr;
    }
  }

  // 2. 尝试解析 12h 格式 (e.g., "1:30 pm", "1:30p", "1:30 p")
  // 移除空格，统一小写
  const normalizedTime = timeStr.toLowerCase().replace(/\s/g, "");

  // 匹配: 1 or 2 digits (hour), ":", 2 digits (minute), "am/pm" (optional 'm')
  // 示例: "1:30p", "01:30pm"
  const match = normalizedTime.match(/^(\d{1,2}):(\d{2})([ap])m?$/);

  if (match) {
    let [_, hourStr, minuteStr, period] = match;
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    // "13:00 pm" 这种是非法输入
    if (hour > 12 || minute > 59) return null;
    // "12:00 pm" (12) or "1:00 pm" (13)
    if (period === "p" && hour !== 12) {
      hour += 12;
    }
    // "12:00 am" (00)
    else if (period === "a" && hour === 12) {
      hour = 0;
    }

    // 格式化为 "HH:mm"
    const h = String(hour).padStart(2, "0");
    const m = String(minute).padStart(2, "0");
    return `${h}:${m}`;
  }

  return null; // 无法解析
}

/**
 * 获取指定日期的日期类型（工作日、周末、节假日等）
 * @param dateString - 'yyyy-MM-dd' 格式的日期
 * @param dayTypeMap - 用户自定义的日期类型映射
 * @returns DayType
 */
export function getDayTypeForDate(
  dateString: string,
  dayTypeMap: DayTypeMap
): DayType {
  // 1. 检查用户自定义配置
  if (dayTypeMap[dateString]) {
    return dayTypeMap[dateString];
  }

  // 2. 如果没有配置，则根据是否为周末进行默认判断
  const date = parse(dateString, "yyyy-MM-dd", new Date());
  if (!isValid(date)) {
    return "workday"; // 默认
  }

  if (isWeekend(date)) {
    return "weekend";
  }

  // 3. 默认为工作日
  return "workday";
}

/**
 * 格式化时间字符串（12/24 小时制）
 * @param timeStr - 'HH:mm' 格式的时间
 * @param format - '12h' 或 '24h'
 * @returns 格式化后的时间字符串
 */
export function formatTime(
  timeStr: string | null | undefined,
  hourFormat: "12h" | "24h"
): string {
  if (!timeStr) return "--:--";

  // parseTime 是我们 timeCalculator 里的工具，它返回一个 Date 对象
  const date = parseTime(timeStr);
  if (!date || !isValid(date)) {
    // 如果输入无效 (例如 "1:30 p")，parseTime 会返回 null
    // 我们在12h模式下，短暂显示无效输入，直到失焦
    // 但如果值已经是 "HH:mm" 但无效 (e.g. "99:99")，返回 --:--
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
      return "--:--";
    }
    // 对于 12h 输入中 (e.g. "1:30 p")，暂时原样显示
    return timeStr;
  }

  if (hourFormat === "12h") {
    return format(date, "hh:mm a"); // e.g., "01:30 PM"
  }
  return format(date, "HH:mm"); // e.g., "13:30"
}

/**
 * 格式化小时数为 'X.XX h'
 * @param hours - 小时数
 * @returns 格式化后的字符串
 */
export function formatHours(hours: number): string {
  if (isNaN(hours) || hours === 0) {
    return "0 h";
  }
  return `${hours.toFixed(2)} h`;
}
