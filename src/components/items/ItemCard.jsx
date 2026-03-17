import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, ChevronRight } from 'lucide-react';

const ItemCard = ({ item }) => {
  const { id, title, category, location, lost_found_date, image_url, status, resolved } = item;

  return (
    <div className="card group overflow-hidden flex flex-col h-full bg-white">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={image_url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop'}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
            status === 'lost' ? 'bg-red-500 text-white' : 'bg-primary-600 text-white'
          }`}>
            {status}
          </span>
          {resolved && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 text-white shadow-sm">
              Resolved
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
            <Tag size={12} className="mr-1" />
            {category}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        
        <div className="space-y-2 mt-auto">
          <div className="flex items-center text-sm text-slate-500">
            <MapPin size={14} className="mr-2 shrink-0 text-primary-500" />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center text-sm text-slate-500">
            <Calendar size={14} className="mr-2 shrink-0 text-primary-500" />
            <span>{new Date(lost_found_date).toLocaleDateString()}</span>
          </div>
        </div>

        <Link
          to={`/items/${id}`}
          className="mt-6 flex items-center justify-between text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          <span>View Details</span>
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default ItemCard;
