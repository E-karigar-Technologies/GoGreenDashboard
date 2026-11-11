// import axios from "axios";
// import axios from "axios";
import { jwtDecode } from "jwt-decode";
import axios from "./axiosInstanse";
import rawAxios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

// const axios = api.create({
//     baseURL: API_URL,
// });
const token = localStorage.getItem("token");
const config = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token") || token}`,
    "Content-Type": "application/json",  // ✅ Use JSON instead of multipart/form-data
  },
};
const configwithform = {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data", // ✅ Ensure correct content type
  },
};

// ✅ Axios instance for cleaner API calls
// const axios = axios.create({
//     baseURL: API_URL,
//     headers: {
//         "Content-Type": "application/json",
//     },
// });

// ✅ Fetch all categories
export const getAllCategories = async () => {
  try {
    const response = await axios.post("/category/fetch-categories", {
      is_web: true
    }, config);

    return { success: true, data: response.data.categories || [] };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return { success: false, error: error.response?.data || "Something went wrong" };
  }
};

export const getAllActiveCategories = async () => {
  try {
    const response = await axios.post("/category/fetch-categories/active", {
      is_web: true
    }, config);

    return { success: true, data: response.data.categories || [] };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return { success: false, error: error.response?.data || "Something went wrong" };
  }
};


export const getAllSubCategoriesbyID = async (catID) => {
  try {
    const response = await axios.post("/subcategory/subcategoriesbycatID", { catID }, config);
    return { success: true, data: response.data.subcategories || [] };
  } catch (error) {
    console.error("Failed to fetch subcategories:", error);
    return { success: false, error: error.response?.data || "Something went wrong" };
  }
};
export const getAllSubCategories = async (catID) => {
  try {
    const response = await axios.post("/subcategory/fetch-subcategories", {
      is_web: true
    }, config);
    return { success: true, data: response.data.subcategories || [] };
  } catch (error) {
    console.error("Failed to fetch subcategories:", error);
    return { success: false, error: error.response?.data || "Something went wrong" };
  }
};
export const getAllProducts = async () => {
  try {
    const response = await axios.post("/products/getproducts", {}, config);

    return { success: true, data: response.data?.products || [] };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { success: false, error: error.response?.data || "Something went wrong" };
  }
};


// ✅ Update a product
export const updateProduct = async (formData) => {
  try {

    const response = await axios.post(`/products/update-products`, formData, configwithform);
    return { success: response.data.success !== undefined ? response.data.success : true, data: response.data };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: error.response?.data || error.message };
  }
};

// ✅ Add a new product brand
export const addProductBrand = async (formData) => {
  try {

    const response = await axios.post("/productbrands/product-brands", formData, configwithform);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to add product brand:", error);
    return { success: false, error: error.response?.data || "Failed to add product brand" };
  }
};

// ✅ Update a product brand
export const updateProductBrand = async (formData) => {
  try {
    const response = await axios.put("/productbrands/product-brands", formData, configwithform);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to update product brand:", error);
    return { success: false, error: error.response?.data || error.message };
  }
};

