// src/services/partnerService.ts

import { AppDataSource } from '../data-source';

export const getPartnerNamesByGroup = async (grupoEmpresarialId: number): Promise<string[]> => {
  try {
    const result = await AppDataSource.query(
      'SELECT nome_parceiro FROM controle_acesso_parceiros WHERE grupo_empresarial_id = ?',
      [grupoEmpresarialId]
    );
    return result.map((row: any) => row.nome_parceiro);
  } catch (error) {
    console.error('Erro ao buscar nomes de parceiros:', error);
    throw error;
  }
};
