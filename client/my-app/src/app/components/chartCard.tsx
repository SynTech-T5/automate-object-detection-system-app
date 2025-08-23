

export default function ChartCard() {
    return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Card 1 */}
      <div className="bg-white rounded-sm  shadow-md overflow-hidden">
        <div className="px-4 pt-3 text-sky-600 font-semibold text-sm">
          Alert Trends (Last 7 Days)
        </div>
        <div className="m-4 h-40 md:h-48  bg-gray-200   " />
      </div>

      {/* Card 2 */}
      <div className="bg-white rounded-sm shadow-md overflow-hidden">
        <div className="px-4 pt-3 text-sky-600 font-semibold text-sm">
          Alert Distribution by Event Type
        </div>
        <div className="m-4 h-40 md:h-48 bg-gray-200 " />
      </div>
    </div>
    );
}