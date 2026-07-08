import React from "react";
import "./TaskTrendChart.css";

const TaskTrendChart = ({ reports = [] }) => {
  const submitted = reports.filter(r => r.status === "SUBMITTED");
  const lastFive = [...submitted]
    .slice(0, 5)
    .reverse();

  const chartData = lastFive.map(r => {
    const weekStart = new Date(r.weekStart);
    const dateStr = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const tasksCount = r.tasksCompleted?.length || 0;
    return {
      label: dateStr,
      tasks: tasksCount,
    };
  });

  const displayData = chartData.length > 0 ? chartData : [
    { label: "W1", tasks: 0 },
    { label: "W2", tasks: 0 },
    { label: "W3", tasks: 0 },
    { label: "W4", tasks: 0 },
    { label: "W5", tasks: 0 },
  ];

  const maxTasks = Math.max(...displayData.map(d => d.tasks), 5);

  return (
    <section className="task-trend-chart" aria-label="Weekly activity trend">
      <div className="task-trend-chart__header">
        <h3 className="task-trend-chart__title">Weekly Activity Trend</h3>
        <div className="task-trend-chart__legend" aria-label="Chart legend">
          <span className="task-trend-chart__legend-item">
            <span className="task-trend-chart__legend-dot task-trend-chart__legend-dot--primary" />
            Tasks Completed
          </span>
        </div>
      </div>

      <div className="task-trend-chart__bars">
        {displayData.map((item, index) => {
          const heightPercent = maxTasks > 0 ? (item.tasks / maxTasks) * 80 + 10 : 10;
          return (
            <div className="task-trend-chart__bar" key={index}>
              <div className="task-trend-chart__track">
                <div 
                  className="task-trend-chart__fill" 
                  style={{ height: `${heightPercent}%` }} 
                  title={`${item.tasks} tasks completed`}
                />
              </div>
              <span className="task-trend-chart__day">{item.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TaskTrendChart;
