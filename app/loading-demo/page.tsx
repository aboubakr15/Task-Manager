"use client";

import React, { useState } from 'react';
import { LoadingSpinner, LoadingContainer } from '@/components/ui/loading-spinner';
import { LoadingButton } from '@/components/ui/loading-button';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

export default function LoadingDemoPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 border border-blue-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Loading Components Demo
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h2 className="text-xl font-semibold text-blue-700 mb-4">Loading Spinners</h2>
                <div className="flex flex-wrap gap-6 items-center">
                  <LoadingContainer>
                    <LoadingSpinner size="sm" />
                    <span className="mt-2 text-sm">Small</span>
                  </LoadingContainer>
                  
                  <LoadingContainer>
                    <LoadingSpinner size="md" />
                    <span className="mt-2 text-sm">Medium</span>
                  </LoadingContainer>
                  
                  <LoadingContainer>
                    <LoadingSpinner size="lg" />
                    <span className="mt-2 text-sm">Large</span>
                  </LoadingContainer>
                  
                  <LoadingContainer>
                    <LoadingSpinner size="xl" />
                    <span className="mt-2 text-sm">Extra Large</span>
                  </LoadingContainer>
                </div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h2 className="text-xl font-semibold text-blue-700 mb-4">Loading Buttons</h2>
                <div className="flex flex-col gap-4">
                  <LoadingButton 
                    isLoading={isLoading} 
                    loadingText="Processing..." 
                    onClick={handleLoadingDemo}
                  >
                    Click to Load
                  </LoadingButton>
                  
                  <LoadingButton 
                    isLoading={isLoading} 
                    variant="outline" 
                    onClick={handleLoadingDemo}
                  >
                    Outline Button
                  </LoadingButton>
                  
                  <LoadingButton 
                    isLoading={isLoading} 
                    variant="secondary" 
                    onClick={handleLoadingDemo}
                  >
                    Secondary Button
                  </LoadingButton>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">Full Page Loading Demo</h2>
              <p className="text-gray-600 mb-4">
                Click the button below to see a full-page loading overlay for 3 seconds.
              </p>
              <Button 
                onClick={() => {
                  document.body.style.overflow = 'hidden';
                  const overlay = document.createElement('div');
                  overlay.className = 'fixed inset-0 bg-gray-50 flex items-center justify-center z-50';
                  overlay.innerHTML = `
                    <div class="p-8 bg-white rounded-xl shadow-md border border-blue-100 flex flex-col items-center">
                      <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
                      <div class="text-gray-700 text-xl">Loading demo...</div>
                      <div class="mt-2 text-sm text-blue-600">This will disappear in 3 seconds</div>
                    </div>
                  `;
                  document.body.appendChild(overlay);
                  
                  setTimeout(() => {
                    document.body.removeChild(overlay);
                    document.body.style.overflow = '';
                  }, 3000);
                }}
              >
                Show Full Page Loading
              </Button>
            </div>
            
            <div className="text-center text-gray-600">
              <p>
                Use these loading components throughout your application for a consistent user experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
