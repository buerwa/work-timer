import React, { useRef } from "react";
import { Download, Upload } from "lucide-react";
import { format } from "date-fns";
import { useTimerActions } from "../context/useTimerStore";

/**
 * 组件: 导入/导出按钮
 */
export const ImportExportButtons: React.FC = () => {
  const { exportData, importData } = useTimerActions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 导出
  const handleExport = () => {
    try {
      const jsonData = exportData();
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `work-timer-data-${format(new Date(), "yyyyMMdd")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("数据导出失败:", error);
      // 真实应用中用 Toast 提示
    }
  };

  // 触发文件选择
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        // 真实应用中用自定义 Modal 替代 confirm
        console.log("准备导入，请确认...");
        const confirmed = window.confirm(
          "导入数据将覆盖现有数据，确定要继续吗？"
        );

        if (confirmed) {
          const success = importData(text);
          if (success) {
            console.log("导入成功！");
          } else {
            console.error("导入失败！");
          }
        }
      }
    };
    reader.readAsText(file);
    // 重置 input以便下次选择同一文件
    event.target.value = "";
  };

  return (
    <div className="flex space-x-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
      <button
        onClick={handleImportClick}
        className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        title="导入数据"
      >
        <Upload size={18} className="mr-2" />
        导入
      </button>
      <button
        onClick={handleExport}
        className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        title="导出数据"
      >
        <Download size={18} className="mr-2" />
        导出
      </button>
    </div>
  );
};
