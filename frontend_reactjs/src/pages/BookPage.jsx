import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const BookPage = () => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_KEY = "AIzaSyBzBVojOP6DCMB6hFwWpL8ppVWEo-O3ao4";

  const searchBooks = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          query
        )}&maxResults=20&key=${API_KEY}`
      );
      const data = await res.json();
      setBooks(data.items || []);
    } catch (err) {
      console.error("Lỗi khi tìm sách:", err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-8 rounded-3xl shadow-xl">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Thư Viện Sách 📚
        </h1>

        {/* Search Box */}
        <div className="max-w-2xl mx-auto relative">
          <input
            type="text"
            placeholder="Tìm kiếm sách, tác giả, ISBN..."
            className="w-full px-6 py-4 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 pl-12 pr-36 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchBooks()}
          />
          <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <button
            onClick={searchBooks}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="px-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">Hãy nhập từ khóa để tìm sách bạn cần</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {books.map((book) => {
              const info = book.volumeInfo;
              const isbn = info.industryIdentifiers?.find((id) =>
                id.type.includes("ISBN")
              )?.identifier;

              return (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
                >
                  <div className="flex p-6 gap-6">
                    <div className="flex-shrink-0">
                      {info.imageLinks?.thumbnail ? (
                        <img
                          src={info.imageLinks.thumbnail}
                          alt={info.title}
                          className="w-32 h-44 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-32 h-44 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h2 className="text-xl font-bold text-gray-800 line-clamp-2">
                        {info.title}
                      </h2>
                      <p className="text-blue-600 font-medium">
                        {info.authors?.join(", ") || "Không rõ tác giả"}
                      </p>
                      {isbn && (
                        <p className="text-sm text-gray-500">ISBN: {isbn}</p>
                      )}
                      {info.description && (
                        <p className="text-gray-600 line-clamp-3 text-sm">
                          {info.description}
                        </p>
                      )}
                      <a
                        href={info.previewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-500 hover:text-blue-600 transition-colors duration-200"
                      >
                        Xem chi tiết
                        <svg
                          className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookPage;
