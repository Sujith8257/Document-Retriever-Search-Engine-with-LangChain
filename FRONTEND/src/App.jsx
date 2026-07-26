import React, { useState, useEffect } from "react";
import Upload from "./upload/Upload";
import Query from "./Response/Response";

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [apiBaseUrl, setApiBaseUrl] = useState(
    localStorage.getItem("apiBaseUrl") || "https://rag-zmjw.onrender.com"
  );
  const [fileId, setFileId] = useState(localStorage.getItem("file_id") || "");

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("apiBaseUrl", apiBaseUrl);
  }, [apiBaseUrl]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand-section">
          <h1>DocuSeek // RAG</h1>
          <div className="brand-subtitle">
            {fileId ? `Active File Session: ${fileId}` : "No Active Session — Upload Documents Below"}
          </div>
        </div>
        
        <div className="controls-section">
          <div className="control-group">
            <span className="control-label">API Backend</span>
            <select
              className="control-select"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
            >
              <option value="https://rag-zmjw.onrender.com">Cloud (Render)</option>
              <option value="http://localhost:5000">Local (Port 5000)</option>
            </select>
          </div>

          <div className="control-group">
            <span className="control-label">Theme</span>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              style={{ padding: "8px 12px", fontSize: "0.8rem", minWidth: "80px", margin: 0 }}
            >
              {theme === "light" ? "☾ Dark" : "☼ Light"}
            </button>
          </div>
        </div>
      </header>

      <main>
        {!fileId ? (
          <Upload apiBaseUrl={apiBaseUrl} fileId={fileId} setFileId={setFileId} />
        ) : (
          <Query apiBaseUrl={apiBaseUrl} fileId={fileId} setFileId={setFileId} />
        )}
      </main>
    </div>
  );
}

export default App;

