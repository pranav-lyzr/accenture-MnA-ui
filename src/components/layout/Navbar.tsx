const Navbar = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Mergers & Acquisitions Agent
            </h1>
            <p className="text-gray-600 mt-1 font-medium text-sm">
              Strategic Intelligence & Analysis Platform
            </p>
          </div>
          
          {/* <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-600">Live Analysis</span>
          </div> */}
        </div>
      </div>
    </header>
  );
};

export default Navbar;