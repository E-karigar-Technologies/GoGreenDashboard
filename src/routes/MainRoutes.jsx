import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';

//lazy import components
const DashSales2 = lazy(() => import('../views/dashboard/DashSales/index2'));
const UpdateProduct = lazy(() => import('../views/products/updateProduct/upDateProduct'));
const SingleProduct = lazy(() => import('../views/products/viewSingleProduct/singleProduct'));
const SingleVendor = lazy(() => import('../views/dashboard/VENDORS/singleVendor/SingleVendor'));


import ProtectedRoute from '../components/ProtectedRoute';


// import Orders from '../views/dashboard/ORDERS/Orders';
// import VendorTypeList from '../views/dashboard/VENDORS/vendorType/vendorTypeList';
// import VendorTable from '../views/dashboard/VENDORS/AllVendors/vendorTabel';
const Orders = lazy(() => import('../views/dashboard/ORDERS/Orders'));
const VendorTypeList = lazy(() => import('../views/dashboard/VENDORS/vendorType/vendorTypeList'));
const VendorTable = lazy(() => import('../views/dashboard/VENDORS/AllVendors/vendorTabel'));
const RiderTable = lazy(() => import('../views/dashboard/RIDER/RiderTabel'));
const SingleRider = lazy(() => import('../views/dashboard/RIDER/SingleRider'));
const PickAndDrop = lazy(() => import('../views/pickAndDrop/PickAndDrop'));
const VendorWithdrawals = lazy(() => import('../views/vendors/vendorWithdrawals/VendorWithdrawals'));
const RiderWithdrawals = lazy(() => import('../views/dashboard/RIDER/riderWithdrawals/RiderWithdrawals'));
const RiderDeliveryCharges = lazy(() => import('../views/settings/RiderDeliveryCharges'));
const VendorCommission = lazy(() => import('../views/settings/VendorCommission'));
const WithdrawalSettings = lazy(() => import('../views/settings/WithdrawalSettings'));
const DistanceManager = lazy(() => import('../views/settings/DistanceManager'));
const VendorOrderTiming = lazy(() => import('../views/settings/VendorOrderTiming'));

const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));

const Typography = lazy(() => import('../views/ui-elements/basic/BasicTypography'));
const Color = lazy(() => import('../views/ui-elements/basic/BasicColor'));

const FeatherIcon = lazy(() => import('../views/ui-elements/icons/Feather'));
const FontAwesome = lazy(() => import('../views/ui-elements/icons/FontAwesome'));
const MaterialIcon = lazy(() => import('../views/ui-elements/icons/Material'));

const Login = lazy(() => import('../views/auth/login'));
const Register = lazy(() => import('../views/auth/register'));

const Sample = lazy(() => import('../views/sample'));
const AddUser = lazy(() => import('../views/users/addUser'));
const AllUser = lazy(() => import('../views/users/allUser'));
const SingleUser = lazy(() => import('../views/users/singleUser/SingleUser'));
const AddProducts = lazy(() => import('../views/products/addProducts'));
const AddProducts2 = lazy(() => import('../views/products/addProducts_redesigned'));

const AllProducts = lazy(() => import('../views/products/allProducts'));
const ProductDiscount = lazy(() => import('../views/products/productDiscount'));
const AddCategory = lazy(() => import('../views/product-category/addCategory'));
const AllCategory = lazy(() => import('../views/product-category/allCategory'));
const AddSubCategory = lazy(() => import('../views/product-subCategory/addsubCategory'));
const AllSubCategory = lazy(() => import('../views/product-subCategory/allsubCategory'));
const AddProductBrand = lazy(() => import('../views/product-Brand/addbrands'));
const AllProductBrand = lazy(() => import('../views/product-Brand/allbrands'));
const Editcategorydata = lazy(() => import('../views/editCategory/editCategory'));
const AddAppBanner = lazy(() => import('../views/homeApp-banner/addappbanner'));
const AllAppBanner = lazy(() => import('../views/homeApp-banner/allappbanner'));
const Unverifiedusers = lazy(() => import('../views/users/unverifiedusers'));
const AllCustomers = lazy(() => import('../views/users/customers/allCustomers'));
const AllOffers = lazy(() => import('../views/offers/AllOffers'));
const CreateOffer = lazy(() => import('../views/offers/CreateOffer'));

