import { useEffect, useState } from "react";
import { fetchGoogleFitData } from "../utils/googleFitFetcher";

const STEP_SOURCE = "raw:com.google.step_count.delta:com.noisefit:noise_activity - step count";

export default function useSteps() {
  const [steps, setSteps] = useState(null);

  useEffect(() => {
    fetchGoogleFitData(STEP_SOURCE, "intVal").then(setSteps);
  }, []);

  return steps;
}
