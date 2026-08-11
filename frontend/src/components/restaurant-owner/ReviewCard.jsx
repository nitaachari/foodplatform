import { useState } from "react";

export default function ReviewCard({ review, onReply, submitting }) {
  const [replyText, setReplyText] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onReply(review, replyText);
    setReplyText("");
    setShowForm(false);
  };

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm">{review.user?.name || "Customer"}</p>
        <span className="font-mono text-xs text-turmeric">
          {"★".repeat(review.rating)}
          {"☆".repeat(5 - review.rating)}
        </span>
      </div>

      {review.comment && (
        <p className="mt-2 text-sm text-ink/70">{review.comment}</p>
      )}

      <p className="mt-1 text-xs text-ink/40">
        {new Date(review.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>

      {review.reply?.comment ? (
        <div className="mt-3 rounded-lg bg-ink/5 p-3">
          <p className="text-xs font-medium text-ink/70">Your reply</p>
          <p className="mt-1 text-sm text-ink/70">{review.reply.comment}</p>
        </div>
      ) : showForm ? (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2">
          <textarea
            required
            rows={2}
            maxLength={1000}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply…"
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-ink px-3 py-1.5 text-xs text-paper hover:bg-ink/90 disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Post reply"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-ink/50 hover:text-chili"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 text-xs text-chili hover:underline"
        >
          Reply
        </button>
      )}
    </div>
  );
}
