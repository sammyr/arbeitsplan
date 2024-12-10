"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
class ErrorBoundary extends react_1.Component {
    constructor() {
        super(...arguments);
        this.state = {
            hasError: false
        };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }
    render() {
        var _a;
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (<div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="rounded-lg bg-white p-8 text-center shadow-xl">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Ein Fehler ist aufgetreten</h2>
            <p className="text-gray-600 mb-6">
              {((_a = this.state.error) === null || _a === void 0 ? void 0 : _a.message) || 'Bitte laden Sie die Seite neu.'}
            </p>
            <button onClick={() => window.location.reload()} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Seite neu laden
            </button>
          </div>
        </div>);
        }
        return this.props.children;
    }
}
