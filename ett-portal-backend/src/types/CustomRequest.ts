// src/types/CustomRequest.ts
import { Request } from 'express';

export interface CustomRequest extends Request {
  params: {
    coligadaId?: string;
  };
  query: {
    sexo?: string;
    nomeFuncionario?: string;
    dataAdmissaoInicio?: string;
    dataAdmissaoFim?: string;
    valorMin?: string;
    valorMax?: string;
  };
}
