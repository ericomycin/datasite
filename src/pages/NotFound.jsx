import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#F3F4F6]">
      {/* Error Message */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-[red] mb-4 text-center">
          Page Not Found
        </h2>
        <p className="text-lg text-slate-600 leading-relaxed">
          Sorry, the page you're looking for doesn't exist. It might have been
          removed, or you may have mistyped the URL.
        </p>
      </div>
    </div>
  );
}
