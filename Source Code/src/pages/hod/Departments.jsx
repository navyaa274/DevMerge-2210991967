import apiClient from '../../services/api/apiClient';
import { useAuthStore } from '../../store/authStore';
import { ENDPOINTS } from '../../config/urls';

export default function HODDepartments() {
    const { user: authUser } = useAuthStore();
    const [departments, setDepartments] = useState([]);
    const [university, setUniversity] = useState(null);
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [formData, setFormData] = useState({ _id: '', name: '', code: '', description: '', hodId: '' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [univRes, deptRes, hodRes] = await Promise.all([
                apiClient.get(ENDPOINTS.UNIVERSITY.BASE),
                apiClient.get(ENDPOINTS.DEPARTMENTS.BASE),
                apiClient.get(ENDPOINTS.USERS.BY_ROLE('hod'))
            ]);

            setUniversity(univRes.data.data || univRes.data);
            setDepartments(deptRes.data.data || deptRes.data || []);
            setFaculties(hodRes.data.data || hodRes.data || []);
        } catch (err) {
            setError(err.formattedMessage || err.message);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (mode, dept = null) => {
        setModalMode(mode);
        if (mode === 'edit' && dept) {
            setFormData({
                _id: dept._id,
                name: dept.name,
                code: dept.code,
                description: dept.description || '',
                hodId: dept.hodId?._id || ''
            });
        } else {
            setFormData({ _id: '', name: '', code: '', description: '', hodId: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, universityId: university._id };

            if (modalMode === 'add') {
                await apiClient.post(ENDPOINTS.DEPARTMENTS.BASE, payload);
            } else {
                await apiClient.put(ENDPOINTS.DEPARTMENTS.BY_ID(formData._id), payload);
            }
            setIsModalOpen(false);
            fetchInitialData();
        } catch (err) {
            alert(err.formattedMessage || err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this department?')) return;
        try {
            await apiClient.delete(ENDPOINTS.DEPARTMENTS.BY_ID(id));
            fetchInitialData();
        } catch (err) {
            alert(err.formattedMessage || err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-dark-900">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Departments</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-3 flex items-center gap-2">
                        Academic Structure of {university?.name || 'System'}
                    </p>
                </div>
                <button onClick={() => openModal('add')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/30 transition-all hover:scale-105">
                    + Add Department
                </button>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-xl text-rose-700 font-bold text-xs uppercase tracking-widest">
                    {typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {departments.map((dept, idx) => (
                    <motion.div
                        key={dept._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-dark-700 hover:border-indigo-500 transition-all overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[5rem] -mr-8 -mt-8 group-hover:scale-110 transition-transform" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter">
                                    {dept.code}
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal('edit', dept)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">✏️</button>
                                    <button onClick={() => handleDelete(dept._id)} className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors">🗑️</button>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 leading-tight uppercase">{dept.name}</h3>
                            <p className="text-slate-500 text-xs font-medium mb-8 line-clamp-2">{dept.description || 'No description provided for this academic division.'}</p>
                            <div className="space-y-4 pt-6 border-t border-slate-50 dark:border-dark-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs">🎓</div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Head of Department</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{dept.hodId?.name || 'Unassigned'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {departments.length === 0 && (
                    <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                        <p className="font-black uppercase tracking-widest text-xs">No Departments Found</p>
                        <p className="text-[10px] mt-2 font-bold px-4 text-center">Foundation layer is empty. Please add your first department.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-dark-800 rounded-[3rem] p-12 max-w-xl w-full shadow-2xl border-t-[12px] border-indigo-600"
                        >
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">
                                {modalMode === 'add' ? 'Add Department' : 'Update Department'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Dept Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Computer Science"
                                            className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-indigo-500/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Unique Code</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            placeholder="e.g. CS"
                                            className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-indigo-500/10"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Assign HOD</label>
                                    <select
                                        value={formData.hodId}
                                        onChange={(e) => setFormData({ ...formData, hodId: e.target.value })}
                                        className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-indigo-500/10"
                                    >
                                        <option value="">Select HOD Candidate</option>
                                        {faculties.map(f => (
                                            <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief overview of the department's focus..."
                                        rows="3"
                                        className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-indigo-500/10 resize-none"
                                    />
                                </div>
                                <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition">
                                        Discard
                                    </button>
                                    <button type="submit" className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition">
                                        {modalMode === 'add' ? 'Create Department' : 'Commit Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
