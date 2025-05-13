import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GoogleFitCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const exchangeCode = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (!code) return;

      try {
        const res = await fetch(`http://localhost:3000/api/googlefit/callback?code=${code}`);
        const data = await res.json();

        if (!data.tokens?.access_token) {
          console.error("❌ Access token missing");
          return;
        }

        const accessToken = data.tokens.access_token;
        localStorage.setItem("google_fit_tokens", JSON.stringify(data.tokens));
        console.log('Access token:', accessToken);  // Check if the token is being retrieved correctly

        console.log("✅ Tokens saved:", data.tokens);

        const dataSourceId =
          "raw:com.google.step_count.delta:com.noisefit:noise_activity - step count";

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();

        const startTimeNs = start.getTime() * 1_000_000;
        const endTimeNs = end.getTime() * 1_000_000;

        const datasetId = `${startTimeNs}-${endTimeNs}`;

        const rawRes = await fetch(
          `https://www.googleapis.com/fitness/v1/users/me/dataSources/${encodeURIComponent(
            dataSourceId
          )}/datasets/${datasetId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const rawData = await rawRes.json();
        console.log("📦 Raw NoiseFit Step Data:", rawData);

        let totalSteps = 0;
        rawData.point?.forEach((pt, idx) => {
          const val = pt.value?.[0]?.intVal || 0;
          totalSteps += val;
          console.log(`📍 Point ${idx + 1}: ${val} steps`);
        });

        localStorage.setItem("stepCount", totalSteps.toString());
        console.log("🚶 Final Total Step Count from NoiseFit:", totalSteps);

        navigate("/connect");
      } catch (error) {
        console.error("❌ Error in GoogleFitCallback:", error);
      }
    };

    exchangeCode();
  }, [navigate]);

  return <p>Loading your NoiseFit step data...</p>;
};

export default GoogleFitCallback;
