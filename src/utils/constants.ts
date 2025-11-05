import { format } from "date-fns";
// 修正：使用 'import type' 来导入纯类型，防止 Vite 报错
import type { SettingsConfig, DayType } from "../types";

/** 默认设置 */
export const DEFAULT_SETTINGS: SettingsConfig = {
  standardWorkTime: { start: "09:00", end: "17:30" },
  workdayRestTimes: [
    { start: "12:00", end: "13:30" }, // 午休
    { start: "17:30", end: "18:00" }, // 晚休
  ],
  weekendRestTimes: [
    { start: "12:00", end: "13:30" }, // 午休
  ],
  maxWeekendHours: 8,
};

/** 默认日期类型配置 */
export const DAY_TYPE_CONFIG: Record<
  DayType,
  { label: string; bg: string; text: string }
> = {
  workday: { label: "工作日", bg: "bg-transparent", text: "text-gray-800" },
  weekend: { label: "周末", bg: "bg-blue-100", text: "text-blue-800" },
  holiday: { label: "节假日", bg: "bg-green-100", text: "text-green-800" },
  "restday-work": {
    label: "调休",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
  },
};

/**
 * 应用程序的初始状态
 * 注意： settings 和 dayTypeMap 将由 Zustand persist 中间件从 localStorage 填充
 */
export const initialState = {
  // timeEntries: {}, // 示例： { '2023-10-25': { start: '09:00', end: '17:30' } }
  // settings: DEFAULT_SETTINGS,
  // dayTypeMap: {}, // 示例： { '2023-10-01': 'holiday' }
  hourFormat: "24h" as const,
};

/**
 * 生成给定月份的所有日期字符串
 * @param month - Date 对象，表示目标月份
 * @returns 字符串数组，格式为 'yyyy-MM-dd'
 */
export function getDaysInMonth(month: Date): string[] {
  const dates: string[] = [];
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const date = new Date(year, monthIndex, 1);

  while (date.getMonth() === monthIndex) {
    dates.push(format(date, "yyyy-MM-dd"));
    date.setDate(date.getDate() + 1);
  }
  return dates;
}
