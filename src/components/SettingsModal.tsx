import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { useTimerStore, useSettings } from "../context/useTimerStore";
// 修正：使用 'import type' 来导入纯类型
import type { SettingsConfig, TimeRange } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 内部组件：用于渲染 TimeInput，避免 SettingsModal 过于臃肿
const TimeInput: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex-1">
    <label className="block text-xs font-medium text-gray-500">{label}</label>
    <input
      type="time"
      value={value}
      onChange={onChange}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    />
  </div>
);

/**
 * 设置弹窗组件
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  // 从 store 中获取 actions 和当前的 settings
  const { setSettings } = useTimerStore((state) => ({
    setSettings: state.setSettings,
  }));
  const { settings } = useSettings();

  // 使用本地 state 来管理表单，防止在输入过程中频繁更新 store
  const [localSettings, setLocalSettings] = useState(settings);

  // 当 settings (来自 store) 发生变化时（例如导入数据后），同步本地 state
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // 处理标准工作时间变化
  const handleStandardTimeChange = (field: "start" | "end", value: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      standardWorkTime: {
        ...prev.standardWorkTime,
        [field]: value,
      },
    }));
  };

  // 处理休息时间段变化 (通用)
  const handleRestTimeChange = (
    type: "workday" | "weekend",
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    const key = type === "workday" ? "workdayRestTimes" : "weekendRestTimes";

    setLocalSettings((prev) => {
      const updatedTimes = [...prev[key]];
      updatedTimes[index] = {
        ...updatedTimes[index],
        [field]: value,
      };
      return { ...prev, [key]: updatedTimes };
    });
  };

  // 保存设置到 Zustand store
  const handleSave = () => {
    // TODO: 在这里添加时间格式的验证
    setSettings(localSettings);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="设置">
      <div className="space-y-6">
        {/* 1. 标准在岗时间 */}
        <fieldset className="border p-4 rounded-md">
          <legend className="text-lg font-medium px-2">标准在岗时间</legend>
          <div className="flex items-center space-x-4">
            <TimeInput
              label="上班"
              value={localSettings.standardWorkTime.start}
              onChange={(e) =>
                handleStandardTimeChange("start", e.target.value)
              }
            />
            <span className="text-gray-500">-</span>
            <TimeInput
              label="下班"
              value={localSettings.standardWorkTime.end}
              onChange={(e) => handleStandardTimeChange("end", e.target.value)}
            />
          </div>
        </fieldset>

        {/* 2. 工作日休息时间 */}
        <fieldset className="border p-4 rounded-md">
          <legend className="text-lg font-medium px-2">工作日休息时间</legend>
          {localSettings.workdayRestTimes.map((time, index) => (
            <div key={index} className="flex items-center space-x-4 mb-2">
              <TimeInput
                label={`休息 ${index + 1} 开始`}
                value={time.start}
                onChange={(e) =>
                  handleRestTimeChange(
                    "workday",
                    index,
                    "start",
                    e.target.value
                  )
                }
              />
              <span className="text-gray-500">-</span>
              <TimeInput
                label={`休息 ${index + 1} 结束`}
                value={time.end}
                onChange={(e) =>
                  handleRestTimeChange("workday", index, "end", e.tag.value)
                }
              />
              {/* TODO: 添加删除/添加按钮 */}
            </div>
          ))}
        </fieldset>

        {/* 3. 周末/节假日休息时间 */}
        <fieldset className="border p-4 rounded-md">
          <legend className="text-lg font-medium px-2">
            周末/节假日休息时间
          </legend>
          {localSettings.weekendRestTimes.map((time, index) => (
            <div key={index} className="flex items-center space-x-4 mb-2">
              <TimeInput
                label={`休息 ${index + 1} 开始`}
                value={time.start}
                onChange={(e) =>
                  handleRestTimeChange(
                    "weekend",
                    index,
                    "start",
                    e.target.value
                  )
                }
              />
              <span className="text-gray-500">-</span>
              <TimeInput
                label={`休息 ${index + 1} 结束`}
                value={time.end}
                onChange={(e) =>
                  handleRestTimeChange("weekend", index, "end", e.target.value)
                }
              />
            </div>
          ))}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              周末/节假日加班封顶 (小时)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={localSettings.maxWeekendHours}
              onChange={(e) =>
                setLocalSettings((prev) => ({
                  ...prev,
                  maxWeekendHours: parseFloat(e.target.value) || 0,
                }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </fieldset>

        {/* 保存按钮 */}
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </div>
    </Modal>
  );
};
