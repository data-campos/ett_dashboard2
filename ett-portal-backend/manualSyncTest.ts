/*import { sincronizarDados, associarGrupos } from './src/services/syncService';
import { AppDataSource } from './src/data-source';
import { connectToSqlServer } from './src/config/sqlServerConfig';

(async () => {
  try {
    console.log('Iniciando conexões...');
    // Inicializa o MySQL e o SQL Server
    await AppDataSource.initialize();
    console.log('Conexão com o MySQL estabelecida.');

    await connectToSqlServer();
    console.log('Conexão com o SQL Server estabelecida.');

    console.log('Iniciando sincronização manual...');
    await sincronizarDados();
    console.log('Sincronização concluída.');

    console.log('Iniciando associação de grupos...');
    await associarGrupos();
    console.log('Associação de grupos concluída.');
  } catch (error) {
    console.error('Erro durante o processo:', error);
  } finally {
    // Fecha as conexões
    await AppDataSource.destroy();
    console.log('Conexão com o MySQL encerrada.');
  }
})();
*/