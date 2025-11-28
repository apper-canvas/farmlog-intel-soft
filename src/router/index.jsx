import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "@/components/organisms/Layout";

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-green-50">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

// Lazy load page components
const DashboardPage = lazy(() => import("@/components/pages/DashboardPage"));
const FarmsPage = lazy(() => import("@/components/pages/FarmsPage"));
const CropsPage = lazy(() => import("@/components/pages/CropsPage"));
const TasksPage = lazy(() => import("@/components/pages/TasksPage"));
const ExpensesPage = lazy(() => import("@/components/pages/ExpensesPage"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));

// Define main routes
const mainRoutes = [
  {
    path: "",
    index: true,
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <DashboardPage />
      </Suspense>
    )
  },
  {
    path: "farms",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <FarmsPage />
      </Suspense>
    )
  },
  {
    path: "crops",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <CropsPage />
      </Suspense>
    )
  },
  {
    path: "tasks",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TasksPage />
      </Suspense>
    )
  },
  {
    path: "expenses",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ExpensesPage />
      </Suspense>
    )
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    )
  }
];

// Create routes array
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: mainRoutes
  }
];

export const router = createBrowserRouter(routes);