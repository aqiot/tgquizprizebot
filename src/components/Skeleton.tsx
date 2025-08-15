import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  className = ''
}) => {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
};

export const QuizCardSkeleton: React.FC = () => {
  return (
    <div className="quiz-card skeleton-card">
      <Skeleton height={24} width="60%" />
      <Skeleton height={16} width="80%" />
      <Skeleton height={40} width={100} borderRadius={12} />
    </div>
  );
};

export const QuestionSkeleton: React.FC = () => {
  return (
    <div className="question-skeleton">
      <Skeleton height={32} width="40%" />
      <Skeleton height={60} />
      <div className="answers-skeleton">
        <Skeleton height={48} borderRadius={12} />
        <Skeleton height={48} borderRadius={12} />
        <Skeleton height={48} borderRadius={12} />
      </div>
    </div>
  );
};