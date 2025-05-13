// src/components/Dashboard.jsx
import React from 'react';
import ReactSpeedometer from 'react-d3-speedometer';

import useUserProfile from '../hooks/useUserProfile';
import useSteps from '../hooks/useSteps';
import useCalories from '../hooks/useCalories';

function StatCard({ label, value, unit }) {
  return (
    <div className="card-gradient p-4 rounded-2xl border border-white/10 text-center">
      <p className="text-sm text-white/60 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-white">
        {value}
        {unit && <span className="text-base text-white/80 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

function Dashboard() {
  const { profile, loading: profileLoading, error: profileError } = useUserProfile();
  const steps = useSteps();
  const calories = useCalories();

  if (profileLoading) {
    return <div className="text-center text-white p-8">Loading profile…</div>;
  }
  if (profileError) {
    return (
      <div className="text-center text-red-400 p-8">
        Error loading profile: {profileError.message}
      </div>
    );
  }

  const weight = profile.weight;
  const height = profile.height;
  const heightMeters = height / 100;
  const bmi = weight && height
    ? +(weight / (heightMeters * heightMeters)).toFixed(1)
    : 0;

  let category = '—';
  let tip = '—';

  if (bmi > 0) {
    if (bmi < 18.5) {
      category = 'Underweight';
      tip = 'Increase calorie intake with nutrient‑dense foods';
    } else if (bmi < 25) {
      category = 'Normal';
      tip = 'Maintain your current lifestyle';
    } else if (bmi < 30) {
      category = 'Overweight';
      tip = 'Incorporate regular exercise';
    } else {
      category = 'Obese';
      tip = 'Consult a healthcare provider';
    }
  }

  return (
    <div className="space-y-8 p-6">
      {/* BMI Gauge + Info */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-12">
        {/* Gauge */}
        <div className="mx-auto">
          <ReactSpeedometer
            maxValue={50}
            value={bmi}
            segments={5}
            customSegmentStops={[0, 18.5, 25, 30, 35, 50]}
            segmentColors={[
              '#facc15', // underweight
              '#4ade80', // normal
              '#fde047', // overweight
              '#f87171', // obesity
              '#b91c1c', // high obesity
            ]}
            needleColor="#333"
            startColor="#facc15"
            endColor="#b91c1c"
            needleTransition="easeElastic"
            ringWidth={35}
            textColor="#ffffff"
            currentValueText={`BMI = ${bmi}`}
            height={240}
            width={320}
          />
        </div>

        {/* Category Info */}
        <div className="bg-white/10 p-6 rounded-2xl border border-white/20 w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-white mb-4">Your BMI</h2>
          <p className="text-xl text-white/80 mb-2">
            <span className="font-bold">{bmi}</span> kg/m<sup>2</sup> —{' '}
            <span
              className={
                category === 'Normal'
                  ? 'text-green-400'
                  : category === 'Underweight'
                  ? 'text-yellow-300'
                  : 'text-red-400'
              }
            >
              {category}
            </span>
          </p>
          <hr className="my-4 border-white/20" />
          <h3 className="text-lg text-white/80 mb-2">Tip</h3>
          <p className="text-white text-sm">{tip}</p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard label="Weight" value={`${weight} kg`} />
        <StatCard label="Height" value={`${height} cm`} />
        <StatCard label="Ideal BMI" value="18.5–24.9" />
        <StatCard
          label="Calories Burned"
          value={calories != null ? `${calories}` : '—'}
          unit="kcal"
        />
        <StatCard
          label="Steps Today"
          value={steps != null ? `${steps}` : '—'}
        />
      </div>
    </div>
  );
}

export default Dashboard;
