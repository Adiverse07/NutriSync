// src/pages/Food.jsx

import React, { useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import useRecipeSuggestions from "../hooks/useRecipeSuggestions";
import { fetchRecipes } from "../api/edamam";
import { generateMealPlan } from "../api/gemini";
import jsPDF from "jspdf";

function ProgressRing({ radius, stroke, progress, color = "#34D399" }) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="rgba(255,255,255,0.2)"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset, transition: "stroke-dashoffset 0.3s" }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        style={{ fontSize: `${radius / 2.5}px`, fill: color }}
      >
        {`${Math.round(progress)}%`}
      </text>
    </svg>
  );
}

export default function Food() {
  const { recipes, targets, loading: suggestedLoading } =
    useRecipeSuggestions();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  // Hover for nutrient rings
  const [hoveredRecipe, setHoveredRecipe] = useState(null);

  // Modal + Vegetarian toggle
  const [showVegModal, setShowVegModal] = useState(false);
  const [vegetarian, setVegetarian] = useState(false);

  // Helpers
  const handleMouseEnter = (r) => setHoveredRecipe(r);
  const handleMouseLeave = () => setHoveredRecipe(null);

  const getProgress = (metric) => {
    const src = hoveredRecipe;
    if (!src) return 0;
    let v = 0;
    switch (metric) {
      case "calories":
        v = src.calories;
        break;
      case "protein":
        v = src.totalNutrients?.PROCNT?.quantity || 0;
        break;
      case "carbs":
        v = src.totalNutrients?.CHOCDF?.quantity || 0;
        break;
      case "fat":
        v = src.totalNutrients?.FAT?.quantity || 0;
        break;
      default:
        v = 0;
    }
    return Math.min(100, (v / (targets[metric] || 1)) * 100);
  };

  // Search
  const handleSearch = async (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    setSearchQuery(term);
    setIsSearchActive(true);
    setSearchLoading(true);
    try {
      const hits = await fetchRecipes(term);
      setSearchResults(hits.slice(0, 30));
      setSearchHistory((h) => [term, ...h.filter((t) => t !== term)]);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearchHistoryItem = (t) =>
    setSearchHistory((h) => h.filter((x) => x !== t));

  const showRecommended = () => {
    setIsSearchActive(false);
    setSearchResults([]);
    setSearchQuery("");
  };

  // PDF generation after modal confirm
  const confirmGeneratePlan = async () => {
    setShowVegModal(false);
    try {
      const plan = await generateMealPlan({ targets, vegetarian });
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Your Meal Plan", 14, 20);
      doc.setFontSize(12);
      plan.split("\n").forEach((line, idx) =>
        doc.text(line, 14, 30 + idx * 8)
      );
      doc.save("meal-plan.pdf");
    } catch (err) {
      console.error("Failed to generate meal plan", err);
    }
  };

  // Display logic
  const displayRecipes = isSearchActive ? searchResults : recipes;
  const displayLoading = isSearchActive ? searchLoading : suggestedLoading;
  const displayTitle =
    isSearchActive && searchQuery
      ? `Results for "${searchQuery}"`
      : "Today's Suggested Recipes";

  return (
    <div className="p-6 relative">
      {/* Search & Generate Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold gradient-text">Meal Planning</h1>
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search for meals"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/10 placeholder-white/60 text-white focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-1"
            >
              <FiSearch />
              <span>Search Meals</span>
            </button>
          </form>
          {isSearchActive && (
            <button
              onClick={showRecommended}
              className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/90 transition"
            >
              Show Recommended
            </button>
          )}
          <button
            onClick={() => setShowVegModal(true)}
            className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
          >
            Generate Meal Plan
          </button>
        </div>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 px-2">
          {searchHistory.map((t) => (
            <div
              key={t}
              className="flex items-center bg-white/10 px-3 py-1 rounded-full"
            >
              <span className="text-white/80 mr-2">{t}</span>
              <FiX
                className="cursor-pointer"
                onClick={() => clearSearchHistoryItem(t)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Sticky Daily Summary */}
      <div className="sticky top-0 z-10 bg-white/10 backdrop-blur-sm py-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
          {["calories", "protein", "carbs", "fat"].map((m) => (
            <div
              key={m}
              className="card-gradient p-4 rounded-2xl border border-white/10 flex flex-col items-center"
            >
              <h3 className="text-lg font-semibold mb-2 text-white capitalize">
                {m}
              </h3>
              <ProgressRing radius={50} stroke={6} progress={getProgress(m)} />
              <p className="mt-2 text-white/80">
                {m === "calories"
                  ? `${targets.calories} kcal`
                  : `${targets[m]} g`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold gradient-text px-2">
          {displayTitle}
        </h2>
        {displayLoading ? (
          <p className="text-white/60 px-2">Loading…</p>
        ) : displayRecipes.length === 0 ? (
          <p className="text-white/60 px-2">
            {isSearchActive ? "No meals found." : "No recipes found."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-2">
            {displayRecipes.map((r, i) => (
              <div
                key={i}
                onMouseEnter={() => handleMouseEnter(r)}
                onMouseLeave={handleMouseLeave}
                className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition"
              >
                <div className="w-full h-32 mb-3 overflow-hidden rounded-md bg-white/10">
                  <img
                    src={r.image}
                    alt={r.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {r.label}
                </h3>
                <p className="text-sm text-white/60 mb-4">
                  {Math.round(r.calories)} kcal
                </p>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-3 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-medium rounded-md hover:opacity-90 transition"
                >
                  View Full Recipe →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vegetarian Toggle Modal */}
      {showVegModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
          <div className="bg-[#1e1e1e] rounded-lg p-6 w-full max-w-sm shadow-lg text-white">
            <h2 className="text-lg font-semibold mb-4">Meal Plan Options</h2>
            <div className="flex items-center justify-between mb-6">
              <span>Vegetarian only</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={vegetarian}
                  onChange={() => setVegetarian((v) => !v)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                <div
                  className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    vegetarian ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowVegModal(false)}
                className="px-4 py-2 rounded-md text-sm bg-white/10 hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmGeneratePlan}
                className="px-4 py-2 rounded-md text-sm bg-primary hover:bg-primary/80 transition"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
