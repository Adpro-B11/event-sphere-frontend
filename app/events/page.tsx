export default function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-48 bg-gray-200 relative">
              <div className="absolute bottom-0 left-0 bg-gray-800 text-white px-3 py-1 m-2 text-sm font-medium rounded">
                {new Date(Date.now() + i * 86400000).toLocaleDateString()}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">Event Title {i}</h3>
              <p className="text-gray-600 mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">${(10 * i).toFixed(2)}</span>
                <button className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
