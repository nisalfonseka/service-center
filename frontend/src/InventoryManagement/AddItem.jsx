import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ManagerHeader from '../InventoryManagement/managerHeader';

const AddItemForm = () => {
  const [categories, setCategories] = useState([]);
  const [item, setItem] = useState({
    name: '',
    code: '',
    companyName: '',
    description: '',
    qty: 0,
    buyingPrice: 0,
    price: 0,
    category: '',
    photo: null,
  });
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5555/categories');
        setCategories(response.data);
      } catch (error) {
        setError('Failed to fetch categories. Please refresh or try again later.');
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs specially to prevent negative values
    if ((name === 'price' || name === 'qty' || name === 'buyingPrice') && Number(value) < 0) {
      return; // Don't update if trying to set a negative value
    }
    
    setItem((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      
      setItem((prev) => ({
        ...prev,
        photo: file,
      }));
      setErrors((prev) => ({ ...prev, photo: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
  
    if (!item.name.trim()) newErrors.name = 'Name is required';
    else if (item.name.length < 3) newErrors.name = 'Name must be at least 3 characters long';
    
    if (!item.code.trim()) newErrors.code = 'Code is required';
    else if (item.code.length < 3) newErrors.code = 'Code must be at least 3 characters long';
    
    if (!item.companyName?.trim()) newErrors.companyName = 'Company name is required';
    
    if (!item.description.trim()) newErrors.description = 'Description is required';
    
    if (item.qty <= 0) newErrors.qty = 'Quantity must be greater than 0';
    
    if (item.buyingPrice <= 0) newErrors.buyingPrice = 'Buying Price must be greater than 0';
    
    if (item.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (Number(item.price) <= Number(item.buyingPrice)) 
      newErrors.price = 'Price must be higher than Buying Price';
    
    if (!item.category) newErrors.category = 'Please select a category';
    
    if (!item.photo) {
      newErrors.photo = 'Product image is required';
    } else if (item.photo.size > 2097152) { // 2MB limit
      newErrors.photo = 'Photo size should not exceed 2MB';
    } else if (!/\.(jpg|jpeg|png|webp)$/i.test(item.photo.name)) {
      newErrors.photo = 'Photo must be in JPG, JPEG, PNG, or WEBP format';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    const formData = new FormData();
    
    Object.entries(item).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      await axios.post('http://localhost:5555/inventory', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(true);
      
      // Show success message before redirecting
      setTimeout(() => {
        navigate('/dashboard/senura');
      }, 1500);
    } catch (error) {
      setError('Failed to add item. Please check your connection and try again.');
      console.error('Error adding item:', error);
      setLoading(false);
    }
  };

  return (
    <div className='flex'>
      <ManagerHeader />
      <div className="flex-1 relative min-h-screen">
        {/* Dynamic Background */}
        <div className="fixed inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: "url('/images/inventory-bg.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-red-900/50 to-gray-900/80 backdrop-blur-sm"/>
          <div className="absolute inset-0 bg-grid-pattern opacity-20"/>
          
          {/* Animated Particles for Visual Interest */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i}
                className="absolute rounded-full bg-white/20 animate-float"
                style={{
                  width: `${Math.random() * 10 + 3}px`,
                  height: `${Math.random() * 10 + 3}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 10 + 15}s`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-orange-300 to-rose-500 animate-shine">
              Create New Inventory Item
            </h1>
            <p className="text-gray-200 mt-2 max-w-2xl mx-auto">
              Add your new product details below to keep your inventory up-to-date and organized
            </p>
          </div>

          {error && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-fade-in">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg animate-fade-in">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-700 font-medium">Item added successfully! Redirecting...</p>
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200/20">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="name">
                        Item Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={item.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 ${
                          errors.name ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Enter item name"
                        required
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="code">
                        Item Code
                      </label>
                      <input
                        type="text"
                        id="code"
                        name="code"
                        value={item.code}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 ${
                          errors.code ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Enter item code"
                        required
                      />
                      {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="companyName">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={item.companyName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 ${
                          errors.companyName ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Enter company name"
                        required
                      />
                      {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="price">
                        Selling Price (LKR)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">LKR</span>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          value={item.price}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 ${
                            errors.price ? 'border-red-500' : 'border-gray-200'
                          }`}
                          placeholder="0.00"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="buyingPrice">
                        Buying Price (LKR)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">LKR</span>
                        <input
                          type="number"
                          id="buyingPrice"
                          name="buyingPrice"
                          value={item.buyingPrice}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 ${
                            errors.buyingPrice ? 'border-red-500' : 'border-gray-200'
                          }`}
                          placeholder="0.00"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {errors.buyingPrice && <p className="text-red-500 text-sm mt-1">{errors.buyingPrice}</p>}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="qty">
                        Quantity in Stock
                      </label>
                      <input
                        type="number"
                        id="qty"
                        name="qty"
                        value={item.qty}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 ${
                          errors.qty ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Enter quantity"
                        required
                        min="0"
                      />
                      {errors.qty && <p className="text-red-500 text-sm mt-1">{errors.qty}</p>}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="category">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={item.category}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 ${
                          errors.category ? 'border-red-500' : 'border-gray-200'
                        }`}
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Image
                      </label>
                      <div className="flex flex-col items-center space-y-2">
                        {preview ? (
                          <div className="relative w-full h-32 overflow-hidden rounded-lg">
                            <img src={preview} alt="Product preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setPreview(null);
                                setItem(prev => ({ ...prev, photo: null }));
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="w-full">
                            <label className="flex flex-col w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-200">
                              <div className="flex flex-col items-center justify-center pt-7">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                                  Select a product image
                                </p>
                              </div>
                              <input 
                                type="file" 
                                id="photo"
                                name="photo"
                                className="opacity-0"
                                accept="image/*"
                                onChange={handleFileChange}
                                required
                              />
                            </label>
                          </div>
                        )}
                        {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Width Fields */}
                <div className="space-y-6">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="description">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={item.description}
                      onChange={handleChange}
                      rows="4"
                      className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 ${
                        errors.description ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Enter detailed item description"
                      required
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || success}
                      className={`px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg 
                        hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200
                        flex items-center ${(loading || success) ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : success ? (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Added!
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Add Item
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemForm;