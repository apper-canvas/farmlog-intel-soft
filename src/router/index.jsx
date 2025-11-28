import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "@/components/organisms/Layout";
import Root from "@/layouts/Root";
import { getRouteConfig } from "@/router/route.utils";

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  </div>
);

// Lazy load page components
const DashboardPage = lazy(() => import("@/components/pages/DashboardPage"));
const FarmsPage = lazy(() => import("@/components/pages/FarmsPage"));
const CropsPage = lazy(() => import("@/components/pages/CropsPage"));
const TasksPage = lazy(() => import("@/components/pages/TasksPage"));
const ExpensesPage = lazy(() => import("@/components/pages/ExpensesPage"));
const Login = lazy(() => import("@/components/pages/Login"));
const Signup = lazy(() => import("@/components/pages/Signup"));
const Callback = lazy(() => import("@/components/pages/Callback"));
const ErrorPage = lazy(() => import("@/components/pages/ErrorPage"));
const ResetPassword = lazy(() => import("@/components/pages/ResetPassword"));
const PromptPassword = lazy(() => import("@/components/pages/PromptPassword"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));

const createRoute = ({
  path,
  index,
  element,
  access,
  children,
  ...meta
}) => {
  // Get config for this route
  let configPath;
  if (index) {
    configPath = "/";
  } else {
    configPath = path.startsWith('/') ? path : `/${path}`;
  }

  const config = getRouteConfig(configPath);
  const finalAccess = access || config?.allow;

  const route = {
    ...(index ? { index: true } : { path }),
    element: element ? <Suspense fallback={<LoadingFallback />}>{element}</Suspense> : element,
    handle: {
      access: finalAccess,
      ...meta,
    },
  };

  if (children && children.length > 0) {
    route.children = children;
  }

  return route;
};

// Define main routes
const mainRoutes = [
  createRoute({
    index: true,
    element: <DashboardPage />
  }),
  createRoute({
    path: "farms",
    element: <FarmsPage />
  }),
  createRoute({
    path: "crops",
    element: <CropsPage />
  }),
  createRoute({
    path: "tasks",
    element: <TasksPage />
  }),
  createRoute({
    path: "expenses",
    element: <ExpensesPage />
  }),
  createRoute({
    path: "*",
    element: <NotFound />
  })
];

// Create routes array
const routes = [
  {
    path: "/",
    element: <Root />,
    children: [
      // Auth routes
      createRoute({
        path: "login",
        element: <Login />
      }),
      createRoute({
        path: "signup",
        element: <Signup />
      }),
      createRoute({
        path: "callback",
        element: <Callback />
      }),
      createRoute({
        path: "error",
        element: <ErrorPage />
      }),
      createRoute({
        path: "reset-password/:appId/:fields",
        element: <ResetPassword />
      }),
      createRoute({
        path: "prompt-password/:appId/:emailAddress/:provider",
        element: <PromptPassword />
      }),
      // Main app routes
      {
        path: "/",
        element: <Layout />,
        children: mainRoutes
      }
    ]
  }
];

export const router = createBrowserRouter(routes);