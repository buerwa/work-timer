import React, { useState, useMemo } from "react";
import {
  format,
  addDays,
  subDays,
  startOfMonth,
  isAfter,
  addMinutes,
} from "date-fns";
import {
  Settings,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

// Zustand store 和 actions
import {
  useTimerStore,
  useTimerActions,
  useSettings,
} from "./context/useTimerStore";

// Hooks
import { useDashboardStats } from "./hooks/useDashboardStats";

// Components
import { SettingsModal } from "./components/SettingsModal";
import { CalendarConfigModal } from "./components/CalendarConfigModal";
import { ImportExportButtons } from "./components/ImportExportButtons";
import { Dashboard } from "./components/Dashboard";
import { CountdownTimer } from "./components/CountdownTimer";
import { TimeInputList } from "./components/TimeInputList";

// Utils
import { parseTime } from "./utils/timeCalculator";

/**
 * 主应用组件 (App.tsx)
 * * 这个文件将所有组件和状态管理 Hooks 组装在一起。
 */
function App() {
  // 弹窗状态
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 当前查看的月份
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 从 Zustand store 获取状态和 actions
  const { hourFormat, settings } = useSettings();
  const { toggleHourFormat, resetToDefaults } = useTimerActions();

  // --- 核心逻辑 ---

  // 1. 计算仪表盘统计数据
  // useDashboardStats Hook 会自动从 store 中获取数据并计算
  const stats = useDashboardStats(currentMonth);

  // 2. 计算动态下班时间
  const { dynamicEndTime, standardEndTime } = useMemo(() => {
    // 获取配置的标准下班时间
    const standardEnd = parseTime(settings.standardWorkTime.end);
    if (!standardEnd) return { dynamicEndTime: null, standardEndTime: null };

    const todayString = format(new Date(), "yyyy-MM-dd");
    const todayCalc = stats.dailyCalculations[todayString];

    // 如果今天不是工作日/调休日，或者今天还未录入工时，则不计算动态时间
    if (
      !todayCalc ||
      (todayCalc.dayType !== "workday" &&
        todayCalc.dayType !== "restday-work") ||
      !todayCalc.effectiveHours
    ) {
      return { dynamicEndTime: standardEnd, standardEndTime: standardEnd };
    }

    // 获取本月工时亏欠情况
    const { deficitHours, isDeficit } = stats;

    let dynamicEnd = standardEnd;

    // 如果本月存在工时亏欠 ( deficitHours > 0 )
    // 并且现在还没到标准下班时间 (用于防止下班后时间还在跳)
    if (isDeficit && isAfter(standardEnd, new Date())) {
      // 动态下班时间 = 标准下班时间 + 累计亏欠的分钟数
      // 这是一个简化的逻辑，假设所有亏欠都在今天补完
      dynamicEnd = addMinutes(dynamicEnd, Math.ceil(deficitHours * 60));
    }

    return { dynamicEndTime: dynamicEnd, standardEndTime: standardEnd };
  }, [
    settings.standardWorkTime,
    stats.deficitHours,
    stats.isDeficit,
    stats.dailyCalculations,
  ]);

  // --- 事件处理 ---

  // 切换月份
  const changeMonth = (direction: number) => {
    setCurrentMonth((prev) => {
      const monthStart = startOfMonth(prev);
      // 通过加/减天数来避免 date-fns 的月份计算问题
      return direction > 0 ? addDays(monthStart, 35) : subDays(monthStart, 1);
    });
  };

  // 处理重置 (带确认)
  const handleReset = () => {
    // 真实应用中使用自定义 Modal
    const confirmed = window.confirm(
      "确定要重置所有设置和工时数据吗？此操作不可撤销。"
    );
    if (confirmed) {
      resetToDefaults();
      console.log("数据已重置。");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-inter antialiased text-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* 1. 页头 */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-3xl font-bold text-gray-900">Work-Timer</h1>
          <div className="flex items-center space-x-2">
            <ImportExportButtons />
            <button
              onClick={toggleHourFormat}
              title={`切换到 ${hourFormat === "12h" ? "24" : "12"} 小时制`}
              className="p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 w-12"
            >
              {hourFormat === "12h" ? "12h" : "24h"}
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              title="设置"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={handleReset}
              title="重置所有数据"
              className="p-2 border border-transparent rounded-md text-sm font-medium text-red-600 hover:bg-red-100"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </header>

        {/* 2. 倒计时 */}
        <CountdownTimer
          dynamicEndTime={dynamicEndTime}
          standardEndTime={standardEndTime}
        />

        {/* 3. 仪表盘 */}
        <Dashboard stats={stats} />

        {/* 4. 月份切换 和 列表 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-md hover:bg-gray-200"
              aria-label="上个月"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 w-32 text-center">
              {format(currentMonth, "yyyy 年 MM 月")}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-md hover:bg-gray-200"
              aria-label="下个月"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Calendar size={18} className="mr-2" />
            配置日期类型
          </button>
        </div>

        {/* 5. 时间列表 */}
        <TimeInputList
          currentMonth={currentMonth}
          dailyCalculations={stats.dailyCalculations}
          onDayTypeConfigClick={() => setIsCalendarOpen(true)}
        />
      </div>

      {/* 6. 弹窗 (Modals) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <CalendarConfigModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        currentMonth={currentMonth}
        // onDateSelect={null} // 我们在这里不需要这个功能
      />
    </div>
  );
}

export default App;
