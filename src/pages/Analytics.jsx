// src/pages/Analytics.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import useWeeklySteps from "../hooks/useWeeklySteps";
import useWeeklyCalories from "../hooks/useWeeklyCalories";
import useSleep from "../hooks/useSleep";

function Analytics() {
  const { weeklySteps, loading: stepsLoading } = useWeeklySteps();
  const { weeklyCalories, loading: calLoading } = useWeeklyCalories();
  const sleepDuration = useSleep();

  if (stepsLoading || calLoading) {
    return (
      <div className="p-8 text-center text-white">
        Loading analytics…
      </div>
    );
  }

  // === Date helpers ===
  const toWeekday = (millis) =>
    new Date(millis).toLocaleDateString("en-US", { weekday: "short" });

  const formatDateShort = (millis) =>
    new Date(millis).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });

  const formatCaloriesRange = () => {
    if (!weeklyCalories.length) return "";
    const start = formatDateShort(weeklyCalories[0].date);
    const end = formatDateShort(
      weeklyCalories[weeklyCalories.length - 1].date
    );
    return `${start} – ${end}`;
  };

  const average = (arr, key) =>
    arr.length
      ? Math.round(arr.reduce((sum, item) => sum + item[key], 0) / arr.length)
      : 0;

  // === Chart data ===
  const caloriesChartData = weeklyCalories.map((e) => ({
    name: toWeekday(e.date),
    calories: e.calories,
  }));
  const stepsChartData = weeklySteps.map((e) => ({
    name: toWeekday(e.date),
    steps: e.steps,
  }));

  const avgCalories = average(caloriesChartData, "calories");
  const avgSteps = average(stepsChartData, "steps");

  // === Sleep parsing ===
  let totalSleepMinutes = 0;
  let sleepLabel = "No data";

  if (typeof sleepDuration === "string") {
    const match = sleepDuration.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      totalSleepMinutes = hours * 60 + mins;
      sleepLabel = `${hours}h ${mins}m`;
    } else {
      sleepLabel = sleepDuration;
    }
  }

  const sleepGoalMinutes = 8 * 60;
  const sleepPct = sleepGoalMinutes
    ? Math.min(100, Math.round((totalSleepMinutes / sleepGoalMinutes) * 100))
    : 0;

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold gradient-text">
        Analytics Overview
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calories Chart */}
        <div className="card-gradient p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-semibold mb-4">
            Weekly Calories Burned
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caloriesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="calories" fill="#646cff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-sm text-white/60 text-center mt-2">
            {formatCaloriesRange()}
          </div>
        </div>

        {/* Steps Chart */}
        <div className="card-gradient p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-semibold mb-4">
            Weekly Steps
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stepsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="steps" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep Quality Card */}
        <div className="card-gradient p-6 rounded-2xl border border-white/10 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4">
            Last Night’s Sleep
          </h3>
          <div className="w-32 h-32 mb-4">
            <CircularProgressbar
              value={sleepPct}
              text={`${sleepPct}%`}
              styles={buildStyles({
                textColor: "#fff",
                pathColor: "#22c55e",
                trailColor: "#1e1e2e",
              })}
            />
          </div>
          <p className="text-white/80 mb-1">{sleepLabel}</p>
          <p className="text-sm text-white/60">of 8 h goal</p>
        </div>

        {/* Weekly Summary */}
        <div className="card-gradient p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-semibold mb-4">
            Weekly Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-white/60">Average Calories</span>
              <span className="text-xl font-bold">
                {avgCalories} kcal
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-white/60">Average Steps</span>
              <span className="text-xl font-bold">
                {avgSteps.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
