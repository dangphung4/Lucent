import React, { memo } from 'react';
import { Button } from "./ui/button";
import { Avatar, AvatarImage } from "./ui/avatar";
import { User } from "firebase/auth";

interface DashboardHeaderProps {
  greeting: string;
  firstName: string;
  currentUser: User | null;
  onEditProfile: () => void;
}

/**
 * DashboardHeader component - displays the welcome banner at the top of dashboard
 */
const DashboardHeader = memo(({
  greeting,
  firstName,
  currentUser,
  onEditProfile
}: DashboardHeaderProps) => {
  // Get display name with first letter capitalized
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-[#b83280] to-[#805ad5] dark:from-[#4f46e5] dark:via-primary dark:to-[#7e22ce] pt-8 pb-20 md:pt-12 md:pb-24">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 bg-noise-pattern opacity-[0.03]"></div>

      <div className="container max-w-7xl mx-auto px-4 relative z-10">
        {/* Enhanced subtle badge with glow - now green */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/20 backdrop-blur-md text-white text-xs font-medium mb-1 shadow-md border border-[#10b981]/30">
          <span className="inline-block w-2 h-2 rounded-full bg-[#10b981]"></span>
          <span>Your Skincare Journey</span>
        </div>

        <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-md">
              {greeting}, <span className="text-[#f59e0b] dark:text-[#fbbf24]">{displayName}!</span>
            </h1>
            <p className="text-white/90 max-w-xl backdrop-blur-md bg-white/10 p-2 rounded-lg border border-white/20 shadow-lg">
              Track your skincare routine, monitor progress, and discover what
              works best for your skin.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2 md:mt-0">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full text-sm font-medium backdrop-blur-md bg-white/20 border border-white/20 hover:bg-white/30 shadow-lg"
              onClick={onEditProfile}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit Profile
            </Button>
            <Avatar className="h-10 w-10 border-2 border-white/40 shadow-xl ring-2 ring-[#f59e0b]/30 dark:ring-[#fbbf24]/30 hover:ring-[#f59e0b]/50 dark:hover:ring-[#fbbf24]/50">
              <div className="flex h-full w-full items-center justify-center bg-primary-foreground text-primary font-medium">
                {currentUser?.photoURL ? (
                  <AvatarImage src={currentUser.photoURL} alt={displayName} />
                ) : (
                  displayName.charAt(0)
                )}
              </div>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Enhanced Wave Divider with double wave */}
      <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16 overflow-hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="absolute bottom-0 w-full h-full opacity-90"
          preserveAspectRatio="none"
        >
          <path
            fill="hsl(var(--background))"
            fillOpacity="1"
            d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,138.7C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="absolute bottom-0 w-full h-full opacity-50"
          preserveAspectRatio="none"
        >
          <path
            fill="hsl(var(--background))"
            fillOpacity="0.8"
            d="M0,96L60,106.7C120,117,240,139,360,138.7C480,139,600,117,720,112C840,107,960,117,1080,138.7C1200,160,1320,192,1380,208L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent"></div>
      </div>
    </div>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader; 