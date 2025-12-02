"use client";

import Link from "next/link";
import biblie from "../../data/bible.json";

export default function BibliaHome() {
  const books = Object.keys(biblie);

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Biblia</h1>
      <p className="text-neutral-400 mb-6">Selecciona un libro:</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {books.map((book) => (
          <Link
            key={book}
            href={`/biblia/${book}`}
            className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 hover:bg-neutral-800 transition"
          >
            {book}
          </Link>
        ))}
      </div>
    </main>
  );
}
