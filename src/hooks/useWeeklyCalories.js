import { useEffect, useState } from "react";
import dayjs from "dayjs";

const useWeeklyCalories = () => {
  const [weeklyCalories, setWeeklyCalories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalories = async () => {
      try {
        // Retrieve the google_fit_tokens from localStorage
        const tokens = JSON.parse(localStorage.getItem("google_fit_tokens"));
        const accessToken = tokens?.access_token;

        if (!accessToken) throw new Error("Access token not found");

        const endTime = dayjs().endOf("day").valueOf();
        const startTime = dayjs().subtract(6, "day").startOf("day").valueOf();

        const dataSourceId = "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended";
        const datasetId = `${startTime * 1000000}-${endTime * 1000000}`;

        const response = await fetch(
          `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataSourceId}/datasets/${datasetId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch calorie data");

        const data = await response.json();

        const dailyCalories = {};

        data.point.forEach((point) => {
          const date = dayjs(parseInt(point.startTimeNanos) / 1e6).format("YYYY-MM-DD");
          const calories = point.value[0]?.fpVal || 0;
          dailyCalories[date] = (dailyCalories[date] || 0) + calories;
        });

        const result = [];
        for (let i = 6; i >= 0; i--) {
          const day = dayjs().subtract(i, "day").format("YYYY-MM-DD");
          result.push({
            date: day,
            calories: Math.round(dailyCalories[day] || 0),
          });
        }

        setWeeklyCalories(result);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching calories:", error);
        setWeeklyCalories([]);
        setLoading(false);
      }
    };

    fetchCalories();
  }, []);

  return { weeklyCalories, loading };
};

export default useWeeklyCalories;
