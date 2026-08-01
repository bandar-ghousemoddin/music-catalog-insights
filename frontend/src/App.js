import { useState, useEffect } from 'react';
import { 
  Music, Search, BarChart3, Bot, LogOut, Heart, Plus, Trash2, Edit3, Play, Pause, 
  Sparkles, Disc, Radio, Sliders, TrendingUp, Headphones, Star, CheckCircle, ShieldCheck,
  ExternalLink, ArrowUpRight, RefreshCw, Cpu, Activity, Zap
} from 'lucide-react';
import { authAPI, musicAPI } from './api';
import { toast } from 'sonner';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('soundvault_token') || '');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('search'); // search, library, analytics, ai
  const [loading, setLoading] = useState(false);

  // Auth form state
  const [authMode, setAuthMode] = useState('login'); // login or register
  const [email, setEmail] = useState('demo@soundvault.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Alex Sounder');

  // Search state
  const [searchTerm, setSearchTerm] = useState('Daiki Kasho');
  const [searchEntity, setSearchEntity] = useState('song');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Library state
  const [library, setLibrary] = useState([]);
  const [libFilterGenre, setLibFilterGenre] = useState('All');
  const [libSearch, setLibSearch] = useState('');

  // Analytics state
  const [analytics, setAnalytics] = useState(null);

  // AI Assistant state
  const [aiPrompt, setAiPrompt] = useState('Analyze my music taste and recommend top 3 albums');
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Player state
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (token) {
      authAPI.me(token)
        .then(u => {
          setUser(u);
          fetchLibrary();
          fetchAnalytics();
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = authMode === 'login' 
        ? await authAPI.login(email, password)
        : await authAPI.register(email, password, name);
      
      setToken(data.access_token);
      localStorage.setItem('soundvault_token', data.access_token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name || 'Melomaniac'}!`);
      setActiveTab('search');
      fetchLibrary(data.access_token);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('soundvault_token');
    toast.info('Logged out successfully');
  };

  const fetchLibrary = async (t = token) => {
    if (!t) return;
    try {
      const data = await musicAPI.getLibrary(t);
      setLibrary(data);
    } catch (e) {
      console.error('Failed to fetch library', e);
    }
  };

  const fetchAnalytics = async (t = token) => {
    if (!t) return;
    try {
      const data = await musicAPI.getAnalytics(t);
      setAnalytics(data);
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      const results = await musicAPI.searchiTunes(searchTerm, searchEntity, 30);
      setSearchResults(results);
    } catch (err) {
      toast.error('Search failed from iTunes API');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (token && activeTab === 'search') {
      handleSearch();
    }
  }, [token, activeTab]);

  const addToLibrary = async (item) => {
    try {
      const payload = {
        track_name: item.track_name || item.collection_name || 'Unknown Track',
        artist_name: item.artist_name || 'Unknown Artist',
        collection_name: item.collection_name || 'Single',
        genre: item.genre || 'Pop',
        release_date: item.release_date || new Date().toISOString(),
        artwork_url: item.artwork_url || '',
        preview_url: item.preview_url || '',
        mood: item.mood || 'Energetic',
        rating: 5,
        notes: 'Added from iTunes search catalog'
      };
      await musicAPI.addLibraryItem(token, payload);
      toast.success(`Saved "${payload.track_name}" to your library!`);
      fetchLibrary();
      fetchAnalytics();
    } catch (err) {
      toast.error('Failed to save item to library');
    }
  };

  const deleteFromLibrary = async (id) => {
    try {
      await musicAPI.deleteLibraryItem(token, id);
      toast.success('Removed item from library');
      fetchLibrary();
      fetchAnalytics();
    } catch (e) {
      toast.error('Failed to remove item');
    }
  };

  const runAIQuery = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await musicAPI.getAIInsights(token, aiPrompt);
      setAiResponse(res);
      toast.success('AI Insights generated successfully!');
    } catch (err) {
      toast.error('Failed to generate AI insights');
    } finally {
      setAiLoading(false);
    }
  };

  // If not logged in, render gorgeous auth screen
  if (!token) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
        {/* Background glow ornaments */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#131b2e]/80 backdrop-blur-xl border border-[#2a3959] p-8 rounded-2xl shadow-2xl relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Disc className="w-7 h-7 text-white animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">SoundVault OS</h1>
              <p className="text-xs text-slate-400">Music Catalog Insights & AI Analytics</p>
            </div>
          </div>

          <div className="flex bg-[#0b0f19] p-1 rounded-xl mb-6 border border-[#2a3959]">
            <button 
              data-testid="auth-mode-login"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${authMode === 'login' ? 'bg-sky-500 text-slate-950 font-semibold shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button 
              data-testid="auth-mode-register"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${authMode === 'register' ? 'bg-sky-500 text-slate-950 font-semibold shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Your Name</label>
                <input 
                  data-testid="auth-name-input"
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#2a3959] rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
              <input 
                data-testid="auth-email-input"
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#0b0f19] border border-[#2a3959] rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
              <input 
                data-testid="auth-password-input"
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#0b0f19] border border-[#2a3959] rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <button 
              data-testid="auth-submit-btn"
              type="submit" 
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-slate-950 font-semibold py-3 rounded-xl shadow-lg shadow-sky-500/20 hover:opacity-95 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              <span>{authMode === 'login' ? 'Launch SoundVault' : 'Register & Launch'}</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#2a3959] text-center">
            <p className="text-xs text-slate-400">
              Demo Account pre-configured with 10 popular tracks & albums across genres.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredLibrary = library.filter(item => {
    const matchesGenre = libFilterGenre === 'All' || item.genre.toLowerCase() === libFilterGenre.toLowerCase();
    const matchesSearch = item.track_name.toLowerCase().includes(libSearch.toLowerCase()) || 
                          item.artist_name.toLowerCase().includes(libSearch.toLowerCase()) ||
                          item.collection_name.toLowerCase().includes(libSearch.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const genresList = ['All', ...new Set(library.map(i => i.genre))];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-16 border-b border-[#2a3959] bg-[#131b2e]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20">
            <Disc className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <h2 className="font-bold text-base tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">SoundVault OS</h2>
            <p className="text-[10px] text-slate-400">iTunes Insights & AI Library</p>
          </div>
        </div>

        <nav className="flex items-center space-x-1 md:space-x-2 bg-[#0b0f19] p-1 rounded-xl border border-[#2a3959]">
          <button 
            data-testid="nav-search-tab"
            onClick={() => setActiveTab('search')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'search' ? 'bg-sky-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">iTunes Search</span>
          </button>
          <button 
            data-testid="nav-library-tab"
            onClick={() => setActiveTab('library')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'library' ? 'bg-sky-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            <Headphones className="w-4 h-4" />
            <span className="hidden sm:inline">My Library</span>
            <span className="bg-slate-800 text-sky-400 px-1.5 py-0.5 rounded-full text-[10px]">{library.length}</span>
          </button>
          <button 
            data-testid="nav-analytics-tab"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'analytics' ? 'bg-sky-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </button>
          <button 
            data-testid="nav-ai-tab"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'ai' ? 'bg-sky-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>
        </nav>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-slate-200">{user?.name || 'Melomaniac'}</p>
            <p className="text-[10px] text-sky-400">Pro Collector</p>
          </div>
          <button 
            data-testid="logout-btn"
            onClick={logout}
            className="p-2 rounded-xl bg-[#1a243f] border border-[#2a3959] text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        
        {/* TAB 1: ITUNES SEARCH */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-[#131b2e] border border-[#2a3959] rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center space-x-2">
                    <Search className="w-5 h-5 text-sky-400" />
                    <span>iTunes Catalog Search</span>
                  </h3>
                  <p className="text-xs text-slate-400">Search over 100M+ songs, albums, and artists in real-time</p>
                </div>
              </div>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input 
                    data-testid="itunes-search-input"
                    type="text" 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search artist, song, album (e.g. Daft Punk, Hans Zimmer)..." 
                    className="w-full bg-[#0b0f19] border border-[#2a3959] rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <select 
                  data-testid="itunes-entity-select"
                  value={searchEntity} 
                  onChange={e => setSearchEntity(e.target.value)}
                  className="bg-[#0b0f19] border border-[#2a3959] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="song">Songs</option>
                  <option value="album">Albums</option>
                  <option value="musicArtist">Artists</option>
                </select>
                <button 
                  data-testid="itunes-search-submit-btn"
                  type="submit" 
                  disabled={searching}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-6 py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/20"
                >
                  {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Search</span>
                </button>
              </form>
            </div>

            {searching ? (
              <div className="py-20 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-sky-400 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Querying iTunes Public API...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((item, idx) => (
                  <div key={idx} data-testid={`search-item-${idx}`} className="bg-[#131b2e] border border-[#2a3959] rounded-2xl p-4 flex flex-col justify-between hover:border-sky-500/50 transition-all group shadow-lg">
                    <div>
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-[#0b0f19]">
                        <img 
                          src={item.artwork_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80'} 
                          alt={item.track_name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {item.preview_url && (
                          <button 
                            onClick={() => {
                              if (currentTrack === item.preview_url && isPlaying) {
                                setIsPlaying(false);
                              } else {
                                setCurrentTrack(item.preview_url);
                                setIsPlaying(true);
                              }
                            }}
                            className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                          >
                            {currentTrack === item.preview_url && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                          </button>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-100 truncate mb-1">{item.track_name}</h4>
                      <p className="text-xs text-sky-400 truncate mb-1">{item.artist_name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{item.collection_name}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#2a3959] flex items-center justify-between">
                      <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2.5 py-1 rounded-full font-medium">{item.genre || 'Pop'}</span>
                      <button 
                        data-testid={`save-to-library-btn-${idx}`}
                        onClick={() => addToLibrary(item)}
                        className="bg-[#1a243f] hover:bg-sky-500 hover:text-slate-950 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 border border-[#2a3959]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PERSONAL LIBRARY */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            <div className="bg-[#131b2e] border border-[#2a3959] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold flex items-center space-x-2">
                  <Headphones className="w-5 h-5 text-sky-400" />
                  <span>Personal Music Library</span>
                </h3>
                <p className="text-xs text-slate-400">Manage your saved tracks, albums, ratings, and custom mood tags</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <input 
                  data-testid="library-search-input"
                  type="text" 
                  value={libSearch} 
                  onChange={e => setLibSearch(e.target.value)}
                  placeholder="Filter library..." 
                  className="bg-[#0b0f19] border border-[#2a3959] rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <select 
                  data-testid="library-genre-filter"
                  value={libFilterGenre} 
                  onChange={e => setLibFilterGenre(e.target.value)}
                  className="bg-[#0b0f19] border border-[#2a3959] rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {genresList.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {filteredLibrary.length === 0 ? (
              <div className="bg-[#131b2e] border border-[#2a3959] rounded-2xl p-16 text-center">
                <Music className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-300">No tracks found in your library</h4>
                <p className="text-xs text-slate-500 mt-1">Search the iTunes catalog and save items to build your collection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredLibrary.map((item) => (
                  <div key={item.id} data-testid={`library-card-${item.id}`} className="bg-[#131b2e] border border-[#2a3959] rounded-2xl p-4 flex flex-col justify-between hover:border-sky-500/50 transition-all shadow-lg">
                    <div>
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-[#0b0f19]">
                        <img 
                          src={item.artwork_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80'} 
                          alt={item.track_name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-amber-400 font-bold flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{item.rating || 5}</span>
                        </div>
                      </div>
                      <h4 className="font-bold text-sm text-slate-100 truncate mb-1">{item.track_name}</h4>
                      <p className="text-xs text-sky-400 truncate mb-1">{item.artist_name}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                        <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full">{item.genre}</span>
                        <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full">{item.mood}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#2a3959] flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">{new Date(item.release_date).getFullYear() || '2024'}</span>
                      <button 
                        data-testid={`delete-lib-item-${item.id}`}
                        onClick={() => deleteFromLibrary(item.id)}
                        className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all"
                        title="Remove from Library"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-[#131b2e] border border-[#2a3959] rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-sky-400" />
                <span>Catalog Analytics & Insights Dashboard</span>
              </h3>
              <p className="text-xs text-slate-400">Visualizing genre distribution, mood profiles, release decades, and library metrics</p>
            </div>

            {analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart 1: Genre Distribution (Bar Chart) */}
                <div className="bg-[#131b2e] border border-[#2a3959] rounded-2xl p-6 shadow-xl">
                  <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
                    <span>Genre Breakdown</span>
                    <TrendingUp className="w-4 h-4 text-sky-400" />
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.genre_breakdown}>
                        <XAxis dataKey="genre" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#131b2e', borderColor: '#2a3959', borderRadius: '12px' }} />
                        <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Mood Distribution (Pie Chart) */}
                <div className="bg-[#131b2e] border border-[#2a3959] rounded-2xl p-6 shadow-xl">
                  <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
                    <span>Mood Classification</span>
                    <Sparkles className="w-4 h-4 text-rose-400" />
                  </h4>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={analytics.mood_breakdown} 
                          dataKey="count" 
                          nameKey="mood" 
                          cx="50%" 
                          cy="50%" 
                          outerRadius={80} 
                          label
                        >
                          {analytics.mood_breakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#38bdf8', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#131b2e', borderColor: '#2a3959', borderRadius: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 3: Release Year Timeline (Area Chart) */}
                <div className="bg-[#131b2e] border border-[#2a3959] rounded-2xl p-6 shadow-xl">
                  <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
                    <span>Release Years Timeline</span>
                    <Disc className="w-4 h-4 text-emerald-400" />
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.year_breakdown}>
                        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#131b2e', borderColor: '#2a3959', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="count" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 4: Rating Distribution (Radar Chart) */}
                <div className="bg-[#131b2e] border border-[#2a3959] rounded-2xl p-6 shadow-xl">
                  <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
                    <span>Library Rating Profile</span>
                    <Star className="w-4 h-4 text-amber-400" />
                  </h4>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius={80} data={analytics.rating_breakdown}>
                        <PolarGrid stroke="#2a3959" />
                        <PolarAngleAxis dataKey="rating" stroke="#94a3b8" fontSize={11} />
                        <PolarRadiusAxis stroke="#94a3b8" />
                        <Radar name="Tracks" dataKey="count" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.5} />
                        <Tooltip contentStyle={{ backgroundColor: '#131b2e', borderColor: '#2a3959', borderRadius: '12px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-sky-400 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Loading Analytics...</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AI ASSISTANT & INSIGHTS */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-[#131b2e] border border-[#2a3959] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">AI Music Recommendations & Mood Classification</h3>
                  <p className="text-xs text-slate-400">Powered by advanced LLM intelligence analyzing your personal music catalog</p>
                </div>
              </div>

              <form onSubmit={runAIQuery} className="mt-6 flex gap-3">
                <input 
                  data-testid="ai-prompt-input"
                  type="text" 
                  value={aiPrompt} 
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Ask for recommendations, mood playlists, or catalog analysis..." 
                  className="flex-1 bg-[#0b0f19] border border-[#2a3959] rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <button 
                  data-testid="ai-submit-btn"
                  type="submit" 
                  disabled={aiLoading}
                  className="bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-semibold px-6 py-3 rounded-xl transition-all flex items-center space-x-2 shadow-lg shadow-amber-500/20 hover:opacity-95"
                >
                  {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Generate Insights</span>
                </button>
              </form>
            </div>

            {aiLoading && (
              <div className="bg-[#131b2e] border border-[#2a3959] rounded-2xl p-16 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
                <p className="text-sm text-slate-400">AI is analyzing your library and synthesizing recommendations...</p>
              </div>
            )}

            {aiResponse && !aiLoading && (
              <div className="bg-[#131b2e] border border-[#2a3959] rounded-2xl p-8 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-[#2a3959] pb-4">
                  <h4 className="text-base font-bold text-amber-400 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>AI Analysis Results</span>
                  </h4>
                  <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full font-medium">Model: Claude / GPT Synthesis</span>
                </div>

                <div className="prose prose-invert max-w-none text-slate-200 text-sm whitespace-pre-line leading-relaxed">
                  {aiResponse.insight}
                </div>

                {aiResponse.recommendations && aiResponse.recommendations.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-[#2a3959]">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Recommended Additions</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {aiResponse.recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-[#0b0f19] border border-[#2a3959] rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm text-slate-100">{rec.track_name}</p>
                            <p className="text-xs text-sky-400">{rec.artist_name}</p>
                            <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full mt-1 inline-block">{rec.genre}</span>
                          </div>
                          <button 
                            onClick={() => addToLibrary(rec)}
                            className="w-8 h-8 rounded-lg bg-sky-500 text-slate-950 flex items-center justify-center shadow hover:scale-105 transition-transform"
                            title="Add to Library"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Audio Preview Sticky Bar */}
      {currentTrack && (
        <div className="bg-[#131b2e] border-t border-[#2a3959] px-6 py-3 flex items-center justify-between sticky bottom-0 z-50 shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">iTunes Audio Preview</p>
              <p className="text-[10px] text-slate-400 truncate max-w-xs">{currentTrack}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <audio 
              src={currentTrack} 
              controls 
              autoPlay={isPlaying}
              className="h-8 rounded-lg filter invert hue-rotate-180"
            />
            <button 
              onClick={() => { setCurrentTrack(null); setIsPlaying(false); }}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
