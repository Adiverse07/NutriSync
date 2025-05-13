import useSteps from "../hooks/useSteps";
import useCalories from "../hooks/useCalories";

function StepCount() {
  const steps = useSteps();
  const calories = useCalories();

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-3xl font-bold">Health Stats</h1>

      <p className="text-lg">
        🚶 Steps Today:{" "}
        <span className="font-semibold">{steps ?? "Loading..."}</span>
      </p>

      <p className="text-lg">
        🔥 Calories Burned:{" "}
        <span className="font-semibold">{calories ?? "Loading..."}</span>
      </p>
    </div>
  );
}

export default StepCount;
