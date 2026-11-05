const menuItems = {
  items: [
    // Navigation Group
    {
      id: 'navigation-group',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'home',
          url: '/dashboard/'
        }
      ]
    },
    // Users Management Group
    {
      id: 'users-group',
      type: 'group',
      icon: 'icon-support',
      children: [
        {
          id: 'manage-users',
          title: 'Verification Requests',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'group',
          children: [
            {
              id: 'unverified-vendors',
              title: 'Unverified Vendors',
              type: 'item',
              url: '/all-unverified-vendors',
              classes: 'nav-item',
              icon: 'material-icons-two-tone',
              iconname: 'people_alt'
            },
            {
              id: 'unverified-partners',
              title: 'Unverified Riders',
              type: 'item',
              url: '/all-unverified-rider',
              classes: 'nav-item',
              icon: 'material-icons-two-tone',
              iconname: 'people_alt'
            },
            {
              id: 'unverified-customers',
              title: 'Unverified Customers',
              type: 'item',
              url: '/all-unverified-customers',
              classes: 'nav-item',
              icon: 'material-icons-two-tone',
              iconname: 'people_alt'
            }
          ]
        }
      ]
    },
    // order Group
    {
      id: 'orders-group',
      type: 'group',
      icon: 'icon-support',
      children: [
        {
          id: 'manage-orders',
          title: 'Orders',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'add_shopping_cart',
          children: [

            {
              id: 'all-orders',
              title: 'All Orders',
              type: 'item',
              url: '/all-orders',
              classes: 'nav-item',
              icon: 'material-icons-two-tone',
              iconname: 'people_alt'
            },

          ]
        }
      ]
    },
    {
      id: 'manage-users-group',
      title: 'Customers',
      type: 'collapse',
      icon: 'material-icons-two-tone',
      iconname: 'people',
      children: [
        {
          id: 'all-users-item',
          title: 'All Customers',
          type: 'item',
          url: '/all-users',
          classes: 'nav-item',
          icon: 'material-icons-two-tone',
          iconname: 'people_alt'
        }
      ]
    },
    // vendor Group
    {
      id: 'vendor-group',
      type: 'group',
      icon: 'icon-support',
      children: [
        {
          id: 'manage-vendor',
          title: 'Vendors',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'storefront',
          children: [
            {
              id: 'vendortype',
              title: 'Vendor Types',
              type: 'item',
              url: '/vendor-type/',
              classes: 'nav-item',
              icon: 'material-icons-two-tone',
              iconname: 'category'
            },
            {
              id: 'all-vendors',
              title: 'All Vendors',
              type: 'item',
              url: '/vendors',
              classes: 'nav-item',
              icon: 'material-icons-two-tone',
              iconname: 'apartment'
            },
            {
              id: 'vendor-withdrawals',
              title: 'Vendor Withdrawals',
              type: 'item',
              url: '/vendor-withdrawals',
              classes: 'nav-item',
              icon: 'material-icons-two-tone',
              iconname: 'account_balance_wallet'
            }
          ]
        }
      ]
    },
    // rider Group
    {
      id: 'rider-group',
      type: 'group',
      icon: 'icon-delivery', // optional custom icon
      children: [
        {
          id: 'manage-rider',
          title: 'Riders',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'two_wheeler', // Rider/delivery icon
          children: [
            {
              id: 'all-riders',
              title: 'All Riders',
              type: 'item',
              url: '/riders',
              classes: 'nav-item',
              icon: 'material-icons-two-tone',
              iconname: 'two_wheeler' // Rider's vehicle
            },
            {
              id: 'rider-withdrawals-item',
              title: 'Rider Withdrawals',
              type: 'item',
              url: '/rider-withdrawals',
              classes: 'nav-item',
              icon: 'material-icons-two-tone',
              iconname: 'account_balance_wallet'
            }
          ]
        }
      ]
    },
    // Products Group
    {
      id: 'products-group',
      type: 'group',
      icon: 'icon-support',
      children: [
        {
          id: 'manage-products',
          title: 'Products',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'add_shopping_cart',
          children: [
            {
              id: 'add-product',
              title: 'Add Product',
              type: 'item',
              url: '/add-products',
              classes: 'nav-item',
              icon: 'material-icons-two-tone',
              iconname: 'person_add'
            },
            {
              id: 'all-products',
              title: 'All Products',
              type: 'item',
              url: '/products',
              classes: 'nav-item',
              icon: 'material-icons-two-tone',
              iconname: 'people_alt'
            },
            // Brands sub-section
            {
              id: 'product-brands',
              title: 'Brands',
              type: 'collapse',
              icon: 'material-icons-two-tone',
              iconname: 'history_edu',
              children: [
                {
                  id: 'add-product-brand',
                  title: 'Add Product Brand',
                  type: 'item',
                  url: '/add-product-brand',
                  classes: 'nav-item',
                  icon: 'material-icons-two-tone',
                  iconname: 'person_add'
                },
                {
                  id: 'all-product-brands',
                  title: 'All Product Brands',
                  type: 'item',
                  url: '/all-product-brands',
                  classes: 'nav-item',
                  icon: 'material-icons-two-tone',
                  iconname: 'people_alt'
                }
              ]
            },
            // Product Categories sub-section
            {
              id: 'manage-category',
              title: 'Product Categories',
              type: 'collapse',
              icon: 'material-icons-two-tone',
              iconname: 'history_edu',
              children: [
                {
                  id: 'add-category',
                  title: 'Add Category',
                  type: 'item',
                  url: '/add-category',
                  classes: 'nav-item',
                  icon: 'material-icons-two-tone',
                  iconname: 'person_add'
                },
                {
                  id: 'all-category',
                  title: 'All Categories',
                  type: 'item',
                  url: '/all-category',
                  classes: 'nav-item',
                  icon: 'material-icons-two-tone',
                  iconname: 'people_alt'
                }
              ]
            },
            // Product Sub-Categories sub-section
            {
              id: 'manage-subcategory',
              title: 'Product Sub-Categories',
              type: 'collapse',
              icon: 'material-icons-two-tone',
              iconname: 'history_edu',
              children: [
                {
                  id: 'add-subcategory',
                  title: 'Add Subcategory',
                  type: 'item',
                  url: '/add-subcategory',
                  classes: 'nav-item',
                  icon: 'material-icons-two-tone',
                  iconname: 'person_add'
                },
                {
                  id: 'all-subcategory',
                  title: 'All Subcategories',
                  type: 'item',
                  url: '/all-subcategory',
                  classes: 'nav-item',
                  icon: 'material-icons-two-tone',
                  iconname: 'people_alt'
                }
              ]
            }
          ]
        }
      ]
    },
    // Pick & Drop Group
    {
      id: 'pick-drop-group',
      type: 'group',
      icon: 'icon-delivery',
      children: [
        {
          id: 'pick-and-drop',
          title: 'Pick & Drop',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'local_shipping',
          url: '/pick-and-drop'
        }
      ]
    },
    // Customer Settings Group
    {
      id: 'customer-settings-group',
      type: 'group',
      icon: 'icon-support',
      children: [
        {
          id: 'customer-settings',
          title: 'Settings',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'settings',
          children: [
            {
              id: 'rider-delivery-charges',
              title: 'Rider Delivery Charges',
              type: 'item',
              url: '/settings/rider-delivery-charges',
              classes: 'nav-item',
              icon: 'material-icons-two-tone',
              iconname: 'attach_money'
            },
            {
              id: 'vendor-commission',
              title: 'Vendor Commission',
              type: 'item',
              url: '/settings/vendor-commission',
              classes: 'nav-item',
              icon: 'material-icons-two-tone',
              iconname: 'percent'
            },
            {
              id: 'withdrawal-settings',
              title: 'Withdrawal Settings',
              type: 'item',
              url: '/settings/withdrawal-settings',
              classes: 'nav-item',
              icon: 'material-icons-two-tone',
              iconname: 'account_balance_wallet'
            },
            {
              id: 'distance-manager',
              title: 'Distance Manager',
              type: 'item',
              url: '/settings/distance-manager',
              classes: 'nav-item',
              icon: 'material-icons-two-tone',
              iconname: 'explore'
            },
            {
              id: 'manage-appbanners',
              title: 'App Banners',
              type: 'collapse',
              icon: 'material-icons-two-tone',
              iconname: 'view_carousel',
              children: [
                {
                  id: 'add-banner',
                  title: 'Add Banner',
                  type: 'item',
                  url: '/add-banner',
                  classes: 'nav-item',
                  icon: 'material-icons-two-tone',
                  iconname: 'add_photo_alternate'
                },
                {
                  id: 'all-banner',
                  title: 'All Banners',
                  type: 'item',
                  url: '/all-banner',
                  classes: 'nav-item',
                  icon: 'material-icons-two-tone',
                  iconname: 'burst_mode'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'category-div-data',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'manage-categories',
          title: 'Manage Categories',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'group',
          url: '/edit-category-data'
        }
      ]
    },
    // Manage Categories Data
    // {
    //   id: 'category-div-data',
    //   type: 'group',
    //   icon: 'icon-support',
    //   children: [
    //     {
    //       id: 'manage-categories',
    //       title: 'Manage Categories',
    //       type: 'item',
    //       url: '/edit-category-data',
    //       icon: 'material-icons-two-tone',
    //       iconname: 'group',
    //     }
    //   ]
    // }
  ]
};

export default menuItems;
