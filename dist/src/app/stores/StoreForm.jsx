"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StoreForm;
const react_1 = require("react");
const StoreContext_1 = require("@/contexts/StoreContext");
const react_hook_form_1 = require("react-hook-form");
const react_hot_toast_1 = __importDefault(require("react-hot-toast")); // Assuming you have react-hot-toast installed
function StoreForm({ store, onClose }) {
    const { addStore, updateStore } = (0, StoreContext_1.useStore)();
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const { register, handleSubmit, formState: { errors } } = (0, react_hook_form_1.useForm)({
        defaultValues: store ? {
            name: store.name,
            address: store.address,
            phone: store.phone || '',
            email: store.email || '',
        } : undefined
    });
    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            const now = new Date().toISOString();
            if (store) {
                await updateStore(store.id, Object.assign(Object.assign({}, data), { updatedAt: now }));
            }
            else {
                await addStore(Object.assign(Object.assign({}, data), { createdAt: now, updatedAt: now }));
            }
            onClose();
            react_hot_toast_1.default.success(store ? 'Store updated successfully' : 'Store added successfully');
        }
        catch (error) {
            console.error('Error saving store:', error);
            react_hot_toast_1.default.error('Error saving store');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Store Name
        </label>
        <input type="text" id="name" {...register('name', { required: 'Store name is required' })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
        {errors.name && (<p className="mt-1 text-sm text-red-600">{errors.name.message}</p>)}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <input type="text" id="address" {...register('address', { required: 'Address is required' })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
        {errors.address && (<p className="mt-1 text-sm text-red-600">{errors.address.message}</p>)}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input type="tel" id="phone" {...register('phone')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input type="email" id="email" {...register('email', {
        pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
        },
    })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
        {errors.email && (<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>)}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Saving...' : store ? 'Update Store' : 'Add Store'}
        </button>
      </div>
    </form>);
}
