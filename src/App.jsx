import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import HealthStats from "./pages/HealthStats";
import Progress from "./pages/Progress";
import Food from "./pages/Food";
import Connect from "./pages/Connect";
import AuthPage from "./pages/AuthPage";
import GoogleFitCallback from "./pages/GoogleFitCallback";
import StepCount from "./pages/StepCount";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

// import GoogleFitAuthPage from "./googlefitapi/authPage";

function App() {
  return (
    <Routes>
      {/* Default page on load — Firebase login */}
      <Route path="/" element={<AuthPage />} />

      {/* Callback after Google Fit OAuth */}
      <Route path="/auth/callback" element={<AuthPage />} />

      {/* Main pages — ideally should be protected (but skipped for testing) */}
      <Route path="/home" element={<Layout><Home /></Layout>} />
      <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
      <Route path="/health-stats" element={<Layout><HealthStats /></Layout>} />
      <Route path="/progress" element={<Layout><Progress /></Layout>} />
      <Route path="/food" element={<Layout><Food /></Layout>} />
      <Route path="/connect" element={<Layout><Connect /></Layout>} />
      <Route path="/googlefit/callback" element={<GoogleFitCallback />} />
      <Route path="/stepcount" element={<Layout><StepCount /></Layout>} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element = {<Layout><Dashboard/></Layout>}/>
      <Route path="/profile" element = {<Layout><Profile/></Layout>}/>
      

    </Routes>
  );
}

export default App;
