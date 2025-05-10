import React from 'react';
import LoadingPage from '@/components/LoadingPage';

export default function DashboardLoading() {
  return <LoadingPage message="Loading dashboard..." showNavbar={false} />;
}
