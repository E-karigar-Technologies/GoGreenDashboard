import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllCategories, getAllSubCategories, updateSubCategory, deleteSubCategory } from '../../services/apiService';
import useDebounce from '../../hooks/useDebounce';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
const token = localStorage.getItem('token');

export default function useSubcategoryHook() {
  const [allSubcategories, setAllSubcategories] = useState([]); // Store all data in-memory
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter States
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [parentFilter, setParentFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  // Pagination & Sorting
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [sorter, setSorter] = useState({ field: 'name', order: 'ascend' });

  // Categories list for dropdown
  const [categories, setCategories] = useState([]);

  // Modals & form state
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch all categories and subcategories
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, subcatRes] = await Promise.all([
        getAllCategories(),
        getAllSubCategories(),
      ]);
      let subcategories = subcatRes.success ? subcatRes.data || [] : [];
      let cats = catRes.success ? catRes.data || [] : [];

      if (!Array.isArray(subcategories)) subcategories = [];
      if (!Array.isArray(cats)) cats = [];

      subcategories = subcategories.map((sub, idx) => ({
        ...sub,
        sr: idx + 1,
        category_name: cats.find((c) => String(c.id) === String(sub.category_id))?.name || 'General',
      }));

      setAllSubcategories(subcategories);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to fetch subcategories:', err);
      setError(err.message || 'Failed to fetch subcategories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // In-memory filter, search, sort, and paginate
  useEffect(() => {
    let filtered = [...allSubcategories];

    // 1. Search (name or description)
    if (debouncedSearch && debouncedSearch.trim() !== '') {
      const query = debouncedSearch.trim().toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          (sub.name && sub.name.toLowerCase().includes(query)) ||
          (sub.description && sub.description.toLowerCase().includes(query))
      );
    }

    // 2. Parent category filter
    if (parentFilter) {
      filtered = filtered.filter((sub) => String(sub.category_id) === String(parentFilter));
    }

    // 3. Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((sub) => Number(sub.status) === 1);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((sub) => Number(sub.status) !== 1);
    }

    // 4. Sorting
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

    // 5. Pagination
    const total = filtered.length;
    const current = Math.min(pagination.current, Math.max(1, Math.ceil(total / pagination.pageSize))) || 1;
    const paged = filtered.slice((current - 1) * pagination.pageSize, current * pagination.pageSize);

    setData(paged);
    setPagination((prev) => ({
      ...prev,
      current,
      total,
    }));
  }, [allSubcategories, debouncedSearch, parentFilter, statusFilter, sorter, pagination.current, pagination.pageSize]);

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
    setParentFilter(null);
    setStatusFilter('all');
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const isFiltered = useMemo(() => {
    return Boolean(
      (search && search.trim() !== '') ||
      parentFilter ||
      (statusFilter && statusFilter !== 'all')
    );
  }, [search, parentFilter, statusFilter]);

  // Overall metric counts across whole catalog
  const totalSubcategoriesCount = allSubcategories.length;
  const activeSubcategoriesCount = allSubcategories.filter((s) => Number(s.status) === 1).length;
  const inactiveSubcategoriesCount = Math.max(0, totalSubcategoriesCount - activeSubcategoriesCount);

  // Toggle active status
  const handleToggleActive = async (subcategoryId, isActive) => {
    setStatusLoading((prev) => ({ ...prev, [subcategoryId]: true }));
    try {
      const formData = new FormData();
      formData.append('id', subcategoryId);
      formData.append('status', isActive ? 1 : 0);

      await updateSubCategory(formData);
      setAllSubcategories((prev) =>
        prev.map((sub) => (sub.id === subcategoryId ? { ...sub, status: isActive ? 1 : 0 } : sub))
      );
    } catch (err) {
      console.error('Failed to update subcategory status:', err);
      setError('Failed to update status');
    } finally {
      setStatusLoading((prev) => ({ ...prev, [subcategoryId]: false }));
    }
  };

  // Edit modal
  const openEditModal = (subcategory) => {
    setSelectedSubcategory(subcategory);
    const logoUrl = subcategory.subcategory_logo
      ? subcategory.subcategory_logo.startsWith('http')
        ? subcategory.subcategory_logo
        : `${IMAGE_BASE_URL}${subcategory.subcategory_logo}`
      : '';
    setPreviewImage(logoUrl);
    setEditModal(true);
  };

  const closeEditModal = () => {
    setEditModal(false);
    setSelectedSubcategory(null);
    setPreviewImage('');
  };

  // Delete modal
  const openDeleteModal = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteModal(false);
    setSelectedSubcategory(null);
  };

  // Image change for edit modal
  const handleImageChange = (file) => {
    setPreviewImage(URL.createObjectURL(file));
    setSelectedSubcategory((prev) => ({ ...prev, subcategory_logo: file }));
  };

  // Edit save
  const handleEditSave = async (values, fileObj) => {
    setFormLoading(true);
    try {
      if (selectedSubcategory) {
        const formData = new FormData();
        formData.append('id', selectedSubcategory.id);
        formData.append('name', values.name);
        formData.append('description', values.description || '');
        formData.append('category_id', values.category_id);
        formData.append('status', values.status ? 1 : 0);

        if (selectedSubcategory.subcategory_logo instanceof File) {
          formData.append('subcategory_logo', selectedSubcategory.subcategory_logo);
        }

        const result = await updateSubCategory(formData);
        if (result.success && result.data) {
          const parentCat = categories.find((c) => String(c.id) === String(values.category_id));
          const updated = {
            ...result.data,
            category_name: parentCat ? parentCat.name : selectedSubcategory.category_name,
            subcategory_logo: result.data.subcategory_logo
              ? result.data.subcategory_logo.startsWith('http')
                ? result.data.subcategory_logo
                : `${IMAGE_BASE_URL}${result.data.subcategory_logo}`
              : '',
          };
          setAllSubcategories((prev) =>
            prev.map((cat) => (cat?.id === selectedSubcategory?.id ? { ...cat, ...updated } : cat))
          );
        }
        closeEditModal();
      }
    } catch (err) {
      console.error('Failed to update subcategory:', err);
      setError('Failed to update subcategory.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      if (selectedSubcategory) {
        const result = await deleteSubCategory(selectedSubcategory.id);
        if (result.success) {
          setAllSubcategories((prev) => prev.filter((sub) => sub.id !== selectedSubcategory.id));
          closeDeleteModal();
        } else {
          setError(result.error || 'Failed to delete subcategory. Please try again.');
        }
      }
    } catch (err) {
      console.error('Failed to delete subcategory:', err);
      setError('Failed to delete subcategory. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    pagination,
    sorter,
    search,
    setSearch,
    parentFilter,
    setParentFilter,
    statusFilter,
    setStatusFilter,
    handleResetFilters,
    isFiltered,
    totalSubcategoriesCount,
    activeSubcategoriesCount,
    inactiveSubcategoriesCount,
    categories,
    onTableChange,
    handleToggleActive,
    editModal,
    openEditModal,
    closeEditModal,
    selectedSubcategory,
    previewImage,
    handleImageChange,
    formLoading,
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    handleEditSave,
    handleDelete,
    statusLoading,
    deleteLoading,
    fetchAll,
  };
}
