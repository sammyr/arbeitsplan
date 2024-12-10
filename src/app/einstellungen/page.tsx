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
    <div className="container mx-auto p-4 bg-transparent">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center">
          <MdSettings className="h-8 w-8 mr-3 text-slate-600" />
          Einstellungen
        </h1>
        <p className="text-slate-600">
          Verwalten Sie hier Ihre Systemeinstellungen und E-Mail-Vorlagen.
        </p>
      </div>

      <div className="space-y-8">
        {/* Admin Email Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Manager E-Mail</h3>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                E-Mail Adresse
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdEmail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                  focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                  transition-colors duration-200"
                  placeholder="z.B. manager@firma.de"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
              >
                Speichern
              </button>
            </div>
          </form>
        </div>

        {/* Email Templates */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-slate-900">E-Mail Vorlagen</h3>
            <button
              onClick={() => {
                setSelectedTemplate(null);
                setIsEditing(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
            >
              <MdAdd className="mr-2" /> Neue Vorlage
            </button>
          </div>

          {/* Template List */}
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-slate-900">{template.name}</h4>
                    <p className="text-sm text-slate-500 mt-1">{template.subject}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTemplateEdit(template)}
                      className="text-slate-400 hover:text-emerald-600 transition-colors duration-200"
                      title="Bearbeiten"
                    >
                      <MdEdit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleTemplateDelete(template.id!)}
                      className="text-slate-400 hover:text-red-600 transition-colors duration-200"
                      title="Löschen"
                    >
                      <MdDelete className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-slate-600 whitespace-pre-line line-clamp-3">
                    {template.body}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {template.variables.map((variable) => (
                    <span key={variable} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Template Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">
                {selectedTemplate ? 'Vorlage bearbeiten' : 'Neue Vorlage'}
              </h2>
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setIsEditing(false);
                }}
                className="text-slate-400 hover:text-slate-500 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    defaultValue={selectedTemplate?.name}
                    required
                    className="mt-1 block w-full rounded-lg border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700">Betreff</label>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    defaultValue={selectedTemplate?.subject}
                    required
                    className="mt-1 block w-full rounded-lg border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="body" className="block text-sm font-medium text-slate-700">Inhalt</label>
                  <textarea
                    name="body"
                    id="body"
                    rows={8}
                    defaultValue={selectedTemplate?.body}
                    required
                    className="mt-1 block w-full rounded-lg border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="variables" className="block text-sm font-medium text-slate-700">
                    Variablen (kommagetrennt)
                  </label>
                  <input
                    type="text"
                    name="variables"
                    id="variables"
                    defaultValue={selectedTemplate?.variables.join(', ')}
                    required
                    className="mt-1 block w-full rounded-lg border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-200"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(null);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border rounded-lg transition-colors duration-200"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-all duration-200"
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
