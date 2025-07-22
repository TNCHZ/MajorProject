import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingPage";
import DashboardPage from "./pages/DashboardPage"
import MainLayout from "./layouts/MainLayout";
import { MyDispatchContext, MyUserContext } from "./configs/Context";
import { useReducer } from "react";
import myUserReducer from "./reducer/MyUserReducer";

const App = () => {
  const [user, dispatch] = useReducer(myUserReducer, null);

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>

        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />

            {/* Các route cần layout */}
            <Route path="/" element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Router>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>

  );
}

export default App;
