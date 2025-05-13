import { useEffect, useState } from "react";
import { fetchGoogleFitData } from "../utils/googleFitFetcher";

const WEIGHT_SOURCE = "derived:com.google.weight.summary:com.google.android.gms:aggregated";

export default function useWeight() {
  const [weight, setWeight] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getWeightData = async () => {
      try {
        const weightData = await fetchGoogleFitData(WEIGHT_SOURCE, "fpVal");

        if (!weightData) {
          console.warn("❗ No weight data found for fpVal.");
        }

        setWeight(weightData);
      } catch (err) {
        console.error("❌ Error fetching weight data:", err);
        setError("Failed to fetch weight data.");
      }
    };

    getWeightData();
  }, []);

  if (error) {
    return error;  // You can return the error string directly in the component
  }

  return weight;
}
