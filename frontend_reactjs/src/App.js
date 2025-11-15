import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useReducer, useState, useEffect, useContext } from "react";
import cookie from "react-cookies";
import { authApis, endpoints } from "./configs/Apis";
import { MyUserContext, MyDispatchContext } from "./configs/Context";
import myUserReducer from "./reducer/MyUserReducer";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import BookPage from "./pages/BookPage";
import LogoutPage from "./pages/LogoutPage";
import ReaderPage from "./pages/ReaderPage";
import BorrowSlipPage from "./pages/BorrowSlipPage";
import PaymentResult from "./pages/PaymentResult";
import MainLayout from "./layouts/MainLayout";
import FinePage from "./pages/FinePage";
import UserPage from "./pages/UserPage";
import ForbiddenPage from "./pages/ForbiddenPage";
import RevenueManagementPage from "./pages/RevenueManagementPage";
import ChatPage from "./pages/ChatPage";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const user = useContext(MyUserContext);
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/forbidden" />;
  return element;
};

const App = () => {
  const [user, dispatch] = useReducer(myUserReducer, null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = cookie.load("token");
    if (token) {
      authApis()
        .get(endpoints["profile"])
        .then((res) => {
          dispatch({
            type: "login",
            payload: res.data,
          });
        })
        .catch((err) => {
          console.error("Failed to load user data:", err);
          cookie.remove("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <Router>
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/main" /> : <LoginPage />}
            />
            <Route
              path="/payment/result"
              element={<PaymentResult storageKey="pendingPayment" />}
            />
            <Route path="/forbidden" element={<ForbiddenPage />} />

            {/* Các route còn lại */}
            <Route
              path="*"
              element={
                <Routes>
                  <Route path="/" element={<Navigate to="/main" />} />
                  <Route
                    path="/main"
                    element={user ? <MainLayout /> : <Navigate to="/login" />}
                  >
                    <Route
                      path="dashboard"
                      element={
                        <ProtectedRoute
                          element={<DashboardPage />}
                          allowedRoles={["ADMIN"]}
                        />
                      }
                    />
                    <Route
                      path="users"
                      element={
                        <ProtectedRoute
                          element={<UserPage />}
                          allowedRoles={["ADMIN"]}
                        />
                      }
                    />
                    <Route
                      path="revenue-management"
                      element={
                        <ProtectedRoute
                          element={<RevenueManagementPage />}
                          allowedRoles={["ADMIN"]}
                        />
                      }
                    />
                    <Route
                      path="readers"
                      element={
                        <ProtectedRoute
                          element={<ReaderPage />}
                          allowedRoles={["ADMIN", "LIBRARIAN"]}
                        />
                      }
                    />
                    <Route
                      path="books"
                      element={
                        <ProtectedRoute
                          element={<BookPage />}
                          allowedRoles={["ADMIN", "LIBRARIAN"]}
                        />
                      }
                    />
                    <Route
                      path="fines"
                      element={
                        <ProtectedRoute
                          element={<FinePage />}
                          allowedRoles={["ADMIN", "LIBRARIAN"]}
                        />
                      }
                    />
                    <Route
                      path="borrow-slip"
                      element={
                        <ProtectedRoute
                          element={<BorrowSlipPage />}
                          allowedRoles={["ADMIN", "LIBRARIAN"]}
                        />
                      }
                    />
                    <Route
                      path="chat"
                      element={
                        <ProtectedRoute
                          element={<ChatPage />}
                          allowedRoles={["LIBRARIAN"]}
                        />
                      }
                    />
                    <Route
                      path="logout"
                      element={
                        <ProtectedRoute
                          element={<LogoutPage />}
                          allowedRoles={["ADMIN", "LIBRARIAN"]}
                        />
                      }
                    />
                  </Route>
                </Routes>
              }
            />
          </Routes>
        </Router>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  );
};

export default App;
