import React from 'react';
import { MainAppNavigator } from '../../navigation/MainAppNavigator';

interface MainAppLayoutProps {
  children?: React.ReactNode;
  onLogout?: () => void;
}

export function MainAppLayout({ children, onLogout }: MainAppLayoutProps) {
  return <MainAppNavigator onLogout={onLogout} />;
} 