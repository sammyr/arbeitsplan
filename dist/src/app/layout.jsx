"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require("./globals.css");
const google_1 = require("next/font/google");
const Sidebar_1 = __importDefault(require("@/components/Sidebar"));
const StoreContext_1 = require("@/contexts/StoreContext");
const inter = (0, google_1.Inter)({ subsets: ['latin'] });
exports.metadata = {
    title: 'Arbeitsplan Manager',
    description: 'Verwalten Sie Ihren Arbeitsplan effizient',
};
function RootLayout({ children, }) {
    return (<html lang="de" className="h-full bg-gray-100">
      <body className={`${inter.className} h-full`}>
        <StoreContext_1.StoreProvider>
          <div className="flex min-h-screen">
            <Sidebar_1.default />
            <main className="flex-1 lg:pl-72 pt-16 lg:pt-0">
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </StoreContext_1.StoreProvider>
      </body>
    </html>);
}
