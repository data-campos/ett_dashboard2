import { Request, Response } from 'express';
import sql from '../config/sqlServerConfig';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { AppDataSource } from '../data-source'; // Importar o DataSource configurado
import { ControleAcessoParceiroGrupo } from '../models/ControleAcessoParceiroGrupo';

export const getDashboardDataByGroup = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { grupo_empresarial_id, super_usuario } = req.user || {};

  console.log("Dados do usuário no endpoint:");
  console.log("Grupo Empresarial ID:", grupo_empresarial_id);
  console.log("Super Usuário:", super_usuario);

  if (!super_usuario && !grupo_empresarial_id) {
    res.status(403).json({ message: 'Acesso negado. Grupo empresarial não identificado.' });
    return;
  }

  try {
    let whereClause = '';

    if (!super_usuario) {
      // Buscar os nomes dos parceiros associados ao grupo empresarial
      const parceiros = await AppDataSource.getRepository(ControleAcessoParceiroGrupo)
        .createQueryBuilder('grupo')
        .leftJoinAndSelect('grupo.parceiro', 'parceiro')
        .where('grupo.grupo_empresarial_id = :grupoEmpresarialId', { grupoEmpresarialId: grupo_empresarial_id })
        .andWhere('grupo.status_acesso = 1')
        .select(['parceiro.nome_parceiro'])
        .getMany();

      const partnerNames = parceiros.map((parceiro) => parceiro.parceiro.nome_parceiro);

      if (partnerNames.length === 0) {
        res.status(404).json({ message: 'Nenhuma empresa associada ao grupo empresarial.' });
        return;
      }

      // Montar a cláusula WHERE para filtrar pelos nomes dos parceiros
      whereClause = partnerNames.map((name) => `DESCRICAO_SECAO LIKE '%${name}%'`).join(' OR ');
    } else {
      whereClause = '1 = 1'; // Super usuários veem todos os dados
    }

    console.log("Cláusula WHERE gerada:", whereClause);

    // Query para buscar os dados do dashboard
    const query = `
      SELECT 
        CODCOLIGADA,
        COUNT(*) AS totalFuncionarios,
        AVG(VALOR) AS mediaSalario,
        SUM(CASE WHEN SEXO = 'M' THEN 1 ELSE 0 END) AS totalMasculino,
        SUM(CASE WHEN SEXO = 'F' THEN 1 ELSE 0 END) AS totalFeminino
      FROM ZPWPortalCliente
      WHERE ${whereClause}
      GROUP BY CODCOLIGADA
    `;

    const result = await sql.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Erro ao buscar dados filtrados por grupo empresarial:', error);
    res.status(500).json({ message: 'Erro ao buscar dados do dashboard por grupo empresarial' });
  }
};

export const getDashboardData = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { coligadaId } = req.params;
  const {
    sexo,
    nomeFuncionario,
    dataAdmissaoInicio,
    dataAdmissaoFim,
    valorMin,
    valorMax,
    mesAno,
    codigoSituacao,
  } = req.query as {
    sexo?: string;
    nomeFuncionario?: string;
    dataAdmissaoInicio?: string;
    dataAdmissaoFim?: string;
    valorMin?: string;
    valorMax?: string;
    mesAno?: string;
    codigoSituacao?: string;
  };

  const grupoEmpresarialId = req.user?.grupo_empresarial_id;

  if (!grupoEmpresarialId && !req.user?.super_usuario) {
    res.status(403).json({ message: 'Acesso negado: Grupo empresarial não identificado.' });
    return;
  }

  let query = `
    WITH FuncionarioUnico AS (
      SELECT 
        CODCOLIGADA,
        CHAPA,
        NOME_FUNCIONARIO,
        SEXO,
        CPF,
        CODFUNCAO,
        NOME_FUNCAO,
        DATAADMISSAO,
        VALOR,
        MesAno,
        CODIGOSITACAO,
        ROW_NUMBER() OVER (PARTITION BY CHAPA ORDER BY DATAADMISSAO DESC) AS RowNum
      FROM dbo.ZPWPortalCliente
    )
    SELECT 
      CODCOLIGADA,
      COUNT(*) AS totalFuncionarios,
      AVG(CASE 
          WHEN ${mesAno && mesAno !== 'all' ? `MesAno = '${mesAno.split('-').reverse().join('/')}'` : '1 = 1'} THEN VALOR
          ELSE NULL 
      END) AS mediaSalario,
      SUM(CASE WHEN SEXO = 'M' THEN 1 ELSE 0 END) AS totalMasculino,
      SUM(CASE WHEN SEXO = 'F' THEN 1 ELSE 0 END) AS totalFeminino,
      (
        SELECT 
          CODFUNCAO,
          NOME_FUNCAO,
          COUNT(*) AS totalPorFuncao
        FROM FuncionarioUnico
        WHERE RowNum = 1
          ${codigoSituacao ? `AND CODIGOSITACAO = '${codigoSituacao}'` : ''}
          ${mesAno && mesAno !== 'all' ? `AND MesAno = '${mesAno.split('-').reverse().join('/')}'` : ''}
          ${nomeFuncionario ? `AND NOME_FUNCIONARIO LIKE '%${nomeFuncionario}%'` : ''}
          ${valorMin ? `AND VALOR >= ${parseFloat(valorMin)}` : ''}
          ${valorMax ? `AND VALOR <= ${parseFloat(valorMax)}` : ''}
        GROUP BY CODFUNCAO, NOME_FUNCAO
        FOR JSON PATH
      ) AS funcionariosPorFuncao
    FROM FuncionarioUnico
    WHERE RowNum = 1
  `;

  const whereConditions: string[] = [];

  if (coligadaId) {
    whereConditions.push(`CODCOLIGADA = ${coligadaId}`);
  }
  if (sexo) {
    whereConditions.push(`SEXO = '${sexo}'`);
  }
  if (nomeFuncionario) {
    whereConditions.push(`NOME_FUNCIONARIO LIKE '%${nomeFuncionario}%'`);
  }
  if (dataAdmissaoInicio) {
    whereConditions.push(`DATAADMISSAO >= '${dataAdmissaoInicio}'`);
  }
  if (dataAdmissaoFim) {
    whereConditions.push(`DATAADMISSAO <= '${dataAdmissaoFim}'`);
  }
  if (valorMin) {
    whereConditions.push(`VALOR >= ${parseFloat(valorMin)}`);
  }
  if (valorMax) {
    whereConditions.push(`VALOR <= ${parseFloat(valorMax)}`);
  }
  if (codigoSituacao) {
    whereConditions.push(`CODIGOSITACAO = '${codigoSituacao}'`);
  }

  if (mesAno && mesAno !== 'all') {
    whereConditions.push(`MesAno = '${mesAno.split('-').reverse().join('/')}'`);
  }

  if (whereConditions.length > 0) {
    query += ` AND ${whereConditions.join(' AND ')}`;
  }

  if (!req.user?.super_usuario) {
    query += `
      AND CODCOLIGADA IN (
        SELECT coligada_id
        FROM controle_acesso_parceiro_grupo
        WHERE grupo_empresarial_id = ${grupoEmpresarialId}
      )
    `;
  }

  query += ' GROUP BY CODCOLIGADA';

  try {
    const result = await sql.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ message: 'Erro ao buscar dados do dashboard' });
  }
};
