import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Upload, X, MapPin, Calendar, Tag, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const CATEGORIES = ['Electronics', 'ID/Cards', 'Keys', 'Wallets/Bags', 'Books/Stationery', 'Clothing', 'Other'];

const EditItem = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    status: 'lost',
    location: '',
    lost_found_date: ''
  });

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check ownership
      if (data.user_id !== user?.id) {
        showNotification('You do not have permission to edit this post', 'error');
        navigate('/');
        return;
      }

      setFormData({
        title: data.title,
        description: data.description || '',
        category: data.category,
        status: data.status,
        location: data.location,
        lost_found_date: data.lost_found_date
      });
      setExistingImageUrl(data.image_url);
      setImagePreview(data.image_url);
    } catch (err) {
      showNotification('Failed to load item details', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showNotification('Image size should be less than 2MB', 'error');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return existingImageUrl;

    // Delete old image if it exists
    if (existingImageUrl) {
      const oldPath = existingImageUrl.split('/item-images/')[1];
      if (oldPath) {
        await supabase.storage.from('item-images').remove([oldPath]);
      }
    }

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(filePath, imageFile);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('item-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const image_url = await uploadImage();

      const { error: updateError } = await supabase
        .from('items')
        .update({
          ...formData,
          image_url
        })
        .eq('id', id);

      if (updateError) throw updateError;

      navigate(`/items/${id}`);
      showNotification('Post updated successfully!', 'success');
    } catch (err) {
      const msg = err.message || 'Failed to update item';
      showNotification(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Report</h1>
        <p className="text-slate-500 text-lg">Update the details of your report.</p>
      </div>

      <div className="card p-8 bg-white">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Status Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: 'lost' })}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.status === 'lost'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.status === 'lost' ? 'bg-primary-600 text-white' : 'bg-slate-200'}`}>
                {formData.status === 'lost' ? <CheckCircle2 size={18} /> : 1}
              </div>
              <span className="font-bold">I Lost Something</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: 'found' })}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.status === 'found'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.status === 'found' ? 'bg-primary-600 text-white' : 'bg-slate-200'}`}>
                {formData.status === 'found' ? <CheckCircle2 size={18} /> : 2}
              </div>
              <span className="font-bold">I Found Something</span>
            </button>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">Item Photo</label>
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(existingImageUrl);
                  }}
                  className="absolute top-4 right-4 p-2 bg-slate-900/50 text-white rounded-full hover:bg-slate-900 transition-colors"
                >
                  <X size={20} />
                </button>
                <label className="absolute inset-0 bg-slate-900/0 hover:bg-slate-900/40 transition-all flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer">
                  <Upload className="text-white" size={32} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-primary-300 transition-all cursor-pointer group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-slate-400 group-hover:text-primary-500 mb-4 transition-colors" />
                  <p className="mb-2 text-sm text-slate-600 font-medium">Click to upload photo</p>
                  <p className="text-xs text-slate-400">PNG, JPG or JPEG (MAX 2MB)</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Item Title</label>
              <input
                required
                className="input"
                placeholder="e.g. Blue Backpack, Brown Leather Wallet"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  className="input pl-10 appearance-none"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Date {formData.status === 'lost' ? 'Lost' : 'Found'}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  required
                  className="input pl-10"
                  value={formData.lost_found_date}
                  onChange={(e) => setFormData({ ...formData, lost_found_date: e.target.value })}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  className="input pl-10"
                  placeholder="e.g. Science Library, Building A Room 302"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
              <textarea
                className="input min-h-[120px] py-3"
                placeholder="Describe the item in detail (brand, color, special marks...)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary w-full py-4 text-lg font-bold flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/25"
          >
            {saving ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditItem;
