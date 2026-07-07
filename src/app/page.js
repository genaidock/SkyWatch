'use client';

import { useState, useEffect } from 'react';
import { useFlightContext } from '@/context/FlightContext';
import RadarScreen from '@/components/screens/RadarScreen';
import FlightsScreen from '@/components/screens/FlightsScreen';
import AlertsScreen from '@/components/screens/AlertsScreen';
import SettingsScreen from '@/components/screens/SettingsScreen';
import DetailScreen from '@/components/screens/DetailScreen';
import BottomNav from '@/components/BottomNav';
import Toast from '@/components/Toast';
import LocationModal from '@/components/LocationModal';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState('radar');
  const { setSelectedFlight } = useFlightContext();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  const openFlightDetail = (flight) => {
    setSelectedFlight(flight);
    if (flight) {
      setCurrentScreen('detail');
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-bg text-text">
      <div className={currentScreen === 'radar' ? 'contents' : 'hidden'}>
        <RadarScreen onShowToast={showToastMessage} onLocationClick={() => setShowLocationModal(true)} onSelectFlight={openFlightDetail} />
      </div>
      <div className={currentScreen === 'flights' ? 'contents' : 'hidden'}>
        <FlightsScreen onShowToast={showToastMessage} onSelectFlight={openFlightDetail} />
      </div>
      <div className={currentScreen === 'alerts' ? 'contents' : 'hidden'}>
        <AlertsScreen onSelectFlight={openFlightDetail} onShowToast={showToastMessage} />
      </div>
      <div className={currentScreen === 'settings' ? 'contents' : 'hidden'}>
        <SettingsScreen onShowToast={showToastMessage} />
      </div>
      
      {currentScreen === 'detail' && (
        <DetailScreen onShowToast={showToastMessage} onBack={() => setCurrentScreen('radar')} />
      )}

      <BottomNav currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
      <Toast message={toastMessage} show={showToast} />
      <LocationModal show={showLocationModal} onClose={() => setShowLocationModal(false)} />
    </div>
  );
}
