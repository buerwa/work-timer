import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
// 修正：使用 'import type' 来导入纯类型
import type {
  AppState,
  AppActions,
  SettingsConfig,
  DayType,
  TimeEntry,
} from "../types";
import { initialState, DEFAULT_SETTINGS } from "../utils/constants";

// Zustand store
// 合并 State 和 Actions
type TimerStore = AppState & AppActions;

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      timeEntries: {},
      settings: DEFAULT_SETTINGS,
      dayTypeMap: {},

      // --- Actions ---

      setStore: (data) => {
        set(data);
      },

      setTimeEntry: (date: string, entry: TimeEntry) => {
        // 输入验证
        const validStart =
          entry.start === "" || /^\d{2}:\d{2}$/.test(entry.start);
        const validEnd = entry.end === "" || /^\d{2}:\d{2}$/.test(entry.end);

        if (!validStart || !validEnd) {
          console.error("Invalid time format submitted");
          return;
        }

        set((state) => ({
          timeEntries: {
            ...state.timeEntries,
            [date]: { start: entry.start, end: entry.end },
          },
        }));
      },

      setDayType: (date: string, dayType: DayType) => {
        set((state) => {
          const newDayTypeMap = { ...state.dayTypeMap };
          // 如果设置为 "默认"，则从 map 中删除该键
          if (dayType === "workday" || dayType === "weekend") {
            // 这是一个简化的逻辑，更好的做法是检查该日期 *默认* 是什么
            // 但对于UI来说，删除自定义项通常是期望的行为
            delete newDayTypeMap[date];
          } else {
            newDayTypeMap[date] = dayType;
          }
          return { dayTypeMap: newDayTypeMap };
        });
      },

      setSettings: (newSettings: Partial<SettingsConfig>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      toggleHourFormat: () => {
        set((state) => ({
          hourFormat: state.hourFormat === "12h" ? "24h" : "12h",
        }));
      },

      resetToDefaults: () => {
        // 重置所有状态
        set({
          ...initialState,
          timeEntries: {},
          settings: DEFAULT_SETTINGS,
          dayTypeMap: {},
        });
      },
    }),
    {
      name: "work-timer-storage", // localStorage 中的 key
      storage: createJSONStorage(() => localStorage), // 使用 localStorage
    }
  )
);

// --- 创建自定义 Hooks 以便在组件中使用 ---

/**
 * Hook: 用于获取所有状态
 * @returns AppState
 */
export const useTimerState = () => useTimerStore((state) => state);

/**
 * Hook: 用于获取所有 actions
 * @returns AppActions
 */
export const useTimerActions = () =>
  useTimerStore((state) => ({
    setStore: state.setStore,
    setTimeEntry: state.setTimeEntry,
    setDayType: state.setDayType,
    setSettings: state.setSettings,
    toggleHourFormat: state.toggleHourFormat,
    resetToDefaults: state.resetToDefaults,
  }));

/**
 * Hook: 仅用于获取设置和格式化选项（用于性能优化）
 * @returns \{ settings, hourFormat \}
 */
export const useSettings = () =>
  useTimerStore((state) => ({
    settings: state.settings,
    hourFormat: state.hourFormat,
  }));
