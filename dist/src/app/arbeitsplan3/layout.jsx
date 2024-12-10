"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Arbeitsplan3Layout;
const react_hot_toast_1 = require("react-hot-toast");
function Arbeitsplan3Layout({ children, }) {
    return (<>
      <react_hot_toast_1.Toaster position="top-right"/>
      {children}
    </>);
}
