// src/data-source.ts

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { VerificationCode } from './models/VerificationCode';
import { Empresa } from './models/Empresa';
import { Usuario } from './models/Usuario';
import { PermissaoDashboard } from './models/PermissaoDashboard';
import { GrupoEmpresarial } from './models/GrupoEmpresarial';
import { ControleAcessoParceiroGrupo } from './models/ControleAcessoParceiroGrupo';
import { Parceiro } from './models/Parceiro';

export const AppDataSource = new DataSource({
  name: 'default', // Nome da conexão como "default"
  type: 'mysql',
 // host: 'localhost',
  //port: 3308,
  host: '10.0.0.117',
  port: 3306,
  username: 'dtc_saga',
  password: 'Data179856!@#',
  database: 'db_st_ettfirst',
  entities: [
    VerificationCode,
    Empresa,
    Usuario,
    PermissaoDashboard,
    GrupoEmpresarial,
    ControleAcessoParceiroGrupo,
    Parceiro,
  ],
  synchronize: true,
});
