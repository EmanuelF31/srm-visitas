import { Filesystem, Directory } from '@capacitor/filesystem';

export const requestPermissions = async () => {
  try {
    // Verificar permissões de escrita
    const permissions = await Filesystem.checkPermissions();
    
    if (permissions.publicStorage !== 'granted') {
      const request = await Filesystem.requestPermissions();
      return request.publicStorage === 'granted';
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissões:', error);
    return false;
  }
};

export const ensurePermissions = async () => {
  const hasPermission = await requestPermissions();
  
  if (!hasPermission) {
    alert('O app precisa de permissões para salvar arquivos. Por favor, ative nas configurações do dispositivo.');
    return false;
  }
  
  return true;
};