import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  totalReviews?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  interactive = false,
  onChange,
  size = 'md',
  showNumber = false,
  totalReviews,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  }[size];

  const currentVal = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }, (_, i) => {
          const starValue = i + 1;
          const isFilled = currentVal >= starValue;
          const isHalf = currentVal > i && currentVal < starValue;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`transition-colors ${
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              } p-0.5`}
              aria-label={`Rate ${starValue} stars`}
            >
              <Star
                className={`${starSizes} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-500'
                    : isHalf
                    ? 'fill-amber-200 text-amber-500'
                    : 'fill-slate-100 text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="text-xs sm:text-sm font-bold text-slate-800 ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}
      {totalReviews !== undefined && (
        <span className="text-xs text-slate-500 font-medium">({totalReviews})</span>
      )}
    </div>
  );
};
