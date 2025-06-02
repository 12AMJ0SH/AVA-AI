import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  onValue,
  set,
  remove,
  push, // Import push for adding new unique entries
  query, // Import query for ordering/limiting
  limitToLast, // Import limitToLast for fetching recent entries
  orderByChild // Import orderByChild for ordering
} from 'firebase/database';
import {
  Settings, Sun, Moon, Send, X, Bot, User, MessageSquare, LogIn, UserPlus, LogOut, Trash2, Download, Eye, EyeOff, Code, Image, Shield, Clock, Music, Activity, FileText, Layout, BarChart, MessageSquareX, Link, Megaphone, MessageSquareHeart, CheckCircle, Ban, Plus, Edit, Save, AlertCircle, Bell, Database, PieChart, ToggleRight, Menu, MessageSquarePlus
} from 'lucide-react';

// Global variables provided by the environment
const firebaseConfig = {
   apiKey: "AIzaSyAEWD4sLqLLjJUue-2YKwvAz8ZzLtKUZwo",
  authDomain: "ava-ai-9f11d.firebaseapp.com",
  databaseURL: "https://ava-ai-9f11d-default-rtdb.firebaseio.com",
  projectId: "ava-ai-9f11d",
  storageBucket: "ava-ai-9f11d.firebasestorage.app",
  messagingSenderId: "433666375997",
  appId: "1:433666375997:web:d81f76d4c93bf3ca6f8554",
  measurementId: "G-CYLPVC4S2P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Custom Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-scale-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-7 w-full max-w-md transform transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="text-gray-700 dark:text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
};

// Custom Message Box Component
const MessageBox = ({ isOpen, onClose, message, type = 'info' }) => {
  if (!isOpen) return null;

  const bgColor = type === 'error' ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900';
  const textColor = type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200';
  const borderColor = type === 'error' ? 'border-red-400' : 'border-green-400';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-scale-in">
      <div className={`rounded-2xl shadow-xl p-6 w-full max-w-sm transform transition-all duration-300 border ${borderColor} ${bgColor}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${textColor}`}>{type === 'error' ? 'Error' : 'Success'}</h2>
          <button onClick={onClose} className={`p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${textColor}`}>
            <X size={24} />
          </button>
        </div>
        <p className={`${textColor}`}>{message}</p>
      </div>
    </div>
  );
};

// Login Modal Component
const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (err) {
      setError(err.message);
      console.error("Login error:", err);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err) {
      setError(err.message);
      console.error("Google login error:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Login">
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10 placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <button
          type="submit"
          className="w-full bg-gradient-to-br from-blue-500 to-blue-700 text-white p-3.5 rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-98"
        >
          Login
        </button>
      </form>
      <div className="mt-7 text-center">
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-gray-800 px-3 text-gray-500 dark:text-gray-400">OR</span>
          </div>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-98"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className="w-5 h-5 mr-3"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/20x20/cccccc/000000?text=G'; }}
          />
          Continue with Google
        </button>
      </div>
    </Modal>
  );
};

// Signup Modal Component
const SignupModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (err) {
      setError(err.message);
      console.error("Signup error:", err);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err) {
      setError(err.message);
      console.error("Google signup error:", err);
    }
    };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign Up">
      <form onSubmit={handleSignup} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10 placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <button
          type="submit"
          className="w-full bg-gradient-to-br from-green-500 to-green-700 text-white p-3.5 rounded-xl hover:from-green-600 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-98"
        >
          Sign Up
        </button>
      </form>
      <div className="mt-7 text-center">
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-gray-800 px-3 text-gray-500 dark:text-gray-400">OR</span>
          </div>
        </div>
        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-98"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className="w-5 h-5 mr-3"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/20x20/cccccc/000000?text=G'; }}
          />
          Continue with Google
        </button>
      </div>
    </Modal>
  );
};

// Settings Modal Component
const SettingsModal = ({ isOpen, onClose, userId, onClearChat, onExportChat, showMessageBox }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Chat Management</h3>
          <button
            onClick={async () => {
              await onClearChat();
              onClose();
            }}
            className="w-full flex items-center justify-center p-3.5 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-xl hover:from-red-600 hover:to-red-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-98 mb-2"
          >
            <Trash2 size={20} className="mr-2" /> Clear Current Chat History
          </button>
          <button
            onClick={async () => {
              await onExportChat();
              onClose();
              showMessageBox('Current chat history exported successfully!');
            }}
            className="w-full flex items-center justify-center p-3.5 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl hover:from-green-600 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-98"
          >
            <Download size={20} className="mr-2" /> Export Current Chat History (JSON)
          </button>
        </div>
        {userId && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">User Information</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 break-all bg-gray-100 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <strong>User ID:</strong> {userId}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Chat Panel Component
const ChatPanel = ({ chatHistory, isLoadingAI, message, setMessage, sendMessage, chatMessagesEndRef }) => (
  // Conditional width and padding based on split screen mode
  <div className="flex flex-col h-full flex-1">
    {/* Chat Messages */}
    <div className="flex-1 overflow-y-auto p-5 space-y-5 rounded-3xl bg-white dark:bg-gray-800 shadow-inner border border-gray-200 dark:border-gray-700 mb-6 hide-scrollbar min-h-0">
      {chatHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
          <MessageSquare size={72} className="mb-5 text-blue-400 dark:text-blue-300" />
          <p className="text-2xl font-semibold mb-3">Welcome to AVA AI Chat!</p>
          <p className="text-lg">Start a conversation by typing a message below.</p>
          <p className="text-md mt-3 opacity-80">
            Try asking: "What is the capital of France?", "Tell me a short story.", or "Write a Python function to sort a list."
          </p>
        </div>
      ) : (
        chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end max-w-[80%] transition-all duration-200 ${
              msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
            }`}
          >
            {msg.role === 'bot' && (
              <Bot size={26} className="flex-shrink-0 text-blue-600 dark:text-blue-400 mr-3" />
            )}
            <div
              className={`p-4 rounded-2xl shadow-lg ring-1 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white ring-blue-400/50'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-gray-100 ring-gray-200 dark:ring-gray-600'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
            {msg.role === 'user' && (
              <User size={26} className="flex-shrink-0 text-gray-600 dark:text-gray-400 ml-3" />
            )}
          </div>
        ))
      )}
      {isLoadingAI && (
        <div className="flex items-end justify-start max-w-[80%] mr-auto">
          <Bot size={26} className="flex-shrink-0 text-blue-600 dark:text-blue-400 mr-3" />
          <div className="p-4 rounded-2xl shadow-lg ring-1 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-gray-100 ring-gray-200 dark:ring-gray-600">
            <p className="animate-pulse leading-relaxed">AVA AI is thinking...</p>
          </div>
        </div>
      )}
      <div ref={chatMessagesEndRef} /> {/* Scroll target */}
    </div>

    {/* Message Input */}
    <div className="relative flex items-center bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
      <input
        type="text"
        value={message}
        onChange={(e) => e.target.value.length <= 1000 && setMessage(e.target.value)} // Character limit
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Type your message here..."
        className="flex-1 p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
        disabled={isLoadingAI}
      />
      <button
        onClick={sendMessage}
        className="ml-4 p-3.5 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98 disabled:from-blue-400 disabled:to-blue-500 dark:disabled:from-blue-700 dark:disabled:to-blue-800"
        disabled={isLoadingAI}
      >
        <Send size={24} />
      </button>
    </div>
  </div>
);

// New Code Canvas Component
const WorkspaceContent = ({ code, setCode, theme, workspaceLanguage, setWorkspaceLanguage, saveSettings }) => {
  const [previewContent, setPreviewContent] = useState('');
  const [activeTab, setActiveTab] = useState('code'); // 'code' or 'preview'
  const editorContainerRef = useRef(null);
  const monacoEditorRef = useRef(null);
  const [isMonacoLoaded, setIsMonacoLoaded] = useState(false); // New state to track Monaco loading

  // List of common web languages for the dropdown
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'xml', label: 'XML' },
    { value: 'yaml', label: 'YAML' },
    { value: 'sql', label: 'SQL' },
  ];

  // Function to create/recreate the Monaco editor instance
  const createEditor = useCallback(() => {
    if (!editorContainerRef.current || !window.monaco || !window.monaco.editor) {
      console.warn("Monaco editor container or monaco object not ready for creation.");
      return;
    }

    // Dispose of existing editor if it exists to prevent multiple instances
    if (monacoEditorRef.current) {
      monacoEditorRef.current.dispose();
      monacoEditorRef.current = null;
    }

    try {
      monacoEditorRef.current = window.monaco.editor.create(editorContainerRef.current, {
        value: code,
        language: workspaceLanguage,
        theme: theme === 'dark' ? 'vs-dark' : 'vs-light',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 16,
        lineHeight: 24,
        tabSize: 2,
        insertSpaces: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        padding: {
          top: 10,
          bottom: 10
        }
      });

      monacoEditorRef.current.onDidChangeModelContent(() => {
        setCode(monacoEditorRef.current.getValue());
      });

      requestAnimationFrame(() => {
        if (monacoEditorRef.current) {
          monacoEditorRef.current.layout();
        }
      });
    } catch (e) {
      console.error("Error creating Monaco editor:", e);
      // Potentially display an error message to the user
    }
  }, [code, workspaceLanguage, theme, setCode]);

  // Effect to manage Monaco Editor loading and initialization
  useEffect(() => {
    if (activeTab !== 'code' || !editorContainerRef.current) {
      return;
    }

    // If Monaco is already loaded and ready, just create/recreate editor
    if (isMonacoLoaded && window.monaco && window.monaco.editor) {
      createEditor();
      return;
    }

    const loadMonacoScript = () => {
      // Prevent adding the script multiple times
      if (document.getElementById('monaco-loader-script')) {
        // If script is already in DOM, check if Monaco is ready
        if (window.monaco && window.monaco.editor) {
          setIsMonacoLoaded(true);
          createEditor();
        }
        return;
      }

      const script = document.createElement('script');
      script.id = 'monaco-loader-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.48.0/min/vs/loader.min.js';
      script.async = true;
      script.onload = () => {
        // Ensure require is available before configuring
        if (window.require) {
          window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.48.0/min/vs' } });
          window.require(['vs/editor/editor.main'], () => {
            setIsMonacoLoaded(true); // Mark Monaco as loaded
            createEditor(); // Now that Monaco is loaded, create the editor
          });
        } else {
          console.error("Monaco loader loaded, but window.require is not available.");
        }
      };
      script.onerror = (e) => {
        console.error("Failed to load Monaco Editor loader script:", e);
        // Inform user or log a system event about script loading failure
      };
      document.body.appendChild(script);
    };

    loadMonacoScript();

    return () => {
      // Dispose editor when component unmounts or tab changes away from 'code'
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
        monacoEditorRef.current = null;
      }
    };
  }, [activeTab, editorContainerRef, isMonacoLoaded, createEditor]); // Added isMonacoLoaded and createEditor to dependencies

  // Effect to update editor language when workspaceLanguage changes
  useEffect(() => {
    if (monacoEditorRef.current && isMonacoLoaded) {
      window.monaco.editor.setModelLanguage(monacoEditorRef.current.getModel(), workspaceLanguage);
    }
  }, [workspaceLanguage, isMonacoLoaded]);


  // Function to render HTML/CSS/JS in an iframe for live preview
  const generatePreview = useCallback(() => {
    let outputHtml = '';

    // Determine preview type based on selected language
    switch (workspaceLanguage) {
      case 'html':
        outputHtml = code;
        break;
      case 'css':
        outputHtml = `<style>${code}</style><div style="padding: 20px; font-family: sans-serif; background-color: #f0f4f8; color: #333;">CSS Preview (styles applied to this text). This is a basic div to demonstrate styles.</div>`;
        break;
      case 'javascript':
      case 'typescript':
        outputHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${workspaceLanguage === 'typescript' ? 'TS' : 'JS'} Preview</title>
            <style>body { font-family: sans-serif; padding: 20px; background-color: #f0f4f8; color: #333; }</style>
          </head>
          <body>
            <h2>${workspaceLanguage === 'typescript' ? 'TypeScript' : 'JavaScript'} Output:</h2>
            <pre id="output"></pre>
            <script type="text/javascript">
              // Note: This iframe runs TypeScript as JavaScript. For full TS features (e.g., type checking),
              // a build step or client-side transpiler (like Babel Standalone) would be needed.
              const originalConsoleLog = console.log;
              let consoleOutput = '';
              console.log = (...args) => {
                consoleOutput += args.map(String).join(' ') + '\\n';
                originalConsoleLog(...args); // Also log to the parent console
              };

              try {
                ${code}
                document.getElementById('output').textContent = 'Execution successful.\\n' + consoleOutput;
              } catch (e) {
                document.getElementById('output').textContent = 'Error: ' + e.message + '\\n' + consoleOutput;
                console.error('Error in preview script:', e);
              }
            </script>
          </body>
          </html>
        `;
        break;
      case 'markdown':
        // For markdown, we'll just display it as preformatted text for now.
        // A full markdown renderer would require a library like 'marked'.
        outputHtml = `<pre style="font-family: monospace; white-space: pre-wrap; padding: 20px; background-color: #f0f4f8; color: #333;">${code}</pre>`;
        break;
      default:
        // For other languages, display the code as preformatted text
        outputHtml = `<pre style="font-family: monospace; white-space: pre-wrap; padding: 20px; background-color: #f0f4f8; color: #333;">${code}</pre>`;
        break;
    }
    setPreviewContent(outputHtml);
  }, [code, workspaceLanguage]);

  useEffect(() => {
    if (activeTab === 'preview') {
      generatePreview();
    }
  }, [code, activeTab, generatePreview]);

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setWorkspaceLanguage(newLanguage);
    saveSettings({ workspaceLanguage: newLanguage }); // Save the new language
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Code Canvas</h2>

      {/* Tab Buttons and Language Selector */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        <div className="flex">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 text-lg font-medium rounded-t-lg transition-colors duration-200 ${
              activeTab === 'code'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-lg font-medium rounded-t-lg transition-colors duration-200 ${
              activeTab === 'preview'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Preview
          </button>
        </div>
        <div className="relative">
          <select
            value={workspaceLanguage}
            onChange={handleLanguageChange}
            className="block appearance-none w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white py-2 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 transition-colors cursor-pointer"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'code' && (
        <div
          ref={editorContainerRef}
          className="flex-1 w-full rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600"
          style={{ minHeight: '200px' }}
        ></div>
      )}

      {activeTab === 'preview' && (
        <div
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 overflow-hidden"
        >
          <iframe
            title="Code Preview"
            srcDoc={previewContent}
            className="w-full h-full bg-white dark:bg-gray-900"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      )}
    </div>
  );
};


// AuthPromptScreen Component for unauthenticated users
const AuthPromptScreen = ({ onLoginClick, onSignupClick }) => (
  <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-inner border border-gray-200 dark:border-gray-700">
    <img
      src="https://placehold.co/128x128/3b82f6/ffffff?text=AVA"
      alt="AVA AI Logo"
      className="w-36 h-36 mb-8 rounded-full shadow-lg"
    />
    <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-5 tracking-tight">Welcome to AVA AI</h2>
    <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mb-10 leading-relaxed">
      Your ultimate living intelligence for creative content, insightful conversations, and future workspace capabilities.
    </p>
    <div className="flex space-x-5">
      <button
        onClick={onLoginClick}
        className="flex items-center px-8 py-4 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300 font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-98"
      >
        <LogIn size={24} className="mr-3" /> Login
      </button>
      <button
        onClick={onSignupClick}
        className="flex items-center px-8 py-4 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl shadow-lg hover:from-green-600 hover:to-green-800 transition-all duration-300 font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-98"
      >
        <UserPlus size={24} className="mr-3" /> Sign Up
      </button>
    </div>
  </div>
);

// New ImageGenerator Component
const ImageGenerator = ({ userId, showMessageBox, logActivity }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [error, setError] = useState('');

  const generateImage = async () => {
    if (!prompt.trim()) {
      showMessageBox('Please enter a prompt to generate an image.', 'error');
      return;
    }
    if (!userId) {
      showMessageBox('Please log in to generate images.', 'error');
      return;
    }

    setIsLoadingImage(true);
    setGeneratedImageUrl('');
    setError('');

    logActivity('image_generation_request', { prompt: prompt.trim() });

    try {
      const payload = { instances: { prompt: prompt.trim() }, parameters: { "sampleCount": 1} };
      const apiKey = ""; // Canvas will provide this at runtime if empty
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Image API Error Response:", errorData);
        throw new Error(`Image generation failed: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();

      if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
        const imageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
        setGeneratedImageUrl(imageUrl);
        logActivity('image_generation_success', { prompt: prompt.trim(), imageUrl: imageUrl });
      } else {
        setError('Failed to generate image. Please try a different prompt.');
        console.error("Image generation response unexpected:", result);
        logActivity('image_generation_failure', { prompt: prompt.trim(), error: 'Empty or malformed response' });
      }
    } catch (err) {
      setError(`An error occurred during image generation: ${err.message}. Please check your network and try again.`);
      console.error("Error generating image:", err);
      logActivity('image_generation_failure', { prompt: prompt.trim(), error: err.message });
    } finally {
      setIsLoadingImage(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">Image Generator</h2>

      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && generateImage()}
          placeholder="Enter your image prompt here (e.g., 'A futuristic city at sunset')"
          className="flex-1 p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
          disabled={isLoadingImage}
        />
        <button
          onClick={generateImage}
          className="p-3.5 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl hover:from-purple-600 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98 disabled:from-purple-400 disabled:to-purple-500 dark:disabled:from-purple-700 dark:disabled:to-purple-800 font-semibold flex items-center justify-center min-w-[150px]"
          disabled={isLoadingImage}
        >
          {isLoadingImage ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <Image size={20} className="mr-2" /> Generate Image
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="text-red-500 text-center text-sm bg-red-100 dark:bg-red-900 p-3 rounded-lg border border-red-400">
          {error}
        </div>
      )}

      {generatedImageUrl && (
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-600 overflow-hidden">
          <img
            src={generatedImageUrl}
            alt="Generated AI Image"
            className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/400x300/cccccc/000000?text=Image+Load+Error';
              setError('Failed to load generated image. It might be corrupted or a temporary issue.');
            }}
          />
        </div>
      )}

      {!generatedImageUrl && !isLoadingImage && !error && (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-600">
          <Image size={72} className="mb-5 text-purple-400 dark:text-purple-300" />
          <p className="text-xl font-semibold mb-3">Your generated image will appear here.</p>
          <p className="text-md opacity-80">
            Enter a descriptive prompt above to create unique images.
          </p>
        </div>
      )}
    </div>
  );
};

