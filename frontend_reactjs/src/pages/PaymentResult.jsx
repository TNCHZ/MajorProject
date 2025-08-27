import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authApis } from "../configs/Apis";

function PaymentResult({ storageKey }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [amount, setAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [type, setType] = useState("");
  // Hàm lấy query param từ URL
  const getQueryParams = (search) => {
    const params = new URLSearchParams(search);
    return {
      status: params.get("status"),
      amount: params.get("amount"),
      type: params.get("type")
    };
  };

  useEffect(() => {
    const processPayment = async () => {
      const { status, amount, type } = getQueryParams(location.search);
      setStatus(status);
      setAmount(amount);
      setType(type);

      // Chỉ xử lý POST khi status là "success"
      if (status !== "success") {
        setIsProcessing(false);
        return;
      }

      const pendingPayment = JSON.parse(localStorage.getItem(storageKey));
      console.log(pendingPayment);
      if (!pendingPayment || !pendingPayment.data || !pendingPayment.endpoint) {
        setError("Không tìm thấy thông tin thanh toán");
        setIsProcessing(false);
        return;
      }

      try {
        const formData = new FormData();
        formData.append(
          type,
          new Blob([JSON.stringify(pendingPayment.data)], { type: "application/json" })
        );

        if (type === "fine") {
          await authApis().patch(pendingPayment.endpoint, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
        else {
          await authApis().post(pendingPayment.endpoint, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        localStorage.removeItem(storageKey);
        
        setIsProcessing(false);
      } catch (err) {
        console.error("Lỗi khi hoàn tất thanh toán:", err);
        setError("Lỗi khi hoàn tất thanh toán. Vui lòng thử lại.");
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [location.search, navigate, storageKey]);

  const handleRedirect = () => {
    if (type === "membership") {
      navigate("/main/readers");
    } else {
      navigate("/main/fines");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {isProcessing ? (
        <div>
          <h2>Đang xử lý thanh toán...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : (
        <>
          {status === "success" && !error && (
            <div>
              <h2>Thanh toán thành công!</h2>
              <p>Số tiền: {amount} VND</p>
              <button
                onClick={handleRedirect}
                className="px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition mt-4"
              >
                Quay về
              </button>
            </div>
          )}
          {status === "failure" && (
            <div>
              <h2>Thanh toán thất bại!</h2>
              <button
                onClick={handleRedirect}
                className="px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition mt-4"
              >
                Quay về
              </button>
            </div>
          )}
          {status === "invalid-signature" && (
            <div>
              <h2>Lỗi chữ ký!</h2>
              <button
                onClick={handleRedirect}
                className="px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition mt-4"
              >
                Quay về
              </button>
            </div>
          )}
          {error && (
            <div>
              <h2>Lỗi: {error}</h2>
              <button
                onClick={handleRedirect}
                className="px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition mt-4"
              >
                Quay về
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PaymentResult;