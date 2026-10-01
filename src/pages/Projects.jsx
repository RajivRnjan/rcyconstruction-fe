import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import AddProjectModal from '../components/AddProjectModal';

export default function Projects() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedProject, setSelectedProject] = useState(null);
  const [masterSheets, setMasterSheets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMasterSheets = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/master-sheets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMasterSheets(data);
      }
    } catch (error) {
      console.error('Failed to fetch master sheets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterSheets();
  }, []);

  const handleSuccess = () => {
    fetchMasterSheets();
  };

  const handleOpenModal = (mode, project = null) => {
    setModalMode(mode);
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? All BOQ items will also be deleted.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/master-sheets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        fetchMasterSheets();
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">PROJECTS</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Overview of all projects</p>
        </div>
        <button 
          onClick={() => navigate('/add-project')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-950/50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">NAME OF PROJECT</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-center">Date Added</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-center sticky right-0 bg-gray-50 dark:bg-gray-950/50">Actions</th>
              </tr>
</thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 transition-colors duration-300">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500">Loading data...</td>
                </tr>
              ) : masterSheets.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No projects found. Click "Add Project" to create one.</td>
                </tr>
              ) : (
                masterSheets.map((sheet) => (
                  <tr key={sheet.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {sheet.project_name}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {new Date(sheet.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4 sticky right-0 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/30">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleOpenModal('edit', sheet)} className="text-gray-400 hover:text-amber-600 dark:hover:text-yellow-400 transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(sheet.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
</tbody>
          </table>
        </div>
      </div>

      <AddProjectModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={handleSuccess}
        initialData={selectedProject}
        mode={modalMode}
      />
    </div>
  );
}
