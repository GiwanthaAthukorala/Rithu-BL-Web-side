import { AuthProvider } from "@/Context/AuthContext";
import "@/styles/globals.css";
import { ErrorBoundary } from "react-error-boundary";
function ErrorFallback({ error }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
    </div>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ErrorBoundary>
    </>
  );
}
