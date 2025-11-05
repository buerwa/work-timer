import React from "react";
import { formatHours } from "../utils/helpers";
import type { DashboardStats } from "../types";

interface DashboardProps {
  stats: DashboardStats; // 接收计算好的统计数据
}

interface StatCardProps {
  title: string;
  value: string; // 已格式化的值
  isDeficit?: boolean;
}

// 内部组件: 统计卡片
const StatCard: React.FC<StatCardProps> = ({ title, value, isDeficit }) => (
  <div className="bg-white p-5 rounded-lg shadow">
    <div className="text-sm font-medium text-gray-500 truncate">{title}</div>
    <div className="mt-1">
      <div
        className={`text-3xl font-bold ${
          isDeficit ? "text-red-600" : "text-gray-900"
        }`}
      >
        {value}
      </div>
    </div>
  </div>
);

/**
 * 组件: 统计仪表盘
 */
export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  // [ 核心修正 ]
  // 如果 stats 尚未加载（或因为错误而为 undefined），显示加载中...
  // 这可以防止 `stats.averageHours` (undefined.averageHours) 导致的崩溃
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="mt-2 h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  // [ 健壮性 ]
  // 确保即使 stats 对象存在，但某个值为 undefined，我们也能提供 0 作为回退
  const avgHours = stats.averageHours || 0;
  const totalWorkdays = stats.totalWorkdayCount || 0;
  const workdayOver = stats.workdayOvertime || 0;
  const weekendOver = stats.weekendOvertime || 0;
  const totalOver = stats.totalOvertime || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      <StatCard
        title="日平均工时"
        value={formatHours(avgHours)}
        isDeficit={stats.isDeficit}
      />
      <StatCard title="已统计工作日" value={`${totalWorkdays} 天`} />
      <StatCard title="工作日加班" value={formatHours(workdayOver)} />
      <StatCard title="周末/节假日加班" value={formatHours(weekendOver)} />
      <StatCard title="总加班" value={formatHours(totalOver)} />
    </div>
  );
};
