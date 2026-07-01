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
    setCurrentScreen('detail');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'radar':
        return <RadarScreen onShowToast={showToastMessage} onLocationClick={() => setShowLocationModal(true)} onSelectFlight={openFlightDetail} />;
      case 'flights':
        return <FlightsScreen onShowToast={showToastMessage} onSelectFlight={openFlightDetail} />;
      case 'alerts':
        return <AlertsScreen onSelectFlight={openFlightDetail} onShowToast={showToastMessage} />;
      case 'settings':
        return <SettingsScreen onShowToast={showToastMessage} />;
      case 'detail':
        return <DetailScreen onShowToast={showToastMessage} onBack={() => setCurrentScreen('radar')} />;
      default:
        return <RadarScreen onShowToast={showToastMessage} onLocationClick={() => setShowLocationModal(true)} onSelectFlight={openFlightDetail} />;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-bg text-text">
      {renderScreen()}
      <BottomNav currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
      <Toast message={toastMessage} show={showToast} />
      <LocationModal show={showLocationModal} onClose={() => setShowLocationModal(false)} />
    </div>
  );
}
