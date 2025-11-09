import React, { useState, useEffect } from "react";
import { format, parse, isValid } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { useTimerStore, useTimerActions } from "../context/useTimerStore";
import { getDayTypeForDate, formatHours } from "../utils/helpers";
import { calculateWorkHours } from "../utils/timeCalculator";
import { DAY_TYPE_CONFIG } from "../utils/constants";
import { ListTimeInput } from "./ListTimeInput";

interface DailyEntryFormProps {
  onDayTypeConfigClick: (dateString: string) => void;
}

/**
 * 组件: 单日工时录入表单
 */
export const DailyEntryForm: React.FC<DailyEntryFormProps> = ({
  onDayTypeConfigClick,
}) => {
  // 默认选中今天
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );

  const { timeEntries, dayTypeMap, settings } = useTimerStore((state) => ({
    timeEntries: state.timeEntries,
    dayTypeMap: state.dayTypeMap,
    settings: state.settings,
  }));
  const { setTimeEntry } = useTimerActions();

  // 获取选中日期的数据
  const timeEntry = timeEntries[selectedDate] || { start: "", end: "" };
  const dayType = getDayTypeForDate(selectedDate, dayTypeMap);
  const dayConfig = DAY_TYPE_CONFIG[dayType];

  // 计算当天的实时工时
  const [dailyStats, setDailyStats] = useState({ effectiveHours: 0 });

  useEffect(() => {
    const stats = calculateWorkHours(timeEntry, dayType, settings);
    setDailyStats(stats);
  }, [timeEntry, dayType, settings]);

  // 格式化显示的日期
  const dateObj = parse(selectedDate, "yyyy-MM-dd", new Date());
  const formattedDateStr = isValid(dateObj)
    ? format(dateObj, "yyyy年MM月dd日 EEEE", { locale: zhCN })
    : "选择日期";

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Calendar className="mr-2" size={20} />
        每日打卡
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* 1. 日期选择 (4列) */}
        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            选择日期
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
          <div className="mt-3 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <span className="text-sm font-medium text-gray-900">
              {formattedDateStr}
            </span>
            <button
              onClick={() => onDayTypeConfigClick(selectedDate)}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${dayConfig.bg} ${dayConfig.text} hover:opacity-80`}
            >
              {dayConfig.label} (点击修改)
            </button>
          </div>
        </div>

        {/* 2. 时间录入 (5列) */}
        <div className="md:col-span-5 flex items-end space-x-4">
          <div className="flex-1">
            <ListTimeInput
              label="上班时间"
              value={timeEntry.start || settings.standardWorkTime.start} // 默认显示标准上班时间方便录入
              onChange={(val) =>
                setTimeEntry(selectedDate, { start: val, end: timeEntry.end })
              }
            />
          </div>
          <div className="flex-1">
            <ListTimeInput
              label="下班时间"
              value={timeEntry.end || settings.standardWorkTime.end} // 默认显示标准下班时间
              onChange={(val) =>
                setTimeEntry(selectedDate, { start: timeEntry.start, end: val })
              }
            />
          </div>
        </div>

        {/* 3. 当日统计 (3列) */}
        <div className="md:col-span-3 flex flex-col justify-end">
          <div className="bg-indigo-50 p-4 rounded-lg text-center border border-indigo-100">
            <div className="text-sm text-indigo-600 mb-1">当日有效工时</div>
            <div className="text-3xl font-bold text-indigo-700">
              {formatHours(dailyStats.effectiveHours)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
