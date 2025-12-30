"use client";
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6">
      {stats.map((stat) => (
        <div
          key={stat.stat}
          className={`flex flex-col gap-2 items-start rounded-2xl border-2 p-4 md:p-6`}
          style={{
            borderColor: stat.color,
            backgroundColor: `${stat.color}10`, // 80 = 50% opacity in hex
          }}
        >
          <p style={{ color: stat.color }} className="lg:text-lg">
            {stat.stat}
          </p>
          <h1 className="text-2xl md:text-3xl lg:text-4xl">{stat.count}</h1>
        </div>
      ))}
    </div>
  );
};

export default Stats;
