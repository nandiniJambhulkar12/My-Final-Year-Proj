import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, X, AlertCircle } from "lucide-react";

interface CodeInputProps {
  onAnalyzeSubmit: (payload: { code?: string; files?: File[] }) => void;
  isLoading?: boolean;
}

const SUPPORTED_FILE_EXTENSIONS = [
  ".js",
  ".ts",
  ".py",
  ".java",
  ".cpp",
  ".c",
  ".cs",
  ".php",
  ".go",
  ".rs",
  ".rb",
  ".sql",
  ".sh",
];

const CodeInput: React.FC<CodeInputProps> = ({
  onAnalyzeSubmit,
  isLoading = false,
}) => {
  const [code, setCode] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const isSupportedFile = (file: File) => {
    return (
      file.type.startsWith("text/") ||
      SUPPORTED_FILE_EXTENSIONS.some((ext) =>
        file.name.toLowerCase().endsWith(ext),
      )
    );
  };

  const loadSingleFilePreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCode((e.target?.result as string) || "");
    };
    reader.readAsText(file);
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(isSupportedFile);
    if (!validFiles.length) {
      alert(
        "Please upload a valid code file (.js, .ts, .py, .java, .cpp, .c, .cs, .php, .go, .rs, .rb, .sql, .sh)",
      );
      return;
    }

    // Only accept the first file
    const fileToUpload = [validFiles[0]];

    if (validFiles.length > 1) {
      alert("Only one file can be uploaded at a time. Using the first file.");
    }

    setUploadedFiles(fileToUpload);
    loadSingleFilePreview(fileToUpload[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (fileName?: string) => {
    setUploadedFiles([]);
    setCode("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    // Prevent multiple submissions
    if (isLoading) {
      return;
    }

    if (uploadedFiles.length > 0) {
      onAnalyzeSubmit({ files: uploadedFiles, code });
      return;
    }

    if (code.trim()) {
      onAnalyzeSubmit({ code });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Code Input
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Upload your code file or paste code directly for risk analysis
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-primary-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".js,.ts,.py,.java,.cpp,.c,.cs,.php,.go,.rs,.rb,.sql,.sh,.txt"
          onChange={handleFileInput}
          aria-label="Upload a source code file"
          title="Upload a source code file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Drop your code file here
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          or click to browse a file
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Supports: JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust,
          PHP, Ruby, SQL, Shell
        </p>
      </div>

      {/* Uploaded File Info */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              File selected for analysis: {uploadedFiles[0]?.name}
            </p>
            <button
              onClick={() => removeFile()}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={`${file.name}-${file.size}`}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile()}
                  aria-label={`Remove ${file.name}`}
                  title={`Remove ${file.name}`}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Code Editor */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Code Editor
        </label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={
            uploadedFiles.length > 0
              ? "File uploaded. Code preview is shown here."
              : "Paste your code here or upload a file..."
          }
          readOnly={uploadedFiles.length > 0}
          className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <AlertCircle className="w-4 h-4" />
          <span>
            Analysis will detect security vulnerabilities and code quality
            issues
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={(!code.trim() && uploadedFiles.length === 0) || isLoading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Analyze Code</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default CodeInput;
