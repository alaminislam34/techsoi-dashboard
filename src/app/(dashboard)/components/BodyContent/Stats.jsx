"use client";

import React from "react";

const stats = [
  {
    stat: "New Order",
    count: 12046,
    color: "#2CACE2",
  },
  {
    stat: "Pending Products",
    count: 12046,
    color: "#E2872C",
  },
  {
    stat: "Delivered Products",
    count: 12046,
    color: "#0D9800",
  },
  {
    stat: "Cancel Order",
    count: 12046,
    color: "#E22C2C",
  },
];

const Stats = () => {
  return (
    /* grid-cols-1 for small phones 
       grid-cols-2 for tablets 
       lg:grid-cols-4 for desktops 
    */
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-3 pb-6 mt-6 lg:mt-0">
      {stats.map((stat) => (
        <div
          key={stat.stat}
          className="flex flex-col gap-1 md:gap-2 items-start rounded-2xl p-5 md:p-6 transition-transform hover:scale-[1.02] duration-300"
          style={{
            backgroundColor: `${stat.color}10`, // 10 = approx 6% opacity in hex
          }}
        >
          {/* Label: Adjusted font sizes for mobile/desktop */}
          <p
            style={{ color: stat.color }}
            className="text-sm xl:text-lg font-medium whitespace-nowrap"
          >
            {stat.stat}
          </p>

          {/* Count: Responsive sizing to prevent overflow */}
          <h1 className="text-2xl sm:text-3xl xl:text-4xl font-semibold text-dark">
            {stat.count.toLocaleString()}
          </h1>
        </div>
      ))}
    </div>
  );
};

export default Stats;
