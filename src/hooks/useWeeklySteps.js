// src/hooks/useWeeklySteps.js
import { useEffect, useState } from "react";
import { fetchGoogleFitAggregateData } from "../utils/googleFitFetcher";

export default function useWeeklySteps() {
  const [weeklySteps, setWeeklySteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSteps = async () => {
      const now = Date.now();
      const start = now - 6 * 24 * 60 * 60 * 1000; // six days ago

      const result = await fetchGoogleFitAggregateData({
        dataTypeName: "com.google.step_count.delta",
        startTimeMillis: start,
        endTimeMillis: now,
      });

      if (!result?.bucket) {
        setLoading(false);
        return;
      }

      // map each bucket to { date: "Apr 28", steps: 1234 }
      const formatted = result.bucket.map((bucket) => {
        const dateMillis = parseInt(bucket.startTimeMillis, 10);
        const steps =
          bucket.dataset[0]?.point?.[0]?.value?.[0]?.intVal || 0;

        // format the timestamp into e.g. "Apr 28"
        const label = new Date(dateMillis)
          .toLocaleDateString("en-US", { month: "short", day: "numeric" });

        return {
          date: label,
          steps,
        };
      });

      setWeeklySteps(formatted);
      setLoading(false);
    };

    fetchSteps();
  }, []);

  return { weeklySteps, loading };
}
