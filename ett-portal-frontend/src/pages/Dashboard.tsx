import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DashboardProps {
  coligadaId?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ coligadaId }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [filters, setFilters] = useState({
    sexo: "",
    nomeFuncionario: "",
    dataAdmissaoInicio: "",
    dataAdmissaoFim: "",
    valorMin: "",
    valorMax: "",
    mesAno: "all",
    codigoSituacao: "",
  });

  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  const [isSuperUser, setIsSuperUser] = useState(false);
  const [grupoEmpresarialId, setGrupoEmpresarialId] = useState<number | null>(null);

  useEffect(() => {
    // Simula carregar informações do usuário
    const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
    setIsSuperUser(userInfo?.superUsuario || false);
    setGrupoEmpresarialId(userInfo?.grupoEmpresarialId || null);
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    setIsDashboardLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/dashboard${coligadaId ? `/${coligadaId}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            sexo: filters.sexo || undefined,
            nomeFuncionario: filters.nomeFuncionario || undefined,
            dataAdmissaoInicio: filters.dataAdmissaoInicio || undefined,
            dataAdmissaoFim: filters.dataAdmissaoFim || undefined,
            valorMin: filters.valorMin || undefined,
            valorMax: filters.valorMax || undefined,
            mesAno: filters.mesAno || undefined,
            codigoSituacao: filters.codigoSituacao || undefined,
            grupoEmpresarialId: isSuperUser ? undefined : grupoEmpresarialId,
          },
        }
      );
      setDashboardData(response.data);
    } catch (error) {
      console.error("Erro ao obter dados do dashboard", error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        alert("Acesso negado. Faça login novamente.");
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    } finally {
      setIsDashboardLoading(false);
    }
  };

  const fetchFuncionarios = async (page: number) => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/funcionarios`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit: 10,
          sexo: filters.sexo || undefined,
          mesAno: filters.mesAno || undefined,
          codigoSituacao: filters.codigoSituacao || undefined,
          nomeFuncionario: filters.nomeFuncionario || undefined,
          grupoEmpresarialId: isSuperUser ? undefined : grupoEmpresarialId,
        },
      });
      setFuncionarios(response.data.data);
      setTotalPages(Math.ceil(response.data.total / response.data.limit));
    } catch (error) {
      console.error("Erro ao buscar funcionários", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [coligadaId, filters]);

  useEffect(() => {
    fetchFuncionarios(currentPage);
  }, [currentPage, filters]);

  if (isDashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div
            style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #3498db",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              animation: "spin 1s linear infinite",
            }}
            className="mb-4"
          ></div>
          <style>{`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
          <p className="text-xl font-semibold text-gray-700">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  const formatNumber = (value: number) => new Intl.NumberFormat("pt-BR").format(value);
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 14,
            family: "Arial",
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#ffffff",
        borderColor: "#ccc",
        borderWidth: 1,
        titleColor: "#333",
        bodyColor: "#333",
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12, family: "Arial" } },
      },
      y: {
        ticks: { beginAtZero: true, font: { size: 12, family: "Arial" } },
      },
    },
  };

  const coligadas = dashboardData.map((item: any) => {
    return item.CODCOLIGADA === 1 ? "ETT" : item.CODCOLIGADA === 6 ? "SHIFT" : `Coligada ${item.CODCOLIGADA}`;
  });

  const barDataFuncionarios = {
    labels: coligadas,
    datasets: [
      {
        label: "Masculino",
        data: dashboardData.map((item: any) => item.totalMasculino),
        backgroundColor: "#4B9CD3",
      },
      {
        label: "Feminino",
        data: dashboardData.map((item: any) => item.totalFeminino),
        backgroundColor: "#E87653",
      },
    ],
  };

  const barDataSalario = {
    labels: coligadas,
    datasets: [
      {
        label: "Média Salarial",
        data: dashboardData.map((item: any) => item.mediaSalario),
        backgroundColor: "#6AA84F",
      },
    ],
  };

  const funcionariosPorFuncao =
    dashboardData[0]?.funcionariosPorFuncao
      ? JSON.parse(dashboardData[0].funcionariosPorFuncao)
      : [];

  const barDataFuncoes = {
    labels: funcionariosPorFuncao.map((func: any) => func.NOME_FUNCAO),
    datasets: [
      {
        label: "Funcionários por Função",
        data: funcionariosPorFuncao.map((func: any) => func.totalPorFuncao),
        backgroundColor: "#FFD700",
      },
    ],
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };
  
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Corporativo</h1>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label>Sexo:</label>
            <select
              value={filters.sexo}
              onChange={(e) => handleFilterChange("sexo", e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="">Todos</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>

          <div>
            <label>Código Situação:</label>
            <select
              value={filters.codigoSituacao}
              onChange={(e) => handleFilterChange("codigoSituacao", e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="">Todos</option>
              <option value="ATIVO">Ativo</option>
              <option value="DEMITIDO">Demitido</option>
              <option value="LICENÇA MATER.">Licença Mater.</option>
              <option value="FÉRIAS">Férias</option>
              <option value="AF.AC.TRABALHO">Af. Acidente de Trabalho</option>
              <option value="AF.PREVIDÊNCIA">Af. Previdência</option>
            </select>
          </div>

          <div>
            <label>Mês/Ano:</label>
            <select
              value={filters.mesAno}
              onChange={(e) => handleFilterChange("mesAno", e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="all">Todos os meses</option>
              <option value="2024-01">Janeiro 2024</option>
              <option value="2024-02">Fevereiro 2024</option>
              <option value="2024-03">Março 2024</option>
              <option value="2024-04">Abril 2024</option>
              <option value="2024-05">Maio 2024</option>
              <option value="2024-06">Junho 2024</option>
              <option value="2024-07">Julho 2024</option>
              <option value="2024-08">Agosto 2024</option>
              <option value="2024-09">Setembro 2024</option>
              <option value="2024-10">Outubro 2024</option>
              <option value="2024-11">Novembro 2024</option>
              <option value="2024-12">Dezembro 2024</option>
            </select>
          </div>

          <div>
            <label>Nome do Funcionário:</label>
            <input
              type="text"
              value={filters.nomeFuncionario}
              onChange={(e) => handleFilterChange("nomeFuncionario", e.target.value)}
              placeholder="Digite o nome"
              className="border p-2 rounded w-full"
            />
          </div>
         {/* <div>
            <label>Data de Admissão (Início):</label>
            <input
              type="date"
              value={filters.dataAdmissaoInicio}
              onChange={(e) => handleFilterChange("dataAdmissaoInicio", e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label>Data de Admissão (Fim):</label>
            <input
              type="date"
              value={filters.dataAdmissaoFim}
              onChange={(e) => handleFilterChange("dataAdmissaoFim", e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div> */}
          <div>
            <label>Valor Mínimo:</label>
            <input
              type="number"
              value={filters.valorMin}
              onChange={(e) => handleFilterChange("valorMin", e.target.value)}
              placeholder="Digite o valor mínimo"
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label>Valor Máximo:</label>
            <input
              type="number"
              value={filters.valorMax}
              onChange={(e) => handleFilterChange("valorMax", e.target.value)}
              placeholder="Digite o valor máximo"
              className="border p-2 rounded w-full"
            />
          </div>
          {/*<div>
            <label>Mês/Ano:</label>
            <input
              type="month"
              value={filters.mesAno}
              onChange={(e) => handleFilterChange("mesAno", e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div> */}
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {dashboardData.map((item: any, index: number) => (
          <div
            key={index}
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              {item.CODCOLIGADA === 1 ? "ETT" : item.CODCOLIGADA === 6 ? "SHIFT" : `Coligada ${item.CODCOLIGADA}`}
            </h2>
            <p className="text-white text-lg mb-2">
              Total de Funcionários: <span className="font-bold">{formatNumber(item.totalFuncionarios)}</span>
            </p>
            <p className="text-white text-lg mb-2">
              Média Salarial: <span className="font-bold">{formatCurrency(item.mediaSalario)}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Funcionários por Gênero</h2>
          <div style={{ height: "300px" }}>
            <Bar data={barDataFuncionarios} options={barOptions} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Média Salarial</h2>
          <div style={{ height: "300px" }}>
            <Bar data={barDataSalario} options={barOptions} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Funcionários por Função</h2>
          <div style={{ height: "300px" }}>
            <Bar data={barDataFuncoes} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Lista de Funcionários */}
      <div className="bg-white p-4 rounded-lg shadow-lg mt-6">
        <h2 className="text-xl font-semibold mb-4">Lista de Funcionários</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">CHAPA</th>
              <th className="border border-gray-300 p-2">Nome</th>
              <th className="border border-gray-300 p-2">CPF</th>
              <th className="border border-gray-300 p-2">Sexo</th>
              <th className="border border-gray-300 p-2">Data de Admissão</th>
              <th className="border border-gray-300 p-2">Função</th>
            </tr>
          </thead>
          <tbody>
  {isLoading ? (
    <tr>
      <td colSpan={6} className="text-center py-4 text-blue-600 font-semibold">
        Carregando funcionários, por favor aguarde...
      </td>
    </tr>
  ) : (
    funcionarios.map((funcionario) => (
      <tr key={funcionario.CHAPA}>
        <td className="border border-gray-300 p-2">{funcionario.CHAPA}</td>
        <td className="border border-gray-300 p-2">{funcionario.NOME_FUNCIONARIO}</td>
        <td className="border border-gray-300 p-2">{funcionario.CPF}</td>
        <td className="border border-gray-300 p-2">{funcionario.SEXO}</td>
        <td className="border border-gray-300 p-2">{formatDate(funcionario.DATAADMISSAO)}</td>
        <td className="border border-gray-300 p-2">{funcionario.NOME_FUNCAO}</td>
      </tr>
    ))
  )}
</tbody>
        </table>

        {/* Paginação */}
        <div className="flex justify-center items-center mt-4">
  <button
    disabled={currentPage === 1} // Desabilita o botão "Anterior" na primeira página
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    className={`px-6 py-2 rounded-lg font-semibold transition duration-200 ${
      currentPage === 1
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-blue-500 text-white hover:bg-blue-600"
    }`}
  >
    Anterior
  </button>
  <span className="mx-4 text-lg font-medium text-gray-700">
    Página {currentPage} de {totalPages}
  </span>
  <button
    disabled={currentPage === totalPages || totalPages === 0} // Desabilita o botão "Próxima" na última página
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    className={`px-6 py-2 rounded-lg font-semibold transition duration-200 ${
      currentPage === totalPages || totalPages === 0
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-blue-500 text-white hover:bg-blue-600"
    }`}
  >
    Próxima
  </button>
</div>

      </div>
    </div>
  );
};

export default Dashboard;
