import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllCategories, deletecategory, updateCategory, updateCategoryStatus } from '../../services/apiService';
import useDebounce from '../../hooks/useDebounce';

export default function useCatagoryHook() {
  const [allCategories, setAllCategories] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter States
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  // Table pagination & sorter
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [sorter, setSorter] = useState({ field: 'sr', order: 'ascend' });

  // Modals & form state
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Fetch all categories from backend
  const fetchAllCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllCategories();
      let categories = response.success ? response.data || response : [];
      if (!Array.isArray(categories)) {
        categories = [];
      }
      categories = categories.map((cat, idx) => ({ ...cat, sr: idx + 1 }));
      setAllCategories(categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  // Apply in-memory search, filter, sorting, and pagination
  useEffect(() => {
    let filtered = [...allCategories];

    // 1. Search keyword (name or description)
    if (debouncedSearch && debouncedSearch.trim() !== '') {
      const query = debouncedSearch.trim().toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          (cat.name && cat.name.toLowerCase().includes(query)) ||
          (cat.description && cat.description.toLowerCase().includes(query))
      );
    }

    // 2. Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((cat) => Number(cat.status) === 1);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((cat) => Number(cat.status) !== 1);
    }

    // 3. Sorting
    if (sorter && sorter.field && sorter.order) {
      const { field, order } = sorter;
      filtered.sort((a, b) => {
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        if (typeof valA === 'string' && typeof valB === 'string') {
          return order === 'descend' ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        return order === 'descend' ? (valB > valA ? 1 : -1) : (valA > valB ? 1 : -1);
      });
    }

    const total = filtered.length;
    const current = Math.min(pagination.current, Math.max(1, Math.ceil(total / pagination.pageSize))) || 1;
    const paged = filtered.slice((current - 1) * pagination.pageSize, current * pagination.pageSize);

    setData(paged);
    setPagination((prev) => ({
      ...prev,
      current,
      total,
    }));
  }, [allCategories, debouncedSearch, statusFilter, sorter, pagination.current, pagination.pageSize]);

  const onTableChange = (newPagination, filters, newSorter) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
    if (newSorter && newSorter.field) {
      setSorter(newSorter);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const isFiltered = useMemo(() => {
    return Boolean((search && search.trim() !== '') || (statusFilter && statusFilter !== 'all'));
  }, [search, statusFilter]);

  // Overall metric counts across the entire catalog
  const totalCategoriesCount = allCategories.length;
  const activeCategoriesCount = allCategories.filter((c) => Number(c.status) === 1).length;
  const inactiveCategoriesCount = Math.max(0, totalCategoriesCount - activeCategoriesCount);

  // Toggle active status
  const handleToggleActive = async (categoryId, isActive) => {
    setLoading(true);
    try {
      const res = await updateCategoryStatus(categoryId, isActive);
      const newStatus = res?.data?.category?.status ?? (isActive ? 1 : 0);

      setAllCategories((prev) =>
        prev.map((cat) => (cat.id === categoryId ? { ...cat, status: newStatus } : cat))
      );
      setData((prev) =>
        prev.map((cat) => (cat.id === categoryId ? { ...cat, status: newStatus } : cat))
      );
    } catch (err) {
      console.error('Failed to update category status:', err);
      setError('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // Edit modal
  const openEditModal = (category) => {
    setSelectedCategory(category);
    setPreviewImage(
      category.category_logo
        ? category.category_logo.startsWith('http')
          ? category.category_logo
          : `${import.meta.env.VITE_IMAGE_BASE_URL}${category.category_logo}`
        : ''
    );
    setEditModal(true);
  };

  const closeEditModal = () => {
    setEditModal(false);
    setSelectedCategory(null);
    setPreviewImage('');
  };

  const handleSave = async (formValues) => {
    setFormLoading(true);
    try {
      const updatedCategory = {
        ...selectedCategory,
        ...formValues,
        category_logo: selectedCategory.category_logo,
      };
      const result = await updateCategory(updatedCategory);
      if (result.success && result.data) {
        setAllCategories((prev) =>
          prev.map((cat) => (cat.id === result.data.id ? { ...cat, ...result.data } : cat))
        );
        setData((prev) =>
          prev.map((cat) => (cat.id === result.data.id ? { ...cat, ...result.data } : cat))
        );
        closeEditModal();
        setPreviewImage('');
      } else {
        setError(result.error || 'Failed to update category');
      }
    } catch (err) {
      console.error('Failed to update category:', err);
      setError('Failed to update category');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete modal
  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteModal(false);
    setSelectedCategory(null);
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      if (selectedCategory) {
        await deletecategory(selectedCategory.id);
        setAllCategories((prev) => prev.filter((cat) => cat.id !== selectedCategory.id));
        setData((prev) => prev.filter((cat) => cat.id !== selectedCategory.id));
        closeDeleteModal();
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError('Failed to delete category');
    } finally {
      setFormLoading(false);
    }
  };

  // Image change for edit modal
  const handleImageChange = (file) => {
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setSelectedCategory((prev) => ({ ...prev, category_logo: file }));
    } else {
      setPreviewImage('');
      setSelectedCategory((prev) => ({ ...prev, category_logo: null }));
    }
  };

  return {
    data,
    loading,
    error,
    pagination,
    sorter,
    onTableChange,
    handleToggleActive,
    editModal,
    openEditModal,
    closeEditModal,
    selectedCategory,
    previewImage,
    handleImageChange,
    handleSave,
    formLoading,
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    handleResetFilters,
    isFiltered,
    totalCategoriesCount,
    activeCategoriesCount,
    inactiveCategoriesCount,
    fetchAllCategories,
  };
}