const MainRoutes = {
  path: '/',
  errorElement: <Navigate to="/dashboard" replace />,
  children: [
    {
      path: '/',
      element: <AdminLayout />,
      children: [
        {
          path: '/dashboard',
          element: <DashboardSales />
        },
        {
          path: '/dashboard2',
          element: <DashSales2 />
        },
        {
          path: '/typography',
          element: <Typography />
        },
        {
          path: '/color',
          element: <Color />
        },
        {
          path: '/icons/Feather',
          element: <FeatherIcon />
        },
        {
          path: '/icons/font-awesome-5',
          element: <FontAwesome />
        },
        {
          path: '/icons/material',
          element: <MaterialIcon />
        },

        {
          path: '/sample-page',
          element: <Sample />
        },

        {
          path: '/add-users',
          element: <AddUser />
        },

        {
          path: '/all-users',
          element: <AllUser />
        },
        {
          path: '/users/:id',
          element: <SingleUser />
        },
        {
          path: '/all-users/:id',
          element: <SingleUser />
        },
        {
          path: '/all-unverified-vendors',
          element: <Unverifiedusers user={"vendors"} />
        },
        {
          path: '/all-unverified-rider',
          element: <Unverifiedusers user={"delivery_partners"}  />
        },
        {
          path: '/all-unverified-customers',
          element: <AllCustomers />
        },

        {
          path: '/add-Products',
          element: <AddProducts />
        },
        {
          path: '/products/update/:id',
          element: <UpdateProduct />
        },

        {
          path: '/products',
          element: <AllProducts />
        },
        {
          path: '/products/:id',        // 👈 Yeh pehle likha hai
          element: <SingleProduct />
        },

        {
          path: '/products-discount',
          element: <ProductDiscount />
        },

        {
          path: '/add-category',
          element: <AddCategory />
        },

        {
          path: '/all-category',
          element: <AllCategory />
        },

        {
          path: '/add-subcategory',
          element: <AddSubCategory />
        },

        {
          path: '/all-subcategory',
          element: <AllSubCategory />
        },

        {
          path: '/add-Product-Brand',
          element: <AddProductBrand />
        },

        {
          path: '/all-Product-Brands',
          element: <AllProductBrand />
        },
        
        {
          path: '/edit-category-data',
          element: <Editcategorydata />
        },
        {
          path: '/all-orders',
          element: <Orders />
        },                                                                                                                                                                                                        
        {
          path: '/add-banner',
          element: <AddAppBanner />
        },
        {
          path: '/all-banner',
          element: <AllAppBanner />
        },
        
        // {
        //   path: '/vendor-type',
        //   element:<ProtectedRoute><VendorTypeList /></ProtectedRoute>
        // },
        // {
        //   path: '/vendors/',
        //   element:<ProtectedRoute allowedRoles={["admin"]}><VendorTable /></ProtectedRoute>
        // },
        {
          path: '/vendor-type',
          element: <VendorTypeList />
        },
        {
          path: '/vendors/',
          element: <VendorTable />
        },
        {
          path: '/vendors/:id',
          element: <SingleVendor/>
        },
        {
          path: '/riders/',
          element: <RiderTable />
        },
        {
          path: '/riders/:id',
          element: <SingleRider/>
        },
        {
          path: '/pick-and-drop',
          element: <PickAndDrop />
        },
        {
          path: '/vendor-withdrawals',
          element: <VendorWithdrawals />
        },
        {
          path: '/rider-withdrawals',
          element: <RiderWithdrawals />
        },
        {
          path: '/settings/rider-delivery-charges',
          element: <RiderDeliveryCharges />
        },
        {
          path: '/settings/vendor-commission',
          element: <VendorCommission />
        },
        {
          path: '/vendor-commission',
          element: <VendorCommission />
        },
        {
          path: '/settings/distance-manager',
          element: <DistanceManager />
        },
        {
          path: '/distance-manager',
          element: <DistanceManager />
        },
        {
          path: '/settings/vendor-order-timing',
          element: <VendorOrderTiming />
        },
        {
          path: '/vendor-order-timing',
          element: <VendorOrderTiming />
        },
        {
          path: '/settings/withdrawal-settings',
          element: <WithdrawalSettings />
        },
        {
          path: '/withdrawal-settings',
          element: <WithdrawalSettings />
        },
        {
          path: '/rider-delivery-charges',
          element: <RiderDeliveryCharges />
        },
        {
          path: '/offers',
          element: <AllOffers />
        },
        {
          path: '/all-offers',
          element: <AllOffers />
        },
        {
          path: '/create-offer',
          element: <CreateOffer />
        },
        {
          path: '/edit-offer/:id',
          element: <CreateOffer />
        },
        {
          path: '/settings',
          element: <Navigate to="/settings/withdrawal-settings" replace />
        },
        {
          path: '*',
          element: <Navigate to="/dashboard" replace />
        }


      ]
    },
    {
      path: '/',
      element: <GuestLayout />,
      children: [
        {
          path: '/login',
          element: <Login />
        },
        {
          path: '/register',
          element: <Register />
        }
      ]
    }
  ]
};

export default MainRoutes;
