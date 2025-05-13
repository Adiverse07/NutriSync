// src/pages/Home.jsx
import React from "react";
import useUserProfile from "../hooks/useUserProfile";
import useCalories from "../hooks/useCalories";
import useSleep from "../hooks/useSleep";
import useSteps from "../hooks/useSteps";
import useWeeklySteps from "../hooks/useWeeklySteps";
import useRecipeSuggestions from "../hooks/useRecipeSuggestions";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Home() {
  const { profile, loading: profileLoading, error: profileError } = useUserProfile();
  const calories = useCalories();
  const sleepDuration = useSleep();
  const steps = useSteps();
  const { weeklySteps, loading: weeklyLoading } = useWeeklySteps();
  const { recipes, targets, loading: suggestedLoading } = useRecipeSuggestions();

  if (profileLoading) {
    return <div className="p-8 text-center text-white">Loading profile…</div>;
  }
  if (profileError) {
    return (
      <div className="p-8 text-center text-red-400">
        Error loading profile: {profileError}
      </div>
    );
  }

  // Current steps fallback from weeklySteps if useSteps returns null
  const displaySteps =
    steps != null
      ? steps
      : weeklySteps.length > 0
      ? weeklySteps[weeklySteps.length - 1].steps
      : null;

  // Water intake recommendation based on age
  const getWaterIntakeRecommendation = (age) => {
    if (!age) return null;
    if (age <= 13) return 2.1;
    if (age <= 18) return 2.4;
    if (age <= 30) return 2.7;
    if (age <= 50) return 2.6;
    return 2.5;
  };
  const waterIntake = getWaterIntakeRecommendation(profile?.age);

  return (
    <>
      {/* Hero Banner */}
      <div className="mb-8">
        <div className="relative rounded-2xl overflow-hidden h-48 md:h-64 mb-8">
          <img
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1920"
            alt="Fitness Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent flex items-center">
            <div className="p-4 md:p-8">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 gradient-text">
                Welcome back, {profile?.name || "User"}!
              </h1>
              <p className="text-lg md:text-xl text-white/80">
                Let's check your health status
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Activity Card */}
        <div className="card-gradient p-4 md:p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-semibold mb-4 gradient-text">Daily Activity</h3>
          <div className="space-y-4">
            <div>
              <p className="text-white/60">Steps</p>
              <p className="text-3xl font-bold">
                {displaySteps != null ? displaySteps : "—"}
              </p>
            </div>
            <div>
              <p className="text-white/60">Calories</p>
              <p className="text-3xl font-bold">
                {calories != null ? `${calories} kcal` : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Sleep Card */}
        <div className="card-gradient p-4 md:p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-semibold mb-4 gradient-text">Sleep Schedule</h3>
          <div className="relative h-32">
            <img
              src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=400"
              alt="Sleep Graph"
              className="w-full h-full object-cover rounded-lg opacity-20"
            />
            <div className="absolute inset-0 flex flex-col justify-center">
              <p className="text-white/60">Last night</p>
              <p className="text-3xl font-bold">
                {sleepDuration || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Steps Progress Card */}
        <div className="card-gradient p-4 md:p-6 rounded-2xl border border-white/10 col-span-1 md:col-span-2 lg:col-span-1">
          <h3 className="text-xl font-semibold mb-4 gradient-text">Weekly Steps</h3>
          <div className="h-[200px] w-full">
            {weeklyLoading ? (
              <div className="text-white/60 text-center py-8">Loading steps…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklySteps}>
                  <XAxis dataKey="date" stroke="#ffffff60" />
                  <YAxis stroke="#ffffff60" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a2e",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="steps" stroke="#646cff" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Hydration Status */}
        <div className="card-gradient p-4 md:p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-semibold mb-4 gradient-text">Hydration Status</h3>
          <div className="relative h-32">
            <img
              src="https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=400"
              alt="Water"
              className="w-full h-full object-cover rounded-lg opacity-20"
            />
            <div className="absolute inset-0 flex flex-col justify-center">
              <p className="text-white/60">Recommended Daily water intake</p>
              <p className="text-3xl font-bold">
                {waterIntake ? `${waterIntake} L` : "—"}
              </p>
              {profile?.age && (
                <p className="text-sm text-white/40 mt-1">
                  Based on age: {profile.age} years
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Diet */}
        <div className="card-gradient p-4 md:p-6 rounded-2xl border border-white/10 col-span-1 md:col-span-2">
          <h3 className="text-xl font-semibold mb-4 gradient-text">Recommended Diet</h3>

          {suggestedLoading ? (
            <p className="text-white/60">Generating personalized meals...</p>
          ) : recipes.length === 0 ? (
            <p className="text-white/60">No recommendations available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recipes.map((recipe, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white/5 rounded-lg relative overflow-hidden border border-white/10"
                >
                  <img
                    src={recipe.image}
                    alt={recipe.label}
                    className="absolute inset-0 w-full h-full object-cover opacity-10"
                  />
                  <div className="relative">
                    <h4 className="font-medium text-lg">
                      {recipe.mealType?.[0] || `Meal ${idx + 1}`}
                    </h4>
                    <p className="text-white/60">{recipe.label}</p>
                    <p className="text-sm text-white/40">
                      {Math.round(recipe.calories)} kcal
                    </p>
                    <a
                      href={recipe.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-sm text-blue-400 hover:underline"
                    >
                      View Recipe →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
