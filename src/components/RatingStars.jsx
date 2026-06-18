import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating, maxStars = 5, size = 20, interactive = false, onRate }) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(rating);

  const handleClick = (starIndex) => {
    if (interactive) {
      setSelectedRating(starIndex);
      if (onRate) {
        onRate(starIndex);
      }
    }
  };

  const handleMouseEnter = (starIndex) => {
    if (interactive) {
      setHoverRating(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = interactive ? (hoverRating || selectedRating) : rating;

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxStars)].map((_, index) => {
        const starIndex = index + 1;
        const isFilled = starIndex <= displayRating;
        const isHalf = !isFilled && starIndex - 0.5 <= displayRating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onMouseLeave={handleMouseLeave}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            style={{ width: size, height: size }}
          >
            <Star
              className={`w-full h-full ${
                isFilled || isHalf
                  ? 'text-[#FBBF24] fill-[#FBBF24]'
                  : 'text-gray-300'
              }`}
            />
          </button>
        );
      })}
      {interactive && (
        <span className="ml-2 text-sm text-gray-600">
          {selectedRating > 0 ? `${selectedRating} bintang` : 'Pilih rating'}
        </span>
      )}
    </div>
  );
}
