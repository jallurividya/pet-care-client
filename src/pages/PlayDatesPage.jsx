import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlaydatesPage() {

  // 🔥 Fetch playdates
  const { data: playdates = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["playdates"],
    queryFn: async () => {
      const res = await api.get("/playdates");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto p-4 space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Failed to load playdates</p>
        <Button onClick={refetch} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-black border-b px-4 py-3 flex justify-between items-center">
        <h1 className="text-lg font-bold text-emerald-600">
          Pet Playdates 🐾
        </h1>
      </div>

      {/* Content */}
      <div className="max-w-xl mx-auto px-3 py-6 space-y-4">

        {playdates.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            No playdates scheduled yet 🐶
          </div>
        ) : (
          playdates.map((playdate) => {
            const isExpired = new Date(playdate.date) < new Date();

            return (
              <Card
                key={playdate.id}
                className={`rounded-xl shadow-sm border transition ${
                  isExpired
                    ? "opacity-60 bg-gray-100 dark:bg-neutral-800"
                    : "bg-white dark:bg-neutral-900"
                }`}
              >
                <CardContent className="p-4 space-y-3">

                  {/* Title */}
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-base">
                      {playdate.title}
                    </h2>

                    {playdate.is_host && (
                      <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">
                        Host
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {playdate.description}
                  </p>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CalendarDays size={16} />
                    {new Date(playdate.date).toLocaleString()}
                  </div>

                  {/* Location */}
                  {playdate.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={16} />
                      {playdate.location}
                    </div>
                  )}

                  {/* Expired Badge */}
                  {isExpired && (
                    <div className="text-xs text-red-500 font-medium">
                      This playdate has expired
                    </div>
                  )}

                </CardContent>
              </Card>
            );
          })
        )}

      </div>

      {/* Floating Add Button (Mobile Only) */}
      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-emerald-500 hover:bg-emerald-600 md:hidden"
      >
        <Plus />
      </Button>

    </div>
  );
}