// ✅ Delete a product brand
export const deleteProductBrand = async (id) => {
  try {
    const response = await axios.delete(`/productbrands/product-brands`, {
      ...config,
      data: { id },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to delete product brand:", error);
    return { success: false, error: error.response?.data || error.message };
  }
};

// update category divs
export const saveproductCategories = async (category, index) => {
  try {

    const payload = { category, index };  // ✅ Send both values inside an object

    const response = await axios.put("/dynamiccat/save-categories", payload, config);
    return response.data;
  } catch (error) {
    console.error("Failed to update category", error);
    throw error;  // ✅ Throw error to handle it in `handleSaveCategory`
  }
};

// fetch product brands
export const productfetchBrands = async () => {
  try {
    const response = await axios.get("/productbrands/allproduct-brands", configwithform);
    console.log("brands", response.data.productBrands)
    return { success: true, data: response.data.productBrands || [] };
  } catch (err) {
    setError("Failed to fetch brands.");
  }
};

export const getShowSelectedCategory = async (index) => {
  try {
    const response = await axios.post("/dynamiccat/showselectedcategory", { index }, config);
    return { success: true, data: response.data.products };
  } catch (error) {
    console.error("Failed to fetch selected category:", error);
    return { success: false, error: error.response?.data || "Something went wrong" };
  }
};

export const addBanner = async (formData) => {
  try {
    const response = await axios.post("/banners/app-banners", formData, configwithform);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to add banner:", error);
    return { success: false, error: error?.response?.data || "Failed to add banner" };
  }
};

export const addCategory = async (formData) => {
  try {
    const response = await axios.post(`/category/categories`, formData, configwithform);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const getAllBanners = async () => {
  try {
    const response = await axios.get("/banners/app-banners", config);
    return { success: true, data: response.data.banners };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { success: false, error: error.response?.data || "Something went wrong" };
  }
};

export const deleteBanner = async (bannerId) => {

  try {
    if (!bannerId) throw new Error("Banner ID is required");

    await axios.delete(`/banners/app-banners`, {
      ...config,
      data: { id: bannerId }, // ✅ Proper way to pass data in DELETE request
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting banner:", error);
    return { success: false, message: error.response?.data?.message || "Failed to delete banner" };
  }
};

export const deletecategory = async (categoryID) => {
  console.log("id", categoryID)
  try {
    if (!categoryID) throw new Error("Category ID is required");

    await axios.delete(`/category/categories`, {
      ...config,
      data: { id: categoryID }, // ✅ Proper way to pass data in DELETE request
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting banner:", error);
    return { success: false, message: error.response?.data?.message || "Failed to delete banner" };
  }
};

export const updateBanner = async (payload) => {
  try {
    let formData;
    if (payload instanceof FormData) {
      formData = payload;
    } else {
      formData = new FormData();
      if (!payload || !payload.id) throw new Error("Missing banner id");
      formData.append("id", payload.id);
      if (payload.title !== undefined) formData.append("title", payload.title);
      if (payload.status !== undefined) {
        const statusVal = typeof payload.status === 'boolean' ? (payload.status ? 1 : 0) : payload.status;
        formData.append("status", statusVal);
      }
      if (payload.image_url instanceof File) {
        formData.append("banner_image", payload.image_url);
      }
    }

    const response = await axios.put(`/banners/app-banners`, formData, configwithform);

    return { success: true, data: response.data.banner };
  } catch (err) {
    console.error("Update failed:", err.response?.data || err.message);
    throw err;
  }
};
export const updateCategory = async (selectedCategory) => {
  try {
    const formData = new FormData();
    formData.append("id", selectedCategory.id);
    formData.append("name", selectedCategory.name);
    formData.append("description", selectedCategory.description);
    formData.append("status", selectedCategory.status);

    if (selectedCategory.category_logo instanceof File) {
      formData.append("category_logo", selectedCategory.category_logo); // New image
    } else if (selectedCategory.category_logo) {
      formData.append("existing_category_logo", selectedCategory.category_logo); // Retain existing image
    }

    const response = await axios.put(`/category/categories`, formData, configwithform);
    return { success: true, data: response.data.category };
  } catch (err) {
    console.error("Update failed:", err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
};
export const getAllUnverifiedUsers = async (params = {}) => {
  try {
    const currentToken = localStorage.getItem("token") || token;
    const requestConfig = {
      headers: {
        Authorization: `Bearer ${currentToken}`,
        "Content-Type": "application/json",
      },
      params: {},
    };

    if (params?.sort) {
      requestConfig.params.sort = params.sort;
    }
    if (params?.search && String(params.search).trim()) {
      requestConfig.params.search = String(params.search).trim();
    }
    if (params?.date) {
      requestConfig.params.date = params.date;
    }
    if (params?.startDate) {
      requestConfig.params.startDate = params.startDate;
    }
    if (params?.endDate) {
      requestConfig.params.endDate = params.endDate;
    }

    const response = await axios.get(`/users/unverifiedUsers`, requestConfig);
    return {
      success: true,
      vendors: response.data?.vendors || [],
      delivery_partners: response.data?.delivery_partners || [],
      customers: response.data?.customers || [],
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching unverified users:", error);
    return {
      success: false,
      data: [],
      vendors: [],
      delivery_partners: [],
      customers: [],
      error: error.response?.data || error.message,
    };
  }
};

export const verifyUser = async (userId, verification_status) => {
  try {
    const response = await axios.put(
      `/users/verify-user`,
      { userId, verification_status },
      config
    );
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Verification failed:", error);
    return { success: false };
  }
};

export const getAllDiscounts = async () => {
  try {
    const response = await axios.get("/productdiscount/get-discounts", config); // remove empty object; only config needed
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch discounts:", error);
    return { success: false, error: error.response?.data || "Something went wrong" };
  }
};


export const saveOrUpdateDiscount = async (selected) => {
  try {

    const formData = new FormData();
    Object.entries(selected).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const url = selected.id
      ? `/productdiscount/update-discount`
      : `/productdiscount/add-update-discount`;

    const method = selected.id ? "put" : "post";

    const res = await axios[method](url, formData, config);
    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data || err.message,
    };
  }
};


//   Delete a product discount
export const deleteDiscount = async (discount_id) => {
  try {
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: { discount_id }, // 👈 send id in request body
    };

    await axios.delete(`/productdiscount/delete-discount`, config);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.response?.data || err.message };
  }
};

export const updateSubCategory = async (formData) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "multipart/form-data",
      },
    };
    const response = await axios.put(`/subcategory/subcategories`, formData, config);
    return { success: true, data: response.data.subcategories };
  } catch (err) {
    return { success: false, error: err.response?.data || err.message };
  }
};

export const deleteSubCategory = async (subcategoryId) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      data: { id: subcategoryId },
    };
    await axios.delete(`/subcategory/subcategories`, config);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.response?.data || err.message };
  }
};

// Toggle subcategory status (only id and status as FormData)
export const updateCategoryStatus = async (categoryId, status) => {
  try {
    const formData = new FormData();
    formData.append('id', categoryId);
    formData.append('status', status);
    const response = await axios.put(`/category/categories`, formData, configwithform);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const addProduct = async (formData) => {
  try {

    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "multipart/form-data",
      },
    };
    const response = await axios.post(`/products/products`, formData, config);
    return { success: true, data: response.data };
  } catch (error) {
    console.log(error);

    return { success: false, error: error.response?.data || error.message };
  }
};