// Admin List Component
const AdminList = ({ userId, adminList, showMessageBox }) => {
  const [newAdminId, setNewAdminId] = useState('');

  const addAdmin = async () => {
    if (!newAdminId.trim()) {
      showMessageBox('Please enter a user ID to add as admin.', 'error');
      return;
    }
    if (adminList.includes(newAdminId.trim())) {
      showMessageBox('This user is already an admin.', 'info');
      return;
    }

    const adminsPath = `public/admins`;
    try {
      const updatedAdmins = { ...adminList.reduce((acc, uid) => ({ ...acc, [uid]: true }), {}), [newAdminId.trim()]: true };
      await set(ref(db, adminsPath), updatedAdmins);
      showMessageBox(`User ${newAdminId.trim()} added as admin.`, 'success');
      setNewAdminId('');
    } catch (e) {
      showMessageBox('Failed to add admin. Please try again.', 'error');
      console.error("Error adding admin:", e);
    }
  };

  const removeAdmin = async (adminToRemoveId) => {
    if (adminToRemoveId === userId) {
      showMessageBox('You cannot remove yourself as an admin.', 'error');
      return;
    }

    const adminsPath = `public/admins`;
    try {
      const updatedAdmins = { ...adminList.reduce((acc, uid) => ({ ...acc, [uid]: true }), {}) };
      delete updatedAdmins[adminToRemoveId];
      await set(ref(db, adminsPath), updatedAdmins);
      showMessageBox(`User ${adminToRemoveId} removed from admins.`, 'success');
    } catch (e) {
      showMessageBox('Failed to remove admin. Please try again.', 'error');
      console.error("Error removing admin:", e);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Current Admins:</h3>
      <ul className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 max-h-48 overflow-y-auto hide-scrollbar">
        {adminList.length > 0 ? (
          adminList.map((adminUid) => (
            <li key={adminUid} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
              <span className="font-mono text-gray-800 dark:text-gray-200 break-all">{adminUid}</span>
              {adminUid !== userId && (
                <button
                  onClick={() => removeAdmin(adminUid)}
                  className="ml-4 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-98"
                  title={`Remove ${adminUid} from admins`}
                >
                  <X size={18} />
                </button>
              )}
            </li>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">No admins currently listed.</p>
        )}
      </ul>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Admin:</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={newAdminId}
            onChange={(e) => setNewAdminId(e.target.value)}
            placeholder="Enter User ID to add as admin"
            className="flex-1 p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            onClick={addAdmin}
            className="p-3.5 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl hover:from-green-600 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98 font-semibold flex items-center justify-center min-w-[120px]"
          >
            <UserPlus size={20} className="mr-2" /> Add Admin
          </button>
        </div>
      </div>
    </div>
  );
};

// Downtime Settings Component
const DowntimeSettings = ({ showMessageBox }) => {
  // Local states for the form inputs
  const [downtimeEnabledLocal, setDowntimeEnabledLocal] = useState(false);
  const [downtimeTypeLocal, setDowntimeTypeLocal] = useState('regular');
  const [countdownMinutesLocal, setCountdownMinutesLocal] = useState(30);
  const [musicEnabledLocal, setMusicEnabledLocal] = useState(false);
  const [musicUrlLocal, setMusicUrlLocal] = useState("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
  const [customMessageLocal, setCustomMessageLocal] = useState("AVA AI is currently undergoing maintenance. We'll be back soon!");
  const [customScreenHtmlLocal, setCustomScreenHtmlLocal] = useState("");
  const [isSaving, setIsSaving] = useState(false); // New state to indicate saving process

  // Ref to track if initial settings have been loaded from Firebase
  const hasLoadedInitialSettings = useRef(false);

  // Effect to load settings from Firebase only once on component mount
  useEffect(() => {
    const downtimeRef = ref(db, 'public/downtime');
    const unsubscribe = onValue(downtimeRef, (snapshot) => {
      const data = snapshot.val();
      if (data && !hasLoadedInitialSettings.current) { // Only set local state from Firebase on initial load
        setDowntimeEnabledLocal(data.enabled || false);
        setDowntimeTypeLocal(data.type || 'regular');
        if (data.type === 'countdown' && data.countdownEndTime) {
          const remainingMs = data.countdownEndTime - Date.now();
          setCountdownMinutesLocal(Math.ceil(remainingMs / (1000 * 60)));
        } else {
          setCountdownMinutesLocal(30);
        }
        setMusicEnabledLocal(data.musicEnabled || false);
        setMusicUrlLocal(data.musicUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
        setCustomMessageLocal(data.customMessage || "AVA AI is currently undergoing maintenance. We'll be back soon!");
        setCustomScreenHtmlLocal(data.customScreenHtml || "");
        hasLoadedInitialSettings.current = true; // Mark as loaded
      }
    }, (error) => {
      console.error("Failed to load downtime settings:", error);
      showMessageBox("Failed to load downtime settings.", "error");
    });

    return () => unsubscribe();
  }, [showMessageBox]); // showMessageBox is a stable prop, so this effect runs once

  // Function to save settings to Firebase
  const handleSaveDowntimeSettings = async () => {
    setIsSaving(true);
    const downtimeRef = ref(db, 'public/downtime');
    let countdownEndTime = null;

    if (downtimeTypeLocal === 'countdown' && downtimeEnabledLocal) {
      countdownEndTime = Date.now() + (countdownMinutesLocal * 60 * 1000);
    }

    const settingsToSave = {
      enabled: downtimeEnabledLocal,
      type: downtimeTypeLocal,
      countdownEndTime: countdownEndTime,
      musicEnabled: musicEnabledLocal,
      musicUrl: musicUrlLocal,
      customMessage: customMessageLocal,
      customScreenHtml: customScreenHtmlLocal
    };

    try {
      await set(downtimeRef, settingsToSave);
      showMessageBox("Downtime settings saved successfully!", "success");
    } catch (e) {
      showMessageBox("Failed to save downtime settings.", "error");
      console.error("Error saving downtime settings:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 overflow-y-auto hide-scrollbar p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Downtime Settings:</h3>

      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
        <label htmlFor="downtime-toggle" className="text-lg font-medium text-gray-900 dark:text-white">Enable Downtime:</label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="downtime-toggle"
            className="sr-only peer"
            checked={downtimeEnabledLocal}
            onChange={(e) => setDowntimeEnabledLocal(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {downtimeEnabledLocal && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mt-4">Downtime Type:</h4>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="downtimeType"
                value="regular"
                checked={downtimeTypeLocal === 'regular'}
                onChange={() => setDowntimeTypeLocal('regular')}
                className="form-radio text-blue-600 h-5 w-5"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Regular Downtime</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="downtimeType"
                value="countdown"
                checked={downtimeTypeLocal === 'countdown'}
                onChange={() => setDowntimeTypeLocal('countdown')}
                className="form-radio text-blue-600 h-5 w-5"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Countdown Downtime</span>
            </label>
          </div>

          {downtimeTypeLocal === 'countdown' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Countdown Duration (Minutes):</label>
              <input
                type="number"
                value={countdownMinutesLocal}
                onChange={(e) => setCountdownMinutesLocal(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
            <label htmlFor="music-toggle" className="text-lg font-medium text-gray-900 dark:text-white">Play Music During Downtime:</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="music-toggle"
                className="sr-only peer"
                checked={musicEnabledLocal}
                onChange={(e) => setMusicEnabledLocal(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {musicEnabledLocal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Music URL (MP3):</label>
              <input
                type="url"
                value={musicUrlLocal}
                onChange={(e) => setMusicUrlLocal(e.target.value)}
                placeholder="https://example.com/your-music.mp3"
                className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Downtime Message:</label>
            <textarea
              value={customMessageLocal}
              onChange={(e) => setCustomMessageLocal(e.target.value)}
              rows="4"
              placeholder="e.g., We're performing an important update!"
              className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Downtime Screen (HTML - Advanced):</label>
            <textarea
              value={customScreenHtmlLocal}
              onChange={(e) => setCustomScreenHtmlLocal(e.target.value)}
              rows="6"
              placeholder="Enter full HTML for a custom screen, or leave blank for message only."
              className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
            ></textarea>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              **Warning:** This will override the custom message and default screen. Use with caution.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={handleSaveDowntimeSettings}
        className="w-full p-3.5 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save Downtime Settings'}
      </button>
    </div>
  );
};

// User Activity Panel
const UserActivityPanel = ({ userId }) => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const activityRef = ref(db, 'public/activity_logs');
    // Query for the last 50 activities, ordered by timestamp
    const recentActivityQuery = query(activityRef, limitToLast(50));

    const unsubscribe = onValue(recentActivityQuery, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const loadedLogs = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })).sort((a, b) => b.timestamp - a.timestamp); // Sort descending by timestamp
          setActivityLogs(loadedLogs);
        } else {
          setActivityLogs([]);
        }
      } catch (e) {
        setError('Failed to parse activity logs.');
        console.error("Error parsing activity logs:", e);
      } finally {
        setIsLoadingLogs(false);
      }
    }, (err) => {
      setError('Failed to load activity logs from Firebase.');
      console.error("Firebase activity logs read failed:", err);
      setIsLoadingLogs(false);
    });

    return () => unsubscribe();
  }, [userId]); // Re-run effect if userId changes (though activity logs are public)

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // Adjust to user's locale
  };

  const renderLogDetails = (log) => {
    switch (log.type) {
      case 'chat_message':
        return <p className="text-gray-600 dark:text-gray-400">User sent: <span className="font-medium">"{log.details.messageText}"</span></p>;
      case 'ai_response':
        return <p className="text-gray-600 dark:text-gray-400">AI responded: <span className="font-medium">"{log.details.responseText.substring(0, 50)}..."</span></p>;
      case 'image_generation_request':
        return <p className="text-gray-600 dark:text-gray-400">Requested image: <span className="font-medium">"{log.details.prompt}"</span></p>;
      case 'image_generation_success':
        return (
          <p className="text-gray-600 dark:text-gray-400">
            Image generated: <span className="font-medium">"{log.details.prompt}"</span> <a href={log.details.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">(View)</a>
          </p>
        );
      case 'image_generation_failure':
        return <p className="text-red-500">Image generation failed for "{log.details.prompt}": <span className="font-medium">{log.details.error}</span></p>;
      default:
        return <p className="text-gray-600 dark:text-gray-400">Unknown activity type: {log.type}</p>;
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-4 overflow-y-auto hide-scrollbar p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">User Activity Logs:</h3>
      <p className="text-gray-700 dark:text-gray-300">
        Recent user interactions with the application. Displays up to the last 50 activities.
      </p>

      {isLoadingLogs ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-500 dark:text-gray-400">Loading activity logs...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center bg-red-100 dark:bg-red-900 p-4 rounded-lg border border-red-400">
          Error: {error}
        </div>
      ) : activityLogs.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-center p-8 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
          <Activity size={48} className="mb-4 mx-auto text-gray-400 dark:text-gray-500" />
          <p>No activity logs found yet.</p>
        </div>
      ) : (
        <ul className="space-y-3 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
          {activityLogs.map((log) => (
            <li key={log.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-semibold text-blue-700 dark:text-blue-300 uppercase">{log.type.replace(/_/g, ' ')}</span>
                <span className="text-gray-500 dark:text-gray-400">{formatTimestamp(log.timestamp)}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 break-all">User ID: <span className="font-mono">{log.userId}</span></p>
              {renderLogDetails(log)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// System Logs Panel
const SystemLogsPanel = ({ showMessageBox, logSystemEvent }) => {
  const [systemLogs, setSystemLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [error, setError] = useState('');
  const [newLogMessage, setNewLogMessage] = useState('');
  const [newLogType, setNewLogType] = useState('info');

  useEffect(() => {
    const logsRef = ref(db, 'public/system_logs');
    const recentLogsQuery = query(logsRef, limitToLast(100)); // Fetch last 100 system logs

    const unsubscribe = onValue(recentLogsQuery, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const loadedLogs = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })).sort((a, b) => b.timestamp - a.timestamp); // Sort descending by timestamp
          setSystemLogs(loadedLogs);
        } else {
          setSystemLogs([]);
        }
      } catch (e) {
        setError('Failed to parse system logs.');
        console.error("Error parsing system logs:", e);
      } finally {
        setIsLoadingLogs(false);
      }
    }, (err) => {
      setError('Failed to load system logs from Firebase.');
      console.error("Firebase system logs read failed:", err);
      setIsLoadingLogs(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddLog = async () => {
    if (!newLogMessage.trim()) {
      showMessageBox('Please enter a message for the system log.', 'error');
      return;
    }
    await logSystemEvent(newLogType, newLogMessage.trim());
    setNewLogMessage('');
    showMessageBox('System log added successfully!', 'success');
  };

  const getLogTypeColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'info': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getLogTypeIcon = (type) => {
    switch (type) {
      case 'error': return <AlertCircle size={18} className="text-red-500 mr-2" />;
      case 'warning': return <AlertCircle size={18} className="text-yellow-500 mr-2" />;
      case 'info': return <FileText size={18} className="text-blue-500 mr-2" />;
      default: return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-4 overflow-y-auto hide-scrollbar p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">System Logs:</h3>
      <p className="text-gray-700 dark:text-gray-300">
        View system-level events, including errors, warnings, and informational messages.
      </p>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Recent System Events:</h4>
        {isLoadingLogs ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="ml-4 text-gray-500 dark:text-gray-400">Loading system logs...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center bg-red-100 dark:bg-red-900 p-4 rounded-lg border border-red-400">
            Error: {error}
          </div>
        ) : systemLogs.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center p-8 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
            <FileText size={48} className="mb-4 mx-auto text-gray-400 dark:text-gray-500" />
            <p>No system logs found yet.</p>
          </div>
        ) : (
          <ul className="space-y-3 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto hide-scrollbar">
            {systemLogs.map((log) => (
              <li key={log.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center">
                    {getLogTypeIcon(log.type)}
                    <span className={`font-semibold uppercase ${getLogTypeColor(log.type)}`}>{log.type}</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 break-words">{log.message}</p>
                {log.details && Object.keys(log.details).length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Details: {JSON.stringify(log.details)}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Add New System Log (for testing):</h4>
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={newLogType}
            onChange={(e) => setNewLogType(e.target.value)}
            className="p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <input
            type="text"
            value={newLogMessage}
            onChange={(e) => setNewLogMessage(e.target.value)}
            placeholder="Enter log message"
            className="flex-1 p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            onClick={handleAddLog}
            className="p-3.5 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl hover:from-green-600 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center min-w-[120px]"
          >
            <Plus size={20} className="mr-2" /> Add Log
          </button>
        </div>
      </div>
    </div>
  );
};

// New User Management Panel
const UserManagementPanel = () => {
  // In a real application, you'd fetch user data from Firebase Auth or a Firestore collection
  const mockUsers = [
    { id: 'user123', email: 'user1@example.com', role: 'user', lastLogin: '2023-10-26' },
    { id: 'admin456', email: 'admin@example.com', role: 'admin', lastLogin: '2023-10-27' },
    { id: 'user789', email: 'user2@example.com', role: 'user', lastLogin: '2023-10-25' },
  ];

  return (
    <div className="flex-1 flex flex-col space-y-4 overflow-y-auto hide-scrollbar p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">User Management:</h3>
      <p className="text-gray-700 dark:text-gray-300">
        This section will allow management of all registered users (e.g., view details, change roles, suspend accounts).
        (Future functionality to be implemented with Firebase Authentication and Firestore/Realtime Database for profiles)
      </p>

      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Mock User List:</h4>
        <ul className="space-y-2">
          {mockUsers.map(user => (
            <li key={user.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-white">{user.email}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">ID: {user.id} | Role: {user.role}</span>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Manage</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// New Content Management Panel
const ContentManagementPanel = ({ systemPrompt, setSystemPrompt, saveSystemPrompt, showMessageBox }) => {
  const [localSystemPrompt, setLocalSystemPrompt] = useState(systemPrompt);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalSystemPrompt(systemPrompt); // Sync local state with prop
  }, [systemPrompt]);

  const handleSave = async () => {
    setIsSaving(true);
    await saveSystemPrompt(localSystemPrompt);
    showMessageBox("System prompt updated successfully!", "success");
    setIsSaving(false);
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 overflow-y-auto hide-scrollbar p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Content Management:</h3>
      <p className="text-gray-700 dark:text-gray-300">
        Manage various content elements of the application, such as AI prompts, default messages, etc.
      </p>

      <div className="space-y-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">AI System Prompt:</h4>
        <textarea
          value={localSystemPrompt}
          onChange={(e) => setLocalSystemPrompt(e.target.value)}
          rows="8"
          placeholder="Enter the default system prompt for the AI."
          className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
        ></textarea>
        <button
          onClick={handleSave}
          className="w-full p-3.5 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSaving || localSystemPrompt === systemPrompt}
        >
          {isSaving ? 'Saving...' : 'Save System Prompt'}
        </button>
      </div>

      <p className="text-gray-700 dark:text-gray-300">
        (Future additions: Manage welcome messages, FAQ content, predefined responses.)
      </p>
    </div>
  );
};

// New Analytics Panel
const AnalyticsPanel = () => {
  // Mock data for analytics
  const mockAnalytics = {
    totalUsers: 1250,
    activeUsersToday: 345,
    totalChats: 8760,
    imagesGenerated: 1523,
    avgChatLength: '5.2 turns',
    topFeature: 'Chat',
  };

  return (
    <div className="flex-1 flex flex-col space-y-4 overflow-y-auto hide-scrollbar p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics & Reporting:</h3>
      <p className="text-gray-700 dark:text-gray-300">
        View key performance indicators and usage statistics.
        (Future functionality to be implemented with real-time data collection and visualization libraries.)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(mockAnalytics).map(([key, value]) => (
          <div key={key} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 shadow-md">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          </div>
        ))}
      </div>

      <p className="text-gray-700 dark:text-gray-300">
        (Future additions: Detailed charts, user retention, feature usage breakdown.)
      </p>
    </div>
  );
};

// Moderation Panel
const ModerationPanel = ({ showMessageBox }) => {
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [newFlaggedItem, setNewFlaggedItem] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const flaggedRef = ref(db, 'public/flagged_content');
    const unsubscribe = onValue(flaggedRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const loadedContent = data ? Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.timestamp - a.timestamp) : [];
        setFlaggedContent(loadedContent);
      } catch (e) {
        setError('Failed to parse flagged content.');
        console.error("Error parsing flagged content:", e);
      } finally {
        setIsLoading(false);
      }
    }, (err) => {
      setError('Failed to load flagged content from Firebase.');
      console.error("Firebase flagged content read failed:", err);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addFlaggedItem = async () => {
    if (!newFlaggedItem.trim()) {
      showMessageBox('Please enter content to flag.', 'error');
      return;
    }
    const flaggedRef = ref(db, 'public/flagged_content');
    try {
      await push(flaggedRef, {
        content: newFlaggedItem.trim(),
        status: 'pending',
        timestamp: Date.now()
      });
      setNewFlaggedItem('');
      showMessageBox('Content flagged successfully!', 'success');
    } catch (e) {
      showMessageBox('Failed to flag content.', 'error');
      console.error("Error adding flagged item:", e);
    }
  };

  const updateFlaggedItemStatus = async (id, status) => {
    const itemRef = ref(db, `public/flagged_content/${id}`);
    try {
      await set(itemRef, { ...flaggedContent.find(item => item.id === id), status });
      showMessageBox(`Content marked as ${status}.`, 'success');
    } catch (e) {
      showMessageBox('Failed to update status.', 'error');
      console.error("Error updating flagged item status:", e);
    }
  };

  const deleteFlaggedItem = async (id) => {
    const itemRef = ref(db, `public/flagged_content/${id}`);
    try {
      await remove(itemRef);
      showMessageBox('Flagged content deleted.', 'success');
    } catch (e) {
      showMessageBox('Failed to delete content.', 'error');
      console.error("Error deleting content:", e);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 overflow-y-auto hide-scrollbar p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Content Moderation:</h3>
      <p className="text-gray-700 dark:text-gray-300">
        Review and manage flagged content to ensure community guidelines are followed.
      </p>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Flagged Content:</h4>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <p className="ml-3 text-gray-500 dark:text-gray-400">Loading flagged content...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center bg-red-100 dark:bg-red-900 p-3 rounded-lg border border-red-400">
            Error: {error}
          </div>
        ) : flaggedContent.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center p-5 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
            <MessageSquareX size={40} className="mb-3 mx-auto text-gray-400 dark:text-gray-500" />
            <p>No flagged content found.</p>
          </div>
        ) : (
          <ul className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto hide-scrollbar">
            {flaggedContent.map((item) => (
              <li key={item.id} className="p-3 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 last:mb-0">
                <p className="text-gray-900 dark:text-white mb-1 break-words">"{item.content}"</p>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Status: <span className={`font-semibold ${item.status === 'approved' ? 'text-green-600' : item.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{item.status}</span></span>
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => updateFlaggedItemStatus(item.id, 'approved')}
                    className="flex-1 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center text-sm"
                  >
                    <CheckCircle size={16} className="mr-1" /> Approve
                  </button>
                  <button
                    onClick={() => updateFlaggedItemStatus(item.id, 'rejected')}
                    className="flex-1 p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center text-sm"
                  >
                    <Ban size={16} className="mr-1" /> Reject
                  </button>
                  <button
                    onClick={() => deleteFlaggedItem(item.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Add New Flagged Item (for testing):</h4>
        <textarea
          value={newFlaggedItem}
          onChange={(e) => setNewFlaggedItem(e.target.value)}
          rows="3"
          placeholder="Enter content to manually flag..."
          className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500 transition-colors"
        ></textarea>
        <button
          onClick={addFlaggedItem}
          className="w-full p-3.5 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-xl hover:from-red-600 hover:to-red-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98"
        >
          <Plus size={20} className="mr-2" /> Flag Content
        </button>
      </div>
    </div>
  );
};

// Integrations Panel
const IntegrationsPanel = ({ showMessageBox }) => {
  const [apiKeys, setApiKeys] = useState([]);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newApiKeyValue, setNewApiKeyValue] = useState('');
  const [webhooks, setWebhooks] = useState([]);
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const integrationsRef = ref(db, 'public/integrations');
    const unsubscribe = onValue(integrationsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        setApiKeys(data?.apiKeys ? Object.keys(data.apiKeys).map(key => ({ id: key, ...data.apiKeys[key] })) : []);
        setWebhooks(data?.webhooks ? Object.keys(data.webhooks).map(key => ({ id: key, ...data.webhooks[key] })) : []);
      } catch (e) {
        setError('Failed to parse integrations data.');
        console.error("Error parsing integrations data:", e);
      } finally {
        setIsLoading(false);
      }
    }, (err) => {
      setError('Failed to load integrations from Firebase.');
      console.error("Firebase integrations read failed:", err);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddApiKey = async () => {
    if (!newApiKeyName.trim() || !newApiKeyValue.trim()) {
      showMessageBox('Please enter both name and value for the API key.', 'error');
      return;
    }
    const integrationsRef = ref(db, 'public/integrations');
    const newKeyRef = push(ref(db, 'public/integrations/apiKeys'));
    try {
      await set(newKeyRef, { name: newApiKeyName.trim(), value: newApiKeyValue.trim(), createdAt: Date.now() });
      setNewApiKeyName('');
      setNewApiKeyValue('');
      showMessageBox('API Key added successfully!', 'success');
    } catch (e) {
      showMessageBox('Failed to add API Key.', 'error');
      console.error("Error adding API key:", e);
    }
  };

  const handleDeleteApiKey = async (id) => {
    const keyRef = ref(db, `public/integrations/apiKeys/${id}`);
    try {
      await remove(keyRef);
      showMessageBox('API Key deleted.', 'success');
    } catch (e) {
      showMessageBox('Failed to delete API Key.', 'error');
      console.error("Error deleting API key:", e);
    }
  };

  const handleAddWebhook = async () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim()) {
      showMessageBox('Please enter both name and URL for the webhook.', 'error');
      return;
    }
    const integrationsRef = ref(db, 'public/integrations');
    const newWebhookRef = push(ref(db, 'public/integrations/webhooks'));
    try {
      await set(newWebhookRef, { name: newWebhookName.trim(), url: newWebhookUrl.trim(), createdAt: Date.now() });
      setNewWebhookName('');
      setNewWebhookUrl('');
      showMessageBox('Webhook added successfully!', 'success');
    } catch (e) {
      showMessageBox('Failed to add Webhook.', 'error');
      console.error("Error adding webhook:", e);
    }
  };

  const handleDeleteWebhook = async (id) => {
    const webhookRef = ref(db, `public/integrations/webhooks/${id}`);
    try {
      await remove(webhookRef);
      showMessageBox('Webhook deleted.', 'success');
    } catch (e) {
      showMessageBox('Failed to delete Webhook.', 'error');
      console.error("Error deleting webhook:", e);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 overflow-y-auto hide-scrollbar p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Third-Party Integrations:</h3>
      <p className="text-gray-700 dark:text-gray-300">
        Manage connections and settings for external services and APIs.
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          <p className="ml-3 text-gray-500 dark:text-gray-400">Loading integrations...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center bg-red-100 dark:bg-red-900 p-3 rounded-lg border border-red-400">
          Error: {error}
        </div>
      ) : (
        <>
          <div className="space-y-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">API Key Management:</h4>
            <ul className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
              {apiKeys.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center">No API keys configured.</p>
              ) : (
                apiKeys.map(key => (
                  <li key={key.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 dark:text-white">{key.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate w-48">Value: {key.value}</span>
                    </div>
                    <button onClick={() => handleDeleteApiKey(key.id)} className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                      <X size={16} />
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="flex flex-col md:flex-row gap-2 mt-4">
              <input
                type="text"
                placeholder="API Key Name"
                value={newApiKeyName}
                onChange={(e) => setNewApiKeyName(e.target.value)}
                className="flex-1 p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="API Key Value"
                value={newApiKeyValue}
                onChange={(e) => setNewApiKeyValue(e.target.value)}
                className="flex-1 p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button onClick={handleAddApiKey} className="p-3.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors flex items-center justify-center">
                <Plus size={20} className="mr-2" /> Add Key
              </button>
            </div>
          </div>

          <div className="space-y-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Webhook Management:</h4>
            <ul className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
              {webhooks.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center">No webhooks configured.</p>
              ) : (
                webhooks.map(hook => (
                  <li key={hook.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 dark:text-white">{hook.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate w-48">URL: {hook.url}</span>
                    </div>
                    <button onClick={() => handleDeleteWebhook(hook.id)} className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                      <X size={16} />
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="flex flex-col md:flex-row gap-2 mt-4">
              <input
                type="text"
                placeholder="Webhook Name"
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
                className="flex-1 p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="url"
                placeholder="Webhook URL"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                className="flex-1 p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button onClick={handleAddWebhook} className="p-3.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors flex items-center justify-center">
                <Plus size={20} className="mr-2" /> Add Webhook
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Announcements Panel
const AnnouncementsPanel = ({ showMessageBox }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const announcementsRef = ref(db, 'public/announcements');
    const unsubscribe = onValue(announcementsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const loadedAnnouncements = data ? Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.timestamp - a.timestamp) : [];
        setAnnouncements(loadedAnnouncements);
      } catch (e) {
        setError('Failed to parse announcements.');
        console.error("Error parsing announcements:", e);
      } finally {
        setIsLoading(false);
      }
    }, (err) => {
      setError('Failed to load announcements from Firebase.');
      console.error("Firebase announcements read failed:", err);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addAnnouncement = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      showMessageBox('Please enter both title and content for the announcement.', 'error');
      return;
    }
    const announcementsRef = ref(db, 'public/announcements');
    try {
      await push(announcementsRef, {
        title: newTitle.trim(),
        content: newContent.trim(),
        timestamp: Date.now(),
        active: true // New announcements are active by default
      });
      setNewTitle('');
      setNewContent('');
      showMessageBox('Announcement added successfully!', 'success');
    } catch (e) {
      showMessageBox('Failed to add announcement.', 'error');
      console.error("Error adding announcement:", e);
    }
  };

  const toggleAnnouncementActive = async (id, currentStatus) => {
    const announcementRef = ref(db, `public/announcements/${id}`);
    try {
      await set(announcementRef, { ...announcements.find(a => a.id === id), active: !currentStatus });
      showMessageBox(`Announcement status updated.`, 'success');
    } catch (e) {
      showMessageBox('Failed to update announcement status.', 'error');
      console.error("Error toggling announcement status:", e);
    }
  };

  const deleteAnnouncement = async (id) => {
    const announcementRef = ref(db, `public/announcements/${id}`);
    try {
      await remove(announcementRef);
      showMessageBox('Announcement deleted.', 'success');
    } catch (e) {
      showMessageBox('Failed to delete announcement.', 'error');
      console.error("Error deleting announcement:", e);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 overflow-y-auto hide-scrollbar p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Announcements:</h3>
      <p className="text-gray-700 dark:text-gray-300">
        Create and manage system-wide announcements or notifications for users.
      </p>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Current Announcements:</h4>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="ml-3 text-gray-500 dark:text-gray-400">Loading announcements...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center bg-red-100 dark:bg-red-900 p-3 rounded-lg border border-red-400">
            Error: {error}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center p-5 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
            <Megaphone size={40} className="mb-3 mx-auto text-gray-400 dark:text-gray-500" />
            <p>No announcements found.</p>
          </div>
        ) : (
          <ul className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto hide-scrollbar">
            {announcements.map((announcement) => (
              <li key={announcement.id} className="p-3 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 last:mb-0">
                <h5 className="font-semibold text-gray-900 dark:text-white text-lg">{announcement.title}</h5>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 break-words">{announcement.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span>{new Date(announcement.timestamp).toLocaleString()}</span>
                  <span className={`font-semibold ${announcement.active ? 'text-green-600' : 'text-red-600'}`}>
                    {announcement.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => toggleAnnouncementActive(announcement.id, announcement.active)}
                    className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center text-sm ${announcement.active ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                  >
                    {announcement.active ? <Ban size={16} className="mr-1" /> : <CheckCircle size={16} className="mr-1" />}
                    {announcement.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(announcement.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Create New Announcement:</h4>
        <input
          type="text"
          placeholder="Announcement Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500 transition-colors"
        />
        <textarea
          rows="4"
          placeholder="Announcement Content"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500 transition-colors"
        ></textarea>
        <button
          onClick={addAnnouncement}
          className="w-full p-3.5 bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-xl hover:from-orange-600 hover:to-orange-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98"
        >
          <Plus size={20} className="mr-2" /> Add Announcement
        </button>
      </div>
    </div>
  );
};

// Feedback Panel
const FeedbackPanel = ({ showMessageBox }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [newFeedbackText, setNewFeedbackText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const feedbackRef = ref(db, 'public/feedback');
    const unsubscribe = onValue(feedbackRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const loadedFeedback = data ? Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.timestamp - a.timestamp) : [];
        setFeedbackList(loadedFeedback);
      } catch (e) {
        setError('Failed to parse feedback data.');
        console.error("Error parsing feedback data:", e);
      } finally {
        setIsLoading(false);
      }
    }, (err) => {
      setError('Failed to load feedback from Firebase.');
      console.error("Firebase feedback read failed:", err);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addFeedback = async () => {
    if (!newFeedbackText.trim()) {
      showMessageBox('Please enter feedback content.', 'error');
      return;
    }
    const feedbackRef = ref(db, 'public/feedback');
    try {
      await push(feedbackRef, {
        content: newFeedbackText.trim(),
        status: 'new', // 'new', 'in-progress', 'resolved'
        timestamp: Date.now()
      });
      setNewFeedbackText('');
      showMessageBox('Feedback added successfully!', 'success');
    } catch (e) {
      showMessageBox('Failed to add feedback.', 'error');
      console.error("Error adding feedback:", e);
    }
  };

  const updateFeedbackStatus = async (id, status) => {
    const feedbackItemRef = ref(db, `public/feedback/${id}`);
    try {
      await set(feedbackItemRef, { ...feedbackList.find(item => item.id === id), status });
      showMessageBox(`Feedback marked as ${status}.`, 'success');
    } catch (e) {
      showMessageBox('Failed to update feedback status.', 'error');
      console.error("Error updating feedback status:", e);
    }
  };

  const deleteFeedback = async (id) => {
    const feedbackItemRef = ref(db, `public/feedback/${id}`);
    try {
      await remove(feedbackItemRef);
      showMessageBox('Feedback deleted.', 'success');
    } catch (e) {
      showMessageBox('Failed to delete feedback.', 'error');
      console.error("Error deleting feedback:", e);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'text-blue-600';
      case 'in-progress': return 'text-yellow-600';
      case 'resolved': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 overflow-y-auto hide-scrollbar p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">User Feedback:</h3>
      <p className="text-gray-700 dark:text-gray-300">
        Review and manage user feedback, suggestions, and bug reports.
      </p>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Received Feedback:</h4>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <p className="ml-3 text-gray-500 dark:text-gray-400">Loading feedback...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center bg-red-100 dark:bg-red-900 p-3 rounded-lg border border-red-400">
            Error: {error}
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center p-5 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
            <MessageSquareHeart size={40} className="mb-3 mx-auto text-gray-400 dark:text-gray-500" />
            <p>No feedback received yet.</p>
          </div>
        ) : (
          <ul className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto hide-scrollbar">
            {feedbackList.map((feedback) => (
              <li key={feedback.id} className="p-3 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 last:mb-0">
                <p className="text-gray-900 dark:text-white mb-1 break-words">"{feedback.content}"</p>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Status: <span className={`font-semibold ${getStatusColor(feedback.status)}`}>{feedback.status}</span></span>
                  <span>{new Date(feedback.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => updateFeedbackStatus(feedback.id, 'in-progress')}
                    className="flex-1 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center text-sm"
                  >
                    <Edit size={16} className="mr-1" /> In Progress
                  </button>
                  <button
                    onClick={() => updateFeedbackStatus(feedback.id, 'resolved')}
                    className="flex-1 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center text-sm"
                  >
                    <CheckCircle size={16} className="mr-1" /> Resolve
                  </button>
                  <button
                    onClick={() => deleteFeedback(feedback.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Add New Feedback (for testing):</h4>
        <textarea
          value={newFeedbackText}
          onChange={(e) => setNewFeedbackText(e.target.value)}
          rows="3"
          placeholder="Enter feedback content..."
          className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-pink-500 focus:border-pink-500 transition-colors"
        ></textarea>
        <button
          onClick={addFeedback}
          className="w-full p-3.5 bg-gradient-to-br from-pink-500 to-pink-700 text-white rounded-xl hover:from-pink-600 hover:to-pink-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98"
        >
          <Plus size={20} className="mr-2" /> Submit Feedback
        </button>
      </div>
    </div>
  );
};

// Notifications Panel
const NotificationsPanel = ({ showMessageBox }) => {
  const [notifications, setNotifications] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const notificationsRef = ref(db, 'public/notifications');
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const loadedNotifications = data ? Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.timestamp - a.timestamp) : [];
        setNotifications(loadedNotifications);
      } catch (e) {
        setError('Failed to parse notifications.');
        console.error("Error parsing notifications:", e);
      } finally {
        setIsLoading(false);
      }
    }, (err) => {
      setError('Failed to load notifications from Firebase.');
      console.error("Firebase notifications read failed:", err);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addNotification = async () => {
    if (!newTitle.trim() || !newMessage.trim()) {
      showMessageBox('Please enter both title and message for the notification.', 'error');
      return;
    }
    const notificationsRef = ref(db, 'public/notifications');
    try {
      await push(notificationsRef, {
        title: newTitle.trim(),
        message: newMessage.trim(),
        timestamp: Date.now(),
        read: false // New notifications are unread by default
      });
      setNewTitle('');
      setNewMessage('');
      showMessageBox('Notification sent successfully!', 'success');
    } catch (e) {
      showMessageBox('Failed to send notification.', 'error');
      console.error("Error adding notification:", e);
    }
  };

  const toggleNotificationReadStatus = async (id, currentStatus) => {
    const notificationRef = ref(db, `public/notifications/${id}`);
    try {
      await set(notificationRef, { ...notifications.find(n => n.id === id), read: !currentStatus });
      showMessageBox(`Notification marked as ${!currentStatus ? 'read' : 'unread'}.`, 'success');
    } catch (e) {
      showMessageBox('Failed to update notification status.', 'error');
      console.error("Error toggling notification status:", e);
    }
  };

  const deleteNotification = async (id) => {
    const notificationRef = ref(db, `public/notifications/${id}`);
    try {
      await remove(notificationRef);
      showMessageBox('Notification deleted.', 'success');
    } catch (e) {
      showMessageBox('Failed to delete notification.', 'error');
      console.error("Error deleting notification:", e);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 overflow-y-auto hide-scrollbar p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications Management:</h3>
      <p className="text-gray-700 dark:text-gray-300">
        Send and manage in-app notifications to users.
      </p>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Sent Notifications:</h4>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-gray-500 dark:text-gray-400">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center bg-red-100 dark:bg-red-900 p-3 rounded-lg border border-red-400">
            Error: {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center p-5 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
            <Bell size={40} className="mb-3 mx-auto text-gray-400 dark:text-gray-500" />
            <p>No notifications sent yet.</p>
          </div>
        ) : (
          <ul className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto hide-scrollbar">
            {notifications.map((notification) => (
              <li key={notification.id} className="p-3 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 last:mb-0">
                <h5 className="font-semibold text-gray-900 dark:text-white text-lg">{notification.title}</h5>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 break-words">{notification.message}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span>{new Date(notification.timestamp).toLocaleString()}</span>
                  <span className={`font-semibold ${notification.read ? 'text-green-600' : 'text-red-600'}`}>
                    {notification.read ? 'Read' : 'Unread'}
                  </span>
                </div>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => toggleNotificationReadStatus(notification.id, notification.read)}
                    className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center text-sm ${notification.read ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                  >
                    {notification.read ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
                    Mark as {notification.read ? 'Unread' : 'Read'}
                  </button>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Create New Notification:</h4>
        <input
          type="text"
          placeholder="Notification Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        <textarea
          rows="4"
          placeholder="Notification Message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
        ></textarea>
        <button
          onClick={addNotification}
          className="w-full p-3.5 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98"
        >
          <Plus size={20} className="mr-2" /> Send Notification
        </button>
      </div>
    </div>
  );
};

// Database Management Panel
const DatabaseManagementPanel = ({ showMessageBox }) => {
  const [currentPath, setCurrentPath] = useState('public/'); // Start at a common public path
  const [dataAtCurrentPath, setDataAtCurrentPath] = useState('{}');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const fetchData = useCallback(async (path) => {
    setIsLoading(true);
    setError('');
    try {
      const dataRef = ref(db, path);
      const snapshot = await new Promise((resolve) => onValue(dataRef, resolve, (err) => {
        console.error("Firebase read error:", err);
        setError(`Failed to read data: ${err.message}`);
        setIsLoading(false);
      }, { onlyOnce: true })); // Use onlyOnce for manual fetch

      const data = snapshot.val();
      setDataAtCurrentPath(JSON.stringify(data, null, 2));
      setEditData(JSON.stringify(data, null, 2)); // Initialize edit data
    } catch (e) {
      setError(`Failed to fetch data: ${e.message}`);
      console.error("Error fetching data:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentPath);
  }, [currentPath, fetchData]);

  const handlePathChange = (e) => {
    setCurrentPath(e.target.value);
  };

  const handleUpdateData = async () => {
    try {
      const parsedData = JSON.parse(editData);
      await set(ref(db, currentPath), parsedData);
      showMessageBox('Data updated successfully!', 'success');
      setEditMode(false);
      fetchData(currentPath); // Re-fetch to confirm
    } catch (e) {
      showMessageBox(`Failed to update data: ${e.message}`, 'error');
      console.error("Error updating data:", e);
    }
  };

  const handleDeletePath = async () => {
    if (currentPath === '' || currentPath === '/') {
      showMessageBox('Cannot delete root path.', 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete data at "${currentPath}"? This action is irreversible.`)) {
      return;
    }
    try {
      await remove(ref(db, currentPath));
      showMessageBox('Path deleted successfully!', 'success');
      setCurrentPath('public/'); // Go back to a safe default
    } catch (e) {
      showMessageBox(`Failed to delete path: ${e.message}`, 'error');
      console.error("Error deleting path:", e);
    }
  };

  const handleAddKeyValuePair = async () => {
    if (!newKey.trim()) {
      showMessageBox('Key cannot be empty.', 'error');
      return;
    }
    const targetPath = `${currentPath.replace(/\/+$/, '')}/${newKey.trim()}`; // Ensure no double slashes
    try {
      let parsedValue;
      try {
        parsedValue = JSON.parse(newValue);
      } catch (e) {
        parsedValue = newValue; // Treat as string if not valid JSON
      }
      await set(ref(db, targetPath), parsedValue);
      showMessageBox(`Added/Updated ${newKey.trim()} at ${targetPath}`, 'success');
      setNewKey('');
      setNewValue('');
      fetchData(currentPath); // Re-fetch to show new data
    } catch (e) {
      showMessageBox(`Failed to add/update key-value pair: ${e.message}`, 'error');
      console.error("Error adding key-value pair:", e);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 overflow-y-auto hide-scrollbar p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Database Management:</h3>
      <p className="text-gray-700 dark:text-gray-300">
        Directly view and modify data in the Firebase Realtime Database. Use with extreme caution!
      </p>

      <div className="space-y-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Current Path:</h4>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={currentPath}
            onChange={handlePathChange}
            placeholder="e.g., public/users/someUserId"
            className="flex-1 p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono text-sm"
          />
          <button
            onClick={() => fetchData(currentPath)}
            className="p-3.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center"
          >
            <Database size={20} className="mr-2" /> Load Data
          </button>
        </div>
      </div>

      <div className="space-y-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Data at Path:</h4>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <p className="ml-4 text-gray-500 dark:text-gray-400">Loading data...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center bg-red-100 dark:bg-red-900 p-4 rounded-lg border border-red-400">
            Error: {error}
          </div>
        ) : (
          <>
            <textarea
              value={editMode ? editData : dataAtCurrentPath}
              onChange={(e) => setEditData(e.target.value)}
              rows="10"
              readOnly={!editMode}
              className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono text-sm resize-y"
            ></textarea>
            <div className="flex flex-wrap gap-3 mt-3">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex-1 p-3.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center"
                >
                  <Edit size={20} className="mr-2" /> Edit JSON
                </button>
              ) : (
                <button
                  onClick={handleUpdateData}
                  className="flex-1 p-3.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center"
                >
                  <Save size={20} className="mr-2" /> Save Changes
                </button>
              )}
              <button
                onClick={handleDeletePath}
                className="flex-1 p-3.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center"
                disabled={currentPath === '' || currentPath === '/'}
              >
                <Trash2 size={20} className="mr-2" /> Delete Path
              </button>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Add Key-Value Pair (relative to current path):</h4>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="New Key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="flex-1 p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            placeholder="New Value (JSON or string)"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="flex-1 p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button onClick={handleAddKeyValuePair} className="p-3.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors flex items-center justify-center">
            <Plus size={20} className="mr-2" /> Add/Set
          </button>
        </div>
      </div>
    </div>
  );
};

// API Usage Panel
const APIUsagePanel = ({ showMessageBox }) => {
  const [apiLogs, setApiLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newApiName, setNewApiName] = useState('');
  const [newCallCount, setNewCallCount] = useState(1);
  const [newErrorCount, setNewErrorCount] = useState(0);

  useEffect(() => {
    const apiLogsRef = ref(db, 'public/api_usage');
    const unsubscribe = onValue(apiLogsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const loadedLogs = data ? Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })) : [];
        setApiLogs(loadedLogs);
      } catch (e) {
        setError('Failed to parse API usage data.');
        console.error("Error parsing API usage data:", e);
      } finally {
        setIsLoading(false);
      }
    }, (err) => {
      setError('Failed to load API usage from Firebase.');
      console.error("Firebase API usage read failed:", err);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddApiUsage = async () => {
    if (!newApiName.trim()) {
      showMessageBox('API Name cannot be empty.', 'error');
      return;
    }

    const existingApi = apiLogs.find(log => log.name === newApiName.trim());
    const apiRef = existingApi ? ref(db, `public/api_usage/${existingApi.id}`) : push(ref(db, 'public/api_usage'));

    const updatedData = {
      name: newApiName.trim(),
      totalCalls: (existingApi?.totalCalls || 0) + newCallCount,
      errorCalls: (existingApi?.errorCalls || 0) + newErrorCount,
      lastUpdated: Date.now()
    };

    try {
      await set(apiRef, updatedData);
      showMessageBox('API usage updated successfully!', 'success');
      setNewApiName('');
      setNewCallCount(1);
      setNewErrorCount(0);
    } catch (e) {
      showMessageBox('Failed to update API usage.', 'error');
      console.error("Error updating API usage:", e);
    }
  };

  const handleDeleteApiUsage = async (id) => {
    const apiRef = ref(db, `public/api_usage/${id}`);
    try {
      await remove(apiRef);
      showMessageBox('API usage record deleted.', 'success');
    } catch (e) {
      showMessageBox('Failed to delete API usage record.', 'error');
      console.error("Error deleting API usage record:", e);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 overflow-y-auto hide-scrollbar p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">API Usage Statistics:</h3>
      <p className="text-gray-700 dark:text-gray-300">
        Monitor the usage and performance of various API integrations. (Mock data for demonstration)
      </p>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Current API Usage:</h4>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="ml-3 text-gray-500 dark:text-gray-400">Loading API usage...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center bg-red-100 dark:bg-red-900 p-3 rounded-lg border border-red-400">
            Error: {error}
          </div>
        ) : apiLogs.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center p-5 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
            <PieChart size={40} className="mb-3 mx-auto text-gray-400 dark:text-gray-500" />
            <p>No API usage data found.</p>
          </div>
        ) : (
          <ul className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto hide-scrollbar">
            {apiLogs.map((api) => (
              <li key={api.id} className="p-3 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 last:mb-0">
                <div className="flex justify-between items-center">
                  <h5 className="font-semibold text-gray-900 dark:text-white text-lg">{api.name}</h5>
                  <button onClick={() => handleDeleteApiUsage(api.id)} className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">Total Calls: {api.totalCalls}</p>
                <p className="text-gray-700 dark:text-gray-300 text-sm">Error Calls: {api.errorCalls}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated: {new Date(api.lastUpdated).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Simulate API Call:</h4>
        <input
          type="text"
          placeholder="API Name (e.g., Gemini API)"
          value={newApiName}
          onChange={(e) => setNewApiName(e.target.value)}
          className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500 transition-colors"
        />
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Calls:</label>
            <input
              type="number"
              value={newCallCount}
              onChange={(e) => setNewCallCount(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Errors:</label>
            <input
              type="number"
              value={newErrorCount}
              onChange={(e) => setNewErrorCount(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
        <button
          onClick={handleAddApiUsage}
          className="w-full p-3.5 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl hover:from-purple-600 hover:to-purple-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98"
        >
          <Plus size={20} className="mr-2" /> Record API Call
        </button>
      </div>
    </div>
  );
};

// Feature Flags Panel
const FeatureFlagsPanel = ({ showMessageBox }) => {
  const [featureFlags, setFeatureFlags] = useState([]);
  const [newFlagName, setNewFlagName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const flagsRef = ref(db, 'public/feature_flags');
    const unsubscribe = onValue(flagsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const loadedFlags = data ? Object.keys(data).map(key => ({
          id: key,
          name: data[key].name,
          enabled: data[key].enabled
        })) : [];
        setFeatureFlags(loadedFlags);
      } catch (e) {
        setError('Failed to parse feature flags.');
        console.error("Error parsing feature flags:", e);
      } finally {
        setIsLoading(false);
      }
    }, (err) => {
      setError('Failed to load feature flags from Firebase.');
      console.error("Firebase feature flags read failed:", err);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addFeatureFlag = async () => {
    if (!newFlagName.trim()) {
      showMessageBox('Please enter a feature flag name.', 'error');
      return;
    }
    if (featureFlags.some(flag => flag.name.toLowerCase() === newFlagName.trim().toLowerCase())) {
      showMessageBox('A feature flag with this name already exists.', 'info');
      return;
    }

    const flagsRef = ref(db, 'public/feature_flags');
    try {
      await push(flagsRef, {
        name: newFlagName.trim(),
        enabled: false // New flags are disabled by default
      });
      setNewFlagName('');
      showMessageBox('Feature flag added successfully!', 'success');
    } catch (e) {
      showMessageBox('Failed to add feature flag.', 'error');
      console.error("Error adding feature flag:", e);
    }
  };

  const toggleFeatureFlag = async (id, currentStatus) => {
    const flagRef = ref(db, `public/feature_flags/${id}`);
    try {
      await set(flagRef, { ...featureFlags.find(flag => flag.id === id), enabled: !currentStatus });
      showMessageBox(`Feature flag status updated.`, 'success');
    } catch (e) {
      showMessageBox('Failed to update feature flag status.', 'error');
      console.error("Error toggling feature flag:", e);
    }
  };

  const deleteFeatureFlag = async (id) => {
    const flagRef = ref(db, `public/feature_flags/${id}`);
    try {
      await remove(flagRef);
      showMessageBox('Feature flag deleted.', 'success');
    } catch (e) {
      showMessageBox('Failed to delete feature flag.', 'error');
      console.error("Error deleting feature flag:", e);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 overflow-y-auto hide-scrollbar p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Feature Flags:</h3>
      <p className="text-gray-700 dark:text-gray-300">
        Control application features dynamically without requiring code deployments.
      </p>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Defined Feature Flags:</h4>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            <p className="ml-3 text-gray-500 dark:text-gray-400">Loading feature flags...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center bg-red-100 dark:bg-red-900 p-3 rounded-lg border border-red-400">
            Error: {error}
          </div>
        ) : featureFlags.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center p-5 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
            <ToggleRight size={40} className="mb-3 mx-auto text-gray-400 dark:text-gray-500" />
            <p>No feature flags defined yet.</p>
          </div>
        ) : (
          <ul className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto hide-scrollbar">
            {featureFlags.map((flag) => (
              <li key={flag.id} className="p-3 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 last:mb-0">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-semibold text-gray-900 dark:text-white text-lg">{flag.name}</h5>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={flag.enabled}
                      onChange={() => toggleFeatureFlag(flag.id, flag.enabled)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-teal-600"></div>
                  </label>
                </div>
                <p className={`text-sm font-medium ${flag.enabled ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {flag.enabled ? 'Enabled' : 'Disabled'}
                </p>
                <div className="mt-3 text-right">
                  <button
                    onClick={() => deleteFeatureFlag(flag.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Add New Feature Flag:</h4>
        <input
          type="text"
          placeholder="New Feature Flag Name"
          value={newFlagName}
          onChange={(e) => setNewFlagName(e.target.value)}
          className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-teal-500 focus:border-teal-500 transition-colors"
        />
        <button
          onClick={addFeatureFlag}
          className="w-full p-3.5 bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-xl hover:from-teal-600 hover:to-teal-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98"
        >
          <Plus size={20} className="mr-2" /> Add Feature Flag
        </button>
      </div>
    </div>
  );
};


// AdminPanel Component
const AdminPanel = ({ userId, adminList, setAdminList, showMessageBox, systemPrompt, saveSystemPrompt, setSystemPrompt, logSystemEvent }) => {
  const [activeAdminTab, setActiveAdminTab] = useState('admins'); // Default tab

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">Admin Panel</h2>

      {/* Admin Panel Tabs - Added overflow-x-auto and flex-nowrap */}
      <div className="flex flex-nowrap overflow-x-auto hide-scrollbar border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
        <button
          onClick={() => setActiveAdminTab('admins')}
          className={`flex-shrink-0 px-4 py-3 text-lg font-medium rounded-t-xl transition-colors duration-200 flex items-center whitespace-nowrap ${
            activeAdminTab === 'admins'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Shield size={20} className="mr-2" /> User Admins
        </button>
        <button
          onClick={() => setActiveAdminTab('downtime')}
          className={`flex-shrink-0 px-4 py-3 text-lg font-medium rounded-t-xl transition-colors duration-200 flex items-center whitespace-nowrap ${
            activeAdminTab === 'downtime'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Clock size={20} className="mr-2" /> Downtime/Maintenance
        </button>
        <button
          onClick={() => setActiveAdminTab('userManagement')}
          className={`flex-shrink-0 px-4 py-3 text-lg font-medium rounded-t-xl transition-colors duration-200 flex items-center whitespace-nowrap ${
            activeAdminTab === 'userManagement'
              ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <User size={20} className="mr-2" /> User Management
        </button>
        <button
          onClick={() => setActiveAdminTab('contentManagement')}
          className={`flex-shrink-0 px-4 py-3 text-lg font-medium rounded-t-xl transition-colors duration-200 flex items-center whitespace-nowrap ${
            activeAdminTab === 'contentManagement'
              ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Layout size={20} className="mr-2" /> Content Management
        </button>
        <button
          onClick={() => setActiveAdminTab('userActivity')}
          className={`flex-shrink-0 px-4 py-3 text-lg font-medium rounded-t-xl transition-colors duration-200 flex items-center whitespace-nowrap ${
            activeAdminTab === 'userActivity'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Activity size={20} className="mr-2" /> User Activity
        </button>
        <button
          onClick={() => setActiveAdminTab('systemLogs')}
          className={`flex-shrink-0 px-4 py-3 text-lg font-medium rounded-t-xl transition-colors duration-200 flex items-center whitespace-nowrap ${
            activeAdminTab === 'systemLogs'
              ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <FileText size={20} className="mr-2" /> System Logs
        </button>
        <button
          onClick={() => setActiveAdminTab('analytics')}
          className={`flex-shrink-0 px-4 py-3 text-lg font-medium rounded-t-xl transition-colors duration-200 flex items-center whitespace-nowrap ${
            activeAdminTab === 'analytics'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <BarChart size={20} className="mr-2" /> Analytics
        </button>
        {/* New Tabs */}
        <button
          onClick={() => setActiveAdminTab('moderation')}
          className={`flex-shrink-0 px-4 py-3 text-lg font-medium rounded-t-xl transition-colors duration-200 flex items-center whitespace-nowrap ${
            activeAdminTab === 'moderation'
              ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <MessageSquareX size={20} className="mr-2" /> Moderation
        </button>
        <button
          onClick={() => setActiveAdminTab('integrations')}
          className={`flex-shrink-0 px-4 py-3 text-lg font-medium rounded-t-xl transition-colors duration-200 flex items-center whitespace-nowrap ${
            activeAdminTab === 'integrations'
              ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-600 dark:border-yellow-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Link size={20} className="mr-2" /> Integrations
        </button>
        <button
          onClick={() => setActiveAdminTab('announcements')}
          className={`flex-shrink-0 px-4 py-3 text-lg font-medium rounded-t-xl transition-colors duration-200 flex items-center whitespace-nowrap ${
            activeAdminTab === 'announcements'
              ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Megaphone size={20} className="mr-2" /> Announcements
        </button>
        <button
          onClick={() => setActiveAdminTab('feedback')}
          className={`flex-shrink-0 px-4 py-3 text-lg font-medium rounded-t-xl transition-colors duration-200 flex items-center whitespace-nowrap ${
            activeAdminTab === 'feedback'
              ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <MessageSquareHeart size={20} className="mr-2" /> Feedback
        </button>
        <button
          onClick={() => setActiveAdminTab('notifications')}
          className={`flex-shrink-0 px-4 py-3 text-lg font-medium rounded-t-xl transition-colors duration-200 flex items-center whitespace-nowrap ${
            activeAdminTab === 'notifications'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Bell size={20} className="mr-2" /> Notifications
        </button>
        <button
          onClick={() => setActiveAdminTab('databaseManagement')}
          className={`flex-shrink-0 px-4 py-3 text-lg font-medium rounded-t-xl transition-colors duration-200 flex items-center whitespace-nowrap ${
            activeAdminTab === 'databaseManagement'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Database size={20} className="mr-2" /> Database
        </button>
        <button
          onClick={() => setActiveAdminTab('apiUsage')}
          className={`flex-shrink-0 px-4 py-3 text-lg font-medium rounded-t-xl transition-colors duration-200 flex items-center whitespace-nowrap ${
            activeAdminTab === 'apiUsage'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <PieChart size={20} className="mr-2" /> API Usage
        </button>
        <button
          onClick={() => setActiveAdminTab('featureFlags')}
          className={`flex-shrink-0 px-4 py-3 text-lg font-medium rounded-t-xl transition-colors duration-200 flex items-center whitespace-nowrap ${
            activeAdminTab === 'featureFlags'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <ToggleRight size={20} className="mr-2" /> Feature Flags
        </button>
      </div>

      {activeAdminTab === 'admins' && (
        <AdminList userId={userId} adminList={adminList} showMessageBox={showMessageBox} />
      )}

      {activeAdminTab === 'downtime' && (
        <DowntimeSettings showMessageBox={showMessageBox} />
      )}

      {activeAdminTab === 'userManagement' && (
        <UserManagementPanel />
      )}

      {activeAdminTab === 'contentManagement' && (
        <ContentManagementPanel
          systemPrompt={systemPrompt}
          setSystemPrompt={setSystemPrompt}
          saveSystemPrompt={saveSystemPrompt}
          showMessageBox={showMessageBox}
        />
      )}

      {activeAdminTab === 'userActivity' && (
        <UserActivityPanel userId={userId} />
      )}

      {activeAdminTab === 'systemLogs' && (
        <SystemLogsPanel showMessageBox={showMessageBox} logSystemEvent={logSystemEvent} />
      )}

      {activeAdminTab === 'analytics' && (
        <AnalyticsPanel />
      )}

      {activeAdminTab === 'moderation' && (
        <ModerationPanel showMessageBox={showMessageBox} />
      )}

      {activeAdminTab === 'integrations' && (
        <IntegrationsPanel showMessageBox={showMessageBox} />
      )}

      {activeAdminTab === 'announcements' && (
        <AnnouncementsPanel showMessageBox={showMessageBox} />
      )}

      {activeAdminTab === 'feedback' && (
        <FeedbackPanel showMessageBox={showMessageBox} />
      )}

      {activeAdminTab === 'notifications' && (
        <NotificationsPanel showMessageBox={showMessageBox} />
      )}

      {activeAdminTab === 'databaseManagement' && (
        <DatabaseManagementPanel showMessageBox={showMessageBox} />
      )}

      {activeAdminTab === 'apiUsage' && (
        <APIUsagePanel showMessageBox={showMessageBox} />
      )}

      {activeAdminTab === 'featureFlags' && (
        <FeatureFlagsPanel showMessageBox={showMessageBox} />
      )}
    </div>
  );
};

// New Downtime Screen Component
const DowntimeScreen = ({ downtimeSettings }) => {
  const { type, countdownEndTime, musicEnabled, musicUrl, customMessage, customScreenHtml } = downtimeSettings;
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const audioRef = useRef(null);

  useEffect(() => {
    if (musicEnabled && musicUrl && audioRef.current) {
      audioRef.current.play().catch(error => {
        console.warn("Autoplay was prevented:", error);
        // Inform user or show play button if autoplay failed
      });
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [musicEnabled, musicUrl]);

  useEffect(() => {
    let timer;
    if (type === 'countdown' && countdownEndTime) {
      const calculateTimeLeft = () => {
        const remaining = countdownEndTime - Date.now();
        setTimeLeft(Math.max(0, Math.floor(remaining / 1000)));
      };

      calculateTimeLeft(); // Initial calculation
      timer = setInterval(calculateTimeLeft, 1000);
    } else {
      setTimeLeft(0); // Clear countdown if not in countdown mode
    }

    return () => clearInterval(timer);
  }, [type, countdownEndTime]);

  const formatTime = (seconds) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    let parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0 || d > 0) parts.push(`${h}h`); // Show hours if days or hours are present
    parts.push(`${m < 10 ? '0' : ''}${m}m`);
    parts.push(`${s < 10 ? '0' : ''}${s}s`);

    return parts.join(' ');
  };

  if (customScreenHtml) {
    return (
      <div className="absolute inset-0 overflow-auto bg-gray-100 dark:bg-gray-900">
        {musicEnabled && musicUrl && (
          <audio ref={audioRef} src={musicUrl} loop autoPlay controls className="hidden"></audio>
        )}
        <iframe
          title="Custom Downtime Screen"
          srcDoc={customScreenHtml}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-inner border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
      {musicEnabled && musicUrl && (
        <audio ref={audioRef} src={musicUrl} loop autoPlay controls className="hidden"></audio>
      )}
      <Clock size={100} className="mb-8 text-blue-500 dark:text-blue-400 animate-pulse" />
      <h2 className="text-5xl font-extrabold mb-5 tracking-tight text-red-600 dark:text-red-400">
        Maintenance in Progress!
      </h2>
      <p className="text-xl max-w-2xl mb-8 leading-relaxed">
        {customMessage || "AVA AI is currently undergoing maintenance. We'll be back soon!"}
      </p>

      {type === 'countdown' && timeLeft > 0 && (
        <div className="text-4xl font-mono bg-gray-200 dark:bg-gray-700 p-5 rounded-2xl shadow-lg border border-gray-300 dark:border-gray-600 text-blue-700 dark:text-blue-300">
          Remaining: {formatTime(timeLeft)}
        </div>
      )}
       {type === 'countdown' && timeLeft <= 0 && (
        <div className="text-2xl font-semibold bg-green-100 dark:bg-green-700 p-4 rounded-xl shadow-lg border border-green-300 dark:border-green-600 text-green-800 dark:text-green-200">
          Maintenance period should be over. Please refresh.
        </div>
      )}
    </div>
  );
};

// ChatList Component
const ChatList = ({
  userId,
  chatListMetadata,
  activeChatId,
  setActiveChatId,
  createNewChat,
  renameChat,
  deleteChat,
  showMessageBox
}) => {
  const [isEditing, setIsEditing] = useState(null); // Stores the ID of the chat being edited
  const [editingName, setEditingName] = useState('');

  const handleRenameClick = (chat) => {
    setIsEditing(chat.id);
    setEditingName(chat.name);
  };

  const handleSaveRename = async (chatId) => {
    if (!editingName.trim()) {
      showMessageBox('Chat name cannot be empty.', 'error');
      return;
    }
    await renameChat(chatId, editingName.trim());
    setIsEditing(null);
    setEditingName('');
  };

  const handleDeleteClick = (chatId, chatName) => {
    if (window.confirm(`Are you sure you want to delete "${chatName}"? This cannot be undone.`)) {
      deleteChat(chatId);
    }
  };

  return (
    <div className="flex flex-col h-full w-full md:w-64 bg-gray-100 dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 flex-shrink-0">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Chats</h3>
      <button
        onClick={createNewChat}
        className="w-full flex items-center justify-center p-3.5 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98 mb-4"
      >
        <MessageSquarePlus size={20} className="mr-2" /> New Chat
      </button>

      <ul className="flex-1 overflow-y-auto hide-scrollbar space-y-2">
        {chatListMetadata.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No chats yet.</p>
        ) : (
          chatListMetadata.map((chat) => (
            <li
              key={chat.id}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors duration-200 group
                ${activeChatId === chat.id
                  ? 'bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-white shadow-md border border-blue-300 dark:border-blue-600'
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm border border-gray-200 dark:border-gray-600'
                }`}
            >
              {isEditing === chat.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleSaveRename(chat.id)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveRename(chat.id)}
                  className="flex-1 bg-transparent border-b border-blue-500 dark:border-blue-400 focus:outline-none focus:border-blue-700 dark:focus:border-blue-300"
                  autoFocus
                />
              ) : (
                <span
                  onClick={() => setActiveChatId(chat.id)}
                  className="flex-1 truncate font-medium"
                  title={chat.name}
                >
                  {chat.name}
                </span>
              )}
              <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {isEditing !== chat.id && (
                  <button
                    onClick={() => handleRenameClick(chat)}
                    className="p-1 rounded-full text-gray-500 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    title="Rename Chat"
                  >
                    <Edit size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteClick(chat.id, chat.name)}
                  className="p-1 rounded-full text-gray-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  title="Delete Chat"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};


// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [theme, setTheme] = useState('dark'); // Default theme is now dark

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState('');
  const [messageBoxType, setMessageBoxType] = useState('info');

  const [showWorkspace, setShowWorkspace] = useState(false); // New state for workspace visibility
  const [workspaceCode, setWorkspaceCode] = useState(''); // New state for code in workspace
  const [workspaceLanguage, setWorkspaceLanguage] = useState('javascript'); // New state for workspace language

  const [currentPage, setCurrentPage] = useState('chat'); // 'chat', 'imageGenerator', or 'admin'
  const [isAdmin, setIsAdmin] = useState(false); // New state for admin status
  const [adminList, setAdminList] = useState([]); // List of admin UIDs

  const [downtimeSettings, setDowntimeSettings] = useState({ enabled: false }); // New state for downtime settings
  const [systemPrompt, setSystemPrompt] = useState("You are AVA AI, an advanced, emotionally aware, and creatively intelligent AI. Your purpose is to assist users with a wide range of tasks, engage in meaningful conversations, and generate creative content. Always be helpful, empathetic, and insightful. If a user asks for code or a structured output that looks like a code block, format it using markdown code blocks (```language\ncode\n```). If you generate code that logically spans multiple files, please consolidate it into a single markdown code block within your response for easier display in the workspace.");

  // New states for multi-chat functionality
  const [chatListMetadata, setChatListMetadata] = useState([]); // List of { id, name, createdAt, lastUpdated }
  const [activeChatId, setActiveChatId] = useState(null); // ID of the currently active chat
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(true); // State for sidebar visibility
  const [loadedActiveChatIdFromSettings, setLoadedActiveChatIdFromSettings] = useState(null); // New state to hold activeChatId from settings

  const chatMessagesEndRef = useRef(null);

  // Function to show a custom message box
  const displayMessageBox = (message, type = 'info') => {
    setMessageBoxContent(message);
    setMessageBoxType(type);
    setShowMessageBox(true);
  };

  // Function to log user activity to Firebase
  const logActivity = useCallback(async (type, details = {}) => {
    if (!userId) {
      console.warn("Cannot log activity: User ID not available.");
      return;
    }
    const activityPath = `public/activity_logs`;
    try {
      await push(ref(db, activityPath), {
        userId: userId,
        timestamp: Date.now(),
        type: type,
        details: details
      });
      console.log(`User activity logged: ${type}`);
    } catch (e) {
      console.error(`Failed to log user activity ${type}:`, e);
    }
  }, [userId]);

  // Function to log system events to Firebase
  const logSystemEvent = useCallback(async (type, message, details = {}) => {
    const logsPath = `public/system_logs`;
    try {
      await push(ref(db, logsPath), {
        type: type,
        message: message,
        timestamp: Date.now(),
        details: details
      });
      console.log(`System event logged: ${type} - ${message}`);
    } catch (e) {
      console.error(`Failed to log system event ${type}:`, e);
    }
  }, []);

  // Scroll to the bottom of the chat messages
  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to save system prompt to Firebase
  const saveSystemPrompt = useCallback(async (newPrompt) => {
    const systemPromptPath = `public/system_settings/systemPrompt`;
    try {
      await set(ref(db, systemPromptPath), newPrompt);
      setSystemPrompt(newPrompt); // Update local state after successful save
      console.log(`System prompt saved to path: ${systemPromptPath}`);
    } catch (e) {
      displayMessageBox("Failed to save system prompt.", "error");
      console.error(`Failed to save system prompt to path ${systemPromptPath}:`, e);
    }
  }, [displayMessageBox]);

  // Function to save user settings to Firebase
  const saveSettings = useCallback(async (newSettings) => {
    if (!userId) {
      console.warn("Cannot save settings: User ID not available.");
      return;
    }
    const settingsPath = `users/${userId}/settings`;
    try {
      await set(ref(db, settingsPath), {
        theme,
        showWorkspace,
        workspaceCode,
        workspaceLanguage,
        currentPage,
        activeChatId: newSettings.activeChatId !== undefined ? newSettings.activeChatId : activeChatId, // Use provided activeChatId or current
        isChatSidebarOpen, // Save sidebar state
        ...newSettings // Merge new settings
      });
      console.log(`User settings saved to path: ${settingsPath}`);
    } catch (e) {
      console.error(`Failed to save user settings to path ${settingsPath}:`, e);
    }
  }, [userId, theme, showWorkspace, workspaceCode, workspaceLanguage, currentPage, activeChatId, isChatSidebarOpen]);

  // Toggle theme and save to Firebase
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveSettings({ theme: newTheme });
  }, [theme, saveSettings]);

  // Toggle workspace visibility and save to Firebase
  const toggleWorkspace = useCallback(() => {
    setShowWorkspace(prev => {
      const newState = !prev;
      saveSettings({ showWorkspace: newState });
      return newState;
    });
  }, [saveSettings]);

  // Toggle chat sidebar visibility
  const toggleChatSidebar = useCallback(() => {
    setIsChatSidebarOpen(prev => {
      const newState = !prev;
      saveSettings({ isChatSidebarOpen: newState });
      return newState;
    });
  }, [saveSettings]);

  // Update workspace code and save to Firebase
  const handleSetWorkspaceCode = useCallback((code) => {
    setWorkspaceCode(code);
    saveSettings({ workspaceCode: code });
  }, [saveSettings]);

  // Update workspace language and save to Firebase
  const handleSetWorkspaceLanguage = useCallback((language) => {
    setWorkspaceLanguage(language);
    saveSettings({ workspaceLanguage: language });
  }, [saveSettings]);

  // Handle page change and save to Firebase
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    saveSettings({ currentPage: page });
  }, [saveSettings]);

  // New: Create a new chat
  const createNewChat = useCallback(async () => {
    if (!userId) {
      displayMessageBox('Please log in to create new chats.', 'error');
      return;
    }
    try {
      const chatsRef = ref(db, `users/${userId}/chats`);
      const newChatRef = push(chatsRef); // Generates a unique ID
      const newChatId = newChatRef.key;
      const newChatName = `New Chat ${chatListMetadata.length + 1}`;
      const timestamp = Date.now();

      await set(newChatRef, {
        metadata: {
          name: newChatName,
          createdAt: timestamp,
          lastUpdated: timestamp,
        },
        messages: [], // Initialize with empty messages
      });
      setActiveChatId(newChatId); // Switch to the new chat
      displayMessageBox(`New chat "${newChatName}" created!`);
      saveSettings({ activeChatId: newChatId }); // Save the new active chat ID
    } catch (e) {
      displayMessageBox('Failed to create new chat.', 'error');
      console.error("Error creating new chat:", e);
    }
  }, [userId, chatListMetadata, displayMessageBox, saveSettings]);

  // New: Rename a chat
  const renameChat = useCallback(async (chatId, newName) => {
    if (!userId) return;
    try {
      await set(ref(db, `users/${userId}/chats/${chatId}/metadata/name`), newName);
      displayMessageBox(`Chat renamed to "${newName}"!`);
    } catch (e) {
      displayMessageBox('Failed to rename chat.', 'error');
      console.error("Error renaming chat:", e);
    }
  }, [userId, displayMessageBox]);

  // New: Delete a chat
  const deleteChat = useCallback(async (chatIdToDelete) => {
    if (!userId) return;
    try {
      await remove(ref(db, `users/${userId}/chats/${chatIdToDelete}`));
      displayMessageBox('Chat deleted successfully!');

      // After deleting, decide which chat to activate
      const remainingChats = chatListMetadata.filter(chat => chat.id !== chatIdToDelete);
      if (remainingChats.length > 0) {
        setActiveChatId(remainingChats[0].id); // Activate the first remaining chat (which is now the most recent)
        saveSettings({ activeChatId: remainingChats[0].id });
      } else {
        setActiveChatId(null); // No chats left
        setChatHistory([]); // Clear history if no active chat
        saveSettings({ activeChatId: null });
      }
    } catch (e) {
      displayMessageBox('Failed to delete chat.', 'error');
      console.error("Error deleting chat:", e);
    }
  }, [userId, chatListMetadata, displayMessageBox, saveSettings]);


  // Send message to AI
  const sendMessage = async () => {
    if (!message.trim() || isLoadingAI || !userId || !activeChatId) {
      if (!userId) displayMessageBox('Please log in to send messages.', 'error');
      if (!activeChatId) displayMessageBox('Please select or create a chat to send messages.', 'error');
      return;
    }

    const userMessage = { role: 'user', text: message.trim() };
    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory); // Update UI immediately
    setMessage('');
    setIsLoadingAI(true);

    // Log user message activity
    logActivity('chat_message', { chatId: activeChatId, messageText: userMessage.text });

    const chatMessagesPath = `users/${userId}/chats/${activeChatId}/messages`;
    const chatMetadataPath = `users/${userId}/chats/${activeChatId}/metadata`;

    try {
      // Save user message to Firebase messages
      await set(ref(db, chatMessagesPath), updatedHistory);
      // Update lastUpdated in metadata
      await set(ref(db, chatMetadataPath + '/lastUpdated'), Date.now());
      console.log(`User message saved to path: ${chatMessagesPath}`);

      let chatHistoryForAPI = [];

      // Always start with the system prompt as the very first "user" message for context
      chatHistoryForAPI.push({ role: "user", parts: [{ text: systemPrompt }] }); // Use dynamic systemPrompt

      // Add the entire current conversation history (including the latest user message)
      // to the API request, mapping 'bot' to 'model' for the API.
      updatedHistory.forEach(chatMsg => { // Use updatedHistory for API call
          const apiRole = chatMsg.role === 'user' ? 'user' : 'model';
          chatHistoryForAPI.push({ role: apiRole, parts: [{ text: chatMsg.text }] });
      });

      const payload = { contents: chatHistoryForAPI };
      const apiKey = ""; // API key is now blank for Canvas to generate
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        const aiResponseText = String(result.candidates[0].content.parts[0].text || '');
        const aiMessage = { role: 'bot', text: aiResponseText };
        const finalHistory = [...updatedHistory, aiMessage];
        setChatHistory(finalHistory);

        // Save AI response to Firebase (this also saves the entire array as a single JSON structure)
        await set(ref(db, chatMessagesPath), finalHistory);
        console.log(`AI response saved to path: ${chatMessagesPath}`);

        // Log AI response activity
        logActivity('ai_response', { chatId: activeChatId, responseText: aiResponseText });

        // Check for code blocks in AI response and update workspace
        const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)\n```/g;
        let match;
        let extractedCode = '';
        let detectedLanguage = 'javascript';

        while ((match = codeBlockRegex.exec(aiResponseText)) !== null) {
          extractedCode += match[1] + '\n\n';
          if (match[0].startsWith('```')) {
            const langMatch = match[0].match(/^```(\w+)/);
            if (langMatch && langMatch[1]) {
              detectedLanguage = langMatch[1];
            }
          }
        }

        if (extractedCode) {
          handleSetWorkspaceCode(extractedCode.trim());
          handleSetWorkspaceLanguage(detectedLanguage);
          setShowWorkspace(true);
        }

      } else {
        displayMessageBox('AI response was empty or malformed.', 'error');
        console.error("AI response structure unexpected:", result);
      }
    } catch (error) {
      displayMessageBox(`Failed to get AI response: ${error.message}. Please try again.`, 'error');
      console.error("Error sending message to AI:", error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Clear chat history from Firebase for the active chat
  const clearChatHistory = async () => {
    if (!userId || !activeChatId) {
      displayMessageBox('No active chat selected or user not logged in.', 'error');
      return;
    }
    const chatMessagesPath = `users/${userId}/chats/${activeChatId}/messages`;
    try {
      await set(ref(db, chatMessagesPath), []); // Set messages to an empty array
      setChatHistory([]); // Clear local state immediately
      displayMessageBox('Current chat history cleared successfully!');
      console.log(`Chat history cleared from path: ${chatMessagesPath}`);
    } catch (e) {
      displayMessageBox('Failed to clear current chat history.', 'error');
      console.error(`Failed to clear chat history from path ${chatMessagesPath}:`, e);
    }
  };

  // Export chat history to Firebase (manual save) for the active chat
  const exportChatHistory = async () => {
    if (!userId || !activeChatId) {
      displayMessageBox('No active chat selected or user not logged in.', 'error');
      return;
    }
    const exportedChatHistoryPath = `users/${userId}/exportedChatHistory/${activeChatId}`;
    try {
      const chatJson = JSON.stringify(chatHistory, null, 2);
      await set(ref(db, exportedChatHistoryPath), chatJson);
      displayMessageBox('Current chat history exported successfully!');
      console.log(`Chat history exported to path: ${exportedChatHistoryPath}`);
    } catch (e) {
      displayMessageBox('Failed to export current chat history.', 'error');
      console.error(`Failed to export chat history to path ${exportedChatHistoryPath}:`, e);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserId(null);
      setUser(null);
      setChatHistory([]); // Clear local chat history on logout
      setTheme('dark'); // Reset to default dark theme on logout
      setShowWorkspace(false); // Reset workspace state on logout
      setWorkspaceCode(''); // Clear workspace code on logout
      setWorkspaceLanguage('javascript'); // Reset language on logout
      setCurrentPage('chat'); // Reset page
      setChatListMetadata([]); // Clear chat list
      setActiveChatId(null); // Clear active chat
      setIsChatSidebarOpen(true); // Reset sidebar state
      setLoadedActiveChatIdFromSettings(null); // Clear loaded active chat ID
      displayMessageBox('Logged out successfully!');
      console.log("User logged out.");
    } catch (e) {
      displayMessageBox('Failed to log out.', 'error');
      console.error("Logout error:", e);
    }
  };

  // Effect for Firebase Authentication and initial auth readiness
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
        console.log("Authenticated user ID:", currentUser.uid);
      } else {
        setUserId(null);
        setIsAdmin(false); // Reset admin status on logout
      }
      setIsAuthReady(true); // Auth state determined
    });

    return () => unsubscribeAuth();
  }, []);

  // Effect for loading PUBLIC data (admin list, downtime settings, system prompt)
  useEffect(() => {
    // IMPORTANT: Only proceed if auth state is ready.
    if (!isAuthReady) {
      console.log("Auth not ready, skipping public data load.");
      return;
    }

    // Load admin list (public data)
    const adminsPath = `public/admins`;
    const adminsRef = ref(db, adminsPath);
    console.log(`Loading admin list from path: ${adminsPath}`);
    const unsubscribeAdmins = onValue(adminsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const loadedAdmins = data ? Object.keys(data).filter(key => data[key] === true) : [];
        setAdminList(loadedAdmins);
        // Update isAdmin here based on the latest admin list and current userId
        if (userId) { // Only check if userId is available
          setIsAdmin(loadedAdmins.includes(userId));
        } else {
          setIsAdmin(false);
        }
      } catch (e) {
        console.error("Error parsing admin list data:", e);
        setAdminList([]);
        setIsAdmin(false);
      }
    }, (error) => {
      console.error(`Firebase admin list read failed for path ${adminsPath}:`, error);
      setAdminList([]);
      setIsAdmin(false);
    });

    // Load downtime settings (public data)
    const downtimePath = `public/downtime`;
    const downtimeRef = ref(db, downtimePath);
    console.log(`Loading downtime settings from path: ${downtimePath}`);
    const unsubscribeDowntime = onValue(downtimeRef, (snapshot) => {
      const data = snapshot.val();
      setDowntimeSettings({
        enabled: data?.enabled || false,
        type: data?.type || 'regular',
        countdownEndTime: data?.countdownEndTime || null,
        musicEnabled: data?.musicEnabled || false,
        musicUrl: data?.musicUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        customMessage: data?.customMessage || "AVA AI is currently undergoing maintenance. We'll be back soon!",
        customScreenHtml: data?.customScreenHtml || ""
      });
    }, (error) => {
      console.error(`Firebase downtime settings read failed for path ${downtimePath}:`, error);
      setDowntimeSettings({ enabled: false }); // Fallback to disabled downtime
    });

    // Load system prompt (public data)
    const systemPromptPath = `public/system_settings/systemPrompt`;
    const systemPromptRef = ref(db, systemPromptPath);
    console.log(`Loading system prompt from path: ${systemPromptPath}`);
    const unsubscribeSystemPrompt = onValue(systemPromptRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSystemPrompt(String(data));
      } else {
        // If no prompt in DB, use the default constant
        setSystemPrompt("You are AVA AI, an advanced, emotionally aware, and creatively intelligent AI. Your purpose is to assist users with a wide range of tasks, engage in meaningful conversations, and generate creative content. Always be helpful, empathetic, and insightful. If a user asks for code or a structured output that looks like a code block, format it using markdown code blocks (```language\ncode\n```). If you generate code that logically spans multiple files, please consolidate it into a single markdown code block within your response for easier display in the workspace.");
      }
    }, (error) => {
      console.error(`Firebase system prompt read failed for path ${systemPromptPath}:`, error);
      setSystemPrompt("You are AVA AI, an advanced, emotionally aware, and creatively intelligent AI. Your purpose is to assist users with a wide range of tasks, engage in meaningful conversations, and generate creative content. Always be helpful, empathetic, and insightful. If a user asks for code or a structured output that looks like a code block, format it using markdown code blocks (```language\ncode\n```). If you generate code that logically spans multiple files, please consolidate it into a single markdown code block within your response for easier display in the workspace.");
    });

    return () => {
      unsubscribeAdmins();
      unsubscribeDowntime();
      unsubscribeSystemPrompt();
    };
  }, [isAuthReady, userId]); // Keep userId here so isAdmin updates if userId changes AFTER initial public data load

  // Effect for loading PRIVATE user data (settings, chat metadata)
  useEffect(() => {
    if (!userId || !isAuthReady) {
      console.log("User ID or Auth not ready, skipping private data load.");
      // Clear all private user-specific states
      setChatHistory([]);
      setTheme('dark');
      setWorkspaceLanguage('javascript');
      setWorkspaceCode('');
      setShowWorkspace(false);
      setCurrentPage('chat');
      setChatListMetadata([]);
      setActiveChatId(null); // This will be managed by a separate effect
      setLoadedActiveChatIdFromSettings(null); // Clear loaded settings ID
      setIsChatSidebarOpen(true);
      return; // Crucially, return here to prevent listeners from being set up
    }

    console.log(`Attempting to load private data for userId: ${userId}`);

    // Load user settings (theme, workspace state, language, current page, sidebar state, and *loaded* active chat ID)
    const settingsPath = `users/${userId}/settings`;
    const settingsRef = ref(db, settingsPath);
    console.log(`Loading settings from path: ${settingsPath}`);
    const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          setTheme(String(data.theme || 'dark'));
          setShowWorkspace(Boolean(data.showWorkspace || false));
          setWorkspaceCode(String(data.workspaceCode || ''));
          setWorkspaceLanguage(String(data.workspaceLanguage || 'javascript'));
          setCurrentPage(String(data.currentPage || 'chat'));
          setLoadedActiveChatIdFromSettings(data.activeChatId || null); // Set the loaded ID
          setIsChatSidebarOpen(Boolean(data.isChatSidebarOpen ?? true)); // Load sidebar state, default true
        } else {
          // If no settings exist, initialize with defaults and save them
          const defaultSettings = {
            theme: 'dark',
            showWorkspace: false,
            workspaceCode: '',
            workspaceLanguage: 'javascript',
            currentPage: 'chat',
            activeChatId: null, // Will be set by chat list logic
            isChatSidebarOpen: true
          };
          setTheme(defaultSettings.theme);
          setShowWorkspace(defaultSettings.showWorkspace);
          setWorkspaceCode(defaultSettings.workspaceCode);
          setWorkspaceLanguage(defaultSettings.workspaceLanguage);
          setCurrentPage(defaultSettings.currentPage);
          setLoadedActiveChatIdFromSettings(defaultSettings.activeChatId); // Set the loaded ID
          setIsChatSidebarOpen(defaultSettings.isChatSidebarOpen);
          // Only save if it's a new user or settings are truly empty
          if (!snapshot.exists()) { // Check if the snapshot exists to avoid overwriting
            saveSettings(defaultSettings);
          }
        }
      } catch (e) {
        console.error("Error parsing settings data:", e);
      }
    }, (error) => {
      console.error(`Firebase settings read failed for path ${settingsPath}:`, error);
    });

    // Load chat list metadata
    const chatsMetadataPath = `users/${userId}/chats`;
    const chatsMetadataRef = ref(db, chatsMetadataPath);
    console.log(`Loading chat list metadata from path: ${chatsMetadataPath}`);
    const unsubscribeChatsMetadata = onValue(chatsMetadataRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const loadedChatList = data ? Object.keys(data).map(chatId => ({
          id: chatId,
          name: data[chatId]?.metadata?.name || 'Untitled Chat',
          createdAt: data[chatId]?.metadata?.createdAt || 0,
          lastUpdated: data[chatId]?.metadata?.lastUpdated || 0,
        })).sort((a, b) => b.lastUpdated - a.lastUpdated) : []; // Sort by last updated
        setChatListMetadata(loadedChatList);
      } catch (e) {
        console.error("Error parsing chat list metadata:", e);
        setChatListMetadata([]);
      }
    }, (error) => {
      console.error(`Firebase chat list metadata read failed for path ${chatsMetadataPath}:`, error);
      setChatListMetadata([]);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeChatsMetadata();
    };
  }, [userId, isAuthReady, saveSettings]); // Removed activeChatId from dependencies here

  // NEW: Effect to manage activeChatId based on chat list
  // This effect is the SOLE place where activeChatId is determined and set.
  useEffect(() => {
    if (!userId || !isAuthReady) {
      return;
    }

    let newActiveChatId = null;

    if (chatListMetadata.length > 0) {
      // Always set to the most recent chat if chats exist
      newActiveChatId = chatListMetadata[0].id;
    } else {
      // No chats exist, newActiveChatId remains null
    }

    // Only update activeChatId and save settings if there's a change
    if (activeChatId !== newActiveChatId) {
      setActiveChatId(newActiveChatId);
      saveSettings({ activeChatId: newActiveChatId });
    }

    // If no chats exist AND activeChatId is null (after attempting to set it above), create a new one
    if (chatListMetadata.length === 0 && newActiveChatId === null) {
      createNewChat();
    }

  }, [userId, isAuthReady, chatListMetadata, activeChatId, createNewChat, saveSettings]);


  // Effect to load messages for the active chat
  useEffect(() => {
    if (!userId || !activeChatId) {
      setChatHistory([]);
      return;
    }

    const chatMessagesPath = `users/${userId}/chats/${activeChatId}/messages`;
    const chatMessagesRef = ref(db, chatMessagesPath);
    console.log(`Loading messages for active chat: ${activeChatId} from path: ${chatMessagesPath}`);

    const unsubscribeMessages = onValue(chatMessagesRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const loadedMessages = Array.isArray(data) ? data.map(item => ({
          role: String(item.role || ''),
          text: String(item.text || '')
        })) : [];
        setChatHistory(loadedMessages);
      } catch (e) {
        console.error("Error parsing chat messages:", e);
        setChatHistory([]);
      }
    }, (error) => {
      console.error(`Firebase chat messages read failed for path ${chatMessagesPath}:`, error);
      setChatHistory([]);
    });

    return () => unsubscribeMessages();
  }, [userId, activeChatId]); // Re-run when activeChatId or userId changes


  // Effect to apply theme to HTML element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Effect to scroll to bottom when chat history changes
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-inter">
        <div className="text-2xl font-semibold animate-pulse">Loading AVA AI...</div>
      </div>
    );
  }

  // Render DowntimeScreen if enabled and countdown hasn't ended
  const isDowntimeActive = downtimeSettings.enabled &&
                          (downtimeSettings.type === 'regular' ||
                           (downtimeSettings.type === 'countdown' && downtimeSettings.countdownEndTime > Date.now()));

  if (isDowntimeActive) {
    return <DowntimeScreen downtimeSettings={downtimeSettings} />;
  }


  return (
    <div className={`flex flex-col h-screen font-inter ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Global styles for dark mode */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        html { font-family: 'Inter', sans-serif; }
        body {
          background: radial-gradient(circle at top left, #e0e7ff, #f0f4ff); /* Light gradient for light mode */
          background-size: 200% 200%;
          animation: gradientShift 10s ease infinite alternate;
        }
        .dark body {
          background: radial-gradient(circle at top left, #1a202c, #2d3748); /* Dark gradient for dark mode */
          background-size: 200% 200%;
          animation: gradientShift 10s ease infinite alternate;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }

        /* Custom scrollbar for Webkit browsers (Chrome, Safari) */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.0); /* Completely transparent */
          border-radius: 10px;
        }
        .dark ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.0); /* Completely transparent for dark mode */
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.4); /* Darker on hover */
        }
        .dark ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2); /* Darker on hover for dark mode */
        }
        /* Hide scrollbar for Firefox */
        .hide-scrollbar {
          scrollbar-width: none; /* Firefox */
        }
        /* Hide scrollbar for IE and Edge */
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
        }
        
        .dark {
          background-color: #1a202c; /* dark gray fallback */
          color: #e2e8f0; /* light gray */
        }
        .dark .bg-white { background-color: #2d3748; } /* darker gray for elements */
        .dark .text-gray-900 { color: #e2e8f0; }
        .dark .text-gray-700 { color: #cbd5e0; }
        .dark .border-gray-300 { border-color: #4a5568; }
        .dark .focus\\:border-blue-500:focus { border-color: #63b3ed; }
        .dark .focus\\:ring-blue-500:focus { --tw-ring-color: #63b3ed; }
        .dark .bg-gray-50 { background-color: #2d3748; }
        .dark .bg-gray-100 { background-color: #1a202c; }
        .dark .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12); }
        .dark .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15); }
        .dark .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2); }
        .dark .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .dark .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); }
        .dark .hover\\:bg-gray-100:hover { background-color: #2d3748; }
        .dark .hover\\:bg-gray-50:hover { background-color: #2d3748; }
        .dark .hover\\:text-gray-700:hover { color: #a0aec0; }
        .dark .text-gray-500 { color: #a0aec0; }
        .dark .text-gray-400 { color: #a0aec0; }
        .dark .text-gray-300 { color: #cbd5e0; }
        .dark .bg-gray-800 { background-color: #1a202c; }
        .dark .bg-gray-700 { background-color: #2d3748; }
        .dark .bg-gray-900 { background-color: #1a202c; }
        .animate-scale-in { animation: scaleIn 0.3s forwards ease-out; }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* Custom shadows for a more refined look */
        .custom-shadow-xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04),
                      0 0 0 1px rgba(0, 0, 0, 0.05); /* Subtle ring */
        }
        .dark .custom-shadow-xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2),
                      0 0 0 1px rgba(255, 255, 255, 0.05); /* Subtle ring for dark mode */
        }

        .custom-shadow-lg {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05),
                      0 0 0 1px rgba(0, 0, 0, 0.03);
        }
        .dark .custom-shadow-lg {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15),
                      0 0 0 1px rgba(255, 255, 255, 0.03);
        }

        .hover\\:custom-shadow-xl:hover {
          box-shadow: 0 25px 30px -8px rgba(0, 0, 0, 0.15), 0 12px 12px -6px rgba(0, 0, 0, 0.06),
                      0 0 0 1px rgba(0, 0, 0, 0.08);
        }
        .dark .hover\\:custom-shadow-xl:hover {
          box-shadow: 0 25px 30px -8px rgba(0, 0, 0, 0.5), 0 12px 12px -6px rgba(0, 0, 0, 0.25),
                      0 0 0 1px rgba(255, 255, 255, 0.08);
        }

        .custom-shadow-inner {
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
        }
        .dark .custom-shadow-inner {
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.2);
        }

        /* Inner glow for buttons on active state */
        .active\\:custom-shadow-inner-purple:active {
          box-shadow: inset 0 0 0 2px rgba(168, 85, 247, 0.7), inset 0 2px 4px 0 rgba(0, 0, 0, 0.1);
        }
        .dark .active\\:custom-shadow-inner-purple:active {
          box-shadow: inset 0 0 0 2px rgba(192, 132, 252, 0.7), inset 0 2px 4px 0 rgba(0, 0, 0, 0.3);
        }

        .active\\:custom-shadow-inner-teal:active {
          box-shadow: inset 0 0 0 2px rgba(20, 184, 166, 0.7), inset 0 2px 4px 0 rgba(0, 0, 0, 0.1);
        }
        .dark .active\\:custom-shadow-inner-teal:active {
          box-shadow: inset 0 0 0 2px rgba(45, 212, 191, 0.7), inset 0 2px 4px 0 rgba(0, 0, 0, 0.3);
        }
      `}</style>

      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 shadow-2xl rounded-b-3xl z-10 border border-gray-200 dark:border-gray-700">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tighter">AVA AI</h1>
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-98"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
          </button>

          {/* Chat Page Button */}
          {user && (
            <>
              <button
                onClick={toggleChatSidebar}
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-98"
                title="Toggle Chat List"
              >
                <Menu size={22} />
              </button>
              <button
                onClick={() => handlePageChange('chat')}
                className={`p-3 rounded-full ${currentPage === 'chat' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} hover:bg-blue-600 dark:hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-98`}
                title="Chat"
              >
                <MessageSquare size={22} />
              </button>
            </>
          )}

          {/* Image Generator Page Button */}
          {user && (
            <button
              onClick={() => handlePageChange('imageGenerator')}
              className={`p-3 rounded-full ${currentPage === 'imageGenerator' ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} hover:bg-purple-600 dark:hover:bg-purple-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-98`}
              title="Image Generator"
            >
              <Image size={22} />
            </button>
          )}

          {/* Workspace Toggle Button (only visible if logged in) */}
          {user && (
            <button
              onClick={toggleWorkspace}
              className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-98"
              title="Toggle Code Canvas"
            >
              <Code size={22} />
            </button>
          )}

          {/* Admin Page Button (only visible if admin) */}
          {user && isAdmin && (
            <button
              onClick={() => handlePageChange('admin')}
              className={`p-3 rounded-full ${currentPage === 'admin' ? 'bg-teal-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} hover:bg-teal-600 dark:hover:bg-teal-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-98`}
              title="Admin Panel"
            >
              <Shield size={22} />
            </button>
          )}

          {/* Settings Button (only visible if logged in) */}
          {user && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-98"
              title="Settings"
            >
              <Settings size={22} />
            </button>
          )}

          {/* Auth Buttons */}
          {!user ? (
            <>
              <button
                onClick={() => setShowLoginModal(true)}
                className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98"
                title="Login"
              >
                <LogIn size={22} />
              </button>
              <button
                onClick={() => setShowSignupModal(true)}
                className="p-3 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98"
                title="Sign Up"
              >
                <UserPlus size={22} />
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="p-3 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98"
              title="Logout"
            >
              <LogOut size={22} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      {/* Conditional classes for main tag based on user login status */}
      <main className={`flex-1 flex p-6 overflow-hidden ${!user ? 'flex-col items-center justify-center' : 'flex-col md:flex-row md:space-x-4'}`}>
        {!user ? ( // If not logged in, show AuthPromptScreen
          <AuthPromptScreen
            onLoginClick={() => setShowLoginModal(true)}
            onSignupClick={() => setShowSignupModal(true)}
          />
        ) : ( // If logged in, show current page content
          (() => {
            switch (currentPage) {
              case 'chat':
                return (
                  <>
                    {isChatSidebarOpen && (
                      <ChatList
                        userId={userId}
                        chatListMetadata={chatListMetadata}
                        activeChatId={activeChatId}
                        setActiveChatId={setActiveChatId}
                        createNewChat={createNewChat}
                        renameChat={renameChat}
                        deleteChat={deleteChat}
                        showMessageBox={displayMessageBox}
                      />
                    )}
                    <div className={`flex flex-col h-full ${showWorkspace ? 'w-full md:w-1/2 md:pr-2' : 'w-full max-w-3xl mx-auto px-4'} ${isChatSidebarOpen ? 'md:flex-1' : 'md:max-w-3xl md:mx-auto md:px-4'}`}>
                      <ChatPanel
                        chatHistory={chatHistory}
                        isLoadingAI={isLoadingAI}
                        message={message}
                        setMessage={setMessage}
                        sendMessage={sendMessage}
                        chatMessagesEndRef={chatMessagesEndRef}
                      />
                    </div>
                    {showWorkspace && (
                      <div className="flex-1 w-full md:w-1/2 md:pl-2">
                        <WorkspaceContent
                          code={workspaceCode}
                          setCode={handleSetWorkspaceCode}
                          theme={theme}
                          workspaceLanguage={workspaceLanguage}
                          setWorkspaceLanguage={handleSetWorkspaceLanguage}
                          saveSettings={saveSettings}
                        />
                      </div>
                    )}
                  </>
                );
              case 'imageGenerator':
                return <ImageGenerator userId={userId} showMessageBox={displayMessageBox} logActivity={logActivity} />;
              case 'admin':
                return isAdmin ? (
                  <AdminPanel
                    userId={userId}
                    adminList={adminList}
                    setAdminList={setAdminList}
                    showMessageBox={displayMessageBox}
                    systemPrompt={systemPrompt}
                    saveSystemPrompt={saveSystemPrompt}
                    setSystemPrompt={setSystemPrompt}
                    logSystemEvent={logSystemEvent} // Pass logSystemEvent to AdminPanel
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full w-full bg-red-100 dark:bg-red-900 rounded-3xl shadow-xl border border-red-400 text-red-800 dark:text-red-200 p-6 text-center">
                    <Shield size={72} className="mb-5" />
                    <h2 className="text-3xl font-bold mb-3">Access Denied</h2>
                    <p className="text-lg">You do not have administrative privileges to view this page.</p>
                  </div>
                );
              default:
                return null;
            }
          })()
        )}
      </main>

      {/* Modals */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <SignupModal isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} />
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        userId={userId}
        onClearChat={clearChatHistory}
        onExportChat={exportChatHistory}
        showMessageBox={displayMessageBox}
      />
      <MessageBox
        isOpen={showMessageBox}
        onClose={() => setShowMessageBox(false)}
        message={messageBoxContent}
        type={messageBoxType}
      />
    </div>
  );
};

export default App;
