import { useEffect, useState } from "react";

export default function useSleep() {
  const [sleepDuration, setSleepDuration] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSleepSession = async () => {
      try {
        // Parse tokens from localStorage
        const tokens = JSON.parse(localStorage.getItem("google_fit_tokens") || "{}");
        const accessToken = tokens.access_token;
        if (!accessToken) {
          throw new Error("No access token found. Please login again.");
        }

        // Define start/end range (optional: adjust dynamically)
        const startTimeMillis = 1680316800000;
        const endTimeMillis = 1682899199999;

        // Fetch sleep sessions
        const response = await fetch(
          `https://www.googleapis.com/fitness/v1/users/me/sessions?startTimeMillis=${startTimeMillis}&endTimeMillis=${endTimeMillis}&activityType=72`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || response.statusText);
        }

        const data = await response.json();
        const sessions = data.session || [];
        if (sessions.length === 0) {
          console.warn("❗ No sleep sessions found.");
          setSleepDuration(null);
          return;
        }

        // Use the most recent session
        const latest = sessions[0];
        const startMs = parseInt(latest.startTimeMillis, 10);
        const endMs = parseInt(latest.endTimeMillis, 10);
        const durationMs = endMs - startMs;

        // Convert to hours and minutes
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        setSleepDuration(`${hours}h ${minutes}m`);
      } catch (err) {
        console.error("❌ Error fetching sleep session:", err);
        setError(err.message);
      }
    };

    fetchSleepSession();
  }, []);

  if (error) {
    return "watch not connected";
  }
  return sleepDuration;
}
