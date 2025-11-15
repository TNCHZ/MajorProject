import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authApis } from "../configs/Apis";
import { FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaSpinner } from "react-icons/fa";

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

  const renderContent = () => {
    if (isProcessing) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-2xl">
          <FaSpinner className="text-5xl text-blue-500 animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang xử lý thanh toán...</h2>
          <p className="text-gray-600 text-center">Vui lòng đợi trong giây lát, chúng tôi đang xác thực giao dịch của bạn.</p>
        </div>
      );
    }

    const statusMapping = {
      "success": {
        icon: <FaCheckCircle className="text-green-500 text-6xl mb-4 animate-scale-in" />,
        title: "Thanh toán thành công!",
        description: `Số tiền đã thanh toán: ${amount} VND`,
        buttonText: "Quay về trang chủ"
      },
      "failure": {
        icon: <FaTimesCircle className="text-red-500 text-6xl mb-4 animate-shake" />,
        title: "Thanh toán thất bại!",
        description: "Đã xảy ra lỗi trong quá trình xử lý giao dịch. Vui lòng thử lại.",
        buttonText: "Thử lại"
      },
      "invalid-signature": {
        icon: <FaExclamationCircle className="text-yellow-500 text-6xl mb-4 animate-pulse-slow" />,
        title: "Lỗi chữ ký!",
        description: "Chữ ký giao dịch không hợp lệ. Vui lòng liên hệ hỗ trợ.",
        buttonText: "Quay về"
      },
      "error": {
        icon: <FaTimesCircle className="text-red-500 text-6xl mb-4 animate-shake" />,
        title: "Đã xảy ra lỗi!",
        description: error,
        buttonText: "Quay về"
      }
    };

    const currentStatus = error ? "error" : status;
    const content = statusMapping[currentStatus];

    if (!content) {
      return null;
    }

    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transform transition-transform duration-500 hover:scale-105">
        {content.icon}
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">{content.title}</h2>
        <p className="text-gray-600 mb-6">{content.description}</p>
        {currentStatus === "success" && (
          <p className="text-lg font-semibold text-green-600 mb-6">Thanh toán hoàn tất. Cảm ơn bạn!</p>
        )}
        <button
          onClick={handleRedirect}
          className="w-full px-6 py-3 font-semibold text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
        >
          {content.buttonText}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      {renderContent()}
    </div>
  );
}

export default PaymentResult;