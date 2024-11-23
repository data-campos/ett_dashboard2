import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GrupoEmpresarial } from './GrupoEmpresarial';

@Entity('funcionarios_sync')
export class FuncionariosSync {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  CODCOLIGADA!: number;

  @Column()
  DESCRICAO_SECAO!: string;

  @ManyToOne(() => GrupoEmpresarial, { nullable: true })
  @JoinColumn({ name: 'grupo_empresarial_id' })
  grupo_empresarial?: GrupoEmpresarial;
}
