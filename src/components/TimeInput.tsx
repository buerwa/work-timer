import React, { useState, useEffect } from "react";
// highlight-start
// 修正：不再导入 useHourFormat
import { useSettings } from "../context/useTimerStore";
// highlight-end
import { formatTime, parse12hTime } from "../utils/helpers";

interface TimeInputProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
}

/**
 * 组件: 自定义时间输入 (支持 12/24h 切换)
 */
export const TimeInput: React.FC<TimeInputProps> = ({ value, onChange }) => {
  // highlight-start
  // 修正：从 useSettings() 中解构出 hourFormat
  const { hourFormat } = useSettings();
  // highlight-end

  // displayValue 是输入框中“所见”的值
  const [displayValue, setDisplayValue] = useState("");

  // 当 value (来自 store) 或 hourFormat 变化时，更新显示
  useEffect(() => {
    setDisplayValue(formatTime(value, hourFormat));
  }, [value, hourFormat]);

  // 输入框聚焦时
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // 如果是 24h 制，切换到 <input type="time">
    if (hourFormat === "24h") {
      e.target.type = "time";
      e.target.value = value; // 设为 24h 的值
    }
  };

  // 输入框内容变化时
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    if (hourFormat === "12h") {
      setDisplayValue(newValue); // 允许用户输入 "1:30 p"
      // 尝试将 12h 格式转为 24h 格式
      const parsed = parse12hTime(newValue);
      // 如果解析成功 (e.g., "1:30 pm" -> "13:30")
      if (parsed) {
        onChange(parsed); // 更新 store
      }
    } else {
      // 24h 格式 (来自 type="time" 或 type="text")
      setDisplayValue(newValue);
      onChange(newValue); // 直接更新 store
    }
  };

  // 输入框失焦时
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // 如果是 24h 制，切回 <input type="text">
    if (hourFormat === "24h") {
      e.target.type = "text";
    }
    // 无论如何，都将显示值格式化
    setDisplayValue(formatTime(value, hourFormat));
  };

  return (
    <input
      type="text" // 默认为 text
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={hourFormat === "12h" ? "hh:mm am/pm" : "HH:mm"}
      // 使用 @tailwindcss/forms 插件提供的 'form-input' 类
      className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
    />
  );
};
