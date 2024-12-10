"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStore = void 0;
const zustand_1 = require("zustand");
exports.useStore = (0, zustand_1.create)((set) => ({
    stores: [],
    selectedStore: null,
    setSelectedStore: (store) => {
        console.log('Setting selected store:', store);
        set({ selectedStore: store });
    },
    setStores: (stores) => {
        console.log('Setting stores:', stores);
        set({ stores });
    },
}));
