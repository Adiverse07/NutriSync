// src/hooks/useRecipeSuggestions.js

import { useState, useEffect } from "react";
import { getSuggestedFoods } from "../api/gemini";
import { fetchRecipes } from "../api/edamam";
import useUserProfile from "./useUserProfile";
import useCalories from "./useCalories";
import useSteps from "./useSteps";
import useSleep from "./useSleep";

export default function useRecipeSuggestions() {
  const [recipes, setRecipes] = useState([]);
  const [targets, setTargets] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  });
  const [loading, setLoading] = useState(true);
  const { profile } = useUserProfile();
  const calories = useCalories();
  const steps = useSteps();
  const sleep = useSleep();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      try {
        // 1) Ask Gemini for foods + targets
        const { foods, targets } = await getSuggestedFoods({
          name: profile?.name,
          age: profile?.age,
          calories,
          steps,
          sleep,
        });
        setTargets(targets);

        // 2) Fetch one recipe per food
        const oneEach = await Promise.all(
          foods.map(async (food) => {
            const hits = await fetchRecipes(food);
            return hits[0] || null;
          })
        );
        setRecipes(oneEach.filter(Boolean));
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      } finally {
        setLoading(false);
      }
    };

    if (profile?.age != null) fetchAll();
  }, [profile, calories, steps, sleep]);

  return { recipes, targets, loading };
}
