// hooks/useDownloadBackup.js
import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const useDownloadBackup = () => {
  const [loading, setLoading] = useState(false);

  const downloadBackup = async () => {
    try {
      setLoading(true);
      const response = await api.get('/backup', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Obtener la fecha actual en formato AAAA-MM-DD
     const currentDate = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `database_backup_${currentDate}.sqlite`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Backup descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el backup');
    } finally {
      setLoading(false);
    }
  };

  return { downloadBackup, loading };
};

export { useDownloadBackup };