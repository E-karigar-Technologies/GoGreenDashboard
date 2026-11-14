import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  getAllProducts,
  getAllCategories,
  getAllSubCategories,
  productfetchBrands,
  deleteProduct,
  getAllVendors
} from '../../../services/apiService';
import axios from 'axios';
import useDebounce from '../../../hooks/useDebounce';

export default function useProductTable() {
  // Filter States
  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [subCategoryFilter, setSubCategoryFilter] = useState([]);
  const [vendorFilter, setVendorFilter] = useState([]);
  const [isFeaturedFilter, setIsFeaturedFilter] = useState(undefined);
  const [isTodayDealFilter, setIsTodayDealFilter] = useState(undefined);

  // Debounced search to prevent spamming API on every keystroke
  const debouncedSearch = useDebounce(nameFilter, 350);

  // Table Data & Pagination
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sorter, setSorter] = useState({});

  // Modals & form state
  const [show, setShow] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formState, setFormState] = useState({});

  // Dropdown reference data
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorMap, setVendorMap] = useState({});

  // Image preview state
  const [previewImage, setPreviewImage] = useState('');
  const [previewImages, setPreviewImages] = useState([]);

  const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  // Load Categories, Subcategories, Brands & Vendors on mount
  useEffect(() => {
    getAllCategories().then((res) => {
      if (res.success && Array.isArray(res.data)) setCategories(res.data);
    });
    getAllSubCategories().then((res) => {
      if (res.success && Array.isArray(res.data)) setSubCategories(res.data);
    });
    productfetchBrands().then((res) => {
      if (res.success && Array.isArray(res.data)) setBrands(res.data);
    });
    getAllVendors().then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setVendors(res.data);
        const map = {};
        res.data.forEach((v) => {
          const vId = v.vendor_id || v.id || v._id;
          const vName = v.store_name || v.name || v.vendor_name;
          if (vId && vName) map[vId] = vName;
        });
        setVendorMap(map);
      }
    });
  }, []);

  // Fetch data using the proper Query API
  const fetchData = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const page = params.pagination?.current || pagination.current;
        const limit = params.pagination?.pageSize || pagination.pageSize;
        const currentSorter = params.sorter || sorter;

        const queryPayload = {
          page,
          limit,
          productname: debouncedSearch && debouncedSearch.trim() !== '' ? debouncedSearch.trim() : undefined,
          search_string: debouncedSearch && debouncedSearch.trim() !== '' ? debouncedSearch.trim() : undefined,
          category: categoryFilter && categoryFilter.length > 0 ? categoryFilter : undefined,
          category_id: categoryFilter && categoryFilter.length > 0 ? categoryFilter : undefined,
          subcategory: subCategoryFilter && subCategoryFilter.length > 0 ? subCategoryFilter : undefined,
          sub_category: subCategoryFilter && subCategoryFilter.length > 0 ? subCategoryFilter : undefined,
          vendor: vendorFilter && vendorFilter.length > 0 ? vendorFilter : undefined,
          vendor_id: vendorFilter && vendorFilter.length > 0 ? vendorFilter : undefined,
          is_featured:
            isFeaturedFilter !== undefined && isFeaturedFilter !== null && isFeaturedFilter !== ''
              ? Number(isFeaturedFilter)
              : undefined,
          is_today_deal:
            isTodayDealFilter !== undefined && isTodayDealFilter !== null && isTodayDealFilter !== ''
              ? Number(isTodayDealFilter)
              : undefined,
          sortField: currentSorter?.field,
          sortOrder: currentSorter?.order,
        };

        const response = await getAllProducts(queryPayload);

        if (response.success) {
          const productsList = response.data?.products || (Array.isArray(response.data) ? response.data : []);
          const totalCount = response.data?.total ?? response.data?.meta?.total ?? productsList.length;

          setData(productsList);
          setPagination((prev) => ({
            ...prev,
            current: page,
            pageSize: limit,
            total: totalCount,
          }));
        } else {
          setData([]);
          setError(response.error || 'Failed to load products');
        }
      } catch (err) {
        console.error('Error in fetchData products:', err);
        setError(err.message || 'Error occurred while loading products');
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [
      debouncedSearch,
      categoryFilter,
      subCategoryFilter,
      vendorFilter,
      isFeaturedFilter,
      isTodayDealFilter,
      pagination.current,
      pagination.pageSize,
      sorter,
    ]
  );

  // Trigger query API when filters or search change
  useEffect(() => {
    fetchData({ pagination: { ...pagination, current: 1 } });
  }, [debouncedSearch, categoryFilter, subCategoryFilter, vendorFilter, isFeaturedFilter, isTodayDealFilter]);

  // Handle table pagination and sorting changes
  const onTableChange = (newPagination, tableFilters, newSorter) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
    setSorter(newSorter || {});
    fetchData({
      pagination: newPagination,
      sorter: newSorter,
    });
  };

  // Modal logic
  const handleUpdate = (user) => {
    setSelectedUser(user);
    setFormState(user);
    if (user && user.featured_image) {
      setPreviewImage(BASE_URL + user.featured_image);
    } else {
      setPreviewImage('');
    }
    if (user && Array.isArray(user.gallery_images)) {
      const galleryPreviews = user.gallery_images.map((img) => {
        if (typeof img === 'string') return BASE_URL + img;
        if (img && img.image_path) return BASE_URL + img.image_path;
        return '';
      });
      setPreviewImages(galleryPreviews);
    } else {
      setPreviewImages([]);
    }
    setShow(true);
  };

  const handleDelete = (user) => {
    setSelectedUserId(user.id);
    setShowDeleteModal(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedUser(null);
    setFormState({});
    setPreviewImage('');
    setPreviewImages([]);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedUserId(null);
  };

  // Update product handler
  const handleSave = async () => {
    try {
      if (!token) return;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const formData = new FormData();
      Object.entries(formState).forEach(([key, value]) => {
        if (
          key !== 'featured_image' &&
          key !== 'gallery_images' &&
          key !== 'attributes' &&
          key !== 'variants' &&
          key !== 'addons' &&
          value !== undefined &&
          value !== null
        ) {
          formData.append(key, value);
        }
      });

      if (formState.featured_image && typeof formState.featured_image !== 'string') {
        formData.append('featured_image', formState.featured_image);
      }
      if (Array.isArray(formState.gallery_images)) {
        formState.gallery_images.forEach((img) => {
          if (typeof img !== 'string') {
            formData.append('gallery_images', img);
          }
        });
      }

      await axios.post(`${API_URL}/products/update-products`, formData, config);
      handleClose();
      fetchData({ pagination, sorter });
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  // Delete product handler
  const confirmDelete = async () => {
    try {
      if (!token) return;
      const response = await deleteProduct([selectedUserId]);
      if (response.data?.success || response.success) {
        handleCloseDeleteModal();
        fetchData({ pagination, sorter });
      } else {
        alert('Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error deleting product');
    }
  };

  // Form change handler
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // Image handlers
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setFormState((prev) => ({ ...prev, featured_image: file }));
    }
  };

  const handleGalleryImagesChange = (event) => {
    const files = Array.from(event.target.files);
    const currentGallery = formState.gallery_images || [];
    const totalImages = currentGallery.length + files.length;
    if (totalImages > 5) {
      const allowedFiles = files.slice(0, 5 - currentGallery.length);
      const imageUrls = allowedFiles.map((file) => URL.createObjectURL(file));
      setPreviewImages((prev) => [...prev, ...imageUrls].slice(0, 5));
      setFormState((prev) => ({
        ...prev,
        gallery_images: [...currentGallery, ...allowedFiles].slice(0, 5),
      }));
    } else {
      const imageUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewImages((prev) => [...prev, ...imageUrls]);
      setFormState((prev) => ({
        ...prev,
        gallery_images: [...currentGallery, ...files],
      }));
    }
  };

  const handleDeleteFeaturedImage = () => {
    setFormState((prev) => ({ ...prev, featured_image: null }));
    setPreviewImage('');
  };

  const handleDeleteGalleryImage = (index) => {
    setFormState((prev) => {
      const updated = [...(prev.gallery_images || [])];
      updated.splice(index, 1);
      return { ...prev, gallery_images: updated };
    });
    setPreviewImages((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  // Toggle Featured status
  const handleToggleFeatured = async (productId, isChecked) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    const payload = {
      id: productId,
      is_featured: isChecked ? 1 : 0,
    };
    try {
      // Optimistic update
      setData((prevData) =>
        prevData.map((p) => (p.id === productId ? { ...p, is_featured: isChecked ? 1 : 0 } : p))
      );
      await axios.put(`${API_URL}/products/makeproductfeatures`, payload, config);
    } catch (error) {
      console.error('Error updating featured status:', error.response?.data || error);
      fetchData({ pagination, sorter });
    }
  };

  // Toggle Today's Deal status
  const handleToggleTodayDeal = async (productId, isChecked) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    const payload = {
      id: productId,
      is_today_deal: isChecked ? 1 : 0,
    };
    try {
      // Optimistic update
      setData((prevData) =>
        prevData.map((p) => (p.id === productId ? { ...p, is_today_deal: isChecked ? 1 : 0 } : p))
      );
      await axios.put(`${API_URL}/products/makeproductweeklydeal`, payload, config);
    } catch (error) {
      console.error("Error updating today's deal status:", error.response?.data || error);
      fetchData({ pagination, sorter });
    }
  };

  return {
    // Filters and their setters
    nameFilter,
    setNameFilter,
    categoryFilter,
    setCategoryFilter,
    subCategoryFilter,
    setSubCategoryFilter,
    vendorFilter,
    setVendorFilter,
    isFeaturedFilter,
    setIsFeaturedFilter,
    isTodayDealFilter,
    setIsTodayDealFilter,
    // Data and table logic
    data,
    loading,
    pagination,
    onTableChange,
    error,
    refetch: () => fetchData({ pagination, sorter }),
    // Modal and form logic
    show,
    selectedUser,
    showDeleteModal,
    formState,
    categories,
    brands,
    subCategories,
    vendors,
    vendorMap,
    previewImage,
    previewImages,
    handleUpdate,
    handleDelete,
    handleClose,
    handleCloseDeleteModal,
    handleSave,
    confirmDelete,
    handleFormChange,
    handleImageChange,
    handleGalleryImagesChange,
    handleDeleteFeaturedImage,
    handleDeleteGalleryImage,
    handleToggleFeatured,
    handleToggleTodayDeal,
  };
}
