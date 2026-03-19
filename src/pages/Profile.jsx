import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/items/ItemCard';
import { User, Mail, Package, CheckCircle2, Clock, Camera, Calendar, Phone, Edit3, Share2, Award, Instagram, Send, Info as InfoIcon, ArrowLeft, Facebook } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/common/Modal';

const Profile = () => {
  const { id } = useParams();
  const { user, profile: currentUserProfile, fetchProfile: refreshCurrentUserProfile } = useAuth();
  const navigate = useNavigate();
  const [targetProfile, setTargetProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    instagram: '',
    facebook: '',
    telegram: ''
  });
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();

  const isOwnProfile = !id || id === user?.id;
  const profileId = id || user?.id;

  useEffect(() => {
    if (profileId) {
      fetchTargetProfile();
      fetchUserItems();
    } else if (!loading && !user) {
      navigate('/login');
    }
  }, [profileId, user]);

  const fetchTargetProfile = async () => {
    try {
      if (isOwnProfile && currentUserProfile) {
        setTargetProfile(currentUserProfile);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      setTargetProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      showNotification('Profile not found', 'error');
    }
  };

  const fetchUserItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      showNotification('Failed to load activity.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    if (!isOwnProfile) return;
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

      await refreshCurrentUserProfile(user.id);
      setTargetProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      showNotification('Profile picture updated!', 'success');
    } catch (err) {
      showNotification('Failed to update profile picture', 'error');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleEditProfile = async () => {
    if (!isOwnProfile) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editFormData.name,
          phone: editFormData.phone,
          bio: editFormData.bio,
          instagram: editFormData.instagram,
          facebook: editFormData.facebook,
          telegram: editFormData.telegram
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshCurrentUserProfile(user.id);
      setTargetProfile(prev => ({
        ...prev,
        ...editFormData
      }));
      setIsEditModalOpen(false);
      showNotification('Profile updated successfully!', 'success');
    } catch (err) {
      showNotification('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = () => {
    setEditFormData({
      name: targetProfile?.name || '',
      phone: targetProfile?.phone || '',
      bio: targetProfile?.bio || '',
      instagram: targetProfile?.instagram || '',
      facebook: targetProfile?.facebook || '',
      telegram: targetProfile?.telegram || ''
    });
    setIsEditModalOpen(true);
  };

  if (!user && !loading) {
    return (
      <div className="min-h-[80vh] relative">
        {/* Blurred Background Content for Context */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 blur-[4px] pointer-events-none opacity-40">
           <div className="h-64 w-full bg-slate-200 rounded-[2.5rem] mb-16"></div>
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="space-y-4">
                 <div className="h-20 bg-slate-100 rounded-2xl w-full"></div>
                 <div className="h-20 bg-slate-100 rounded-2xl w-full"></div>
              </div>
              <div className="lg:col-span-3 h-96 bg-slate-100 rounded-2xl"></div>
           </div>
        </div>

        <Modal
          isOpen={true}
          onClose={() => navigate('/')}
          title="Sign In Required"
          message="Please sign up or log in to view this page."
          showClose={false}
          type="info"
          maxWidth="max-w-sm"
        >
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary py-3 text-sm font-bold"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 py-3 text-sm font-bold"
            >
              Sign Up
            </button>
          </div>
        </Modal>
      </div>
    );
  }

  const resolvedCount = items.filter(i => i.resolved).length;
  const karma = (items.length * 10) + (resolvedCount * 50);
  const getBadge = () => {
    if (karma >= 300) return { title: 'Honesty Hero', color: 'text-amber-400', icon: <Award className="text-amber-400" size={14} /> };
    if (karma >= 100) return { title: 'Good Samaritan', color: 'text-emerald-400', icon: <Award className="text-emerald-400" size={14} /> };
    return { title: 'Campus Member', color: 'text-white', icon: <User className="text-white/60" size={14} /> };
  };
  const badge = getBadge();

  const lookingFor = items.filter(item => item.status === 'lost' && !item.resolved).slice(0, 3);

  const stats = [
    { label: 'Total Posts', value: items.length, icon: <Package size={20} className="text-primary-600" /> },
    { label: 'Resolved', value: resolvedCount, icon: <CheckCircle2 size={20} className="text-emerald-600" /> },
    { label: 'Active', value: items.filter(i => !i.resolved).length, icon: <Clock size={20} className="text-amber-600" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button if viewing other profile */}
      {!isOwnProfile && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors group"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
      )}

      {/* Enhanced Header Banner */}
      <div className="relative mb-16">
        <div className="h-64 w-full bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-emerald-500 to-teal-400 opacity-90"></div>
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[5%] w-64 h-64 bg-primary-400/20 rounded-full blur-2xl"></div>
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative group/avatar">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-3xl p-1.5 shadow-2xl rotate-3 group-hover/avatar:rotate-0 transition-transform duration-500 overflow-hidden">
                    <div className="w-full h-full bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden">
                      {targetProfile?.avatar_url ? (
                        <img src={targetProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="text-primary-200" />
                      )}
                    </div>
                  </div>
                  {isOwnProfile && (
                    <label className="absolute -bottom-2 -right-2 p-2.5 bg-white text-primary-600 rounded-2xl shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all border border-slate-100 z-10">
                      {uploading ? (
                        <div className="w-5 h-5 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin"></div>
                      ) : (
                        <Camera size={20} />
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                    </label>
                  )}
                </div>

                <div className="text-white flex-grow">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm">{targetProfile?.name || 'User Profile'}</h1>
                    {isOwnProfile && (
                      <button
                        onClick={openEditModal}
                        className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-colors text-white"
                        title="Edit Profile"
                      >
                        <Edit3 size={16} />
                      </button>
                    )}
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

                  {targetProfile?.bio && (
                    <p className="text-white/90 text-sm italic mb-3 font-medium max-w-lg line-clamp-2">
                      "{targetProfile.bio}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-white/80 font-medium">
                    <a href={`mailto:${targetProfile?.email}`} className="flex items-center gap-1.5 text-sm hover:text-white transition-colors">
                      <Mail size={14} />
                      {targetProfile?.email}
                    </a>
                    {targetProfile?.phone && (
                      <>
                        <div className="w-1 h-1 bg-white/40 rounded-full hidden sm:block"></div>
                        <a href={`tel:${targetProfile.phone}`} className="flex items-center gap-1.5 text-sm hover:text-white transition-colors">
                          <Phone size={14} />
                          {targetProfile.phone}
                        </a>
                      </>
                    )}
                    <div className="w-1 h-1 bg-white/40 rounded-full hidden sm:block"></div>
                    <p className="flex items-center gap-1.5 text-sm">
                      <Calendar size={14} />
                      Joined {targetProfile?.created_at ? new Date(targetProfile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '...'}
                    </p>
                  </div>

                  {/* Social Links */}
                  {(targetProfile?.instagram || targetProfile?.facebook || targetProfile?.telegram) && (
                    <div className="flex gap-3 mt-4">
                      {targetProfile.facebook && (
                        <a href={`https://facebook.com/${targetProfile.facebook}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/10 hover:bg-white/30 rounded-lg transition-all flex items-center gap-2 text-xs">
                          <Facebook size={14} /> Facebook
                        </a>
                      )}
                      {targetProfile.instagram && (
                        <a href={`https://instagram.com/${targetProfile.instagram}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/10 hover:bg-white/30 rounded-lg transition-all flex items-center gap-2 text-xs">
                          <Instagram size={14} /> @{targetProfile.instagram}
                        </a>
                      )}
                      {targetProfile.telegram && (
                        <a href={`https://t.me/${targetProfile.telegram}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/10 hover:bg-white/30 rounded-lg transition-all flex items-center gap-2 text-xs">
                          <Send size={14} /> @{targetProfile.telegram}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden lg:flex items-center">
                <div className="glass-premium px-6 py-3 rounded-2xl border-white/20 flex items-center gap-4 shadow-xl backdrop-blur-md">
                  <div className="flex flex-col border-r border-white/10 pr-4">
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest leading-tight">Points</p>
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
        <div className="lg:col-span-1 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">{isOwnProfile ? 'Your Stats' : `${targetProfile?.name}'s Stats`}</h3>
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

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              Activity Registry
              <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">{isOwnProfile ? 'All Your Items' : 'All Items'}</span>
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
              <p className="text-slate-500 mb-6 font-display">{isOwnProfile ? "You haven't posted any items yet." : "This user hasn't posted any items yet."}</p>
              {isOwnProfile && (
                <button onClick={() => navigate('/post')} className="btn btn-primary px-8 py-3">Post Your First Item</button>
              )}
            </div>
          )}
        </div>
      </div>

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
              <input type="text" className="input pl-10" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} placeholder="Your Name" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bio</label>
            <textarea className="input min-h-[80px] py-3 resize-none" value={editFormData.bio} onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })} placeholder="Tell us about yourself..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="tel" className="input pl-10 h-11" value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} placeholder="0912..." />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Instagram size={12} /> Instagram</label>
              <input type="text" className="input h-11" value={editFormData.instagram} onChange={(e) => setEditFormData({ ...editFormData, instagram: e.target.value })} placeholder="username" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Facebook size={12} /> Facebook</label>
              <input type="text" className="input h-11" value={editFormData.facebook} onChange={(e) => setEditFormData({ ...editFormData, facebook: e.target.value })} placeholder="vanity URL/ID" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Send size={12} /> Telegram Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
              <input type="text" className="input pl-8 h-11" value={editFormData.telegram} onChange={(e) => setEditFormData({ ...editFormData, telegram: e.target.value })} placeholder="username" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
