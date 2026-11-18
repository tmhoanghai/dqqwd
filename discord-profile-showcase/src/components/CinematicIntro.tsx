import React, { useState, useEffect, useRef } from 'react';

interface CinematicIntroProps {
  onStart?: () => void;
  onStepChange: (step: 'text' | 'opening' | 'complete') => void;
}

export function CinematicIntro({ onStart, onStepChange }: CinematicIntroProps) {
  const [step, setStep] = useState<'text' | 'opening' | 'complete'>('text');
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    onStepChange('text');
  }, [onStepChange]);

  const handleStart = (e?: React.MouseEvent | React.TouchEvent | React.KeyboardEvent | KeyboardEvent) => {
    if (e) {
      e.stopPropagation();
    }
    // Prevent duplicate trigger from rapid clicks or touch+click synthetic events
    if (hasTriggeredRef.current) return;
    if (step !== 'text') return;
    hasTriggeredRef.current = true;

    // 1. Immediately trigger audio play synchronously in the user click event call stack
    if (onStart) {
      onStart();
    }

    // 2. Animate doors opening with snappy timing
    setStep('opening');
    onStepChange('opening');

    // 3. Complete and unmount after doors finish opening
    const timer = setTimeout(() => {
      setStep('complete');
      onStepChange('complete');
    }, 850);

    return () => clearTimeout(timer);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step === 'text' && (e.key === 'Enter' || e.key === ' ' || e.code === 'Space')) {
        e.preventDefault();
        handleStart(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step]);

  if (step === 'complete') return null;

  return (
    <div 
      onClick={handleStart}
      onTouchEnd={handleStart}
      className={`fixed inset-0 z-50 overflow-hidden select-none cursor-pointer transition-opacity duration-500 ${
        step === 'opening' ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* Left Sliding Door */}
      <div 
        className={`fixed top-0 left-0 w-1/2 h-full bg-[#010309] border-r border-indigo-900/20 shadow-[10px_0_40px_rgba(0,0,0,0.9)] transition-transform duration-[850ms] ease-[cubic-bezier(0.77,0,0.175,1)] ${
          step === 'opening' ? '-translate-x-full' : 'translate-x-0'
        }`}
      />

      {/* Right Sliding Door */}
      <div 
        className={`fixed top-0 right-0 w-1/2 h-full bg-[#010309] border-l border-indigo-900/20 shadow-[-10px_0_40px_rgba(0,0,0,0.9)] transition-transform duration-[850ms] ease-[cubic-bezier(0.77,0,0.175,1)] ${
          step === 'opening' ? 'translate-x-full' : 'translate-x-0'
        }`}
      />

      {/* Center glowing text logo with a premium aura & "CLICK TO ENTER" */}
      <div 
        className={`absolute inset-0 flex items-center justify-center px-4 transition-all duration-[700ms] ease-out ${
          step === 'opening' ? 'opacity-0 scale-110 blur-sm' : 'opacity-100 scale-100 blur-none'
        }`}
      >
        <div className="relative flex flex-col items-center group max-w-full">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes letterT {
              0% {
                opacity: 0;
                transform: scale(3.2) translate(-75px, -65px) rotate(-40deg);
              }
              32% {
                opacity: 1;
                transform: scale(0.86) translate(0px, 0px) rotate(5deg);
              }
              56% {
                transform: scale(1.1) translate(-14px, 0px) rotate(-5deg);
              }
              78% {
                transform: scale(0.98) translate(0px, 0px) rotate(0deg);
              }
              100% {
                opacity: 1;
                transform: translate(-10px, 0) scale(1.05);
              }
            }
            @keyframes letterM {
              0% {
                opacity: 0;
                transform: scale(3.2) translate(75px, -65px) rotate(40deg);
              }
              32% {
                opacity: 1;
                transform: scale(0.86) translate(0px, 0px) rotate(-5deg);
              }
              56% {
                transform: scale(1.1) translate(14px, 0px) rotate(5deg);
              }
              78% {
                transform: scale(0.98) translate(0px, 0px) rotate(0deg);
              }
              100% {
                opacity: 1;
                transform: translate(10px, 0) scale(1.05);
              }
            }
            @keyframes containerReveal {
              0% {
                opacity: 0;
                transform: scale(0.9);
              }
              40% {
                opacity: 1;
                transform: scale(1.0);
              }
              100% {
                opacity: 1;
                transform: scale(1.06);
              }
            }
          `}} />
          
          {/* Ambient Purple/Blue Halo background glow - works across all mobile browsers */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/25 via-indigo-500/30 to-purple-600/25 rounded-full blur-2xl sm:blur-3xl scale-125 sm:scale-150 animate-pulse pointer-events-none" style={{ animationDuration: '2.5s' }} />
          
          {/* Logo Characters: fully responsive and mobile-safe */}
          <div 
            className="relative flex items-center justify-center font-sans font-black text-8xl md:text-9xl drop-shadow-[0_0_40px_rgba(99,102,241,0.7)] select-none tracking-tight"
            style={{
              animation: 'containerReveal 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            {/* Letter T */}
            <span 
              className="inline-block text-transparent bg-clip-text bg-gradient-to-br from-sky-300 via-indigo-100 to-indigo-400 pr-1"
              style={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'letterT 1.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                willChange: 'transform, opacity',
              }}
            >
              T
            </span>
            
            {/* Letter M */}
            <span 
              className="inline-block text-transparent bg-clip-text bg-gradient-to-bl from-purple-300 via-pink-100 to-indigo-400 pl-1"
              style={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'letterM 1.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                willChange: 'transform, opacity',
              }}
            >
              M
            </span>
          </div>

          {/* click to enter prompt */}
          <div className="mt-8 flex items-center justify-center">
            <span className="font-mono text-xs sm:text-sm tracking-[0.35em] text-zinc-400 uppercase select-none animate-pulse">
              click to enter
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}
