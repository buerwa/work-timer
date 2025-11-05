import React, { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  parse,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Modal } from "./Modal";
import { useTimerStore, useTimerActions } from "../context/useTimerStore";
import { getDayTypeForDate } from "../utils/helpers";
import { DAY_TYPE_CONFIG } from "../utils/constants";
// 修正：使用 'import type' 来导入纯类型
import type { DayType } from "../types";

interface CalendarConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: Date; // 接收来自 App 的当前月份
  // onDateSelect?: (dateString: string) => void; // (可选)
}

const WEEK_DAYS = ["日", "一", "二", "三", "四", "五", "六"];

/**
 * 日历配置弹窗
 */
export const CalendarConfigModal: React.FC<CalendarConfigModalProps> = ({
  isOpen,
  onClose,
  currentMonth,
}) => {
  // 注意：我们从 App 组件接收 currentMonth，因此不需要内部状态来管理月份
  // const [currentMonth, setCurrentMonth] = useState(new Date());

  // 从 store 中获取日历配置和 actions
  const { dayTypeMap } = useTimerStore((state) => ({
    dayTypeMap: state.dayTypeMap,
  }));
  const { setDayType } = useTimerActions();

  // 生成日历网格
  const calendarGrid = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    // 获取该月所有日期
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // 获取该月第一天是周几 (0-6, 周日-周六)
    const startDayOfWeek = getDay(monthStart);

    // 创建一个包含空位和当月日期的数组
    const grid: (Date | null)[] = [
      ...Array(startDayOfWeek).fill(null), // 月初的空位
      ...daysInMonth,
    ];

    return grid;
  }, [currentMonth]);

  // 处理日期点击事件
  const handleDayClick = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    // 获取当前类型
    const currentType = getDayTypeForDate(dateString, dayTypeMap);

    // 定义类型的循环顺序
    const typeOrder: DayType[] = [
      "workday",
      "weekend",
      "holiday",
      "restday-work",
    ];

    // 找到当前类型的索引
    let currentIndex = typeOrder.indexOf(currentType);

    // 切换到下一个类型
    // (如果找不到，则从头开始)
    let nextIndex = (currentIndex + 1) % typeOrder.length;

    // 特殊逻辑：如果默认是 周末(weekend)，点击后不应该变成 工作日(workday)，
    // 而是应该变成 调休(restday-work) 或 节假日(holiday)
    // 但为了简化，我们采用简单的循环切换

    const nextType = typeOrder[nextIndex];

    // 特殊逻辑：如果下一个类型是 'workday' 或 'weekend'，我们应该重置它
    // (通过在 setDayType 中删除该键来实现)

    setDayType(dateString, nextType);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="配置日期类型 (点击日期切换)"
    >
      <div className="w-full">
        {/* 1. 月份显示 (注：切换功能在 App.tsx 中) */}
        <div className="flex justify-center items-center mb-4">
          {/* <button onClick={() => {}} className="p-2 rounded-md hover:bg-gray-100"><ChevronLeft size={20} /></button>
           */}
          <h2 className="text-xl font-semibold text-gray-800 w-32 text-center">
            {format(currentMonth, "yyyy 年 MM 月")}
          </h2>
          {/* <button onClick={() => {}} className="p-2 rounded-md hover:bg-gray-100"><ChevronRight size={20} /></button>
           */}
        </div>

        {/* 2. 星期头部 */}
        <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2">
          {WEEK_DAYS.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* 3. 日期网格 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarGrid.map((date, index) => {
            if (!date) {
              return (
                <div key={`empty-${index}`} className="aspect-square"></div>
              );
            }

            const dateString = format(date, "yyyy-MM-dd");
            // 获取当天的类型（自定义或默认）
            const dayType = getDayTypeForDate(dateString, dayTypeMap);
            const { label, bg, text } = DAY_TYPE_CONFIG[dayType];

            return (
              <button
                key={dateString}
                onClick={() => handleDayClick(date)}
                title={`${dateString} - 当前: ${label} (点击切换)`}
                className={`
                                    aspect-square flex flex-col justify-center items-center 
                                    rounded-lg cursor-pointer transition-all 
                                    hover:ring-2 hover:ring-blue-400
                                    ${bg} ${text}
                                `}
              >
                <span className="text-lg font-medium">{format(date, "d")}</span>
                <span className="text-xs">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
