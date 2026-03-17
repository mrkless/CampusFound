import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ItemCard from '../components/items/ItemCard';
import { Search, Filter, PackageSearch } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const CATEGORIES = ['All', 'Electronics', 'ID/Cards', 'Keys', 'Wallets/Bags', 'Books/Stationery', 'Clothing', 'Other'];

const LostItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    let result = items;

    if (searchQuery) {
      result = result.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(result);
  }, [searchQuery, selectedCategory, items]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('status', 'lost')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
      setFilteredItems(data || []);
    } catch (err) {
      showNotification('Failed to load items. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Lost Items</h1>
          <p className="text-slate-500 text-lg">Help others recover what they've lost.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 flex-grow max-w-2xl">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by title, location..."
              className="input pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              className="input pl-10 h-12 appearance-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="card h-[400px] animate-pulse bg-white border-slate-100">
              <div className="h-48 bg-slate-100 rounded-t-xl"></div>
              <div className="p-5 space-y-4">
                <div className="h-4 w-1/4 bg-slate-100 rounded"></div>
                <div className="h-6 w-3/4 bg-slate-100 rounded"></div>
                <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <PackageSearch size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No items found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default LostItems;
