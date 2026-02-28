import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  // 🔥 Fetch notifications
  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications");
      return res.data;
    },
  });

  // ✅ Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async (id) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto p-4 space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        Failed to load notifications
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-black border-b px-4 py-3 flex items-center gap-2">
        <Bell className="text-emerald-600" />
        <h1 className="text-lg font-bold">Notifications</h1>
      </div>

      {/* List */}
      <div className="max-w-xl mx-auto px-3 py-6 space-y-4">

        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            No notifications yet 🔕
          </div>
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              className={`rounded-xl shadow-sm border transition ${
                !n.is_read
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200"
                  : "bg-white dark:bg-neutral-900"
              }`}
            >
              <CardContent className="p-4 flex justify-between items-start gap-4">

                <div>
                  <p className="text-sm font-medium">
                    {n.message}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>

                {!n.is_read && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAsRead.mutate(n.id)}
                    className="text-emerald-600 border-emerald-500"
                  >
                    Mark Read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}

      </div>
    </div>
  );
}