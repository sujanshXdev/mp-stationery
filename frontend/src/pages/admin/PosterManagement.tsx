import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUpload, FiTrash2, FiImage } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL, SERVER_BASE_URL } from '../../utils/apiConfig';
import toast from 'react-hot-toast';

const PosterManagement: React.FC = () => {
  const { user } = useAuth();
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current poster
  const fetchPoster = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/poster`, { withCredentials: true });
      if (response.data.success && response.data.poster) {
        setPosterUrl(response.data.poster.image);
      } else {
        setPosterUrl(null);
      }
    } catch (err) {
      console.error('Error fetching poster:', err);
      setPosterUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPoster();
  }, [fetchPoster]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PNG or JPEG image');
        setSelectedFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
    }
  };

  // Handle poster upload/update
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('poster', selectedFile);

      const response = await axios.post(`${API_BASE_URL}/poster`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (response.data.success) {
        setPosterUrl(response.data.poster.image);
        setSelectedFile(null);
        toast.success('Poster uploaded successfully');
      } else {
        throw new Error('Failed to upload poster');
      }
    } catch (err: any) {
      console.error('Error uploading poster:', err);
      toast.error(err.response?.data?.message || 'Failed to upload poster');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle poster deletion
  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete the current poster?');
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/poster`, { withCredentials: true });

      if (response.data.success) {
        setPosterUrl(null);
        toast.success('Poster deleted successfully');
      } else {
        throw new Error('Failed to delete poster');
      }
    } catch (err: any) {
      console.error('Error deleting poster:', err);
      toast.error(err.response?.data?.message || 'Failed to delete poster');
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (path: string) => {
    return `${SERVER_BASE_URL}/${path}`;
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Poster Management</h1>

      {/* Current Poster Preview */}
      {isLoading && !posterUrl ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : posterUrl ? (
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Current Poster</h2>
          <img
            src={getImageUrl(posterUrl)}
            alt="Current Poster"
            className="w-full max-h-[50vh] object-contain rounded-md border border-gray-200"
          />
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className={`mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FiTrash2 className="w-5 h-5" />
            Delete Poster
          </button>
        </div>
      ) : (
        <div className="mb-6 flex flex-col items-center justify-center h-64 bg-gray-100 rounded-md">
          <FiImage className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-gray-500">No poster uploaded</p>
        </div>
      )}

      {/* Upload Section */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-medium text-gray-700 mb-2">
          {posterUrl ? 'Update Poster' : 'Upload Poster'}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileChange}
            className="flex-1 border border-gray-300 rounded-lg p-2 text-gray-700"
            disabled={isLoading}
          />
          <button
            onClick={handleUpload}
            disabled={isLoading || !selectedFile}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              isLoading || !selectedFile ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FiUpload className="w-5 h-5" />
            {isLoading ? 'Uploading...' : posterUrl ? 'Update Poster' : 'Upload Poster'}
          </button>
        </div>
        {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
        {selectedFile && (
          <p className="mt-2 text-gray-600 text-sm">Selected: {selectedFile.name}</p>
        )}
      </div>
    </div>
  );
};

export default PosterManagement;