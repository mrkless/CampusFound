import { Link } from 'react-router-dom';
import { Search, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 sm:pt-32 sm:pb-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700 border border-primary-100 mb-6 uppercase tracking-wider">
                Reuniting you with your belongings
              </span>
              <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
                Lost it? <span className="gradient-text">Found it.</span> <br />
                Recover it.
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                The official campus platform to report lost items and return found ones. 
                Simple, secure, and fast.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/lost" className="btn btn-primary px-8 py-4 text-lg w-full sm:w-auto">
                  I Lost Something
                </Link>
                <Link to="/found" className="btn btn-secondary px-8 py-4 text-lg w-full sm:w-auto">
                  I Found Something
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-6">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Easy Search</h3>
              <p className="text-slate-500">Filter by category, location, and date to find exactly what you're looking for.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-6">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Campus Maps</h3>
              <p className="text-slate-500">Specify exactly where an item was lost or found within the campus grounds.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Secure Recovery</h3>
              <p className="text-slate-500">Authenticated student profiles ensure safe and reliable item recovery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl p-8 sm:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px]"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to help your fellow students?</h2>
                <p className="text-slate-400 text-lg">Join the community and help keep the campus organized.</p>
              </div>
              <Link to="/register" className="btn bg-white text-slate-900 hover:bg-slate-50 px-8 py-4 text-lg flex items-center space-x-2 shrink-0">
                <span>Get Started Now</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
