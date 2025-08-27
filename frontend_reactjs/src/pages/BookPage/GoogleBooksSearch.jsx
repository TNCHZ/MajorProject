import React, { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import Apis, { endpoints, API_KEY } from '../../configs/Apis';

const GoogleBooksSearch = ({ onBookAdded }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchBooks = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${API_KEY}`
      );
      const data = await res.json();
      setResults(data.items || []);
    } catch (err) {
      console.error("Lỗi khi tìm sách:", err);
    }
    setLoading(false);
  };

  const handleAddBook = async (book) => {
    const info = book.volumeInfo;
    const newBook = {
      title: info.title,
      author: (info.authors || []).join(', '),
      description: info.description || '',
      publisher: info.publisher || '',
      imageUrl: info.imageLinks?.thumbnail || '',
    };

    try {
      await Apis.post(endpoints.books, newBook);
      onBookAdded();
    } catch (err) {
      console.error("Lỗi khi thêm sách:", err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchBooks()}
          placeholder="Nhập tên sách, tác giả hoặc ISBN..."
          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={searchBooks}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {results.map((book, idx) => {
            const info = book.volumeInfo;
            return (
              <div key={idx} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl">
                {info.imageLinks?.thumbnail ? (
                  <img
                    src={info.imageLinks.thumbnail}
                    alt={info.title}
                    className="w-16 h-24 object-cover rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-16 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{info.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {info.authors?.join(', ') || 'Unknown author'}
                  </p>
                  <button
                    onClick={() => handleAddBook(book)}
                    className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Thêm sách
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoogleBooksSearch;