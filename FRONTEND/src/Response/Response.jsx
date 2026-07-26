import React, { useState } from "react";

const Query = ({ apiBaseUrl, fileId, setFileId }) => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = () => {
    localStorage.removeItem("file_id");
    setFileId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileId) {
      setMessage("Please upload and index some files first to create a session.");
      return;
    }
    if (!query.trim()) {
      setMessage("Please enter a query.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${apiBaseUrl}/uploadQuery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: query,
          file_id: fileId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        setMessage(data.error || "Query failed. Try adjusting your query.");
        setResponse({});
      }
    } catch (err) {
      setMessage("Network error: Could not reach the backend server.");
      setResponse({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        <h2>2. Query Knowledge Base</h2>
        <button
          type="button"
          className="secondary-btn"
          onClick={handleReset}
          style={{ padding: "6px 12px", fontSize: "0.8rem", margin: 0 }}
        >
          New Session
        </button>
      </div>

      {!fileId ? (
        <div className="empty-state">
          <span className="empty-state-icon">🔍</span>
          <p>No active document session.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            Please use the upload zone above to embed some PDFs or CSVs first.
          </p>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="search-form">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Ask anything about the uploaded documents..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading || !query.trim()}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </button>
          </form>

          {message && (
            <div className="status-msg error" style={{ marginTop: '16px' }}>
              <span>{message}</span>
            </div>
          )}

          {loading && !response.ai_response && (
            <div className="status-msg warning" style={{ marginTop: '24px' }}>
              <span className="spinner"></span>
              <span>Querying vector databases and generating response...</span>
            </div>
          )}

          {response.ai_response && (
            <div className="ai-response-box">
              <h3 className="ai-response-title">AI Response</h3>
              <div className="ai-response-body">{response.ai_response}</div>

              {response.documents && response.documents.length > 0 && (
                <>
                  <h4 className="citations-title">Sources & Context retrieved ({response.documents.length})</h4>
                  <div className="citations-list">
                    {response.documents.map((doc, index) => (
                      <div key={index} className="citation-card">
                        <p>{doc.text}</p>
                        <div className="citation-meta">
                          <span>SOURCE BLOCK #{index + 1}</span>
                          <span className="citation-score">Cosine Score: {Number(doc.score).toFixed(4)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Query;