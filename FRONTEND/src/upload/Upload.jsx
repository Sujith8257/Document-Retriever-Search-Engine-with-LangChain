import React, { useState } from 'react';

const Upload = ({ apiBaseUrl, fileId, setFileId }) => {
    const [files, setFiles] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' | 'error' | 'warning'
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0); // 0: idle, 1-4: active step, 5: finished

    const steps = [
        { id: 1, text: "Extracting raw text from documents" },
        { id: 2, text: "Splitting text into 400-character recursive chunks" },
        { id: 3, text: "Generating 384-dimensional dense vector embeddings" },
        { id: 4, text: "Syncing MongoDB Atlas vector search index" }
    ];

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFiles(e.dataTransfer.files);
            setMessage("");
            setMessageType("");
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(e.target.files);
            setMessage("");
            setMessageType("");
        }
    };

    const handleUpload = async (e) => {
        if (e) e.preventDefault();
        if (!files || files.length === 0) {
            setMessage("Please select or drop files first.");
            setMessageType("warning");
            return;
        }

        setLoading(true);
        setMessage("");
        setMessageType("");
        setCurrentStep(1);

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }

        // Simulate stages using incremental timeouts
        let timer1 = setTimeout(() => setCurrentStep(2), 2000); 
        let timer2 = setTimeout(() => setCurrentStep(3), 4500); 
        let timer3 = setTimeout(() => setCurrentStep(4), 7000); 

        try {
            const response = await fetch(`${apiBaseUrl}/uploadFiles`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            
            // Clear simulated timers to finalize immediately
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);

            if (response.ok) {
                setCurrentStep(5); // Complete all steps
                setMessage(`Success! Indexed ${files.length} document(s). Syncing workspace...`);
                setMessageType("success");
                
                // Allow user to see completed checkmarks before transitioning screen
                setTimeout(() => {
                    localStorage.setItem("file_id", data.file_id);
                    setFileId(data.file_id);
                    setFiles(null);
                    setLoading(false);
                    setCurrentStep(0);
                }, 1500);
            } else {
                setMessage(data.error || "Upload failed. Please verify files are correct format.");
                setMessageType("error");
                setLoading(false);
                setCurrentStep(0);
            }
        } catch (err) {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            setMessage("Network error: Could not reach the backend server.");
            setMessageType("error");
            setLoading(false);
            setCurrentStep(0);
        }
    };

    const removeFileSelection = () => {
        setFiles(null);
        setMessage("");
        setMessageType("");
    };

    const getStepClass = (stepId) => {
        if (currentStep > stepId || currentStep === 5) return "completed";
        if (currentStep === stepId) return "active";
        return "pending";
    };

    const getStepIndicator = (stepId) => {
        if (currentStep > stepId || currentStep === 5) return "✓";
        if (currentStep === stepId) return "●";
        return stepId;
    };

    return (
        <div className="card">
            <div className="card-title">
                <h2>1. Populate Search Index</h2>
                {fileId && (
                    <span className="file-chip">
                        Active ID: {fileId}
                    </span>
                )}
            </div>

            {loading ? (
                <div style={{ padding: '8px 0' }}>
                    <div className="progress-steps">
                        <div style={{ marginBottom: '8px', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                            RAG Ingestion Pipeline
                        </div>
                        {steps.map((step) => (
                            <div key={step.id} className={`step-item ${getStepClass(step.id)}`}>
                                <span className="step-indicator">
                                    {getStepIndicator(step.id)}
                                </span>
                                <span className="step-text">{step.text}</span>
                            </div>
                        ))}
                    </div>
                    {message && (
                        <div className={`status-msg ${messageType}`}>
                            <span>{message}</span>
                        </div>
                    )}
                </div>
            ) : (
                <form onSubmit={handleUpload}>
                    <div 
                        className={`file-upload-zone ${dragActive ? 'drag-active' : ''}`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                    >
                        <span className="file-upload-icon">📄</span>
                        <p className="file-upload-text">
                            {files ? `${files.length} File(s) Staged` : "Drag and drop your PDF or CSV files here"}
                        </p>
                        <p className="file-upload-hint">or click inside this zone to browse</p>
                        
                        <input 
                            type="file" 
                            multiple 
                            accept=".pdf,.csv"
                            className="file-input-hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {files && files.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                            <div className="control-label">Staged Files:</div>
                            <div className="file-chips-container">
                                {Array.from(files).map((f, i) => (
                                    <span key={i} className="file-chip">
                                        {f.name} ({Math.round(f.size / 1024)} KB)
                                    </span>
                                ))}
                                <button 
                                    type="button" 
                                    className="file-chip-remove"
                                    onClick={removeFileSelection}
                                    style={{ marginLeft: 'auto' }}
                                    title="Remove staged files"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className={`status-msg ${messageType || 'warning'}`}>
                            <span>{message}</span>
                        </div>
                    )}

                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                            type="submit" 
                            disabled={!files}
                        >
                            Upload & Embed Documents
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Upload;