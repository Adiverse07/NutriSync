// googlefitapi/fitApi.js
import axios from "axios";

export const getStepCount = async (accessToken) => {
  const now = Date.now();
  const oneDayMillis = 24 * 60 * 60 * 1000;
  const startTime = now - oneDayMillis;

  const body = {
    aggregateBy: [{
      dataTypeName: "com.google.step_count.delta",
      dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
    }],
    bucketByTime: { durationMillis: oneDayMillis },
    startTimeMillis: startTime,
    endTimeMillis: now
  };

  try {
    const response = await axios.post(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const bucket = response.data.bucket[0];
    const stepCount = bucket.dataset[0].point[0]?.value[0]?.intVal || 0;

    return {
      steps: stepCount,
      raw: response.data,
    };
  } catch (error) {
    console.error("Error fetching step count:", error.response?.data || error);
    throw error;
  }
};
