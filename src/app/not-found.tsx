import { Link } from "lucide-react";

const page = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold text-center mt-20">
        404 - Page Not Found
      </h1>
      <Link
        href="/dashboard"
        className="flex items-center justify-center mt-10 text-blue-600 hover:underline"
      >
        <span className="mr-2">Go back to Dashboard</span>
        <Link size={20} />
      </Link>
    </div>
  );
};

export default page;
