import React, { useState, useEffect } from 'react';
import { Sparkles, Play, Square } from 'lucide-react';

const GeminiMascot = ({ isProcessing = false }) => {
  const [mascotState, setMascotState] = useState('idle'); // idle, running, jumping

  useEffect(() => {
    if (isProcessing) {
      setMascotState('running-slow');
    } else {
      setMascotState('idle');
    }
  }, [isProcessing]);

  const toggleAction = () => {
    if (mascotState === 'idle') {
      setMascotState('jumping');
      setTimeout(() => setMascotState('running'), 600);
    } else {
      setMascotState('idle');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-surface-dark rounded-2xl shadow-soft w-48 relative overflow-hidden group">
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
      </div>
      
      {/* Mascot and Ground Container */}
      <div className="relative flex flex-col items-center mt-4">
        {/* The Mascot */}
        <div 
          className={`relative z-10 w-24 h-24 flex items-center justify-center transition-all duration-300
            ${mascotState === 'jumping' ? '-translate-y-8 animate-jump' : ''}
            ${mascotState === 'running' ? 'animate-run' : ''}
            ${mascotState === 'running-slow' ? 'animate-run-slow' : ''}
            ${mascotState === 'idle' ? 'animate-breathe' : ''}
          `}
        >
          <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-lg overflow-visible">
            {/* Back Arm (Left) */}
            <g className={`origin-[50px_45px] transition-all duration-300 ${mascotState.includes('running') ? 'animate-arm-l' : ''}`}>
              <line x1="50" y1="45" x2="35" y2={mascotState.includes('running') ? "55" : "65"} stroke="#333" strokeWidth="6" strokeLinecap="round" />
            </g>

            {/* Back Leg (Left) */}
            <g className={`origin-[50px_70px] transition-all duration-300 ${mascotState.includes('running') ? 'animate-leg-l' : ''}`}>
              <line x1="50" y1="70" x2="40" y2="90" stroke="#1f2937" strokeWidth="7" strokeLinecap="round" />
              <path d="M 35 90 Q 40 85 45 90" stroke="#4b5563" strokeWidth="4" fill="none" strokeLinecap="round" /> {/* Shoe */}
            </g>

            {/* Body (Hoodie) */}
            <path d="M 40 45 C 35 45, 35 70, 40 70 L 60 70 C 65 70, 65 45, 60 45 Z" fill="#1f2937" />
            {/* Hoodie pocket */}
            <path d="M 45 60 L 55 60 L 58 68 L 42 68 Z" fill="#374151" />
            
            {/* Head & Face */}
            <g className="origin-[50px_35px]">
              {/* Hair Back */}
              <path d="M 40 25 L 35 15 L 45 20 L 50 10 L 55 20 L 65 15 L 60 25 Z" fill="#451a03" />
              {/* Face */}
              <circle cx="50" cy="30" r="10" fill="#fcd34d" />
              {/* Eyes */}
              <circle cx="46" cy="28" r="1.5" fill="#111" />
              <circle cx="54" cy="28" r="1.5" fill="#111" />
              {/* Smile */}
              <path d="M 47 33 Q 50 35 53 33" fill="none" stroke="#111" strokeWidth="1" strokeLinecap="round" />
              {/* Hair Front */}
              <path d="M 38 25 Q 45 15 50 22 Q 55 15 62 25" fill="none" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* Front Leg (Right) */}
            <g className={`origin-[50px_70px] transition-all duration-300 ${mascotState.includes('running') ? 'animate-leg-r' : ''}`}>
              <line x1="50" y1="70" x2="60" y2="90" stroke="#111827" strokeWidth="7" strokeLinecap="round" />
              <path d="M 55 90 Q 60 85 65 90" stroke="#374151" strokeWidth="4" fill="none" strokeLinecap="round" /> {/* Shoe */}
            </g>

            {/* Front Arm (Right) */}
            <g className={`origin-[50px_45px] transition-all duration-300 ${mascotState.includes('running') ? 'animate-arm-r' : ''}`}>
              <line x1="50" y1="45" x2="65" y2={mascotState.includes('running') ? "55" : "65"} stroke="#111827" strokeWidth="6" strokeLinecap="round" />
            </g>
          </svg>
        </div>

        {/* Platform/Ground */}
        <div className="w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1"></div>
      </div>

      <p className="mt-4 text-xs font-semibold text-gray-500 uppercase tracking-widest text-center">
        FeastFlow Boy
      </p>

      {/* Controls */}
      <button 
        onClick={toggleAction}
        className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-xs font-bold transition-colors w-full"
      >
        {mascotState === 'idle' ? (
          <><Play className="w-3 h-3" /> Make Him Run</>
        ) : (
          <><Square className="w-3 h-3" /> Stop</>
        )}
      </button>

      <style jsx="true">{`
        @keyframes jump {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes run {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }
        @keyframes arm-swing-l {
          0% { transform: rotate(-30deg); }
          50% { transform: rotate(30deg); }
          100% { transform: rotate(-30deg); }
        }
        @keyframes arm-swing-r {
          0% { transform: rotate(30deg); }
          50% { transform: rotate(-30deg); }
          100% { transform: rotate(30deg); }
        }
        @keyframes leg-swing-l {
          0% { transform: rotate(-40deg); }
          50% { transform: rotate(20deg); }
          100% { transform: rotate(-40deg); }
        }
        @keyframes leg-swing-r {
          0% { transform: rotate(20deg); }
          50% { transform: rotate(-40deg); }
          100% { transform: rotate(20deg); }
        }
        @keyframes breathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        
        .animate-jump { animation: jump 0.6s cubic-bezier(0.28, 0.84, 0.42, 1); }
        .animate-run { animation: run 0.4s infinite linear; }
        .animate-run-slow { animation: run 0.8s infinite linear; }
        .animate-breathe { animation: breathe 3s infinite ease-in-out; }
        
        .animate-arm-l { animation: arm-swing-l 0.4s infinite linear; }
        .animate-arm-r { animation: arm-swing-r 0.4s infinite linear; }
        .animate-leg-l { animation: leg-swing-l 0.4s infinite linear; }
        .animate-leg-r { animation: leg-swing-r 0.4s infinite linear; }
        
        .animate-run-slow.animate-arm-l { animation-duration: 0.8s; }
        .animate-run-slow.animate-arm-r { animation-duration: 0.8s; }
        .animate-run-slow.animate-leg-l { animation-duration: 0.8s; }
        .animate-run-slow.animate-leg-r { animation-duration: 0.8s; }
      `}</style>
    </div>
  );
};

export default GeminiMascot;
