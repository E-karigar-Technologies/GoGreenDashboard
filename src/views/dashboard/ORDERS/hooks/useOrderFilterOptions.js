import { useState, useEffect } from 'react';
import { getAllVendors, getAllRiders, getAllUserDetails } from '../../../../services/apiService';

const useOrderFilterOptions = () => {
  const [vendors, setVendors] = useState([]);
  const [riders, setRiders] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState({
    vendors: false,
    riders: false,
    customers: false,
  });

  useEffect(() => {
    let isMounted = true;

    // Fetch Vendors
    const fetchVendors = async () => {
      setLoading(prev => ({ ...prev, vendors: true }));
      try {
        const res = await getAllVendors(true);
        if (isMounted) {
          const list = Array.isArray(res)
            ? res
            : res?.data && Array.isArray(res.data)
            ? res.data
            : res?.vendors || [];
          setVendors(
            list.map(v => ({
              id: v.vendor_id || v.id,
              name: v.store_name || v.name || `Vendor #${v.vendor_id || v.id}`,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load vendors for filter:', err);
      } finally {
        if (isMounted) setLoading(prev => ({ ...prev, vendors: false }));
      }
    };

    // Fetch Riders
    const fetchRiders = async () => {
      setLoading(prev => ({ ...prev, riders: true }));
      try {
        const res = await getAllRiders(false);
        if (isMounted) {
          const list = Array.isArray(res)
            ? res
            : res?.data && Array.isArray(res.data)
            ? res.data
            : res?.riders || [];
          setRiders(
            list.map(r => {
              const name = [r.firstname, r.lastname].filter(Boolean).join(' ') || r.name || `Rider #${r.rider_id || r.id}`;
              return {
                id: r.rider_id || r.id || r.user_id,
                name,
                customId: r.custom_id,
                phone: r.phonenumber,
              };
            })
          );
        }
      } catch (err) {
        console.error('Failed to load riders for filter:', err);
      } finally {
        if (isMounted) setLoading(prev => ({ ...prev, riders: false }));
      }
    };

    // Fetch Customers / Users
    const fetchCustomers = async () => {
      setLoading(prev => ({ ...prev, customers: true }));
      try {
        const res = await getAllUserDetails({ limit: 200 });
        if (isMounted) {
          const list = Array.isArray(res)
            ? res
            : res?.data && Array.isArray(res.data)
            ? res.data
            : res?.users || [];
          setCustomers(
            list.map(u => {
              const name = [u.firstname, u.lastname].filter(Boolean).join(' ') || u.name || `User #${u.user_id || u.id}`;
              return {
                id: u.user_id || u.id,
                name,
                customId: u.custom_id,
                phone: u.phonenumber,
                email: u.email,
              };
            })
          );
        }
      } catch (err) {
        console.error('Failed to load customers for filter:', err);
      } finally {
        if (isMounted) setLoading(prev => ({ ...prev, customers: false }));
      }
    };

    fetchVendors();
    fetchRiders();
    fetchCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    vendors,
    riders,
    customers,
    loading,
  };
};

export default useOrderFilterOptions;
