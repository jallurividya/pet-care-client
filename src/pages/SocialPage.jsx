import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import api from "@/api/api";
import PostCard from "@/components/PostCard";
import { Edit2, Trash2 } from "lucide-react";

export default function SocialPage() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.id;

  const [posts, setPosts] = useState([]);
  const [playdates, setPlaydates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newPost, setNewPost] = useState({ content: "", image_url: "" });
  const [editingPostId, setEditingPostId] = useState(null);

  const [newPlaydate, setNewPlaydate] = useState({
    title: "",
    description: "",
    location: "",
    event_date: "",
  });

  const [editingPlaydateId, setEditingPlaydateId] = useState(null);

  /* =========================================================
     FETCH DATA
  ========================================================= */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [postsRes, playdatesRes] = await Promise.all([
        api.get("/posts/feed"),
        api.get("/playdates"),
      ]);

      setPosts(postsRes.data || []);
      setPlaydates(playdatesRes.data || []);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =========================================================
     POSTS
  ========================================================= */

  const handleCreateOrUpdatePost = async () => {
  if (!newPost.content.trim()) {
    toast.error("Post cannot be empty");
    return;
  }

  try {
    if (editingPostId) {
      // ✅ UPDATE
      const { data } = await api.put(`/posts/${editingPostId}`, newPost);
  console.log("Updated post from backend:", data); // 👈 ADD THIS

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === editingPostId ? data : post
        )
      );

      toast.success("Post updated!");
      setEditingPostId(null);
    } else {
      // ✅ CREATE
      const { data } = await api.post("/posts", newPost);

      setPosts((prevPosts) => [data, ...prevPosts]);

      toast.success("Post shared!");
    }

    setNewPost({ content: "", image_url: "" });

  } catch {
    console.log("Post action failed");
  }
};


 const handleDeletePost = async (id) => {
  if (!confirm("Delete this post?")) return;

  try {
    await api.delete(`/posts/${id}`);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Post deleted");
  } catch {
    console.log("Delete failed");
  }
};

  const handleEditPost = (post) => {
    setNewPost({
      content: post.content,
      image_url: post.image_url || "",
    });
    setEditingPostId(post.id);
  };

  /* =========================================================
     PLAYDATES
  ========================================================= */

  const handleCreateOrUpdatePlaydate = async () => {
    if (!newPlaydate.title || !newPlaydate.event_date) {
      toast.error("Title and Date required");
      return;
    }

    try {
      if (editingPlaydateId) {
        const { data } = await api.put(
          `/playdates/${editingPlaydateId}`,
          newPlaydate
        );

        setPlaydates((prev) =>
          prev.map((p) => (p.id === editingPlaydateId ? { ...p, ...data } : p))
        );

        toast.success("Playdate updated!");
        setEditingPlaydateId(null);
      } else {
        const { data } = await api.post("/playdates", newPlaydate);
        setPlaydates((prev) => [data, ...prev]);
        toast.success("Playdate created!");
      }

      setNewPlaydate({
        title: "",
        description: "",
        location: "",
        event_date: "",
      });
    } catch {
      toast.error("Playdate action failed");
    }
  };

  const handleEditPlaydate = (playdate) => {
    setNewPlaydate(playdate);
    setEditingPlaydateId(playdate.id);
  };

  const handleDeletePlaydate = async (id) => {
    if (!confirm("Delete this playdate?")) return;

    try {
      await api.delete(`/playdates/${id}`);
      setPlaydates((prev) => prev.filter((p) => p.id !== id));
      toast.success("Playdate deleted!");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleRSVP = async (id) => {
    try {
      const { data } = await api.post(`/playdates/${id}/rsvp`);

      setPlaydates((prev) =>
        prev.map((p) => (p.id === id ? data : p))
      );

      toast.success("RSVP successful!");
    } catch {
      toast.error("RSVP failed");
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Social 🐾</h1>

        <Tabs defaultValue="posts">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="playdates">PlayDates</TabsTrigger>
          </TabsList>

          {/* ================= POSTS TAB ================= */}
          <TabsContent value="posts" className="space-y-4">

            {/* Create / Edit Post */}
            <Card>
              <CardContent className="space-y-3 p-4">
                <Textarea
                  placeholder="Share something..."
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                />
                <Input
                  placeholder="Image URL"
                  value={newPost.image_url}
                  onChange={(e) =>
                    setNewPost({ ...newPost, image_url: e.target.value })
                  }
                />
                <Button onClick={handleCreateOrUpdatePost} className="w-full">
                  {editingPostId ? "Update Post" : "Share Post"}
                </Button>
              </CardContent>
            </Card>

            {posts.length === 0 ? (
              <p className="text-muted-foreground text-center">No posts yet.</p>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                  onDelete={handleDeletePost}
                  onUpdate={handleEditPost}
                />
              ))
            )}

          </TabsContent>

          {/* ================= PLAYDATES TAB ================= */}
          <TabsContent value="playdates" className="space-y-4">

            {/* Create / Edit Playdate */}
            <Card>
              <CardContent className="space-y-3 p-4">
                <Input
                  placeholder="Title"
                  value={newPlaydate.title}
                  onChange={(e) =>
                    setNewPlaydate({ ...newPlaydate, title: e.target.value })
                  }
                />
                <Input
                  type="datetime-local"
                  value={newPlaydate.event_date}
                  onChange={(e) =>
                    setNewPlaydate({
                      ...newPlaydate,
                      event_date: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Location"
                  value={newPlaydate.location}
                  onChange={(e) =>
                    setNewPlaydate({
                      ...newPlaydate,
                      location: e.target.value,
                    })
                  }
                />
                <Textarea
                  placeholder="Description"
                  value={newPlaydate.description}
                  onChange={(e) =>
                    setNewPlaydate({
                      ...newPlaydate,
                      description: e.target.value,
                    })
                  }
                />

                <Button onClick={handleCreateOrUpdatePlaydate} className="w-full">
                  {editingPlaydateId ? "Update Playdate" : "Create Playdate"}
                </Button>
              </CardContent>
            </Card>

            {/* Display Playdates */}
            {playdates.map((playdate) => {
              const isHost = playdate.host_id === currentUserId;
              const rsvpCount = playdate.rsvp_count || 0;

              return (
                <Card key={playdate.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <h2 className="font-semibold">{playdate.title}</h2>

                      {isHost && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPlaydate(playdate)}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleDeletePlaydate(playdate.id)
                            }
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </div>

                    <p>{playdate.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(playdate.event_date).toLocaleString()}
                    </p>
                    {playdate.location && <p>{playdate.location}</p>}

                    {isHost && (
                      <p className="text-sm font-medium">
                        RSVP Count: {rsvpCount}
                      </p>
                    )}

                    {!isHost && (
                      <Button
                        onClick={() => handleRSVP(playdate.id)}
                        className="w-full"
                      >
                        RSVP
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}