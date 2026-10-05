import { cn } from '@/utils';
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSidebar } from '../../hooks/useSidebar';
import ScrollExpandMedia from '../ui/scroll-expansion-hero';
import { DarkGradientBg } from '../ui/elegant-dark-pattern';

export default function DashboardShell() {
  const sidebar = useSidebar();
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  const [showHero, setShowHero] = useState(() => !sessionStorage.getItem('hasSeenHero'));

  useEffect(() => {
    // If the user navigates to any other page, permanently hide the hero for this session
    if (location.pathname !== '/') {
      setShowHero(false);
      sessionStorage.setItem('hasSeenHero', 'true');
    }
  }, [location.pathname]);

  const shellContent = (
    <DarkGradientBg className="text-[#E2E8F0] font-sans">
      <div className="flex min-h-screen w-full bg-transparent">
        <Sidebar {...sidebar} />
        
        <div 
          className="flex flex-col flex-1 min-w-0 z-10 relative h-screen"
        >
          <Topbar {...sidebar} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
            <div className="max-w-[1600px] w-full mx-auto p-4 md:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </DarkGradientBg>
  );

  if (isHome && showHero) {
    return (
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="/assets/rescue-boat.jpg"
        bgImageSrc="/assets/flood-cars.jpg"
        title="RESQ CLOUD"
        date="Active Operations"
        scrollToExpand="Scroll to access Command Center"
        textBlend={false}
      >
        {/* We add w-full h-[100dvh] so it takes up the revealed space perfectly */}
        <div className="w-full h-[100dvh] absolute inset-0 z-50">
          {shellContent}
        </div>
      </ScrollExpandMedia>
    );
  }

  return shellContent;
}
