import { useEffect, useState } from "react";
import { fetchGoogleFitData } from "../utils/googleFitFetcher";

const CALORIE_SOURCE = "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended";

export default function useCalories() {
  const [calories, setCalories] = useState(null);

  useEffect(() => {
    fetchGoogleFitData(CALORIE_SOURCE, "fpVal").then(setCalories);
  }, []);

  return calories;
}
