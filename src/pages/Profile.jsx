import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/items/ItemCard';
import { User, Mail, Package, CheckCircle2, Clock, Camera, Calendar, Phone, Edit3, Share2, Award, Instagram, Send, Info as InfoIcon } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/common/Modal';

const Profile = () => {
  const { user, profile, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ 
    name: '', 
    phone: '', 
    bio: '',
    instagram: '',
    telegram: ''
  });
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (user) {
      fetchUserItems();
    }
  }, [user]);

  const fetchUserItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      showNotification('Failed to load your reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showNotification('Image size should be less than 2MB', 'error');
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await fetchProfile(user.id);
      showNotification('Profile picture updated!', 'success');
    } catch (err) {
      showNotification('Failed to update profile picture', 'error');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleEditProfile = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({ 
          name: editFormData.name, 
          phone: editFormData.phone,
          bio: editFormData.bio,
          instagram: editFormData.instagram,
          telegram: editFormData.telegram
        })
        .eq('id', user.id);

      if (error) throw error;

      await fetchProfile(user.id);
      setIsEditModalOpen(false);
      showNotification('Profile updated successfully!', 'success');
    } catch (err) {
      showNotification('Failed to update profile. Columns (bio, phone, etc) might be missing in DB.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = () => {
    setEditFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      instagram: profile?.instagram || '',
      telegram: profile?.telegram || ''
    });
    setIsEditModalOpen(true);
  };

  const resolvedCount = items.filter(i => i.resolved).length;
  // Feature 3: Karma System
  // +10 per post, +50 per returned item
  const karma = (items.length * 10) + (resolvedCount * 50);
  const getBadge = () => {
    if (karma >= 300) return { title: 'Honesty Hero', color: 'text-amber-400', icon: <Award className="text-amber-400" size={14} /> };
    if (karma >= 100) return { title: 'Good Samaritan', color: 'text-emerald-400', icon: <Award className="text-emerald-400" size={14} /> };
    return { title: 'Campus Member', color: 'text-white', icon: <User className="text-white/60" size={14} /> };
  };
  const badge = getBadge();

  // Feature 4: Looking For (Pinned Lost Items)
  const lookingFor = items.filter(item => item.status === 'lost' && !item.resolved).slice(0, 3);

  const stats = [
    { label: 'Total Posts', value: items.length, icon: <Package size={20} className="text-primary-600" /> },
    { label: 'Resolved', value: resolvedCount, icon: <CheckCircle2 size={20} className="text-emerald-600" /> },
    { label: 'Active', value: items.filter(i => !i.resolved).length, icon: <Clock size={20} className="text-amber-600" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Enhanced Header Banner */}
      <div className="relative mb-16">
        <div className="h-64 w-full bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-emerald-500 to-teal-400 opacity-90"></div>
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[5%] w-64 h-64 bg-primary-400/20 rounded-full blur-2xl"></div>

          {/* Glass Overlay Pattern */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative group/avatar">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-3xl p-1.5 shadow-2xl rotate-3 group-hover/avatar:rotate-0 transition-transform duration-500 overflow-hidden">
                    <div className="w-full h-full bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="text-primary-200" />
                      )}
                    </div>
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-2.5 bg-white text-primary-600 rounded-2xl shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all border border-slate-100 z-10">
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin"></div>
                    ) : (
                      <Camera size={20} />
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                  </label>
                </div>

                <div className="text-white flex-grow">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm">{profile?.name || 'User Profile'}</h1>
                    <button 
                      onClick={openEditModal}
                      className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-colors text-white"
                      title="Edit Profile"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        showNotification('Profile link copied!', 'info');
                      }}
                      className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-colors text-white"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                  
                  {profile?.bio && (
                    <p className="text-white/90 text-sm italic mb-3 font-medium max-w-lg line-clamp-2">
                       "{profile.bio}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-white/80 font-medium">
                    <p className="flex items-center gap-1.5 text-sm">
                      <Mail size={14} />
                      {user?.email}
                    </p>
                    {profile?.phone && (
                      <>
                        <div className="w-1 h-1 bg-white/40 rounded-full hidden sm:block"></div>
                        <p className="flex items-center gap-1.5 text-sm">
                          <Phone size={14} />
                          {profile.phone}
                        </p>
                      </>
                    )}
                    <div className="w-1 h-1 bg-white/40 rounded-full hidden sm:block"></div>
                    <p className="flex items-center gap-1.5 text-sm">
                      <Calendar size={14} />
                      Joined {new Date(profile?.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Social Links */}
                  {(profile?.instagram || profile?.telegram) && (
                    <div className="flex gap-3 mt-4">
                      {profile.instagram && (
                        <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/10 hover:bg-white/30 rounded-lg transition-all flex items-center gap-2 text-xs">
                          <Instagram size={14} /> @{profile.instagram}
                        </a>
                      )}
                      {profile.telegram && (
                        <a href={`https://t.me/${profile.telegram}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/10 hover:bg-white/30 rounded-lg transition-all flex items-center gap-2 text-xs">
                          <Send size={14} /> @{profile.telegram}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden lg:flex items-center">
                <div className="glass-premium px-6 py-3 rounded-2xl border-white/20 flex items-center gap-4 shadow-xl backdrop-blur-md">
                  <div className="flex flex-col border-r border-white/10 pr-4">
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest leading-tight">Karma</p>
                    <p className="text-xl font-black text-white">{karma}</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest leading-tight">Impact</p>
                    <div className="flex items-center gap-2">
                       <Award size={14} className={badge.color.replace('text-', 'text-')} />
                       <p className={`text-xs font-bold uppercase tracking-wide ${badge.color}`}>{badge.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Stats & Looking For */}
        <div className="lg:col-span-1 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Your Stats</h3>
            {stats.map((stat, i) => (
              <div key={i} className="card p-5 flex items-center justify-between border-slate-100 hover:scale-[1.02] transition-transform shadow-sm">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Feature 4: Looking For Section */}
          {lookingFor.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pl-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Looking For</h3>
                <span className="px-2 py-0.5 bg-primary-100 text-primary-600 text-[10px] font-bold rounded-full">Pinned</span>
              </div>
              <div className="space-y-3">
                {lookingFor.map(item => (
                  <div key={item.id} className="group p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary-200 transition-all cursor-pointer" onClick={() => navigate(`/items/${item.id}`)}>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-primary-600 transition-colors line-clamp-1">{item.title}</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                      <Clock size={10} /> {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content: User Posts */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
               Activity Registry
               <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">All Items</span>
            </h2>
            <div className="h-px bg-slate-200 flex-grow mx-8 hidden sm:block"></div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card h-64 animate-pulse bg-white border-slate-100"></div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <Package size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">No reports yet</h3>
              <p className="text-slate-500 mb-6 font-display">You haven't posted any lost or found items yet.</p>
              <button
                onClick={() => navigate('/post')}
                className="btn btn-primary px-8 py-3"
              >
                Post Your First Item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleEditProfile}
        title="Edit Profile"
        message="Update your personal information and social links."
        confirmText={saving ? "Saving..." : "Save Changes"}
        type="info"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                className="input pl-10"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Your Name"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bio</label>
            <textarea
              className="input min-h-[80px] py-3 resize-none"
              value={editFormData.bio}
              onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
              placeholder="Tell us about yourself or where you're usually located on campus..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="tel"
                  className="input pl-10 h-11"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="0912..."
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Instagram size={12} /> Instagram
              </label>
              <input
                type="text"
                className="input h-11"
                value={editFormData.instagram}
                onChange={(e) => setEditFormData({ ...editFormData, instagram: e.target.value })}
                placeholder="username"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Send size={12} /> Telegram Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
              <input
                type="text"
                className="input pl-8 h-11"
                value={editFormData.telegram}
                onChange={(e) => setEditFormData({ ...editFormData, telegram: e.target.value })}
                placeholder="username"
              />
            </div>
          </div>
          
          <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex gap-3 items-start">
             <InfoIcon className="text-primary-500 mt-0.5" size={16} />
             <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
               Providing social links helps others contact you faster if they find your lost items.
             </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
