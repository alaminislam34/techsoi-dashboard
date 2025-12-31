"use client";

import Stats from "../components/BodyContent/Stats";
import Table from "../components/BodyContent/Table";

const DashboardPage = () => {
  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4">
        {/* Stats Section */}
        <section className="w-full">
          <Stats />
        </section>

        {/* Table Section - Ekhane overflow control kora khub joruri */}
        <section className="w-full">
          <Table />
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
