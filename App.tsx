
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, User as UserIcon, Settings, Search, X, Trash2, Plus, Minus, 
  CheckCircle, CreditCard, PieChart, Sparkles, ArrowRight, Upload, 
  DollarSign, Package, Tag, Heart, ShieldCheck, Globe, Truck, ChevronRight,
  Pencil, Maximize2, ShoppingCart, Smartphone, Copy, QrCode, Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { Product, CartItem, User } from './types';
import { INITIAL_PRODUCTS, CATEGORIES } from './constants';
import { getStyleAdvice } from './geminiService';

// --- Helper Components ---

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const formatINR = (amount: number) => {
  return amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};

const Badge: React.FC<{ children: React.ReactNode, variant?: 'default' | 'urgent' }> = ({ children, variant = 'default' }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
    variant === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
  }`}>
    {children}
  </span>
);

// --- Shared UI Components ---

const Header: React.FC<{ 
  cartCount: number, 
  isAdmin: boolean, 
  onLogout: () => void,
  searchQuery: string,
  onSearchChange: (query: string) => void
}> = ({ cartCount, isAdmin, onLogout, searchQuery, onSearchChange }) => {
  const location = useLocation();
  const isSearchActive = location.pathname === '/shop';

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-serif text-xl font-bold group-hover:bg-indigo-600 transition-colors">S</div>
          <span className="text-xl font-serif font-black tracking-tighter text-slate-900 hidden sm:block uppercase">
            ShopVibe
          </span>
        </Link>
        
        <nav className="hidden lg:flex items-center space-x-10">
          <Link to="/" className={`text-sm font-semibold transition-all relative group ${location.pathname === '/' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
            Home
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-indigo-600 transition-all ${location.pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
          <Link to="/shop" className={`text-sm font-semibold transition-all relative group ${location.pathname === '/shop' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
            Shop
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-indigo-600 transition-all ${location.pathname === '/shop' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
          <Link to="/collections" className={`text-sm font-semibold transition-all relative group ${location.pathname === '/collections' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
            Collections
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-indigo-600 transition-all ${location.pathname === '/collections' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-full">
              <Settings className="w-4 h-4" /> Admin Panel
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-2">
          {isSearchActive && (
            <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2 mr-4">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Find perfection..." 
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-32 focus:w-48 transition-all" 
              />
            </div>
          )}
          <Link to="/cart" className="relative p-2.5 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                {cartCount}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-2 border-l border-slate-100 pl-4 ml-2">
            {!isAdmin ? (
               <Link to="/login" className="p-2.5 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                <UserIcon className="w-6 h-6" />
              </Link>
            ) : (
              <button onClick={onLogout} className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-slate-100 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const ProductDetailModal: React.FC<{
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product, s: string) => void;
}> = ({ product, onClose, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    const fetchAdvice = async () => {
      setLoadingAdvice(true);
      const res = await getStyleAdvice(product.name, product.category);
      setAdvice(res || "");
      setLoadingAdvice(false);
    };
    fetchAdvice();
  }, [product]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col md:flex-row">
        {/* Left: Image with Zoom */}
        <div className="md:w-1/2 relative bg-slate-100 overflow-hidden group">
          <div className="w-full h-full overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-150 cursor-zoom-in"
              style={{ transformOrigin: 'center' }}
            />
          </div>
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur border border-white/30 text-white rounded-full hover:bg-white hover:text-slate-900 transition-all md:hidden"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/10 backdrop-blur-sm border border-white/10 rounded-2xl text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-center">Hover to inspect textures</p>
          </div>
        </div>

        {/* Right: Details */}
        <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto bg-white flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">{product.category}</p>
              <h2 className="text-4xl font-serif font-bold text-slate-900 leading-tight mb-2">{product.name}</h2>
              <p className="text-2xl font-bold text-slate-900">₹{formatINR(product.price)}</p>
            </div>
            <button 
              onClick={onClose}
              className="hidden md:flex p-3 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-8 flex-grow">
            <div className="prose prose-slate">
              <p className="text-slate-500 leading-relaxed">{product.description}</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Size</h4>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                      selectedSize === size 
                        ? 'border-slate-900 bg-slate-900 text-white shadow-lg' 
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-[32px] space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-2 text-indigo-600">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Maison Stylist Advice</span>
              </div>
              <p className={`text-sm italic text-slate-600 leading-relaxed font-serif ${loadingAdvice ? 'animate-pulse' : ''}`}>
                {loadingAdvice ? "Consulting our archives..." : advice ? `"${advice}"` : "A versatile silhouette for the modern wardrobe."}
              </p>
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Sparkles className="w-12 h-12" />
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <button 
              onClick={() => {
                onAddToCart(product, selectedSize);
                onClose();
              }}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 active:scale-[0.98]"
            >
              <ShoppingCart className="w-5 h-5" /> Add to Shopping Bag
            </button>
            <div className="flex items-center justify-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Authenticity Guaranteed</div>
              <div className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Express Maison Delivery</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard: React.FC<{ product: Product, onAddToCart: (p: Product, s: string) => void }> = ({ product, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const fetchAdvice = async () => {
    if (advice) return;
    setLoadingAdvice(true);
    const res = await getStyleAdvice(product.name, product.category);
    setAdvice(res || "");
    setLoadingAdvice(false);
  };

  return (
    <>
      <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
        <div className="aspect-[4/5] overflow-hidden relative">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          
          {/* Action Overlay */}
          <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
             <button 
              onClick={() => setIsDetailOpen(true)}
              className="p-4 bg-white text-slate-900 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2 group/btn"
            >
              <Maximize2 className="w-5 h-5" />
              <span className="max-w-0 overflow-hidden group-hover/btn:max-w-xs transition-all duration-500 whitespace-nowrap text-[10px] font-black uppercase tracking-widest">Quick View</span>
            </button>
          </div>

          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.stock < 10 && <Badge variant="urgent">Low Stock</Badge>}
            {product.price > 18000 && <Badge>Premium</Badge>}
          </div>
          <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 z-10">
            <Heart className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category}</p>
          </div>
          <h3 className="font-semibold text-slate-900 text-lg mb-1 truncate group-hover:text-indigo-600 transition-colors">{product.name}</h3>
          <p className="text-slate-900 font-bold mb-4 text-xl">₹{formatINR(product.price)}</p>
          
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-9 h-9 text-[11px] flex items-center justify-center rounded-lg border-2 transition-all ${
                    selectedSize === size 
                      ? 'border-slate-900 bg-slate-900 text-white font-bold' 
                      : 'border-slate-100 text-slate-500 hover:border-slate-200 bg-slate-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => onAddToCart(product, selectedSize)}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" /> Add to Cart
            </button>
            
            <button 
              onClick={fetchAdvice}
              className="w-full py-3 bg-indigo-50 text-indigo-700 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {loadingAdvice ? "Consulting..." : advice ? "Styling Tips" : "AI Stylist Insight"}
            </button>
            
            {advice && (
              <div className="p-3 bg-slate-50 rounded-xl mt-2 animate-in fade-in zoom-in-95 duration-300">
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium italic">
                  "{advice}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isDetailOpen && (
        <ProductDetailModal 
          product={product} 
          onClose={() => setIsDetailOpen(false)} 
          onAddToCart={onAddToCart}
        />
      )}
    </>
  );
};

// --- Page Components ---

const HomePage: React.FC<{ products: Product[], onAddToCart: (p: Product, s: string) => void }> = ({ products, onAddToCart }) => {
  const navigate = useNavigate();
  const featured = products.slice(0, 4);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero */}
      <section className="relative h-[85vh] overflow-hidden bg-slate-900">
        <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2400" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Hero" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent" />
        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-start">
          <div className="max-w-2xl animate-in fade-in slide-in-from-left-12 duration-1000">
            <span className="inline-block px-4 py-1 bg-white/10 backdrop-blur border border-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.3em] mb-8">Collection '26</span>
            <h1 className="text-6xl md:text-8xl font-serif text-white font-bold mb-8 leading-[0.9] tracking-tighter">Define Your <br/><span className="italic text-indigo-400">Own Frequency.</span></h1>
            <p className="text-slate-300 text-xl mb-12 font-medium leading-relaxed max-w-lg">Minimalist aesthetics meet artisanal precision. Explore our curated selection of timeless silhouettes.</p>
            <div className="flex gap-6">
              <button onClick={() => navigate('/shop')} className="px-12 py-5 bg-white text-slate-900 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-2xl flex items-center gap-3 group">
                Enter Shop <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
              <button onClick={() => navigate('/collections')} className="px-12 py-5 bg-white/5 backdrop-blur border border-white/20 text-white rounded-2xl font-bold hover:bg-white/10 transition-all">
                The Collections
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl font-serif font-bold text-slate-900">New Arrivals</h2>
            <p className="text-slate-500 mt-2 font-medium">The latest additions to the ShopVibe repertoire.</p>
          </div>
          <Link to="/shop" className="text-indigo-600 font-bold flex items-center gap-2 hover:gap-3 transition-all border-b-2 border-indigo-100 hover:border-indigo-600 pb-1">
            View All Pieces <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </section>

      {/* Brand values */}
      <section className="bg-slate-950 py-24 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-16 relative z-10">
          <div className="space-y-4">
            <Globe className="w-10 h-10 text-indigo-400" />
            <h3 className="text-2xl font-serif font-bold">Ethical Sourcing</h3>
            <p className="text-slate-400">Every fabric is traced back to its origin. We partner only with mills that respect both people and planet.</p>
          </div>
          <div className="space-y-4">
            <Truck className="w-10 h-10 text-indigo-400" />
            <h3 className="text-2xl font-serif font-bold">Priority Logistics</h3>
            <p className="text-slate-400">White-glove delivery service to your doorstep. Carbon neutral shipping is our standard, not an option.</p>
          </div>
          <div className="space-y-4">
            <ShieldCheck className="w-10 h-10 text-indigo-400" />
            <h3 className="text-2xl font-serif font-bold">Lifetime Quality</h3>
            <p className="text-slate-400">Garments designed to endure. We offer complimentary repairs for the first three years of ownership.</p>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
      </section>
    </div>
  );
};

const ShopPage: React.FC<{ products: Product[], onAddToCart: (p: Product, s: string) => void, searchQuery: string }> = ({ products, onAddToCart, searchQuery }) => {
  const [category, setCategory] = useState('All');

  const filteredProducts = products.filter(p => {
    const matchesCategory = category === 'All' || p.category === category;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in duration-700">
      <div className="mb-16">
        <h1 className="text-5xl font-serif font-bold text-slate-900 tracking-tight">The Boutique</h1>
        <p className="text-slate-500 mt-4 text-lg">Curate your personal signature through our complete inventory.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-12">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              category === cat 
                ? 'bg-slate-900 text-white shadow-xl scale-105' 
                : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-white rounded-[40px] border border-slate-50">
          <Search className="w-20 h-20 text-slate-100 mx-auto mb-8" />
          <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">No Matches Found</h3>
          <p className="text-slate-400 max-w-sm mx-auto">The curation is strictly selective. Try another keyword or reset the filters.</p>
          <button onClick={() => setCategory('All')} className="mt-8 text-indigo-600 font-bold border-b-2 border-indigo-100 hover:border-indigo-600 transition-all">Clear all filters</button>
        </div>
      )}
    </div>
  );
};

const CollectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const collections = [
    { name: 'Evening Rituals', desc: 'Silk and velvet silhouettes for the night.', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1200', cat: 'Dresses' },
    { name: 'Metropolitan Knit', desc: 'High-altitude cashmere for city life.', img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=1200', cat: 'Knitwear' },
    { name: 'Sculpted Layers', desc: 'Architectural outerwear for transition.', img: 'https://images.pexels.com/photos/19531045/pexels-photo-19531045.jpeg?auto=format&fit=crop&q=80&w=1200', cat: 'Outerwear' },
    { name: 'Foundations', desc: 'The base of every modular wardrobe.', img: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&q=80&w=1200', cat: 'Bottoms' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in duration-700">
      <div className="mb-24 text-center max-w-3xl mx-auto">
        <h1 className="text-6xl font-serif font-bold text-slate-900 tracking-tight mb-6 uppercase">The Lookbooks</h1>
        <p className="text-slate-500 text-lg leading-relaxed">Thematic curations designed to evoke specific moods and fulfill unique wardrobe purposes. Each collection is a story of craft.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-16">
        {collections.map((col, idx) => (
          <div key={idx} className="group cursor-pointer" onClick={() => navigate('/shop')}>
            <div className="aspect-[16/10] rounded-[40px] overflow-hidden mb-8 relative">
              <img src={col.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt={col.name} />
              <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-all" />
              <div className="absolute bottom-8 left-8">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/30">Explore Story</span>
              </div>
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{col.name}</h2>
            <p className="text-slate-500 font-medium">{col.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Modals ---

const AddProductModal: React.FC<{ 
  onClose: () => void, 
  onAdd: (p: Product) => void 
}> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: CATEGORIES[1],
    stock: '',
    image: '',
    description: '',
  });
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: Math.random().toString(36).substring(2, 11),
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock),
      image: formData.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
      description: formData.description,
      sizes: selectedSizes,
    };
    onAdd(newProduct);
    onClose();
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
            <Upload className="w-6 h-6 text-indigo-600" /> New Collection Piece
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                required
                type="text" 
                placeholder="e.g. Silk Evening Gown" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Stock</label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  required
                  type="number" 
                  placeholder="25" 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
            <select 
              className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              {CATEGORIES.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL</label>
            <input 
              type="url" 
              placeholder="https://images.unsplash.com/..." 
              className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all"
              value={formData.image}
              onChange={e => setFormData({...formData, image: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Available Sizes</label>
            <div className="flex flex-wrap gap-3">
              {['XS', 'S', 'M', 'L', 'XL', '24', '26', '28', '30'].map(size => (
                <button
                  type="button"
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                    selectedSizes.includes(size) 
                      ? 'border-slate-900 bg-slate-900 text-white' 
                      : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <textarea 
              rows={3}
              placeholder="Describe the fabric, fit, and aesthetic..." 
              className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl transition-all">
            Catalog Item
          </button>
        </form>
      </div>
    </div>
  );
};

const EditProductModal: React.FC<{ 
  product: Product,
  onClose: () => void, 
  onSave: (p: Product) => void 
}> = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price.toString(),
    category: product.category,
    stock: product.stock.toString(),
    image: product.image,
    description: product.description,
  });
  const [selectedSizes, setSelectedSizes] = useState<string[]>(product.sizes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProduct: Product = {
      ...product,
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock),
      image: formData.image,
      description: formData.description,
      sizes: selectedSizes,
    };
    onSave(updatedProduct);
    onClose();
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
            <Pencil className="w-6 h-6 text-indigo-600" /> Edit Piece Details
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                required
                type="text" 
                placeholder="Product Name" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Stock</label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  required
                  type="number" 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
            <select 
              className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              {CATEGORIES.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL</label>
            <input 
              type="url" 
              className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all"
              value={formData.image}
              onChange={e => setFormData({...formData, image: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Available Sizes</label>
            <div className="flex flex-wrap gap-3">
              {['XS', 'S', 'M', 'L', 'XL', '24', '26', '28', '30'].map(size => (
                <button
                  type="button"
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                    selectedSizes.includes(size) 
                      ? 'border-slate-900 bg-slate-900 text-white' 
                      : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <textarea 
              rows={3}
              className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl transition-all">
            Save Modifications
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Page Components ---

const CartPage: React.FC<{ 
  cart: CartItem[], 
  onRemove: (id: string, size: string) => void, 
  onUpdate: (id: string, size: string, q: number) => void 
}> = ({ cart, onRemove, onUpdate }) => {
  const navigate = useNavigate();
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [updatedKey, setUpdatedKey] = useState<string | null>(null);

  const handleRemove = (id: string, size: string) => {
    const key = `${id}-${size}`;
    setRemovingKey(key);
    setTimeout(() => {
      onRemove(id, size);
      setRemovingKey(null);
    }, 400);
  };

  const handleUpdate = (id: string, size: string, q: number) => {
    const key = `${id}-${size}`;
    setUpdatedKey(key);
    onUpdate(id, size, q);
    setTimeout(() => setUpdatedKey(null), 300);
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 40000 ? 0 : 2500;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-4xl font-serif font-bold text-slate-900 mb-3">Your Bag is Empty</h2>
        <p className="text-slate-500 mb-10 text-lg">Your next favorite outfit is just a click away.</p>
        <Link to="/shop" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-100">
          Explore the Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-center gap-4 mb-16">
        <h1 className="text-5xl font-serif font-bold text-slate-900">Your Bag</h1>
        <span className="px-4 py-1.5 bg-slate-100 rounded-full text-sm font-bold text-slate-500">{cart.length} Items</span>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-8">
          {cart.map(item => {
            const itemKey = `${item.id}-${item.selectedSize}`;
            return (
              <div 
                key={itemKey} 
                className={`flex flex-col sm:flex-row gap-8 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm transition-all duration-500 ${
                  removingKey === itemKey ? 'opacity-0 -translate-x-12 scale-95 blur-md' : 'opacity-100 translate-x-0'
                } ${updatedKey === itemKey ? 'border-indigo-200 ring-2 ring-indigo-50' : 'border-slate-100'}`}
              >
                <div className="w-full sm:w-40 h-52 shrink-0 overflow-hidden rounded-2xl relative group">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
                      <button 
                        onClick={() => handleRemove(item.id, item.selectedSize)} 
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-black text-slate-400">Size</span>
                        <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold">{item.selectedSize}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-black text-slate-400">Price</span>
                        <span className="text-indigo-600 font-black">₹{formatINR(item.price)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border-2 border-slate-100 rounded-2xl bg-slate-50 p-1">
                      <button 
                        onClick={() => handleUpdate(item.id, item.selectedSize, Math.max(1, item.quantity - 1))} 
                        className="w-10 h-10 flex items-center justify-center hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className={`w-12 text-center text-sm font-black transition-transform duration-300 ${updatedKey === itemKey ? 'scale-125 text-indigo-600' : ''}`}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => handleUpdate(item.id, item.selectedSize, item.quantity + 1)} 
                        className="w-10 h-10 flex items-center justify-center hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-slate-400 mb-0.5">Item Total</p>
                      <p className="text-xl font-black text-slate-900">₹{formatINR(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl h-fit sticky top-24">
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-10 uppercase tracking-tighter">Order Summary</h2>
          <div className="space-y-6 mb-10">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Subtotal</span>
              <span className="text-slate-900 font-bold">₹{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Shipping</span>
              <span className="text-slate-900 font-bold">{shipping === 0 ? 'Free' : `₹${formatINR(shipping)}`}</span>
            </div>
            <div className="flex justify-between text-indigo-600 font-medium text-sm bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Free styling guide</span>
              <span className="font-bold">Included</span>
            </div>
            <div className="pt-8 border-t border-slate-100 flex justify-between text-3xl font-serif font-bold text-slate-900">
              <span>Total</span>
              <span>₹{formatINR(total)}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-bold hover:bg-indigo-700 shadow-xl shadow-slate-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            Confirm & Checkout <CheckCircle className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage: React.FC<{ 
  onComplete: () => void,
  totalAmount: number
}> = ({ onComplete, totalAmount }) => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<'card' | 'upi' | 'apple'>('card');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleComplete = () => {
    onComplete();
    navigate('/success');
  };

  const vpa = "shopvibe@bank";
  // Dynamically generate QR code for the specific total
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${vpa}&pn=ShopVibe%20Maison&am=${totalAmount}&cu=INR&tn=MaisonPurchase`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-12 text-center text-white relative">
          <div className="absolute top-4 left-4">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-serif text-xl font-bold">S</div>
          </div>
          <h1 className="text-4xl font-serif font-bold mb-4 uppercase tracking-tighter">Secure Checkout</h1>
          <p className="text-slate-400 text-sm">Every transaction is encrypted and secured.</p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
            <span className="text-xs font-bold text-slate-300">Amount Due:</span>
            <span className="text-lg font-black text-indigo-400">₹{formatINR(totalAmount)}</span>
          </div>
        </div>

        <div className="p-12">
          {step === 1 ? (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <h2 className="text-2xl font-bold text-slate-900">1. Shipping Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <input type="text" placeholder="First Name" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 transition-all outline-none" />
                <input type="text" placeholder="Last Name" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 transition-all outline-none" />
              </div>
              <input type="email" placeholder="Email Address" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 transition-all outline-none" />
              <input type="text" placeholder="Delivery Address" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 transition-all outline-none" />
              <button onClick={() => setStep(2)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">Next: Payment</button>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">2. Payment Method</h2>
                <button onClick={() => setStep(1)} className="text-xs font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest">Edit Shipping</button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <button onClick={() => setMethod('card')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'card' ? 'border-indigo-600 bg-indigo-50 shadow-inner' : 'border-slate-100 hover:border-slate-200'}`}><CreditCard className="w-6 h-6" /> <span className="text-[10px] font-bold uppercase">Card</span></button>
                <button onClick={() => setMethod('upi')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'upi' ? 'border-indigo-600 bg-indigo-50 shadow-inner' : 'border-slate-100 hover:border-slate-200'}`}><Smartphone className="w-6 h-6" /> <span className="text-[10px] font-bold uppercase">UPI QR</span></button>
                <button onClick={() => setMethod('apple')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'apple' ? 'border-indigo-600 bg-indigo-50 shadow-inner' : 'border-slate-100 hover:border-slate-200'}`}><div className="font-black"> Pay</div> <span className="text-[10px] font-bold uppercase">Instant</span></button>
              </div>

              {method === 'upi' ? (
                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex flex-col items-center animate-in zoom-in-95 duration-500">
                  <div className="mb-6 flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Verified Merchant</span>
                  </div>
                  
                  <div className="relative bg-white p-6 rounded-[32px] shadow-2xl border border-slate-100 mb-6 group">
                    <img src={qrUrl} alt="UPI QR Code" className="w-48 h-48 md:w-56 md:h-56 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px] cursor-default">
                       <div className="text-center p-4">
                          <QrCode className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                          <p className="text-[10px] font-bold text-slate-500 uppercase leading-tight">Scan with GPay, PhonePe, or any UPI app</p>
                       </div>
                    </div>
                  </div>

                  <div className="w-full max-w-xs space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">UPI ID / VPA</p>
                        <p className="font-mono font-bold text-slate-900">{vpa}</p>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(vpa);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className={`p-3 rounded-xl transition-all ${copied ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'}`}
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-3 py-2 opacity-40 grayscale">
                      <div className="w-6 h-6 bg-slate-400 rounded-sm"></div> {/* Google Pay Placeholder */}
                      <div className="w-6 h-6 bg-slate-400 rounded-sm"></div> {/* PhonePe Placeholder */}
                      <div className="w-6 h-6 bg-slate-400 rounded-sm"></div> {/* Paytm Placeholder */}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Expires in 05:00</span>
                    </div>

                    <button 
                      onClick={handleComplete}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-5 h-5" /> I've Made Payment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {method === 'card' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <input type="text" placeholder="Card Number" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 transition-all outline-none" />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="MM/YY" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 transition-all outline-none" />
                        <input type="text" placeholder="CVV" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 transition-all outline-none" />
                      </div>
                    </div>
                  )}
                  {method === 'apple' && (
                    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col items-center animate-in fade-in duration-300">
                       <p className="text-slate-500 text-sm mb-4">Confirm payment using your Apple device.</p>
                       <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl"></div>
                    </div>
                  )}
                  <button onClick={handleComplete} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                    Pay ₹{formatINR(totalAmount)}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SuccessPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-32 text-center">
      <div className="w-32 h-32 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-10"><CheckCircle className="w-16 h-16" /></div>
      <h1 className="text-6xl font-serif font-bold text-slate-900 mb-6 uppercase tracking-tighter">Confirmed!</h1>
      <p className="text-slate-500 text-xl mb-12">Thank you for choosing ShopVibe Maison. Your items are being prepared for white-glove delivery.</p>
      <Link to="/shop" className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-bold hover:scale-105 transition-transform">Continue Shopping</Link>
    </div>
  );
};

const AdminDashboard: React.FC<{ 
  products: Product[], 
  onAddProduct: (p: Product) => void,
  onUpdateProduct: (p: Product) => void,
  onDeleteProduct: (id: string) => void
}> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adminSearch, setAdminSearch] = useState('');

  const stats = useMemo(() => [
    { name: 'Dresses', value: products.filter(p => p.category === 'Dresses').length },
    { name: 'Knitwear', value: products.filter(p => p.category === 'Knitwear').length },
    { name: 'Outerwear', value: products.filter(p => p.category === 'Outerwear').length },
    { name: 'Bottoms', value: products.filter(p => p.category === 'Bottoms').length },
    { name: 'Skirts', value: products.filter(p => p.category === 'Skirts').length },
  ], [products]);

  const filteredAdminProducts = products.filter(p => 
    p.name.toLowerCase().includes(adminSearch.toLowerCase()) || 
    p.category.toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-16">
        <h1 className="text-5xl font-serif font-bold text-slate-900 uppercase tracking-tighter">Admin Control</h1>
        <button onClick={() => setShowAddModal(true)} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl hover:bg-indigo-700 transition-all">
          <Plus className="w-5 h-5" /> New Item
        </button>
      </div>

      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} onAdd={onAddProduct} />}
      {editingProduct && (
        <EditProductModal 
          product={editingProduct} 
          onClose={() => setEditingProduct(null)} 
          onSave={onUpdateProduct} 
        />
      )}

      <div className="grid lg:grid-cols-3 gap-10 mb-16">
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3"><PieChart className="w-6 h-6 text-indigo-500" /> Category Intelligence</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {stats.map((_, index) => <Cell key={`cell-${index}`} fill={['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'][index % 5]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-900 text-white p-10 rounded-[40px] flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Inventory Value</h2>
            <div className="text-5xl font-serif font-bold tracking-tighter mb-10">₹{products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString('en-IN')}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl">
              <p className="text-[10px] uppercase font-bold text-slate-500">Total SKU</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl">
              <p className="text-[10px] uppercase font-bold text-slate-500">Units</p>
              <p className="text-2xl font-bold">{products.reduce((acc, p) => acc + p.stock, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Product Master</h2>
          <input type="text" placeholder="Search SKU..." value={adminSearch} onChange={e => setAdminSearch(e.target.value)} className="px-6 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 ring-indigo-50" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-6">Product</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Price</th>
                <th className="px-8 py-6">Stock</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAdminProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6 font-bold">{p.name}</td>
                  <td className="px-8 py-6 text-slate-500">{p.category}</td>
                  <td className="px-8 py-6 font-bold">₹{formatINR(p.price)}</td>
                  <td className="px-8 py-6 font-medium">{p.stock}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingProduct(p)} 
                        className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => onDeleteProduct(p.id)} 
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const LoginPage: React.FC<{ onLogin: (role: 'customer' | 'admin') => void }> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      onLogin('admin');
      navigate('/admin');
    } else {
      alert('Invalid admin password (Hint: admin123)');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-32 animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-50">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-8 text-center uppercase tracking-tighter">ShopVibe Access</h1>
        <form onSubmit={handleAdminLogin} className="space-y-6">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Admin Key" className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 transition-all text-center tracking-widest outline-none" />
          <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">Dashboard Login</button>
          <div className="relative py-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div><div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4 text-slate-300">or</span></div></div>
          <button type="button" onClick={() => onLogin('customer')} className="w-full py-5 bg-indigo-50 text-indigo-700 rounded-2xl font-bold hover:bg-indigo-100 transition-all">Browse as Guest</button>
        </form>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User>({ role: 'customer', isLoggedIn: false });
  const [searchQuery, setSearchQuery] = useState('');

  const addToCart = (product: Product, size: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id && i.selectedSize === size);
      if (existing) {
        return prev.map(i => i.id === product.id && i.selectedSize === size ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
  };

  const removeFromCart = (id: string, size: string) => {
    setCart(prev => prev.filter(i => !(i.id === id && i.selectedSize === size)));
  };

  const updateQuantity = (id: string, size: string, q: number) => {
    setCart(prev => prev.map(i => (i.id === id && i.selectedSize === size) ? { ...i, quantity: q } : i));
  };

  const clearCart = () => setCart([]);
  const handleLogin = (role: 'customer' | 'admin') => setUser({ role, isLoggedIn: true });
  const handleLogout = () => setUser({ role: 'customer', isLoggedIn: false });
  
  const handleAddProduct = (newProduct: Product) => setProducts(prev => [newProduct, ...prev]);
  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };
  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const cartTotal = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 40000 ? 0 : 2500;
    return subtotal + shipping;
  }, [cart]);

  return (
    <Router>
      <ScrollToTop />
      
      <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <Header 
          cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)} 
          isAdmin={user.role === 'admin' && user.isLoggedIn}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage products={products} onAddToCart={addToCart} />} />
            <Route path="/shop" element={<ShopPage products={products} onAddToCart={addToCart} searchQuery={searchQuery} />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/cart" element={<CartPage cart={cart} onRemove={removeFromCart} onUpdate={updateQuantity} />} />
            <Route path="/checkout" element={<CheckoutPage onComplete={clearCart} totalAmount={cartTotal} />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route 
              path="/admin" 
              element={user.role === 'admin' ? (
                <AdminDashboard 
                  products={products} 
                  onAddProduct={handleAddProduct} 
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                />
              ) : <LoginPage onLogin={handleLogin} />} 
            />
          </Routes>
        </main>

        <footer className="bg-slate-900 text-white py-24">
          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-20">
            <div className="md:col-span-2">
               <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 font-serif text-2xl font-bold">S</div>
                <h2 className="text-4xl font-serif font-black tracking-tighter uppercase">ShopVibe</h2>
              </div>
              <p className="text-slate-400 max-w-sm mb-12 text-lg leading-relaxed">Redefining modern luxury through sustainable craftsmanship and mindful design. Join us in shaping the future of high fashion.</p>
              <div className="flex gap-4">
                {['fb', 'tw', 'ig', 'li'].map(social => (
                  <button key={social} className="w-12 h-12 rounded-[18px] bg-white/5 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-indigo-600 hover:text-white cursor-pointer transition-all text-slate-400 uppercase font-bold text-[10px]">{social}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Navigation</h3>
              <ul className="space-y-6 text-slate-300 font-medium">
                <li><Link to="/shop" className="hover:text-indigo-400 transition-colors">Seasonal Edit</Link></li>
                <li><Link to="/collections" className="hover:text-indigo-400 transition-colors">Artisanal Line</Link></li>
                <li><Link to="/shop" className="hover:text-indigo-400 transition-colors">Archives</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Guest Care</h3>
              <ul className="space-y-6 text-slate-300 font-medium">
                <li><Link to="/collections" className="hover:text-indigo-400 transition-colors">Concierge Service</Link></li>
                <li><Link to="/collections" className="hover:text-indigo-400 transition-colors">Returns & Rituals</Link></li>
                <li><Link to="/collections" className="hover:text-indigo-400 transition-colors">Private Viewing</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 pt-16 mt-24 border-t border-white/5 text-center flex flex-col md:flex-row justify-between items-center text-slate-500 text-[10px] font-black uppercase tracking-widest gap-4">
            <span>© 2026 ShopVibe Maison. Secure Payment Encryption Active.</span>
            <div className="flex gap-6">
              <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
              <span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
