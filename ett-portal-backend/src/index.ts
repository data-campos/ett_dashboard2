// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import authRoutes from './routes/authRoutes';
import funcionarioRoutes from './routes/funcionarioRoutes';
import { connectToSqlServer } from './config/sqlServerConfig';
import dashboardRoutes from './routes/dashboardRoutes';
import partnerRoutes from './routes/partnerRoutes';
import grupoEmpresarialRoutes from './routes/grupoEmpresarialRoutes';
import usuariosRoutes from './routes/usuariosRoutes';
import { checkGroupAccess } from './middlewares/checkGroupAccess';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../ett-portal-frontend/build')));


app.use('/auth', authRoutes); // Define a rota para autenticação como "/auth"
app.use('/api', funcionarioRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', partnerRoutes);
app.use('/api', grupoEmpresarialRoutes);
app.use('/api', usuariosRoutes);
app.use(checkGroupAccess);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../ett-portal-frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;

// Conexão com MySQL e SQL Server
AppDataSource.initialize()
  .then(async () => {
    console.log('Conectado ao MySQL');
    await connectToSqlServer(); // Conecta ao SQL Server

    // Iniciar o servidor somente após as conexões serem inicializadas
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => console.log('Erro ao conectar ao MySQL:', error));
