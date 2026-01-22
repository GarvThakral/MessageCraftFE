import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import { BLOGS } from "../data/blogs";

export default function BlogPost() {
  const { slug } = useParams();
  const post = useMemo(() => BLOGS.find((b) => b.slug === slug), [slug]);

  useEffect(() => {
    if (post) document.title = `${post.title} | ReTone Blog`;
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#f3e5e8] via-[#f0eef5] to-[#e8f2f7] px-6 py-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <h1 className="text-3xl font-semibold text-[#3d3854]">Post not found</h1>
          <Link to="/blogs" className="text-sm text-[#7d7890] hover:text-[#3d3854]">
            Back to all blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f3e5e8] via-[#f0eef5] to-[#e8f2f7] px-6 py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b2a8c6]">Blog</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-[#3d3854]">{post.title}</h1>
            <p className="mt-2 text-sm text-[#9b96aa]">
              By {post.author} · {post.minutes} min read
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#7d7890]">
            <Link to="/blogs" className="hover:text-[#3d3854]">
              Blogs
            </Link>
            <Link to="/pricing" className="hover:text-[#3d3854]">
              Pricing
            </Link>
          </div>
        </header>

        <article className="rounded-3xl bg-white/90 p-8 shadow-xl space-y-4 text-sm text-[#4a4561]">
          {post.body.map((para, idx) => (
            <p key={idx} className="leading-relaxed">
              {para}
            </p>
          ))}
        </article>

        <div className="flex items-center justify-between text-sm text-[#7d7890]">
          <Link to="/blogs" className="hover:text-[#3d3854]">
            ← Back to all blogs
          </Link>
          <Link to="/" className="hover:text-[#3d3854]">
            Go to app
          </Link>
        </div>
      </div>
    </div>
  );
}
