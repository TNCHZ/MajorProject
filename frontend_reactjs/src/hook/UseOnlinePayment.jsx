import { useState } from 'react';
import { authApis, endpoints } from '../configs/Apis';

const useOnlinePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initiateOnlinePayment = async (type, data, endpoint, amount, storageKey) => {
    setLoading(true);
    setError(null);

    try {

      const res = await authApis().get(endpoints['payment-create'], { 
        params: { amount: parseFloat(amount), type: type } 
      });

      if (res.data && res.data.paymentUrl) {
        localStorage.setItem(storageKey, JSON.stringify({
          data: {
            ...data,
            method: "ONLINE",
            amount: amount,
          },
          endpoint,
        }));
        window.location.href = res.data.paymentUrl;
        return true;
      } else {
        throw new Error('Không thể tạo thanh toán online');
      }
    } catch (err) {
      setError(err.message || 'Không thể tạo thanh toán online. Vui lòng thử lại.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { initiateOnlinePayment, loading, error };
};

export default useOnlinePayment;