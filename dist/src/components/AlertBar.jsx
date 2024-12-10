"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AlertBar;
const react_1 = require("react");
function AlertBar({ message, type = 'success', onClose, autoHideDuration = 3000 }) {
    (0, react_1.useEffect)(() => {
        if (autoHideDuration) {
            const timer = setTimeout(() => {
                onClose();
            }, autoHideDuration);
            return () => clearTimeout(timer);
        }
    }, [autoHideDuration, onClose]);
    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-l-4 border-green-400 text-green-700';
            case 'error':
                return 'bg-red-50 border-l-4 border-red-400 text-red-700';
            case 'info':
                return 'bg-blue-50 border-l-4 border-blue-400 text-blue-700';
            default:
                return 'bg-green-50 border-l-4 border-green-400 text-green-700';
        }
    };
    const getIcon = () => {
        switch (type) {
            case 'success':
                return (<svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>);
            case 'error':
                return (<svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>);
            case 'info':
                return (<svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>);
        }
    };
    return (<div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-auto max-w-lg">
      <div className={`${getBackgroundColor()} px-6 py-4 rounded-lg shadow-lg flex items-center justify-between backdrop-blur-sm bg-opacity-95 transition-all duration-300 ease-in-out`} role="alert">
        <div className="flex items-center">
          {getIcon()}
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button onClick={onClose} className="ml-6 text-current opacity-75 hover:opacity-100 transition-opacity focus:outline-none" aria-label="Close">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>);
}
