"use client";

import React from "react";

const StatsSkeleton = () => {
  // 4ti card er jonno array
  const skeletonCards = [1, 2, 3, 4];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 mt-6">
      {skeletonCards.map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 items-start rounded-2xl p-6 bg-gray-50 border border-gray-100 animate-pulse"
        >
          {/* Label Skeleton */}
          <div className="h-4 w-24 bg-gray-200 rounded-md"></div>

          {/* Count Skeleton */}
          <div className="h-10 w-16 bg-gray-200 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
};

export default StatsSkeleton;
