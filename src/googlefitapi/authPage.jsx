import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccessToken } from '../googlefitapi/auth';
import { getStepCount } from './fitapi';

console.log("✅ GoogleFitAuthPage Loaded!");

function GoogleFitAuthPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        console.error('No authorization code found in URL');
        return;
      }

      try {
        const accessToken = await getAccessToken(code);
        const steps = await getStepCount(accessToken);

        localStorage.setItem('stepCount', steps);
        navigate('/step-count');
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="text-center mt-10 text-white">
      <h1 className="text-3xl font-bold mb-4">Fetching your steps...</h1>
      <p>Please wait while we connect to Google Fit.</p>
    </div>
  );
}

export default GoogleFitAuthPage;
