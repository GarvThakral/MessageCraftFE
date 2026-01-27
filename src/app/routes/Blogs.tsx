import { useEffect } from "react";
import { Link } from "react-router-dom";

import { BLOGS } from "../data/blogs";

export default function Blogs() {
  useEffect(() => {
    document.title = "ReTone Blogs | Communication Intelligence";
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f3e5e8] via-[#f0eef5] to-[#e8f2f7] px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b2a8c6]">Blog</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-[#3d3854]">
              Learn faster with ReTone
            </h1>
            <p className="mt-2 text-sm text-[#7d7890]">
              Communication tactics, product comparisons, and ready-to-use playbooks.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#7d7890]">
            <Link to="/" className="hover:text-[#3d3854]">
              Home
            </Link>
            <Link to="/pricing" className="hover:text-[#3d3854]">
              Pricing
            </Link>
            <Link to="/support" className="hover:text-[#3d3854]">
              Support
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          {BLOGS.map((blog) => (
            <article key={blog.slug} className="rounded-3xl bg-white/90 p-6 shadow-lg">
              <img
                src={blog.image}
                alt={blog.title}
                className="h-44 w-full rounded-2xl object-cover"
                loading="lazy"
              />
              <div className="flex items-center justify-between text-xs text-[#9b96aa]">
                <span>{blog.author}</span>
                <span>{blog.minutes} min read</span>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-[#3d3854]">{blog.title}</h2>
              <p className="mt-2 text-sm text-[#7d7890]">{blog.excerpt}</p>
              <div className="mt-4 space-y-2 text-sm text-[#6f6a83]">
                {blog.body.slice(0, 2).map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
              <Link
                to={`/blogs/${blog.slug}`}
                className="mt-4 inline-flex items-center text-sm font-semibold text-[#3d3854] hover:underline"
              >
                Read full post →
              </Link>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
