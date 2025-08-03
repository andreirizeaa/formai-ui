import React from 'react';
import { MainAppNavigator } from '../../navigation/MainAppNavigator';

interface MainAppLayoutProps {
  children?: React.ReactNode;
}

export function MainAppLayout({ children }: MainAppLayoutProps) {
  return <MainAppNavigator />;
} 