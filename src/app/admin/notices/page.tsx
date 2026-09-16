'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone, User, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/Layout';
import AdminProtectedRoute from '@/components/admin/ProtectedRoute';

interface Notice {
  _id: string;
  title: string;
  message: string;
  class: string;
  postedBy: string;
  documentUrl?: string;
  documentName?: string;
  createdAt: string;
}

interface FormData {
  title: string;
  message: string;
  class: string;
  document: File | null;
}

function AdminNoticesPage() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>({ title: '', message: '', class: 'All', document: null });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notices');
      const data = await res.json();
      if (data.success) setNotices(data.data);
      else toast.error('Failed to load notices');
    } catch {
      toast.error('Error fetching notices');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, document: e.target.files?.[0] || null });
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('message', form.message);
      formData.append('class', form.class);
      if (form.document) {
        formData.append('document', form.document);
      }
      const res = await fetch('/api/notices', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Notice posted');
        setForm({ title: '', message: '', class: 'All', document: null });
        fetchNotices();
      } else {
        toast.error(data.message || 'Failed to post notice');
      }
    } catch {
      toast.error('Error posting notice');
    }
    setPosting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    
    try {
      const res = await fetch(`/api/notices/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Notice deleted successfully');
        fetchNotices();
      } else {
        toast.error(data.message || 'Failed to delete notice');
      }
    } catch {
      toast.error('Error deleting notice');
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#0b0b0b] relative overflow-hidden py-10">
        {/* Green Radial Glow Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_top,_rgba(0,229,168,0.2)_0%,_rgba(0,229,168,0.1)_30%,_transparent_70%)]"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-[#00E5A8] mb-6 flex items-center gap-2">
            <Megaphone size={32} className="text-[#00E5A8]" />
            Admin Notices
          </h1>
          <form onSubmit={handlePost} className="bg-[#111111] rounded-xl shadow-lg p-6 mb-8 border border-gray-800" encType="multipart/form-data">
            <h2 className="text-xl font-semibold text-[#00E5A8] mb-4">Post a New Notice</h2>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Notice Title"
              className="w-full mb-3 px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5A8] text-white placeholder-gray-500"
              required
            />
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Notice Message"
              className="w-full mb-3 px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5A8] text-white placeholder-gray-500"
              rows={4}
              required
            />
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-300 mb-1">Reference Document (PDF, DOC, etc.)</label>
              <input
                type="file"
                name="document"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5A8] text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#00E5A8] file:text-black file:cursor-pointer hover:file:bg-[#00E5A8]/90"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-300 mb-1">For Class</label>
              <select
                name="class"
                value={form.class}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5A8] text-white"
              >
                <option value="All">All</option>
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={posting}
              className="bg-[#00E5A8] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#00E5A8]/90 hover:scale-105 transition-all disabled:opacity-50"
            >{posting ? 'Posting...' : 'Post Notice'}</button>
          </form>
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading notices...</div>
            ) : notices.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No notices yet.</div>
            ) : (
              notices.map(notice => (
                <div key={notice._id} className="bg-[#111111] rounded-xl shadow-md p-6 border border-gray-800 border-l-4 border-l-[#00E5A8]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <User size={20} className="text-[#00E5A8]" />
                      <span className="font-semibold text-[#00E5A8]">{notice.postedBy}</span>
                      <span className="text-xs text-gray-400 ml-2">{new Date(notice.createdAt).toLocaleString()}</span>
                      <span className="ml-2 px-2 py-1 rounded bg-[#00E5A8]/10 text-[#00E5A8] text-xs font-semibold">{notice.class || 'All'}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(notice._id)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors"
                      title="Delete Notice"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{notice.title}</h3>
                  <p className="text-gray-300 mb-2 whitespace-pre-line">{notice.message}</p>
                  {notice.documentUrl && (
                    <a
                      href={notice.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 px-4 py-2 bg-[#00E5A8]/10 text-[#00E5A8] rounded hover:bg-[#00E5A8]/20 font-medium transition-colors"
                    >
                      {notice.documentName ? notice.documentName : 'View Reference Document'}
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Wrap with AdminProtectedRoute for security
export default function ProtectedAdminNoticesPage() {
  return (
    <AdminProtectedRoute>
      <AdminNoticesPage />
    </AdminProtectedRoute>
  );
}

