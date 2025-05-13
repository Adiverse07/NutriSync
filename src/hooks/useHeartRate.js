import { useEffect, useState } from "react";
import { fetchGoogleFitData } from "../utils/googleFitFetcher";

const HEART_RATE_SOURCE = "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm";

export default function useHeartRate() {
  const [heartRate, setHeartRate] = useState(null);

  useEffect(() => {
    fetchGoogleFitData(HEART_RATE_SOURCE, "fpVal").then(setHeartRate);
  }, []);

  return heartRate;
}
