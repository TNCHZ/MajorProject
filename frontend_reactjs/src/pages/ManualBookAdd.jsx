import React, { useEffect, useState } from 'react';
import { authApis, endpoints } from '../configs/Apis';

// Default language list as a fallback
const DEFAULT_LANGUAGES = [
  { code: 'vi', name: 'Vietnamese' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'zh-Hans', name: 'Chinese' },
];

const ManualBookAdd = ({ initialData, onBookAdded, onClose }) => {
  const isUpdate = !!initialData; // Determine if in update mode
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    publisher: '',
    description: '',
    language: 'Vietnamese', // Default to Vietnamese
    publishedDate: new Date().getFullYear(),
    isbn10: '',
    isbn13: '',
    price: '',
    isPrinted: false,
    isElectronic: false,
    file: null,
    ebookFile: null,
    format: '',
    licence: '',
    shelfLocation: '',
    totalCopy: ''
  });

  const [languageOptions, setLanguageOptions] = useState(DEFAULT_LANGUAGES);
  const [languageLoading, setLanguageLoading] = useState(false);
  const [languageError, setLanguageError] = useState(null);
  const [previewCover, setPreviewCover] = useState(null);
  const [ebookFileName, setEbookFileName] = useState('');
  const [errors, setErrors] = useState({});
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryToAdd, setCategoryToAdd] = useState('');

  // Initialize form with initialData if provided (for updates)
  useEffect(() => {
    if (initialData) {
      setNewBook({
        title: initialData.title || '',
        author: initialData.author || '',
        publisher: initialData.publisher || '',
        description: initialData.description || '',
        language: initialData.language || 'Vietnamese',
        publishedDate: initialData.publishedDate || new Date().getFullYear(),
        isbn10: initialData.isbn10 || '',
        isbn13: initialData.isbn13 || '',
        price: initialData.price || '',
        isPrinted: initialData.isPrinted || false,
        isElectronic: initialData.isElectronic || false,
        file: null, // File is not fetched, user must re-upload if needed
        ebookFile: null, // File is not fetched, user must re-upload if needed
        format: initialData.format || '',
        licence: initialData.licence || '',
        shelfLocation: initialData.shelfLocation || '',
        totalCopy: initialData.totalCopy || ''
      });
      setPreviewCover(initialData.image || null); // Set initial image URL as preview
      setEbookFileName(initialData.filePDF ? initialData.filePDF.split('/').pop() : ''); // Extract filename from filePDF
      setSelectedCategories(initialData.categories || []); // Pre-populate categories
    }
  }, [initialData]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await authApis().get(endpoints['categories']);
        const categories = Array.isArray(res.data) ? res.data : [];
        setAllCategories(categories);
        if (categories.length > 0 && !categoryToAdd) {
          setCategoryToAdd(categories[0].id);
        }
      } catch (error) {
        console.error('Lỗi khi tải thể loại:', error);
        setAllCategories([]);
      }
    };
    fetchCategories();
  }, [categoryToAdd]);

  // Fetch languages
  useEffect(() => {
    const fetchLanguages = async () => {
      setLanguageLoading(true);
      setLanguageError(null);
      try {
        const res = await fetch('https://libretranslate.com/languages');
        if (!res.ok) throw new Error('Không thể lấy danh sách ngôn ngữ');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLanguageOptions(data);
          if (!initialData) {
            // Only set default language for adding, not updating
            const viLang = data.find(l => l.code === 'vi');
            setNewBook(prev => ({ ...prev, language: viLang ? viLang.name : data[0].name }));
          }
        } else {
          throw new Error('Danh sách ngôn ngữ trống');
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách ngôn ngữ:', error);
        setLanguageError('Không thể tải danh sách ngôn ngữ. Sử dụng danh sách mặc định.');
        setLanguageOptions(DEFAULT_LANGUAGES);
        if (!initialData) {
          setNewBook(prev => ({ ...prev, language: 'Vietnamese' }));
        }
      } finally {
        setLanguageLoading(false);
      }
    };
    fetchLanguages();
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      if (name === 'file') {
        setNewBook(prev => ({ ...prev, file: files[0] || null }));
        setPreviewCover(files[0] ? URL.createObjectURL(files[0]) : initialData?.image || null);
      } else if (name === 'ebookFile') {
        setNewBook(prev => ({ ...prev, ebookFile: files[0] || null }));
        setEbookFileName(files[0] ? files[0].name : initialData?.filePDF?.split('/').pop() || '');
      }
    } else if (type === 'checkbox') {
      setNewBook(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setNewBook(prev => ({ ...prev, [name]: value === '' ? '' : parseFloat(value) }));
    } else {
      setNewBook(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddCategory = () => {
    if (categoryToAdd && !selectedCategories.find(c => c.id === parseInt(categoryToAdd))) {
      const cat = allCategories.find(c => c.id === parseInt(categoryToAdd));
      if (cat) {
        setSelectedCategories(prev => [...prev, cat]);
      }
    }
  };

  const handleRemoveCategory = (id) => {
    setSelectedCategories(prev => prev.filter(c => c.id !== id));
  };

  const validate = () => {
    const temp = {};
    if (!newBook.title || !newBook.title.trim()) temp.title = 'Tên sách không được để trống';
    if (!newBook.author || !newBook.author.trim()) temp.author = 'Tác giả không được để trống';
    if (!newBook.publisher || !newBook.publisher.trim()) temp.publisher = 'Nhà xuất bản không được để trống';
    if (!newBook.description || !newBook.description.trim()) temp.description = 'Mô tả không được để trống';
    if (!newBook.language || !newBook.language.trim()) temp.language = 'Ngôn ngữ không được để trống';
    if (!newBook.price || Number.isNaN(Number(newBook.price))) temp.price = 'Giá không hợp lệ';
    if (!newBook.publishedDate) temp.publishedDate = 'Năm xuất bản không được để trống';
    if (newBook.publishedDate < 1800 || newBook.publishedDate > new Date().getFullYear()) {
      temp.publishedDate = 'Năm xuất bản không hợp lệ';
    }
    if (newBook.isbn10 && !/^\d{10}$/.test(newBook.isbn10)) temp.isbn10 = 'ISBN-10 không hợp lệ';
    if (newBook.isbn13 && !/^\d{13}$/.test(newBook.isbn13)) temp.isbn13 = 'ISBN-13 không hợp lệ';

    if (newBook.isElectronic) {
      if (!newBook.format || !newBook.format.trim()) temp.format = 'Định dạng không được để trống';
      if (!newBook.licence || !newBook.licence.trim()) temp.licence = 'Giấy phép không được để trống';
    }

    if (newBook.isPrinted) {
      if (!newBook.shelfLocation || !newBook.shelfLocation.trim()) {
        temp.shelfLocation = 'Vị trí kệ không được để trống';
      }
      if (!newBook.totalCopy || Number.isNaN(Number(newBook.totalCopy)) || Number(newBook.totalCopy) <= 0) {
        temp.totalCopy = 'Số lượng bản in phải là số lớn hơn 0';
      }
    }

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const formData = new FormData();

      const bookJson = { ...newBook };
      delete bookJson.file;
      delete bookJson.ebookFile;

      bookJson.isPrinted = newBook.isPrinted ? 'true' : 'false';
      bookJson.isElectronic = newBook.isElectronic ? 'true' : 'false';
      bookJson.publishedDate = String(newBook.publishedDate);
      bookJson.price = String(newBook.price);
      bookJson.totalCopy = String(newBook.totalCopy || '');
      bookJson.shelfLocation = newBook.shelfLocation || '';

      formData.append('book', new Blob([JSON.stringify(bookJson)], { type: 'application/json' }));
      formData.append('categories', new Blob([JSON.stringify(selectedCategories.map(cat => cat.id))], { type: 'application/json' }));

      if (newBook.file) {
        formData.append('file', newBook.file);
      }
      if (newBook.ebookFile) {
        formData.append('ebookFile', newBook.ebookFile);
      }

      if (isUpdate) {
        // Update request
        await authApis().patch(endpoints['book-update'](initialData.id), formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Add request
        await authApis().post(endpoints['add-book'], formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      onBookAdded();
      onClose();
    } catch (err) {
      console.error(`Lỗi khi ${isUpdate ? 'cập nhật' : 'thêm'} sách:`, err);
      setErrors(prev => ({ ...prev, submit: `${isUpdate ? 'Cập nhật' : 'Thêm'} sách thất bại. Vui lòng thử lại.` }));
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên sách *</label>
          <input
            type="text"
            name="title"
            value={newBook.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả *</label>
          <input
            type="text"
            name="author"
            value={newBook.author}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          {errors.author && <p className="mt-1 text-sm text-red-500">{errors.author}</p>}
        </div>

        {/* Publisher */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nhà xuất bản *</label>
          <input
            type="text"
            name="publisher"
            value={newBook.publisher}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          {errors.publisher && <p className="mt-1 text-sm text-red-500">{errors.publisher}</p>}
        </div>

        {/* Published Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Năm xuất bản *</label>
          <input
            type="number"
            name="publishedDate"
            value={newBook.publishedDate}
            onChange={handleChange}
            min="1800"
            max={new Date().getFullYear()}
            className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          {errors.publishedDate && <p className="mt-1 text-sm text-red-500">{errors.publishedDate}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
          <textarea
            name="description"
            value={newBook.description}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thể loại</label>
          <div className="flex gap-2">
            <select
              value={categoryToAdd}
              onChange={(e) => setCategoryToAdd(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              {(Array.isArray(allCategories) ? allCategories : []).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
            >
              Thêm
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedCategories.map(cat => (
              <div key={cat.id} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                <span>{cat.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngôn ngữ *</label>
          {languageLoading ? (
            <div className="text-sm text-gray-500">Đang tải danh sách ngôn ngữ...</div>
          ) : (
            <select
              name="language"
              value={newBook.language}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              {languageOptions.map(opt => (
                <option key={opt.code} value={opt.name}>
                  {opt.name}
                </option>
              ))}
            </select>
          )}
          {languageError && <p className="mt-1 text-sm text-red-500">{languageError}</p>}
          {errors.language && <p className="mt-1 text-sm text-red-500">{errors.language}</p>}
        </div>

        {/* ISBNs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ISBN-10</label>
            <input
              type="text"
              name="isbn10"
              value={newBook.isbn10}
              onChange={handleChange}
              maxLength="10"
              className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            {errors.isbn10 && <p className="mt-1 text-sm text-red-500">{errors.isbn10}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ISBN-13</label>
            <input
              type="text"
              name="isbn13"
              value={newBook.isbn13}
              onChange={handleChange}
              maxLength="13"
              className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            {errors.isbn13 && <p className="mt-1 text-sm text-red-500">{errors.isbn13}</p>}
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giá *</label>
          <input
            type="number"
            name="price"
            value={newBook.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa</label>
          <input
            type="file"
            name="file"
            accept="image/*"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {previewCover && (
            <div className="mt-2">
              <img src={previewCover} alt="Preview" className="h-20 w-20 object-cover rounded-full" />
            </div>
          )}
        </div>

        {/* Checkboxes */}
        <div className="flex gap-4 items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPrinted"
              checked={newBook.isPrinted}
              onChange={handleChange}
              className="mr-2"
            />
            Sách in
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isElectronic"
              checked={newBook.isElectronic}
              onChange={handleChange}
              className="mr-2"
            />
            Sách điện tử
          </label>
        </div>

        {/* Printed book details */}
        {newBook.isPrinted && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
            <h4 className="font-medium">Thông tin Sách in</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí kệ *</label>
              <input
                type="text"
                name="shelfLocation"
                value={newBook.shelfLocation}
                onChange={handleChange}
                placeholder="Ví dụ: Kệ A3"
                className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              {errors.shelfLocation && <p className="mt-1 text-sm text-red-500">{errors.shelfLocation}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng bản in *</label>
              <input
                type="number"
                name="totalCopy"
                value={newBook.totalCopy}
                onChange={handleChange}
                min="1"
                className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              {errors.totalCopy && <p className="mt-1 text-sm text-red-500">{errors.totalCopy}</p>}
            </div>
          </div>
        )}

        {/* Ebook details */}
        {newBook.isElectronic && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
            <h4 className="font-medium">Thông tin Sách điện tử</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Định dạng (ví dụ PDF)</label>
              <input
                type="text"
                name="format"
                value={newBook.format}
                onChange={handleChange}
                placeholder="PDF / EPUB / MOBI"
                className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              {errors.format && <p className="mt-1 text-sm text-red-500">{errors.format}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giấy phép</label>
              <input
                type="text"
                name="licence"
                value={newBook.licence}
                onChange={handleChange}
                placeholder="VD: CC-BY, All rights reserved"
                className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              {errors.licence && <p className="mt-1 text-sm text-red-500">{errors.licence}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload file eBook (PDF/EPUB)</label>
              <input
                type="file"
                name="ebookFile"
                accept=".pdf,application/pdf,.epub"
                onChange={handleChange}
                className="mt-1 block w-full text-sm text-gray-500"
              />
              {ebookFileName && <p className="mt-1 text-sm text-gray-600">File: {ebookFileName}</p>}
            </div>
          </div>
        )}

        {errors.submit && <div className="text-red-500 text-center">{errors.submit}</div>}

        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300">
            Hủy
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            {isUpdate ? 'Cập nhật sách' : 'Thêm sách'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManualBookAdd;