import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * 组件: 基础 Modal 弹窗
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
      // 点击遮罩层关闭
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 z-50 relative m-4"
        // 阻止点击内容区域关闭
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors"
            aria-label="关闭弹窗"
          >
            <X size={24} />
          </button>
        </div>
        {/* 弹窗内容可滚动 */}
        <div className="max-h-[70vh] overflow-y-auto pr-2">{children}</div>
      </div>
    </div>
  );
};
