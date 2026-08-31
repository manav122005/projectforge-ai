'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute/ProtectedRoute';
import { useProjectStore } from '../../../store/useProjectStore';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  FolderPlus,
  FileText,
  Lightbulb
} from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject, isLoading, error, clearError } = useProjectStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    originalIdea: '',
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.name.trim()) {
      setValidationError('Please enter a project name.');
      return;
    }

    if (!formData.originalIdea.trim()) {
      setValidationError('Please enter a project idea or prompt.');
      return;
    }

    const res = await createProject({
      name: formData.name.trim(),
      description: formData.description.trim(),
      originalIdea: formData.originalIdea.trim(),
    });

    if (res?.success && res.project?._id) {
      router.push(`/projects/${res.project._id}`);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/projects" className="hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Projects</span>
          </Link>
          <span>/</span>
          <span className="text-white font-medium">Create Project</span>
        </div>

        {/* Page Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Phase 2 Project Core Engine</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Create Project Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Provide your project title and natural-language software idea to establish your execution workspace.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-glass">
          {(error || validationError) && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-indigo-400" />
                <span>Project Name *</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. AI Placement Predictor"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Short Summary (Optional)</span>
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. Predict placement probability for 500 college students using Python and React."
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Original Idea Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Project Idea & Objectives *</span>
              </label>
              <textarea
                name="originalIdea"
                rows={5}
                value={formData.originalIdea}
                onChange={handleChange}
                placeholder="Describe your project vision in natural language... e.g. I want to build an automated web system for student placement prediction with ML model, team roles, and milestone tracking."
                required
                className="w-full p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all leading-relaxed"
              />
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <Link
                href="/projects"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-semibold text-xs shadow-glow-indigo transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Creating Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Initialize Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
