import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  productfetchBrands,
  getAllCategories,
  updateProductBrand,
  deleteProductBrand
} from '../../services/apiService';
import useDebounce from '../../hooks/useDebounce';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function useBrandHook() {
  const [rawBrands, setRawBrands] = useState([]);
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter States
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  // Table pagination & sorter
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [sorter, setSorter] = useState({ field: 'name', order: 'ascend' });

  // Modals & form state
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Fetch all brands and categories from backend
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, brandRes] = await Promise.all([
        getAllCategories(),
        productfetchBrands(),
      ]);

      const cats = catRes.success && Array.isArray(catRes.data) ? catRes.data : [];
      let brands = brandRes.success && Array.isArray(brandRes.data) ? brandRes.data : [];

      // Link category_name to each brand
      const categoryMap = {};
      cats.forEach((c) => {
        if (c.id) categoryMap[c.id] = c.name;
      });

      brands = brands.map((brand) => ({
        ...brand,
        category_name: brand.category_name || categoryMap[brand.categoryid] || 'General',
      }));

      setCategories(cats);
      setRawBrands(brands);
    } catch (err) {
      console.error('Failed to fetch brands:', err);
      setError(err.message || 'Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Apply filters, sorting, and pagination
  useEffect(() => {
    let filtered = [...rawBrands];

    // 1. Search filter (brand name, description, category)
    if (debouncedSearch && debouncedSearch.trim() !== '') {
      const query = debouncedSearch.trim().toLowerCase();
      filtered = filtered.filter(
        (b) =>
          (b.name && b.name.toLowerCase().includes(query)) ||
          (b.description && b.description.toLowerCase().includes(query)) ||
          (b.category_name && b.category_name.toLowerCase().includes(query))
      );
    }

    // 2. Category filter
    if (categoryFilter) {
      filtered = filtered.filter((b) => String(b.categoryid) === String(categoryFilter));
    }

    // 3. Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((b) => Number(b.status) === 1);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((b) => Number(b.status) === 0);
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

    const total = filtered.length;
    const current = Math.min(pagination.current, Math.max(1, Math.ceil(total / pagination.pageSize))) || 1;
    const paged = filtered.slice((current - 1) * pagination.pageSize, current * pagination.pageSize);

    setData(paged);
    setPagination((prev) => ({
      ...prev,
      current,
      total,
    }));
  }, [rawBrands, debouncedSearch, categoryFilter, statusFilter, sorter, pagination.current, pagination.pageSize]);

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
    setCategoryFilter('');
    setStatusFilter('all');
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const isFiltered = useMemo(() => {
    return Boolean((search && search.trim() !== '') || categoryFilter || (statusFilter && statusFilter !== 'all'));
  }, [search, categoryFilter, statusFilter]);

  // Overall metric counts across the entire catalog
  const totalBrandsCount = rawBrands.length;
  const activeBrandsCount = rawBrands.filter((b) => Number(b.status) === 1).length;
  const inactiveBrandsCount = Math.max(0, totalBrandsCount - activeBrandsCount);

  // Edit modal
  const openEditModal = (brand) => {
    setSelectedBrand(brand);
    setPreviewImage(brand.brand_logo ? (brand.brand_logo.startsWith('http') ? brand.brand_logo : `${IMAGE_BASE_URL}${brand.brand_logo}`) : '');
    setEditModal(true);
  };

  const closeEditModal = () => {
    setEditModal(false);
    setSelectedBrand(null);
    setPreviewImage('');
  };

  // Delete modal
  const openDeleteModal = (brand) => {
    setSelectedBrand(brand);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteModal(false);
    setSelectedBrand(null);
  };

  // Image change for edit modal
  const handleImageChange = (file) => {
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setSelectedBrand((prev) => ({ ...prev, brand_logo: file }));
    } else {
      setPreviewImage('');
      setSelectedBrand((prev) => ({ ...prev, brand_logo: null }));
    }
  };

  // Quick toggle brand status
  const updateStatus = async (brandId, isActive) => {
    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', brandId);
      formData.append('status', isActive ? 1 : 0);
      const response = await updateProductBrand(formData);
      if (response.success) {
        setRawBrands((prev) =>
          prev.map((b) => (b.id === brandId ? { ...b, status: isActive ? 1 : 0 } : b))
        );
      }
    } catch (err) {
      console.error('Failed to update brand status:', err);
      setError('Failed to update brand status.');
    } finally {
      setFormLoading(false);
    }
  };

  // Edit save
  const handleEditSave = async (values, fileObj) => {
    setFormLoading(true);
    try {
      if (selectedBrand) {
        const formData = new FormData();
        formData.append('id', selectedBrand.id);
        formData.append('name', values.name);
        formData.append('description', values.description || '');
        formData.append('categoryid', values.categoryid);
        formData.append('status', values.status ? 1 : 0);

        if (fileObj instanceof File) {
          formData.append('brand_logo', fileObj);
        } else if (selectedBrand.brand_logo instanceof File) {
          formData.append('brand_logo', selectedBrand.brand_logo);
        }

        const response = await updateProductBrand(formData);
        if (response.success) {
          const updatedCatName = categories.find((c) => c.id === values.categoryid)?.name || 'General';
          const returnedBrand = response.data?.productBrand || {};

          setRawBrands((prev) =>
            prev.map((b) =>
              b.id === selectedBrand.id
                ? {
                    ...b,
                    ...values,
                    status: values.status ? 1 : 0,
                    category_name: updatedCatName,
                    brand_logo: returnedBrand.brand_logo || b.brand_logo,
                  }
                : b
            )
          );
          closeEditModal();
        } else {
          setError(response.message || 'Failed to update brand.');
        }
      }
    } catch (err) {
      console.error('Failed to update brand:', err);
      setError('Failed to update brand.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete brand
  const handleDelete = async () => {
    setFormLoading(true);
    try {
      if (selectedBrand) {
        await deleteProductBrand(selectedBrand.id);
        setRawBrands((prev) => prev.filter((b) => b.id !== selectedBrand.id));
        closeDeleteModal();
      }
    } catch (err) {
      console.error('Failed to delete brand:', err);
      setError('Failed to delete brand. Please try again.');
    } finally {
      setFormLoading(false);
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
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    handleResetFilters,
    isFiltered,
    totalBrandsCount,
    activeBrandsCount,
    inactiveBrandsCount,
    categories,
    onTableChange,
    fetchAllData,
    editModal,
    openEditModal,
    closeEditModal,
    selectedBrand,
    previewImage,
    handleImageChange,
    formLoading,
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    handleEditSave,
    handleDelete,
    updateStatus,
  };
}
