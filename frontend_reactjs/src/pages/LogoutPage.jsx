import { useContext} from "react";
import { MyDispatchContext } from "../configs/Context";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

const LogoutPage = () => {
    const dispatch = useContext(MyDispatchContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch({
            type: "logout"
        });
        navigate("/");
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-3xl bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Xác nhận đăng xuất</h3>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="mt-2">
                    <p className="text-gray-600">
                        Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
                    </p>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutPage;
