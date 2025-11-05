/** 日期类型 */
export type DayType = "workday" | "restday-work" | "weekend" | "holiday";

/** 时间配置 (格式 "HH:mm") */
export type TimeRange = {
  start: string;
  end: string;
};

/** 应用配置项 */
export type SettingsConfig = {
  workdayLunchBreak: TimeRange;
  workdayDinnerBreak: TimeRange;
  restdayLunchBreak: TimeRange;
  standardWorkTime: TimeRange;
  restdayMaxHours: number;
};

/** 单日时间记录 (格式 "HH:mm") */
export type TimeEntry = {
  start: string;
  end: string;
};

/** 日期类型映射 (格式 "yyyy-MM-dd") */
export type DayTypeMap = {
  [date: string]: DayType;
};

/** Zustand Store 的完整状态 */
export type AppState = {
  settings: SettingsConfig;
  timeEntries: {
    [date: string]: TimeEntry; // "yyyy-MM-dd"
  };
  dayTypes: DayTypeMap;
  hourFormat: "12h" | "24h";

  // Actions
  actions: {
    updateSettings: (newSettings: Partial<SettingsConfig>) => void;
    setTimeEntry: (date: string, entry: TimeEntry) => void;
    clearTimeEntry: (date: string) => void;
    setDayType: (date: string, type: DayType) => void;
    setMultipleDayTypes: (dates: string[], type: DayType) => void;
    toggleHourFormat: () => void;
    importData: (jsonData: string) => void;
    exportData: () => string;
    resetToDefaults: () => void;
  };
};
