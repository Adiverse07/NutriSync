export async function fetchGoogleFitData(sourceId, dataType = "intVal") {
    const tokens = JSON.parse(localStorage.getItem("google_fit_tokens"));
    const accessToken = tokens?.access_token;
  
    if (!accessToken) {
      console.error("❌ No access token found.");
      return null;
    }
  
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
  
    const startTimeNs = start.getTime() * 1_000_000;
    const endTimeNs = end.getTime() * 1_000_000;
    const datasetId = `${startTimeNs}-${endTimeNs}`;
  
    try {
      const res = await fetch(
        `https://www.googleapis.com/fitness/v1/users/me/dataSources/${encodeURIComponent(
          sourceId
        )}/datasets/${datasetId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      const data = await res.json();
  
      let total = 0;
  
      data.point?.forEach((pt) => {
        const val = pt.value?.[0]?.[dataType];
        total += val || 0;
      });
  
      return total;
    } catch (err) {
      console.error("❌ Error fetching Google Fit data:", err);
      return null;
    }
  }
  
  export async function fetchGoogleFitAggregateData({
    dataTypeName = "com.google.step_count.delta",
    startTimeMillis,
    endTimeMillis,
    bucketDurationMillis = 86400000, // 1 day
  }) {
    const tokens = JSON.parse(localStorage.getItem("google_fit_tokens"));
    const accessToken = tokens?.access_token;
  
    if (!accessToken) {
      console.error("❌ No access token found.");
      return null;
    }
  
    try {
      const res = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregateBy: [{ dataTypeName }],
          bucketByTime: { durationMillis: bucketDurationMillis },
          startTimeMillis,
          endTimeMillis,
        }),
      });
  
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("❌ Error fetching aggregate Google Fit data:", err);
      return null;
    }
  }