export const getProductById = async (id) => {
  try {
    const response = await axios.post(`/products/productbyid`, { id }, config);
    return response.data;
  } catch (error) {
    return { success: false, message: error.message, data: [] };
  }
};

export const getAllVendors = async (params = {}) => {
  try {
    let query = '';
    if (typeof params === 'boolean') {
      query = params ? '?filter=active' : '';
    } else if (typeof params === 'string') {
      query = params ? (params.startsWith('?') ? params : `?${params}`) : '';
    } else if (params && typeof params === 'object') {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, val);
        }
      });
      const qs = searchParams.toString();
      if (qs) query = `?${qs}`;
    }
    const response = await axios.get(`/vendors/getallvendorsforadmin${query}`, config);
    return response.data;
  } catch (error) {
    return { success: false, message: error.message, data: [] };
  }
};

export const getVendorById = async (id) => {
  try {
    const response = await axios.get(`/vendors/getallvendorsforadminbyID/${id}`, config);
    return response.data;
  } catch (error) {
    return { success: false, message: error.message, data: null };
  }
};

export const getAllRiders = async (params = {}) => {
  try {
    let query = '';
    if (typeof params === 'boolean') {
      query = params ? '?filter=active' : '';
    } else if (typeof params === 'string') {
      query = params ? (params.startsWith('?') ? params : `?${params}`) : '';
    } else if (params && typeof params === 'object') {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, val);
        }
      });
      const qs = searchParams.toString();
      if (qs) query = `?${qs}`;
    }
    const response = await axios.get(`/riders/getallridersforadmin${query}`, config);
    return response.data;
  } catch (error) {
    return { success: false, message: error.message, data: [] };
  }
};
// Vendor Type APIs
export const createVendorType = async (formData) => {
  try {
    const response = await axios.post(`/vendors/type`, formData, configwithform);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const getAllVendorTypes = async () => {
  try {
    const response = await axios.get(`/vendors/type`, config);
    return { success: true, data: response.data.data || [] };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const updateVendorType = async (id, formData) => {
  try {
    const response = await axios.put(`/vendors/type/${id}`, formData, configwithform);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const deleteVendorType = async (id) => {
  try {
    const response = await axios.delete(`/vendors/type/${id}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};




// Toggle vendor status
export const updateVendorStatus = async (vendorId, newStatus, extra = {}) => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };
    const response = await axios.post(
      `/vendors/vendor-status`,
      {
        user_id: vendorId,
        status: newStatus,
        role_id: 1,
        ...extra,
      },
      reqConfig
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// Update vendor deactivate status (deactivate_status: 1 = blocked, 0 = active, with remark) 
export const updateVendorDeactivateStatus = async (vendorId, deactivateStatus, remark = '') => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };
    const response = await axios.post(
      `/vendors/vendor-block-status`,
      {
        user_id: vendorId,
        deactivate_status: deactivateStatus,
        remark: remark
      },
      reqConfig
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// Convenience helper to block a vendor (deactivate_status = 1)
export const blockVendor = async (vendorId, remark = '') => {
  return updateVendorDeactivateStatus(vendorId, 1, remark);
};

// Convenience helper to unblock/reactivate a vendor (deactivate_status = 0)
export const unblockVendor = async (vendorId, remark = '') => {
  return updateVendorDeactivateStatus(vendorId, 0, remark);
};

// Update vendor payment transaction status (payment_transaction_status: 1 = blocked, 0 = active/working)
export const updateVendorPaymentTransactionStatus = async (vendorId, paymentTransactionStatus, remark = '') => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };
    const response = await axios.post(
      `/vendors/payment-transaction-status`,
      {
        user_id: Number(vendorId),
        payment_transaction_status: Number(paymentTransactionStatus),
        remark: remark || ''
      },
      reqConfig
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// Convenience helper to block vendor payment transactions (payment_transaction_status = 1)
export const blockVendorPaymentTransactions = async (vendorId, remark = '') => {
  return updateVendorPaymentTransactionStatus(vendorId, 1, remark);
};

// Convenience helper to unblock vendor payment transactions (payment_transaction_status = 0)
export const unblockVendorPaymentTransactions = async (vendorId, remark = '') => {
  return updateVendorPaymentTransactionStatus(vendorId, 0, remark);
};

// Update rider deactivate status (deactivate_status: 1 = blocked, 0 = active, with remark)
export const updateRiderDeactivateStatus = async (riderId, deactivateStatus, remark = '') => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };
    const response = await axios.post(
      `/riders/rider-block-status`,
      {
        user_id: riderId,
        deactivate_status: deactivateStatus,
        remark: remark
      },
      reqConfig
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// Convenience helper to block a rider (deactivate_status = 1)
export const blockRider = async (riderId, remark = '') => {
  return updateRiderDeactivateStatus(riderId, 1, remark);
};

// Convenience helper to unblock/reactivate a rider (deactivate_status = 0)
export const unblockRider = async (riderId, remark = '') => {
  return updateRiderDeactivateStatus(riderId, 0, remark);
};
// Update rider payment transaction status (payment_transaction_status: 1 = blocked, 0 = active/working)
export const updateRiderPaymentTransactionStatus = async (riderId, paymentTransactionStatus, remark = '') => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };
    let response;
    try {
      response = await axios.post(
        `/riders/payment-transaction-status`,
        {
          user_id: Number(riderId),
          payment_transaction_status: Number(paymentTransactionStatus),
          remark: remark || ''
        },
        reqConfig
      );
    } catch (err) {
      // Fallback to shared /vendors/payment-transaction-status (updates users table)
      response = await axios.post(
        `/vendors/payment-transaction-status`,
        {
          user_id: Number(riderId),
          payment_transaction_status: Number(paymentTransactionStatus),
          remark: remark || ''
        },
        reqConfig
      );
    }
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// Convenience helper to block rider payment transactions (payment_transaction_status = 1)
export const blockRiderPaymentTransactions = async (riderId, remark = '') => {
  return updateRiderPaymentTransactionStatus(riderId, 1, remark);
};

// Convenience helper to unblock rider payment transactions (payment_transaction_status = 0)
export const unblockRiderPaymentTransactions = async (riderId, remark = '') => {
  return updateRiderPaymentTransactionStatus(riderId, 0, remark);
};

export const getRiderById = async (id) => {
  try {
    const response = await axios.get(`/riders/getallridersforadminbyID/${id}`, config);
    return response.data;
  } catch (error) {
    return { success: false, message: error.message, data: [] };
  }
};

export const updateRiderStatus = async (riderId, newStatus) => {
  try {
    // const token = localStorage.getItem('token');
    const response = await axios.post(
      `/riders/rider-status`,
      {
        user_id: riderId,
        status: newStatus,
        role_id: 1,
      },
      config

    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const deleteProduct = async (product_ids) => {
  try {
    const response = await axios.delete(`/products/products`, {
      ...config,             // includes your headers
      data: { product_ids }  // includes your body (important!)
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// Vendor dashboard analytics by date range (hourly if same day, else daily)
export const getVendorAnalytics = async (vendor_Id, start_date, end_date) => {
  try {
    const payload = { vendor_Id, start_date, end_date, role_id: 3, };
    const response = await axios.post(`/vendors/vendordashboard-analytics`, payload, config);
    return { success: true, data: response.data || [] };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// Rider dashboard analytics by date range (hourly if same day, else daily)
export const getRiderAnalytics = async (rider_Id, start_date, end_date) => {
  try {
    const payload = { rider_Id, start_date, end_date, role_id: 2 };
    const response = await axios.post(`/riders/riderdashboard-analytics`, payload, config);
    return { success: true, data: response.data || [] };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// GET https://cx.ekarigar.com/delievery-api/users/fetchusers
// Query params: search, date, startDate, endDate, status, vendor_id, sort, page, limit
export const fetchUsersList = async (payload = {}) => {
  try {
    const token = localStorage.getItem("token");
    const reqConfig = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      params: {},
    };

    const params = {};
    if (payload.search !== undefined && payload.search !== null && String(payload.search).trim() !== "") {
      params.search = String(payload.search).trim();
    }
    if (payload.date) {
      params.date = payload.date;
    } else if (payload.date_filter && payload.date_filter !== "all") {
      params.date = payload.date_filter;
    }
    const startDate = payload.startDate || payload.start_date;
    if (startDate) {
      params.startDate = startDate;
    }
    const endDate = payload.endDate || payload.end_date;
    if (endDate) {
      params.endDate = endDate;
    }
    const statusVal = payload.status !== undefined && payload.status !== null ? payload.status : payload.order_status;
    if (statusVal !== undefined && statusVal !== null && statusVal !== "") {
      params.status = statusVal;
    }
    if (payload.vendor_id !== undefined && payload.vendor_id !== null && payload.vendor_id !== "") {
      params.vendor_id = payload.vendor_id;
    }
    if (payload.sort) {
      params.sort = payload.sort;
    }
    if (payload.page !== undefined && payload.page !== null && payload.page !== "") {
      params.page = payload.page;
    }
    if (payload.limit !== undefined && payload.limit !== null && payload.limit !== "") {
      params.limit = payload.limit;
    }
    if (payload.role_id !== undefined && payload.role_id !== null && payload.role_id !== "") {
      params.role_id = payload.role_id;
    }
    if (payload.id !== undefined && payload.id !== null && payload.id !== "") {
      params.id = payload.id;
    } else if (payload.userId !== undefined && payload.userId !== null && payload.userId !== "") {
      params.id = payload.userId;
    }

    reqConfig.params = params;
    const response = await axios.get(`/users/fetchusers`, reqConfig);

    const usersList =
      response.data?.data ||
      response.data?.users ||
      (Array.isArray(response.data) ? response.data : []);

    const totalCount =
      response.data?.total ??
      response.data?.pagination?.totalUsers ??
      usersList.length;

    return {
      success: response.data?.success !== undefined ? response.data.success : true,
      data: usersList,
      total: Number(totalCount) || 0,
      pagination: response.data?.pagination || {
        totalUsers: Number(totalCount) || 0,
        currentPage: Number(params.page) || 1,
        limit: Number(params.limit) || 10,
        totalPages: Math.ceil((Number(totalCount) || 0) / (Number(params.limit) || 10)),
      },
      raw: response.data,
    };
  } catch (error) {
    console.error("Failed to fetch users list:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || "Failed to fetch users list",
      data: [],
      total: 0,
      pagination: { totalUsers: 0, currentPage: 1, limit: 10, totalPages: 1 },
    };
  }
};

// Fetch single user with their orders and details by ID
export const getUserDetailsById = async (id) => {
  try {
    const res = await fetchUsersList({ id });
    if (res.success && res.data && res.data.length > 0) {
      return { success: true, data: res.data[0] };
    }
    return { success: false, error: "User not found", data: null };
  } catch (error) {
    return { success: false, error: error.message || "Failed to fetch user", data: null };
  }
};

// GET https://cx.ekarigar.com/delievery-api/users/user-details
export const getAllUserDetails = async (params = {}) => {
  try {
    const currentToken = localStorage.getItem("token") || token;
    const requestConfig = {
      headers: {
        Authorization: currentToken ? `Bearer ${currentToken}` : "",
        "Content-Type": "application/json",
      },
      params: {},
    };

    if (params?.sort) {
      requestConfig.params.sort = params.sort;
    }
    if (params?.search && String(params.search).trim()) {
      requestConfig.params.search = String(params.search).trim();
    }
    if (params?.date) {
      requestConfig.params.date = params.date;
    }
    if (params?.startDate) {
      requestConfig.params.startDate = params.startDate;
    }
    if (params?.endDate) {
      requestConfig.params.endDate = params.endDate;
    }

    const response = await axios.get(`/users/user-details`, requestConfig);
    const payload = response.data;
    const list = Array.isArray(payload)
      ? payload
      : payload?.users || payload?.data || [];
    return { success: true, data: list, raw: payload };
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    return { success: false, error: error.response?.data || error.message, data: [] };
  }
};

// PUT https://cx.ekarigar.com/delievery-app/users/user-details/status
// Body: { id, active }  where active: 0 = inactive, 1 = active, 2 = rejected
export const updateUserActiveStatus = async (id, is_verified) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `/users/user-details/status`,
      { id, is_verified },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to update user status:", error);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Reverse geocoding via OpenStreetMap Nominatim.
// Returns { success, displayName, address } where address is the structured
// Nominatim address object (road, suburb, city, state, postcode, country, ...).
// Note: Nominatim usage policy — keep traffic light, no heavy bulk calls.
export const reverseGeocode = async (lat, lng) => {
  try {
    if (lat == null || lng == null || lat === "" || lng === "") {
      return { success: false, error: "Missing lat/lng" };
    }
    const response = await rawAxios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          format: "jsonv2",
          lat,
          lon: lng,
          zoom: 18,
          addressdetails: 1,
        },
        headers: {
          "Accept-Language": "en",
        },
      }
    );
    return {
      success: true,
      displayName: response.data?.display_name || "",
      address: response.data?.address || {},
      raw: response.data,
    };
  } catch (error) {
    console.error("Failed reverse geocoding:", error);
    return { success: false, error: error.response?.data || error.message };
  }
};

// ---------------------------------------------------------------------------
// Orders API
// ---------------------------------------------------------------------------

// POST / GET https://cx.ekarigar.com/delievery-api/order/list
export const getOrdersList = async (payload = {}) => {
  try {
    const token = localStorage.getItem("token");
    const reqConfig = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      params: {},
    };

    // Sanitize and build query params
    const params = {};
    if (payload.search !== undefined && payload.search !== null && String(payload.search).trim() !== "") {
      params.search = String(payload.search).trim();
    }
    if (payload.date) {
      params.date = payload.date;
    }
    const startDate = payload.startDate || payload.start_date;
    if (startDate) {
      params.startDate = startDate;
    }
    const endDate = payload.endDate || payload.end_date;
    if (endDate) {
      params.endDate = endDate;
    }
    if (payload.status !== undefined && payload.status !== null && payload.status !== "") {
      params.status = payload.status;
    }
    if (payload.vendor_id !== undefined && payload.vendor_id !== null && payload.vendor_id !== "") {
      params.vendor_id = payload.vendor_id;
    }
    if (payload.rider_id !== undefined && payload.rider_id !== null && payload.rider_id !== "") {
      params.rider_id = payload.rider_id;
    }
    if (payload.user_id !== undefined && payload.user_id !== null && payload.user_id !== "") {
      params.user_id = payload.user_id;
    }
    if (payload.page !== undefined && payload.page !== null && payload.page !== "") {
      params.page = payload.page;
    }
    if (payload.limit !== undefined && payload.limit !== null && payload.limit !== "") {
      params.limit = payload.limit;
    }
    if (payload.sort) {
      params.sort = payload.sort;
    }

    reqConfig.params = params;

    let response;
    try {
      response = await axios.get(`/order/list`, reqConfig);
    } catch (getErr) {
      if (getErr.response && (getErr.response.status === 404 || getErr.response.status === 405)) {
        response = await axios.post(`/order/list`, params, reqConfig);
      } else {
        throw getErr;
      }
    }

    const ordersData =
      response.data?.orders ||
      response.data?.data ||
      (Array.isArray(response.data) ? response.data : []);

    const totalCount =
      response.data?.total ??
      response.data?.totalOrders ??
      response.data?.count ??
      (Array.isArray(ordersData) ? ordersData.length : 0);

    return {
      success: true,
      data: ordersData,
      total: Number(totalCount) || 0,
      raw: response.data,
    };
  } catch (error) {
    console.error("Failed to fetch order list:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || "Failed to fetch orders",
      data: [],
      total: 0,
    };
  }
};

// ---------------------------------------------------------------------------
// Pick & Drop Parcels API
// ---------------------------------------------------------------------------

// GET /parcels/getall-parcels/all
// GET /parcels/getall-parcels/today
// GET /parcels/getall-parcels/{date}
export const getAllParcels = async (type = "all", dateStr = null) => {
  try {
    const token = localStorage.getItem("token");
    const reqConfig = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };
    let endpoint = "/parcels/getall-parcels/all";
    if (type === "today") {
      endpoint = "/parcels/getall-parcels/today";
    } else if (type === "date" && dateStr) {
      endpoint = `/parcels/getall-parcels/${dateStr}`;
    }
    const response = await axios.get(endpoint, reqConfig);
    const parcelsData = response.data?.parcels || response.data?.data || (Array.isArray(response.data) ? response.data : []);
    return {
      success: true,
      data: parcelsData,
      raw: response.data,
    };
  } catch (error) {
    console.error("Failed to fetch parcels:", error);
    return {
      success: false,
      error: error.response?.data || error.message,
      data: [],
    };
  }
};

// ---------------------------------------------------------------------------
// Vendor Withdrawals API
// ---------------------------------------------------------------------------

// GET /order/all-vendor-withdrawals/all
// GET /order/all-vendor-withdrawals/today
// GET /order/all-vendor-withdrawals/{date}
export const getVendorWithdrawals = async (type = "all", dateStr = null) => {
  try {
    const token = localStorage.getItem("token");
    const reqConfig = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };
    let endpoint = "/order/all-vendor-withdrawals/all";
    if (type === "today") {
      endpoint = "/order/all-vendor-withdrawals/today";
    } else if (type === "date" && dateStr) {
      endpoint = `/order/all-vendor-withdrawals/${dateStr}`;
    }
    const response = await axios.get(endpoint, reqConfig);
    const withdrawalsData =
      response.data?.withdrawals ||
      response.data?.data ||
      (Array.isArray(response.data) ? response.data : []);
    return {
      success: true,
      data: withdrawalsData,
      raw: response.data,
    };
  } catch (error) {
    console.error("Failed to fetch vendor withdrawals:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message,
      data: [],
    };
  }
};

// PUT /order/update-vendor-withdrawal
// payload: { id, status, admin_remarks, transaction_reference }
export const updateVendorWithdrawal = async (payload) => {
  try {
    const token = localStorage.getItem("token");
    const reqConfig = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };
    const response = await axios.put("/order/update-vendor-withdrawal", payload, reqConfig);
    return {
      success: response.data?.status !== false,
      message: response.data?.message || "Vendor withdrawal status updated successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to update vendor withdrawal:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message,
    };
  }
};

// POST /order/getvendorshares
export const getVendorShares = async (vendorId) => {
  try {
    const token = localStorage.getItem("token");
    const reqConfig = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };
    const response = await axios.post(
      "/order/getvendorshares",
      { vendor_id: Number(vendorId) },
      reqConfig
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to fetch vendor shares:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message,
      data: null,
    };
  }
};

// POST /order/getvendorwithdrawals
export const getVendorWithdrawalsById = async (vendorId) => {
  try {
    const token = localStorage.getItem("token");
    const reqConfig = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };
    const response = await axios.post(
      "/order/getvendorwithdrawals",
      { vendor_id: Number(vendorId) },
      reqConfig
    );
    const withdrawals =
      response.data?.withdrawals ||
      response.data?.data ||
      (Array.isArray(response.data) ? response.data : []);
    return { success: true, data: withdrawals, raw: response.data };
  } catch (error) {
    console.error("Failed to fetch vendor withdrawals by id:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message,
      data: [],
    };
  }
};

// GET /rider/all-rider-withdrawals/all
// GET /rider/all-rider-withdrawals/today
// GET /rider/all-rider-withdrawals/{date}
// POST /rider/all-rider-withdrawals
export const getRiderWithdrawals = async (type = "all", dateStr = null) => {
  try {
    const token = localStorage.getItem("token");
    const reqConfig = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };
    let endpoint = "/riders/all-rider-withdrawals/all";
    if (type === "today") {
      endpoint = "/riders/all-rider-withdrawals/today";
    } else if (type === "date" && dateStr) {
      endpoint = `/riders/all-rider-withdrawals/${dateStr}`;
    }

    let response;
    try {
      response = await axios.get(endpoint, reqConfig);
    } catch (err) {
      try {
        response = await axios.get("/riders/all-rider-withdrawals", reqConfig);
      } catch (err2) {
        response = await axios.post("/riders/all-rider-withdrawals", { type, date: dateStr }, reqConfig);
      }
    }

    const withdrawalsData =
      response.data?.withdrawals ||
      response.data?.data ||
      (Array.isArray(response.data) ? response.data : []);

    return {
      success: true,
      data: withdrawalsData,
      raw: response.data,
    };
  } catch (error) {
    console.error("Failed to fetch rider withdrawals:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message,
      data: [],
    };
  }
};

// PUT /rider/update-rider-withdrawal
// payload: { id, status, admin_remarks, transaction_ref }
export const updateRiderWithdrawal = async (payload) => {
  try {
    const token = localStorage.getItem("token");
    const reqConfig = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };

    let response;
    try {
      response = await axios.put("/riders/update-rider-withdrawal", payload, reqConfig);
    } catch (err) {
      try {
        response = await axios.put("/riders/update-rider-withdrawal", payload, reqConfig);
      } catch (err2) {
        response = await axios.post("/riders/update-rider-withdrawal", payload, reqConfig);
      }
    }

    return {
      success: response.data?.status !== false,
      message: response.data?.message || "Rider withdrawal status updated successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to update rider withdrawal:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message,
    };
  }
};

// POST /order/getvendorshares (with rider_id)
export const getRiderShares = async (riderId) => {
  try {
    const token = localStorage.getItem("token");
    const reqConfig = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };
    const response = await axios.post(
      "/order/getvendorshares",
      { rider_id: Number(riderId) },
      reqConfig
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to fetch rider shares:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message,
      data: null,
    };
  }
};

// POST /riders/withdrawal-history or GET /riders/all-rider-withdrawals
export const getRiderWithdrawalsById = async (riderId) => {
  try {
    const token = localStorage.getItem("token");
    const reqConfig = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };
    let withdrawals = [];
    try {
      const response = await axios.post(
        "/riders/withdrawal-history",
        { rider_id: Number(riderId) },
        reqConfig
      );
      if (response.data?.withdrawals && Array.isArray(response.data.withdrawals)) {
        withdrawals = response.data.withdrawals;
      }
    } catch (e1) {
      console.warn("Direct rider withdrawal history failed, trying fallback:", e1);
    }

    if (!withdrawals || withdrawals.length === 0) {
      try {
        const allRes = await axios.get("/riders/all-rider-withdrawals/all", reqConfig);
        const allList = allRes.data?.withdrawals || allRes.data?.data || (Array.isArray(allRes.data) ? allRes.data : []);
        withdrawals = allList.filter(
          (w) => Number(w.rider_id) === Number(riderId) || Number(w.rider?.id) === Number(riderId)
        );
      } catch (e2) {
        console.warn("Fallback rider withdrawals failed:", e2);
      }
    }

    return { success: true, data: withdrawals };
  } catch (error) {
    console.error("Failed to fetch rider withdrawals by id:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message,
      data: [],
    };
  }
};


// ==========================================
// Rider Delivery Charges Settings (Canada - CAD)
// ==========================================

/**
 * Fetch rider delivery charges configuration (GET /api/admin/rider-delivery-settings)
 */
export const getRiderDeliverySettings = async () => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };

    let response;
    try {
      response = await axios.get('/api/admin/rider-delivery-settings', reqConfig);
    } catch (err) {
      response = await axios.get('/admin/rider-delivery-settings', reqConfig);
    }

    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Settings retrieved successfully'
    };
  } catch (error) {
    console.error('Failed to get rider delivery settings:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch settings',
    };
  }
};

/**
 * Update rider delivery charges configuration (PUT /api/admin/rider-delivery-settings)
 */
export const updateRiderDeliverySettings = async (payload) => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };

    let response;
    try {
      response = await axios.put('/api/admin/rider-delivery-settings', payload, reqConfig);
    } catch (err) {
      response = await axios.put('/admin/rider-delivery-settings', payload, reqConfig);
    }

    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Settings updated successfully'
    };
  } catch (error) {
    console.error('Failed to update rider delivery settings:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Failed to update settings',
    };
  }
};

/**
 * Calculate rider delivery payout for given distance (POST /api/admin/rider-delivery-settings/calculate)
 */
export const calculateRiderDeliveryPayout = async (distanceKm) => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };

    let response;
    try {
      response = await axios.post('/api/admin/rider-delivery-settings/calculate', { distance_km: distanceKm }, reqConfig);
    } catch (err) {
      response = await axios.post('/admin/rider-delivery-settings/calculate', { distance_km: distanceKm }, reqConfig);
    }

    return {
      success: true,
      data: response.data?.data || response.data
    };
  } catch (error) {
    console.error('Failed to calculate rider delivery payout:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Calculation error',
    };
  }
};

/**
 * Fetch vendor commission configuration (GET /api/admin/vendor-commission-settings)
 */
export const getVendorCommissionSettings = async () => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };

    let response;
    try {
      response = await axios.get('/api/admin/vendor-commission-settings', reqConfig);
    } catch (err) {
      response = await axios.get('/admin/vendor-commission-settings', reqConfig);
    }

    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Vendor commission settings retrieved successfully'
    };
  } catch (error) {
    console.error('Failed to get vendor commission settings:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch vendor commission settings',
    };
  }
};

/**
 * Update vendor commission configuration (PUT /api/admin/vendor-commission-settings)
 */
export const updateVendorCommissionSettings = async (payload) => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };

    let response;
    try {
      response = await axios.put('/api/admin/vendor-commission-settings', payload, reqConfig);
    } catch (err) {
      response = await axios.put('/admin/vendor-commission-settings', payload, reqConfig);
    }

    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Vendor commission settings updated successfully'
    };
  } catch (error) {
    console.error('Failed to update vendor commission settings:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Failed to update vendor commission settings',
    };
  }
};

/**
 * Calculate vendor commission for given subtotal (POST /api/admin/vendor-commission-settings/calculate)
 */
export const calculateVendorCommission = async (subtotalCad) => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };

    let response;
    try {
      response = await axios.post('/api/admin/vendor-commission-settings/calculate', { subtotal_cad: subtotalCad }, reqConfig);
    } catch (err) {
      response = await axios.post('/admin/vendor-commission-settings/calculate', { subtotal_cad: subtotalCad }, reqConfig);
    }

    return {
      success: true,
      data: response.data?.data || response.data
    };
  } catch (error) {
    console.error('Failed to calculate vendor commission:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Calculation error',
    };
  }
};

/**
 * Fetch global withdrawal settings (GET /api/admin/withdrawal-settings)
 */
export const getWithdrawalSettings = async () => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };

    let response;
    try {
      response = await axios.get('/api/admin/withdrawal-settings', reqConfig);
    } catch (err) {
      response = await axios.get('/admin/withdrawal-settings', reqConfig);
    }

    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Withdrawal settings retrieved successfully'
    };
  } catch (error) {
    console.error('Failed to get withdrawal settings:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch withdrawal settings',
    };
  }
};

/**
 * Update global withdrawal settings (PUT /api/admin/withdrawal-settings)
 */
export const updateWithdrawalSettings = async (payload) => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };

    let response;
    try {
      response = await axios.put('/api/admin/withdrawal-settings', payload, reqConfig);
    } catch (err) {
      response = await axios.put('/admin/withdrawal-settings', payload, reqConfig);
    }

    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Withdrawal settings updated successfully'
    };
  } catch (error) {
    console.error('Failed to update withdrawal settings:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Failed to update withdrawal settings',
    };
  }
};

/**
 * Fetch user withdrawal preference (GET /api/withdrawal/preferences)
 */
export const getUserWithdrawalPreferences = async (params = {}) => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
      params
    };

    let response;
    try {
      response = await axios.get('/api/withdrawal/preferences', reqConfig);
    } catch (err) {
      response = await axios.get('/withdrawal/preferences', reqConfig);
    }

    return {
      success: true,
      data: response.data?.data || response.data
    };
  } catch (error) {
    console.error('Failed to get user withdrawal preference:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch preference',
    };
  }
};

/**
 * Update user withdrawal preference (PUT /api/withdrawal/preferences)
 */
export const updateUserWithdrawalPreferences = async (payload) => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };

    let response;
    try {
      response = await axios.put('/api/withdrawal/preferences', payload, reqConfig);
    } catch (err) {
      response = await axios.put('/withdrawal/preferences', payload, reqConfig);
    }

    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Preference saved successfully'
    };
  } catch (error) {
    console.error('Failed to update user withdrawal preference:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Failed to save preference',
    };
  }
};

/**
 * Distance Manager: Fetch dynamic distance limits, rider search radiuses, and test bypass mode
 */
export const getDistanceSettings = async () => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };

    let response;
    try {
      response = await axios.get('/api/admin/distance-settings', reqConfig);
    } catch (err) {
      try {
        response = await axios.get('/admin/distance-settings', reqConfig);
      } catch (err2) {
        // Fallback for backwards compatibility
        response = await axios.get('/api/admin/rider-delivery-settings', reqConfig);
      }
    }

    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Distance settings retrieved successfully'
    };
  } catch (error) {
    console.error('Failed to get distance settings:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch distance settings',
    };
  }
};

/**
 * Distance Manager: Update dynamic distance limits, rider search radiuses, and test bypass mode
 */
export const updateDistanceSettings = async (payload) => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };

    let response;
    try {
      response = await axios.put('/api/admin/distance-settings', payload, reqConfig);
    } catch (err) {
      try {
        response = await axios.put('/admin/distance-settings', payload, reqConfig);
      } catch (err2) {
        // Fallback for backwards compatibility
        response = await axios.put('/api/admin/rider-delivery-settings', payload, reqConfig);
      }
    }

    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Distance settings updated successfully'
    };
  } catch (error) {
    console.error('Failed to update distance settings:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Failed to update distance settings',
    };
  }
};


/**
 * Vendor Order Accept Dynamic Timing Settings:
 * Fetch timeout in minutes, auto-cancellation toggle, and cancellation reason
 */
export const getVendorOrderTimingSettings = async () => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };

    let response;
    try {
      response = await axios.get('/api/admin/vendor-order-timing-settings', reqConfig);
    } catch (err) {
      response = await axios.get('/admin/vendor-order-timing-settings', reqConfig);
    }

    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Vendor timing settings fetched successfully'
    };
  } catch (error) {
    console.error('Failed to fetch vendor order timing settings:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch vendor order timing settings',
    };
  }
};

/**
 * Update Vendor Order Accept Dynamic Timing Settings
 */
export const updateVendorOrderTimingSettings = async (payload) => {
  try {
    const freshToken = localStorage.getItem('token');
    const reqConfig = {
      headers: {
        Authorization: freshToken ? `Bearer ${freshToken}` : '',
        'Content-Type': 'application/json',
      },
    };

    let response;
    try {
      response = await axios.put('/api/admin/vendor-order-timing-settings', payload, reqConfig);
    } catch (err) {
      response = await axios.put('/admin/vendor-order-timing-settings', payload, reqConfig);
    }

    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Vendor timing settings updated successfully'
    };
  } catch (error) {
    console.error('Failed to update vendor order timing settings:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data || error.message || 'Failed to update vendor order timing settings',
    };
  }
};
