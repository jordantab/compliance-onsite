"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const [projectUrl, setProjectUrl] = useState("");
  const [serviceKey, setServiceKey] = useState("");
  const [auditResults, setAuditResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAudit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAuditResults(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectUrl, serviceKey }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || "Audit failed");
      }

      const data = await response.json();
      setAuditResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 p-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-full"
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
            />
          </svg>
        )}
      </button>

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Supabase Compliance Audit
        </h1>

        <form
          onSubmit={handleAudit}
          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded shadow-md space-y-4"
        >
          <div>
            <label htmlFor="projectUrl" className="block font-medium">
              Supabase Project URL
            </label>
            <input
              type="url"
              id="projectUrl"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="URL"
              className="w-full border-gray-300 dark:border-gray-600 rounded p-2 mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label htmlFor="serviceKey" className="block font-medium">
              Service Role Key
            </label>
            <input
              type="password"
              id="serviceKey"
              value={serviceKey}
              onChange={(e) => setServiceKey(e.target.value)}
              placeholder="Service Role Key"
              className="w-full border-gray-300 dark:border-gray-600 rounded p-2 mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-800"
          >
            {loading ? "Running Audit..." : "Run Audit"}
          </button>
        </form>

        {error && (
          <p className="text-red-500 dark:text-red-400 mt-4 text-center">
            <strong>Error:</strong> {error}
          </p>
        )}
      </div>

      <div className="p-6">
        {auditResults && (
          <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded shadow-md">
            <h2 className="text-xl font-bold mb-4">Audit Results</h2>

            {/* MFA Results */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Users Without MFA</h3>
              <p className="text-gray-400 text-sm">
                Last checked:{" "}
                {new Date(auditResults.mfaAudit.timestamp).toLocaleString()}
              </p>
              {auditResults.mfaAudit.usersWithoutMFA.length > 0 ? (
                <ul className="list-disc pl-5">
                  {auditResults.mfaAudit.usersWithoutMFA.map((user, index) => (
                    <li key={index}>{user}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-600 dark:text-green-400">
                  All users have MFA enabled.
                </p>
              )}
            </div>

            {/* RLS Results */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Tables Without RLS</h3>
              <p className="text-gray-400 text-sm">
                Last checked:{" "}
                {new Date(auditResults.rlsAudit.timestamp).toLocaleString()}
              </p>
              {auditResults.rlsAudit.tablesWithoutRLS.length > 0 ? (
                <ul className="list-disc pl-5">
                  {auditResults.rlsAudit.tablesWithoutRLS.map(
                    (table, index) => (
                      <li key={index}>{table}</li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-green-600 dark:text-green-400">
                  All tables have Row Level Security (RLS) enabled.
                </p>
              )}
            </div>

            {/* PITR Results */}
            <div>
              <h3 className="text-lg font-semibold">
                Point-In-Time Recovery (PITR) Status
              </h3>
              <p className="text-gray-400 text-sm">
                Last checked:{" "}
                {new Date(auditResults.pitrAudit.timestamp).toLocaleString()}
              </p>
              <p
                className={`p-4 rounded ${
                  auditResults.pitrAudit.pitrStatus
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                }`}
              >
                {auditResults.pitrAudit.pitrStatus
                  ? "PITR is enabled."
                  : "PITR is not enabled."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
