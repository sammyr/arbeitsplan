"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoadingSpinner;
function LoadingSpinner() {
    return (<div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>);
}
