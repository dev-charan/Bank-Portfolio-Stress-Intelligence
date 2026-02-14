import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { queryClient } from "./lib/queryClient";
import DataManagementPage from "./pages/Data/DataManagementPage";
import { MainLayout } from "./layouts/MainLayout";
import BanksListPage from "./pages/Banks/BanksListPage";
import DashboardPage from "./pages/Overview/DashboardPage";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={
               <DashboardPage/>
              }
            />
            <Route
              path="/banks"
              element={
                <BanksListPage/>
              }
            />
            <Route
              path="/trends"
              element={
                <div className="p-6">
                  <h1 className="text-3xl font-bold">Trends Page</h1>
                </div>
              }
            />
            <Route path="/data" element={<DataManagementPage />} />
            <Route
              path="/settings"
              element={
                <div className="p-6">
                  <h1 className="text-3xl font-bold">Settings Page</h1>
                </div>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />

      {/* React Query DevTools (only in development) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
