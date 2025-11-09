import React, { useMemo, useEffect, useState } from "react";

interface ListTimeInputProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  label?: string;
}

/**
 * 组件: 下拉列表式时间选择器 (彻底解决移动端轮盘问题)
 * 使用两个原生 <select> 实现小时和分钟的选择
 */
export const ListTimeInput: React.FC<ListTimeInputProps> = ({
  value,
  onChange,
  label,
}) => {
  // 生成小时选项 (00-23)
  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")),
    []
  );
  // 生成分钟选项 (00-59)
  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")),
    []
  );

  // 内部状态，用于处理空值情况
  const [selectedHour, setSelectedHour] = useState("09");
  const [selectedMinute, setSelectedMinute] = useState("00");

  // 当外部 value 变化时，同步到内部状态
  useEffect(() => {
    if (value && value.includes(":")) {
      const [h, m] = value.split(":");
      setSelectedHour(h);
      setSelectedMinute(m);
    } else if (value === "") {
      // 如果外部被清空，重置为默认显示（但不触发 onChange）
      // 这里可以选择是否要设为默认值，或者保持上次选择
    }
  }, [value]);

  // 处理选择变化
  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = e.target.value;
    setSelectedHour(newHour);
    onChange(`${newHour}:${selectedMinute}`);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinute = e.target.value;
    setSelectedMinute(newMinute);
    onChange(`${selectedHour}:${newMinute}`);
  };

  return (
    <div className="flex flex-col">
      {label && <span className="text-xs text-gray-500 mb-1">{label}</span>}
      <div className="flex items-center border border-gray-300 rounded-md shadow-sm bg-white">
        {/* 小时选择 */}
        <select
          value={selectedHour}
          onChange={handleHourChange}
          className="block w-full border-0 bg-transparent py-1.5 pl-3 pr-7 text-gray-900 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          {hours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        <span className="text-gray-400 font-bold px-1">:</span>

        {/* 分钟选择 */}
        <select
          value={selectedMinute}
          onChange={handleMinuteChange}
          className="block w-full border-0 bg-transparent py-1.5 pl-3 pr-8 text-gray-900 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          {minutes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
