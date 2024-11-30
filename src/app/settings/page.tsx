'use client';

import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { MdSettings, MdEmail, MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { EmailTemplate, defaultTemplates } from '@/types/emailTemplate';

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual save functionality
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTemplateEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleTemplateDelete = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };

  const handleTemplateSave = (template: EmailTemplate) => {
    if (selectedTemplate) {
      setTemplates(templates.map(t => t.id === selectedTemplate.id ? template : t));
    } else {
      setTemplates([...templates, { ...template, id: Date.now().toString() }]);
    }
    setSelectedTemplate(null);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <MdSettings className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Einstellungen</h2>
        </div>

        <div className="mt-8 space-y-8">
          {/* Admin Email Settings */}
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Manager E-Mail</h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-Mail Adresse
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>

          {/* Email Templates */}
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">E-Mail Vorlagen</h3>
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setIsEditing(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <MdAdd className="mr-2" /> Neue Vorlage
              </button>
            </div>

            {/* Template List */}
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleTemplateEdit(template)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <MdEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleTemplateDelete(template.id!)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <MdDelete className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-3">
                      {template.body}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {template.variables.map((variable) => (
                      <span key={variable} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Template Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedTemplate ? 'Vorlage bearbeiten' : 'Neue Vorlage'}
              </h2>
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setIsEditing(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <MdDelete className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const template: EmailTemplate = {
                  id: selectedTemplate?.id,
                  name: formData.get('name') as string,
                  subject: formData.get('subject') as string,
                  body: formData.get('body') as string,
                  variables: (formData.get('variables') as string).split(',').map(v => v.trim())
                };
                handleTemplateSave(template);
              }} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    defaultValue={selectedTemplate?.name}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Betreff</label>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    defaultValue={selectedTemplate?.subject}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="body" className="block text-sm font-medium text-gray-700">Inhalt</label>
                  <textarea
                    name="body"
                    id="body"
                    rows={8}
                    defaultValue={selectedTemplate?.body}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="variables" className="block text-sm font-medium text-gray-700">
                    Variablen (kommagetrennt)
                  </label>
                  <input
                    type="text"
                    name="variables"
                    id="variables"
                    defaultValue={selectedTemplate?.variables.join(', ')}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(null);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-md"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Speichern
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
