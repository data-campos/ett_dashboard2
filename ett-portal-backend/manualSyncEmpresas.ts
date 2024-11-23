/*import { sincronizarEmpresas } from './src/services/syncEmpresasService';
import { AppDataSource } from './src/data-source';
import { connectToSqlServer } from './src/config/sqlServerConfig';

(async () => {
  try {
    console.log('Inicializando conexões...');
    await AppDataSource.initialize(); // Conecta ao MySQL
    await connectToSqlServer(); // Conecta ao SQL Server

    console.log('Sincronizando empresas...');
    await sincronizarEmpresas();

    console.log('Sincronização concluída.');
  } catch (error) {
    console.error('Erro durante a sincronização manual:', error);
  } finally {
    await AppDataSource.destroy(); // Fecha a conexão com o MySQL
  }
})();*/
