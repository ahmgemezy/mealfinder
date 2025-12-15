export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen animate-pulse">
      {/* Hero Skeleton */}
      <div className="relative w-full overflow-hidden bg-black/90 min-h-[60vh] flex items-center">
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            {/* Text Skeleton */}
            <div className="flex-1 space-y-6 w-full">
              <div className="flex gap-3 justify-center md:justify-start">
                <div className="h-8 w-24 bg-white/10 rounded-full" />
                <div className="h-8 w-24 bg-white/10 rounded-full" />
              </div>
              <div className="h-16 w-3/4 bg-white/10 rounded-xl mx-auto md:mx-0" />
            </div>

            {/* Image Skeleton */}
            <div className="w-full md:w-[450px] lg:w-[500px] shrink-0">
              <div className="aspect-square rounded-3xl bg-white/5 border-4 border-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-8 w-48 bg-gray-200 rounded mb-6 dark:bg-gray-800" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded-xl dark:bg-gray-800"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
