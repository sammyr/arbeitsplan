"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EmployeeForm;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
function EmployeeForm({ employee, onSave, onCancel }) {
    const { register, handleSubmit, reset, formState: { errors }, } = (0, react_hook_form_1.useForm)();
    (0, react_1.useEffect)(() => {
        if (employee) {
            reset(employee);
        }
    }, [employee, reset]);
    const onSubmit = (data) => {
        onSave(Object.assign(Object.assign({}, data), { id: (employee === null || employee === void 0 ? void 0 : employee.id) || '' }));
    };
    return (<div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-lg font-medium mb-6">
          {employee ? 'Edit Employee' : 'Add Employee'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input type="text" {...register('firstName', { required: 'First name is required' })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
            {errors.firstName && (<p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input type="text" {...register('lastName', { required: 'Last name is required' })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
            {errors.lastName && (<p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input type="email" {...register('email', {
        required: 'Email is required',
        pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
        },
    })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
            {errors.email && (<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mobile Phone
            </label>
            <input type="tel" {...register('mobilePhone', { required: 'Mobile phone is required' })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
            {errors.mobilePhone && (<p className="mt-1 text-sm text-red-600">{errors.mobilePhone.message}</p>)}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
              {employee ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>);
}
