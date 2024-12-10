"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WorkplanNotFound;
const link_1 = __importDefault(require("next/link"));
function WorkplanNotFound() {
    return (<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-100">
      <div className="rounded-lg bg-white p-8 text-center shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Arbeitsplan nicht gefunden</h2>
        <p className="text-gray-600 mb-6">
          Der angeforderte Arbeitsplan konnte nicht gefunden werden.
        </p>
        <link_1.default href="/workplan" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Zurück zum Arbeitsplan
        </link_1.default>
      </div>
    </div>);
}
