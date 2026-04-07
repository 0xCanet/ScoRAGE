import React from 'react';

type ScoreBarProps = {
  score: number;
  maxScore?: number;
  tone: 'safe' | 'warning' | 'critical' | 'neutral';
};

export function ScoreBar({ score, maxScore = 100, tone }: ScoreBarProps) {
  const percentage = Math.max(0, Math.min(100, (score / maxScore) * 100));
  
  return (
    <div className={`score-bar score-bar--${tone}`}>
      <div className="score-bar__track">
        <div 
          className="score-bar__fill" 
          style={{ width: `${percentage}%` }} 
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={maxScore}
          role="progressbar"
        />
      </div>
    </div>
  );
}
