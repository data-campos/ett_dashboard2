import { Request, Response } from 'express';
import sql from '../config/sqlServerConfig';

export const getFuncionarios = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1; // Página atual, padrão 1
  const limit = parseInt(req.query.limit as string, 10) || 10; // Limite por página, padrão 10

  const offset = (page - 1) * limit;

  const { sexo, mesAno, codigoSituacao, nomeFuncionario, valorMin, valorMax } = req.query as {
    sexo?: string;
    mesAno?: string;
    codigoSituacao?: string;
    nomeFuncionario?: string;
    valorMin?: string;
    valorMax?: string;
  };

  const whereConditions: string[] = ['RowNum = 1'];

  if (sexo) {
    whereConditions.push(`SEXO = '${sexo}'`);
  }
  if (mesAno && mesAno !== 'all') {
    whereConditions.push(`MesAno = '${mesAno.split('-').reverse().join('/')}'`);
  }
  if (codigoSituacao) {
    whereConditions.push(`CODIGOSITACAO = '${codigoSituacao}'`);
  }
  if (nomeFuncionario) {
    whereConditions.push(`NOME_FUNCIONARIO LIKE '%${nomeFuncionario}%'`);
  }
  if (valorMin) {
    whereConditions.push(`VALOR >= ${parseFloat(valorMin)}`);
  }
  if (valorMax) {
    whereConditions.push(`VALOR <= ${parseFloat(valorMax)}`);
  }

  const countQuery = `
    WITH FuncionarioUnico AS (
      SELECT 
        CHAPA,
        NOME_FUNCIONARIO,
        SEXO,
        MesAno,
        CODIGOSITACAO,
        VALOR,
        ROW_NUMBER() OVER (PARTITION BY CHAPA ORDER BY DATAADMISSAO DESC) AS RowNum
      FROM dbo.ZPWPortalCliente
    )
    SELECT COUNT(*) AS total
    FROM FuncionarioUnico
    WHERE ${whereConditions.join(' AND ')};
  `;

  const dataQuery = `
    WITH FuncionarioUnico AS (
      SELECT 
        CHAPA,
        NOME_FUNCIONARIO,
        CPF,
        SEXO,
        DATAADMISSAO,
        CODFUNCAO,
        NOME_FUNCAO,
        MesAno,
        CODIGOSITACAO,
        VALOR,
        ROW_NUMBER() OVER (PARTITION BY CHAPA ORDER BY DATAADMISSAO DESC) AS RowNum
      FROM dbo.ZPWPortalCliente
    )
    SELECT 
      CHAPA,
      NOME_FUNCIONARIO,
      CPF,
      SEXO,
      DATAADMISSAO,
      CODFUNCAO,
      NOME_FUNCAO,
      VALOR
    FROM FuncionarioUnico
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY NOME_FUNCIONARIO
    OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
  `;

  try {
    const countResult = await sql.query(countQuery);
    const total = countResult.recordset[0]?.total || 0;

    const dataResult = await sql.query(dataQuery);

    res.status(200).json({
      page,
      limit,
      total,
      data: dataResult.recordset,
    });
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    res.status(500).json({ message: 'Erro ao buscar funcionários' });
  }
};
