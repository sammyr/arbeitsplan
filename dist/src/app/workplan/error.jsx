"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WorkplanError;
const react_1 = require("react");
function WorkplanError({ error, reset, }) {
    (0, react_1.useEffect)(() => {
        console.error('Workplan Error:', error);
    }, [error]);
    return (<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-100">
      <div className="rounded-lg bg-white p-8 text-center shadow-xl">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Fehler im Arbeitsplan</h2>
        <p className="text-gray-600 mb-6">Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.</p>
        <button onClick={reset} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Neu laden
        </button>
      </div>
    </div>);
}
