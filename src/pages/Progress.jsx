// src/pages/Progress.jsx
import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import useWeeklyCalories from "../hooks/useWeeklyCalories";
import useWeeklySteps from "../hooks/useWeeklySteps";
import useUserProfile from "../hooks/useUserProfile";

export default function Progress() {
  // ————— Hooks at the top (order never changes) —————
  const { weeklyCalories = [], loading: calLoading } = useWeeklyCalories();
  const { weeklySteps = [], loading: stepsLoading } = useWeeklySteps();
  const { profile, loading: profileLoading } = useUserProfile();

  // Parse stored weight into a number
  const currentWeight = useMemo(() => {
    const w = parseFloat(profile?.weight);
    return isNaN(w) ? 0 : w;
  }, [profile?.weight]);

  // Local goals (initialized from profile where appropriate)
  const [caloriesGoal, setCaloriesGoal] = useState(2000);
  const [stepsGoal, setStepsGoal] = useState(70000);
  const [weightGoal, setWeightGoal] = useState(currentWeight || 0);

  // Precompute totals for estimates
  const totalCal = useMemo(
    () => weeklyCalories.reduce((sum, d) => sum + d.calories, 0),
    [weeklyCalories]
  );
  const totalSteps = useMemo(
    () => weeklySteps.reduce((sum, d) => sum + d.steps, 0),
    [weeklySteps]
  );

  // Early return while loading
  if (calLoading || stepsLoading || profileLoading) {
    return (
      <div className="p-8 text-center text-white">
        Loading progress…
      </div>
    );
  }

  // ————— Helpers —————
  const toWeekday = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
  const average = (arr, key) =>
    arr.length
      ? Math.round(arr.reduce((sum, it) => sum + it[key], 0) / arr.length)
      : 0;

  // ————— Chart data building —————
  const caloriesData = weeklyCalories.map((d) => ({
    name: toWeekday(d.date),
    actual: d.calories,
    goal: caloriesGoal,
  }));
  const stepsData = weeklySteps.map((d) => ({
    name: toWeekday(d.date),
    actual: d.steps,
    goal: stepsGoal,
  }));

  const avgCalories = average(caloriesData, "actual");
  const avgSteps = average(stepsData, "actual");

  // ————— Estimate weight change —————
  const stepsCalories = totalSteps * 0.04;          // ~0.04 kcal per step
  const totalEnergy = totalCal + stepsCalories;
  const estimatedKg = totalEnergy / 7700;           // ~7700 kcal per kg

  // ————— Determine weight-loss vs gain —————
  const needed = currentWeight - weightGoal;
  const isLoss = needed >= 0;                       // true → loss, false → gain
  const magnitude = Math.abs(needed);               // kg needed
  const pct = magnitude > 0
    ? Math.min(100, Math.round((estimatedKg / magnitude) * 100))
    : 0;

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold gradient-text">Your Progress</h1>

      {/* Goals Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <label className="block text-white/60 mb-1">
            Weekly Calories Goal
          </label>
          <input
            type="number"
            value={caloriesGoal}
            onChange={(e) => setCaloriesGoal(+e.target.value)}
            className="w-full px-3 py-2 rounded bg-[#242442] text-white"
          />
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <label className="block text-white/60 mb-1">
            Weekly Steps Goal
          </label>
          <input
            type="number"
            value={stepsGoal}
            onChange={(e) => setStepsGoal(+e.target.value)}
            className="w-full px-3 py-2 rounded bg-[#242442] text-white"
          />
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <label className="block text-white/60 mb-1">
            Target Weight (kg)
          </label>
          <input
            type="number"
            value={weightGoal}
            onChange={(e) => setWeightGoal(+e.target.value)}
            className="w-full px-3 py-2 rounded bg-[#242442] text-white"
          />
        </div>
      </div>

      {/* Calories: Actual vs Goal */}
      <div className="card-gradient p-6 rounded-2xl border border-white/10">
        <h3 className="text-xl font-semibold mb-4">
          Calories: Actual vs Goal
        </h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={caloriesData}>
              <CartesianGrid stroke="#ffffff20" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="#646cff"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="goal"
                name="Goal"
                stroke="#ffffff60"
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Steps: Actual vs Goal */}
      <div className="card-gradient p-6 rounded-2xl border border-white/10">
        <h3 className="text-xl font-semibold mb-4">
          Steps: Actual vs Goal
        </h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stepsData}>
              <CartesianGrid stroke="#ffffff20" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="goal"
                name="Goal"
                stroke="#ffffff60"
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weight Progress, Loss or Gain */}
      <div className="card-gradient p-6 rounded-2xl border border-white/10">
        <h3 className="text-xl font-semibold mb-4">
          Weight Progress
        </h3>
        {isLoss ? (
          <>
            <p className="text-white/80 mb-2">
              Started at <strong>{currentWeight.toFixed(1)} kg</strong>, estimated{" "}
              <strong>{estimatedKg.toFixed(2)} kg</strong> loss → target{" "}
              <strong>{weightGoal.toFixed(1)} kg</strong>
            </p>
            <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-sm text-white/60 mt-1">
              {pct}% of loss goal achieved
            </p>
          </>
        ) : (
          <>
            <p className="text-white/80 mb-2">
              Current <strong>{currentWeight.toFixed(1)} kg</strong>, you need{" "}
              <strong>{magnitude.toFixed(1)} kg</strong> gain to reach{" "}
              <strong>{weightGoal.toFixed(1)} kg</strong>
            </p>
            <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-sm text-white/60 mt-1">
              Your activity burned ≈{estimatedKg.toFixed(2)} kg (
              {pct}% of needed gain)—try eating more!
            </p>
          </>
        )}
      </div>
    </div>
  );
}
