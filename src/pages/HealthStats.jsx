import {
  FiHeart,
  FiActivity,
  FiDroplet,
  FiMoon,
} from 'react-icons/fi';
import { useRef } from 'react';

import useSteps from '../hooks/useSteps';
import useHeartRate from '../hooks/useHeartRate';
import useUserProfile from '../hooks/useUserProfile';
import useSleep from '../hooks/useSleep';
import useCalories from '../hooks/useCalories';
import useHealthNews from '../hooks/useHealthNews';

export default function HealthStats() {
  const steps = useSteps();
  const heartRate = useHeartRate();
  const { profile, loading: profileLoading, error: profileError } =
    useUserProfile();
  const weight = profile?.weight;
  const sleep = useSleep();
  const calories = useCalories();
  const { news, loading: newsLoading, error: newsError } = useHealthNews();

  // — drag‑to‑scroll state
  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  const onMouseDown = (e) => {
    isDown.current = true;
    scrollRef.current.classList.add('cursor-grabbing');
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollStart.current = scrollRef.current.scrollLeft;
  };
  const onMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX.current;
    scrollRef.current.scrollLeft = scrollStart.current - walk;
  };
  const onMouseUpOrLeave = () => {
    isDown.current = false;
    scrollRef.current.classList.remove('cursor-grabbing');
  };

  if (profileLoading) {
    return <div className="p-8 text-center text-white">Loading profile…</div>;
  }
  if (profileError) {
    return (
      <div className="p-8 text-center text-red-400">
        Error loading profile: {profileError.message || profileError.toString()}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold gradient-text">
          Health Statistics
        </h1>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FiHeart className="text-2xl text-red-500" />}
          title="Heart Rate"
          subtitle="Average BPM"
        >
          <p className="text-3xl font-bold">
            {heartRate === null
              ? 'Loading...'
              : heartRate === 0
              ? '0'
              : heartRate}
          </p>
          <p className="text-sm mt-2">
            {heartRate === null ? (
              ''
            ) : heartRate === 0 ? (
              <span className="text-red-400">Not yet measured</span>
            ) : (
              <span className="text-green-400">Last recorded</span>
            )}
          </p>
        </StatCard>

        <StatCard
          icon={<FiActivity className="text-2xl text-blue-500" />}
          title="Steps"
          subtitle="Total Steps"
        >
          <p className="text-3xl font-bold">{steps ?? 'Loading...'}</p>
          <p className="text-sm text-white/60 mt-2">Daily progress</p>
        </StatCard>

        <StatCard
          icon={<FiDroplet className="text-2xl text-purple-500" />}
          title="Weight"
          subtitle="Current weight"
        >
          <p className="text-3xl font-bold">
            {weight !== undefined ? `${weight} kg` : 'Loading...'}
          </p>
          <p className="text-sm text-green-400 mt-2">Last recorded</p>
        </StatCard>

        <StatCard
          icon={<FiMoon className="text-2xl text-indigo-500" />}
          title="Sleep Quality"
          subtitle="Last night"
        >
          <p className="text-3xl font-bold">{sleep ?? 'Loading...'}</p>
          <p className="text-sm text-green-400 mt-2">Improved</p>
        </StatCard>
      </div>

      {/* Detailed & News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calories */}
        <div className="card-gradient p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-semibold mb-4">Calories</h3>
          <p className="text-3xl font-bold">{calories ?? 'Loading...'}</p>
          <p className="text-sm text-white/60 mt-2">Burned today</p>
        </div>

        {/* Health News Slider */}
        <div className="card-gradient p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-semibold mb-4">
            Latest Health News
          </h3>

          {newsLoading && <p className="text-white/60">Loading news…</p>}
          {newsError && <p className="text-red-400">Failed to load news.</p>}

          {!newsLoading && !newsError && news.length > 0 && (
            <div>
              {/* Grab‑and‑drag Row + visible scrollbar */}
              <div
                ref={scrollRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUpOrLeave}
                onMouseLeave={onMouseUpOrLeave}
                className="news-scroll flex overflow-x-auto gap-4 pr-8 pl-8 cursor-grab touch-pan-x"
              >
                {news.map((article) => (
                  <a
                    key={article.url}
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-none w-40"
                  >
                    <img
                      src={
                        article.urlToImage ||
                        'https://via.placeholder.com/300x300?text=No+Image'
                      }
                      alt={article.title}
                      className="w-40 h-40 object-cover rounded-lg"
                    />
                    <p className="text-white/80 text-sm mt-2 line-clamp-3">
                      {article.title}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {!newsLoading && !newsError && news.length === 0 && (
            <p className="text-white/60">No health news available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, subtitle, children }) {
  return (
    <div className="card-gradient p-6 rounded-2xl border border-white/10">
      <div className="flex items-center space-x-4 mb-4">
        <div className="p-3 bg-white/10 rounded-lg">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-white/60">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
