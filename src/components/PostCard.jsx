/* PostCard.jsx */
import { useState } from "react";
import { Heart, MessageCircle, Trash2, Edit2, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import api from "@/services/api";
import { toast } from "react-toastify";

export default function PostCard({ post, currentUserId, onUpdate, onDelete }) {
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);

  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);

  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commenting, setCommenting] = useState(false);

  /* ===================== LIKE ===================== */
  const handleLike = async () => {
    const prevLiked = liked;
    const prevLikes = likesCount;

    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevLikes - 1 : prevLikes + 1);

    try {
      if (prevLiked) await api.delete(`/posts/${post.id}/unlike`);
      else await api.post(`/posts/${post.id}/like`);

      // ✅ Keep all original post fields intact
      onUpdate({
        ...post,
        is_liked: !prevLiked,
        likes_count: prevLiked ? prevLikes - 1 : prevLikes + 1,
      });
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevLikes);
      toast.error("Action failed");
    }
  };

  /* ===================== DELETE ===================== */
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    onDelete(post.id);
  };

  /* ===================== EDIT ===================== */
  const handleEditSave = async () => {
    if (!editedContent.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }

    try {
      const { data } = await api.put(`/posts/${post.id}`, { content: editedContent });

      // ✅ Merge backend response with existing post to keep username/avatar
      onUpdate({
        ...post,
        content: data.content,
        image_url: data.image_url ?? post.image_url,
      });

      setEditing(false);
    } catch {
      toast.error("Failed to update post");
    }
  };

  /* ===================== COMMENTS ===================== */
  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/posts/${post.id}/comments`);
      setComments(data);
    } catch {
      toast.error("Failed to fetch comments");
    }
  };

  const toggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments) fetchComments();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setCommenting(true);
    try {
      const { data } = await api.post(`/posts/${post.id}/comment`, {
        content: newComment,
      });

      setComments((prev) => [...prev, data]);
      setNewComment("");
      setCommentsCount(commentsCount + 1);

      // ✅ Update parent without removing username/avatar
      onUpdate({
        ...post,
        comments_count: commentsCount + 1,
      });
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setCommenting(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm border bg-white dark:bg-neutral-900 overflow-hidden">

      {/* Header */}
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user_avatar} />
            <AvatarFallback>{post.username?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{post.username}</p>
            <p className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {post.user_id === currentUserId && (
          <div className="flex gap-2">
            {!editing && (
              <>
                <button onClick={() => setEditing(true)}>
                  <Edit2 className="w-5 h-5 text-gray-500" />
                </button>
                <button onClick={handleDelete}>
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </>
            )}
          </div>
        )}
      </CardContent>

      {/* Image */}
      {post.image_url && (
        <div className="w-full max-h-[500px] overflow-hidden bg-gray-100 dark:bg-neutral-800">
          <img
            src={post.image_url}
            alt="post"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content & Actions */}
      <CardContent className="p-4 space-y-2">
        {editing ? (
          <div className="space-y-2">
            <textarea
              className="w-full p-2 border rounded"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleEditSave}
                className="bg-emerald-600 text-white px-3 py-1 rounded flex items-center"
              >
                <Check className="inline w-4 h-4 mr-1" /> Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-400 text-white px-3 py-1 rounded flex items-center"
              >
                <X className="inline w-4 h-4 mr-1" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm">{post.content}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-6 mt-2">
          <button onClick={handleLike} className="flex items-center gap-2">
            <Heart
              className={`w-6 h-6 transition-transform duration-200 ${
                liked ? "fill-emerald-500 text-emerald-500 scale-110" : "text-gray-600"
              }`}
            />
            <span>{likesCount}</span>
          </button>

          <button onClick={toggleComments} className="flex items-center gap-2 text-gray-600">
            <MessageCircle className="w-6 h-6" />
            <span>{commentsCount}</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 border-t pt-2 space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="text-sm flex gap-2 items-start">
                <span className="font-semibold">
                  {comment.app_users?.name || "Unknown"}:
                </span>
                <span>{comment.content}</span>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={handleAddComment}
                disabled={commenting}
                className="bg-emerald-600 text-white px-3 py-1 rounded"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}