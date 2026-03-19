import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Tag, User, Mail, ArrowLeft, CheckCircle, Clock, AlertTriangle, Trash2, Edit2, Phone } from 'lucide-react';
import Modal from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const [posterProfile, setPosterProfile] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          profiles:user_id (id, name, email, phone)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setItem(data);
      setPosterProfile(data.profiles);
    } catch (err) {
      showNotification('Error fetching item details', 'error');
      console.error('Error fetching item:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    try {
      setResolving(true);
      const { error } = await supabase
        .from('items')
        .update({ resolved: true })
        .eq('id', id);

      if (error) throw error;
      setItem({ ...item, resolved: true });
      setShowResolveModal(false);
      showNotification('Post marked as resolved!', 'success');
    } catch (err) {
      showNotification('Failed to update status', 'error');
    } finally {
      setResolving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);

      // Delete image from storage if it exists
      if (item.image_url) {
        const path = item.image_url.split('/item-images/')[1];
        if (path) {
          await supabase.storage.from('item-images').remove([path]);
        }
      }

      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setShowDeleteModal(false);
      showNotification('Post deleted successfully', 'success');
      navigate('/profile');
    } catch (err) {
      showNotification('Failed to delete post', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  if (!item) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-slate-900">Item not found</h2>
      <Link to="/" className="text-primary-600 mt-4 inline-block">Go back home</Link>
    </div>
  );

  const isOwner = user?.id === item?.user_id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to listings
      </button>

      {item && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Image */}
          <div>
            <div className="card overflow-hidden bg-slate-100 aspect-square lg:aspect-auto lg:h-[600px]">
              <img
                src={item.image_url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop'}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${item.status === 'lost' ? 'bg-red-500 text-white' : 'bg-primary-600 text-white'
                }`}>
                {item.status}
              </span>
              {item.resolved ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-slate-900 text-white">
                  <CheckCircle size={14} />
                  RESOLVED
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-amber-50 text-amber-700 border border-amber-100">
                  <Clock size={14} />
                  ACTIVE
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">{item.title}</h1>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-center text-slate-600">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 mr-3 shrink-0 text-primary-600">
                  <Tag size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Category</p>
                  <p className="font-semibold text-slate-900">{item.category}</p>
                </div>
              </div>

              <div className="flex items-center text-slate-600">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 mr-3 shrink-0 text-primary-600">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Location</p>
                  <p className="font-semibold text-slate-900 line-clamp-1">{item.location}</p>
                </div>
              </div>

              <div className="flex items-center text-slate-600">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 mr-3 shrink-0 text-primary-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Date {item.status === 'lost' ? 'Lost' : 'Found'}</p>
                  <p className="font-semibold text-slate-900">{new Date(item.lost_found_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center text-slate-600">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 mr-3 shrink-0 text-primary-600">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Posted By</p>
                  <button
                    onClick={(e) => {
                      if (!user) {
                        e.preventDefault();
                        setShowAuthModal(true);
                      } else {
                        navigate(`/profile/${item.user_id}`);
                      }
                    }}
                    className="font-semibold text-primary-600 hover:text-primary-700 transition-colors hover:underline flex items-center gap-1"
                  >
                    {posterProfile?.name || 'Anonymous'}
                    <span className="text-[10px] bg-primary-100 px-1.5 py-0.5 rounded-full font-bold uppercase">View Profile</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Description</h3>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {item.description || 'No description provided.'}
              </p>
            </div>

            <div className="mt-auto space-y-4">
              {isOwner ? (
                <div className="flex flex-col gap-4">
                  {!item.resolved && (
                    <>
                      <button
                        onClick={() => setShowResolveModal(true)}
                        disabled={resolving}
                        className="btn btn-primary w-full py-4 text-lg"
                      >
                        {resolving ? 'Updating...' : 'Mark as Resolved'}
                      </button>
                      <button
                        onClick={() => navigate(`/edit/${id}`)}
                        className="btn bg-primary-50 text-primary-700 hover:bg-primary-100 w-full py-4 text-lg font-bold flex items-center justify-center gap-2 border-2 border-primary-100 transition-all"
                      >
                        <Edit2 size={20} />
                        Edit Post
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={deleting}
                    className="btn bg-red-50 text-red-600 hover:bg-red-100 w-full py-4 text-lg font-bold flex items-center justify-center gap-2 border-2 border-red-100 transition-all"
                  >
                    <Trash2 size={20} />
                    {deleting ? 'Deleting...' : 'Delete Post'}
                  </button>
                </div>
              ) : (
                <div className="relative p-6 border-2 border-primary-100 rounded-2xl bg-primary-50/50 overflow-hidden">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Mail className="text-primary-600" size={20} />
                    Contact Information
                  </h3>
                  <p className="text-slate-600 mb-4 text-sm">
                    Please contact the person who reported this item if you have any information or believe it's yours.
                  </p>

                  <div className="relative">
                    <div className={!user ? "blur-[4px] select-none pointer-events-none transition-all" : "transition-all"}>
                      <div className="flex flex-col gap-3">
                        <a
                          href={`mailto:${posterProfile?.email}`}
                          className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
                        >
                          <Mail size={18} />
                          {posterProfile?.name || 'Contact User'}
                        </a>
                        
                        {posterProfile?.phone && (
                          <a
                            href={`tel:${posterProfile.phone}`}
                            className="btn bg-white text-primary-600 border-2 border-primary-100 hover:bg-primary-50 w-full py-3 flex items-center justify-center gap-2 transition-all"
                          >
                            <Phone size={18} />
                            {posterProfile.phone}
                          </a>
                        )}
                      </div>
                    </div>

                    {!user && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <button 
                          onClick={() => setShowAuthModal(true)}
                          className="text-primary-600 font-bold hover:underline bg-white/80 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm transition-all text-sm"
                        >
                          Sign in to view
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        onConfirm={handleResolve}
        title="Mark as Resolved?"
        message="This will notify others that the item has been returned or recovered. This action cannot be undone."
        confirmText="Yes, Resolve"
        type="info"
      />

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete this Post?"
        message="Are you sure you want to permanently delete this report? This action cannot be undone and will remove all associated data."
        confirmText="Yes, Delete"
        type="danger"
      />

      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign In Required"
        message="Please sign up or log in to view this page."
        showClose={true}
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
};

export default ItemDetails;
