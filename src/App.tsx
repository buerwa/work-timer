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
  Calendar as CalendarIcon,
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
// [修改] 引入新组件
import { DailyEntryForm } from "./components/DailyEntryForm";
import { HistoryList } from "./components/HistoryList";

// Utils
import { parseTime } from "./utils/timeCalculator";

/**
 * 主应用组件 (App.tsx)
 */
function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { settings } = useSettings();
  const { resetToDefaults } = useTimerActions();

  // 核心逻辑计算
  const stats = useDashboardStats(currentMonth);

  // 动态下班时间计算
  const { dynamicEndTime, standardEndTime } = useMemo(() => {
    const standardEnd = parseTime(settings.standardWorkTime.end);
    if (!standardEnd) return { dynamicEndTime: null, standardEndTime: null };

    const todayString = format(new Date(), "yyyy-MM-dd");
    const todayCalc = stats.dailyCalculations[todayString];

    if (
      !todayCalc ||
      (todayCalc.dayType !== "workday" &&
        todayCalc.dayType !== "restday-work") ||
      !todayCalc.effectiveHours
    ) {
      return { dynamicEndTime: standardEnd, standardEndTime: standardEnd };
    }

    const { deficitHours, isDeficit } = stats;
    let dynamicEnd = standardEnd;

    if (isDeficit && isAfter(standardEnd, new Date())) {
      dynamicEnd = addMinutes(dynamicEnd, Math.ceil(deficitHours * 60));
    }

    return { dynamicEndTime: dynamicEnd, standardEndTime: standardEnd };
  }, [
    settings.standardWorkTime,
    stats.deficitHours,
    stats.isDeficit,
    stats.dailyCalculations,
  ]);

  const changeMonth = (direction: number) => {
    setCurrentMonth((prev) => {
      const monthStart = startOfMonth(prev);
      return direction > 0 ? addDays(monthStart, 35) : subDays(monthStart, 1);
    });
  };

  const handleReset = () => {
    if (window.confirm("确定要重置所有设置和工时数据吗？此操作不可撤销。")) {
      resetToDefaults();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-inter antialiased text-gray-800">
      <div className="max-w-5xl mx-auto">
        {/* 1. 页头 */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Work-Timer
          </h1>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <ImportExportButtons />
            {/* 移除了 12h/24h 切换按钮，因为新的下拉列表强制使用 24h 格式更清晰 */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 border border-gray-200 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-all"
              title="设置"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={handleReset}
              title="重置所有数据"
              className="p-2.5 border border-transparent rounded-lg text-red-600 hover:bg-red-50 transition-all"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        {/* 2. 核心功能区 */}
        <div className="space-y-6">
          {/* 倒计时 */}
          <CountdownTimer
            dynamicEndTime={dynamicEndTime}
            standardEndTime={standardEndTime}
          />

          {/* 仪表盘 */}
          <Dashboard stats={stats} />

          {/* 新的单日录入表单 */}
          <DailyEntryForm
            onDayTypeConfigClick={(dateString) => {
              // 这里需要稍微改一下，因为 CalendarConfigModal 接收的是 Date 对象，而这里传回来的是 string
              // 不过我们可以在 CalendarConfigModal 内部处理，或者在这里转换
              // 为了简单，我们在 CalendarConfigModal 里增加一个 onDateSelect 的处理逻辑
              // 或者让 DailyEntryForm 直接打开 CalendarConfigModal 并选中该日期
              setIsCalendarOpen(true);
              // TODO: 理想情况下，这里应该能让 CalendarConfigModal 自动跳转到指定日期
            }}
          />

          {/* 历史记录区域 */}
          <div>
            <div className="flex justify-between items-center mb-4 px-1">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                {format(currentMonth, "yyyy 年 MM 月")}
              </h2>
              <div className="flex items-center space-x-2">
                <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 mr-2">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="p-2 hover:bg-gray-50 rounded-l-lg border-r border-gray-200"
                  >
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    className="p-2 hover:bg-gray-50 rounded-r-lg"
                  >
                    <ChevronRight size={20} className="text-gray-600" />
                  </button>
                </div>
                <button
                  onClick={() => setIsCalendarOpen(true)}
                  className="flex items-center px-3 py-2 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  <CalendarIcon size={16} className="mr-2" />
                  配置日期类型
                </button>
              </div>
            </div>

            {/* 新的历史记录列表 */}
            <HistoryList
              currentMonth={currentMonth}
              dailyCalculations={stats.dailyCalculations}
            />
          </div>
        </div>
      </div>

      {/* 弹窗 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <CalendarConfigModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        currentMonth={currentMonth}
      />
    </div>
  );
}

export default App;
