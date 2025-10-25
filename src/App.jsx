import React, { useState, useEffect } from 'react';
import { BarChart3, MapPin, Users, Briefcase, UserCog, Plus, Edit2, Trash2, Save, X, Upload, Calendar, FileDown, Download, RotateCcw } from 'lucide-react';

const SRMVisitas = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [visitas, setVisitas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [semanaAtual, setSemanaAtual] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  
  // Form states
  const [clienteForm, setClienteForm] = useState({ codigo: '', descricao: '', temContrato: false });
  const [servicoForm, setServicoForm] = useState({ codigo: '', descricao: '' });
  const [funcionarioForm, setFuncionarioForm] = useState({ 
    nome: '', 
    tipo: 'tecnico', 
    percentual: 0, 
    salarioFixo: 0 
  });
  const [visitaForm, setVisitaForm] = useState({
    data: '',
    clienteId: '',
    servicoId: '',
    funcionarioId: '',
    valorLocomocao: '',
    valorServico: ''
  });

  // Load data and create backup on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const clientesData = await window.storage.get('clientes');
        const servicosData = await window.storage.get('servicos');
        const visitasData = await window.storage.get('visitas');
        const funcData = await window.storage.get('funcionarios');
        
        if (clientesData) setClientes(JSON.parse(clientesData.value));
        if (servicosData) setServicos(JSON.parse(servicosData.value));
        if (visitasData) setVisitas(JSON.parse(visitasData.value));
        if (funcData) setFuncionarios(JSON.parse(funcData.value));
      } catch (error) {
        console.log('Primeira vez carregando o app');
      }
    };
    loadData();
  }, []);

  // Auto backup every time data changes
  useEffect(() => {
    if (clientes.length > 0 || servicos.length > 0 || visitas.length > 0 || funcionarios.length > 0) {
      createAutoBackup();
    }
  }, [clientes, servicos, visitas, funcionarios]);

  const saveData = async (key, data) => {
    try {
      await window.storage.set(key, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  // Backup functions
  const createAutoBackup = () => {
    const backup = {
      version: '1.0',
      date: new Date().toISOString(),
      data: {
        clientes,
        servicos,
        visitas,
        funcionarios
      }
    };
    
    try {
      localStorage.setItem('srm_backup', JSON.stringify(backup));
    } catch (error) {
      console.error('Erro ao criar backup automático:', error);
    }
  };

  const downloadBackup = () => {
    const backup = {
      version: '1.0',
      date: new Date().toISOString(),
      data: {
        clientes,
        servicos,
        visitas,
        funcionarios
      }
    };

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `srm-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRestoreBackup = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result);
          if (backup.data) {
            setClientes(backup.data.clientes || []);
            setServicos(backup.data.servicos || []);
            setVisitas(backup.data.visitas || []);
            setFuncionarios(backup.data.funcionarios || []);
            
            saveData('clientes', backup.data.clientes || []);
            saveData('servicos', backup.data.servicos || []);
            saveData('visitas', backup.data.visitas || []);
            saveData('funcionarios', backup.data.funcionarios || []);
            
            alert('Backup restaurado com sucesso!');
          }
        } catch (error) {
          alert('Erro ao restaurar backup. Verifique o arquivo.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Generate PDF Report
  const generateReport = (funcionarioId) => {
    const func = funcionarios.find(f => f.id === funcionarioId);
    if (!func) return;

    const stats = calcularEstatisticas()[funcionarioId];
    const visitasFiltradas = getFilteredVisitas().filter(v => parseInt(v.funcionarioId) === funcionarioId);
    
    let report = `===========================================\n`;
    report += `         RELATÓRIO DE PAGAMENTO\n`;
    report += `         SRM VISITAS\n`;
    report += `===========================================\n\n`;
    report += `Funcionário: ${func.nome}\n`;
    report += `Tipo: ${func.tipo === 'tecnico' ? 'TÉCNICO' : 'GERENTE'}\n`;
    report += `Período: ${semanaAtual ? getCurrentWeekDates().monday.toLocaleDateString('pt-BR') + ' até ' + getCurrentWeekDates().sunday.toLocaleDateString('pt-BR') : 'Todas as visitas'}\n`;
    report += `Data do Relatório: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
    
    report += `-------------------------------------------\n`;
    report += `RESUMO FINANCEIRO\n`;
    report += `-------------------------------------------\n`;
    report += `Total de Visitas: ${stats.totalVisitas}\n`;
    report += `Valor Total de Serviços: R$ ${stats.totalServicos.toFixed(2)}\n`;
    report += `Valor Total de Locomoção: R$ ${stats.totalLocomocao.toFixed(2)}\n`;
    report += `Total Líquido: R$ ${stats.totalGeral.toFixed(2)}\n\n`;
    
    report += `-------------------------------------------\n`;
    report += `CÁLCULO DE PAGAMENTO\n`;
    report += `-------------------------------------------\n`;
    report += `Salário Fixo ${semanaAtual ? '(Semanal)' : '(Mensal)'}: R$ ${(semanaAtual ? stats.salarioFixo / 4 : stats.salarioFixo).toFixed(2)}\n`;
    
    if (func.tipo === 'tecnico') {
      report += `Comissão (${stats.percentual}%): R$ ${stats.comissao.toFixed(2)}\n`;
    }
    
    report += `\n>> TOTAL A PAGAR: R$ ${stats.totalAPagar.toFixed(2)} <<\n\n`;
    
    report += `===========================================\n`;
    report += `DETALHAMENTO DAS VISITAS\n`;
    report += `===========================================\n\n`;
    
    visitasFiltradas.sort((a, b) => new Date(a.data) - new Date(b.data)).forEach((visita, index) => {
      report += `Visita ${index + 1}:\n`;
      report += `  Data: ${new Date(visita.data).toLocaleDateString('pt-BR')}\n`;
      report += `  Cliente: ${getClienteNome(visita.clienteId)}\n`;
      report += `  Serviço: ${getServicoNome(visita.servicoId)}\n`;
      report += `  Locomoção: R$ ${parseFloat(visita.valorLocomocao).toFixed(2)}\n`;
      report += `  Valor: R$ ${parseFloat(visita.valorServico).toFixed(2)}\n`;
      report += `-------------------------------------------\n`;
    });
    
    report += `\n===========================================\n`;
    report += `Assinatura: _____________________________\n`;
    report += `Data: ___________________________________\n`;
    report += `===========================================\n`;

    // Download as text file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-${func.nome.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setShowModal(true);
    
    if (item) {
      setEditingId(item.id);
      if (type === 'cliente') setClienteForm(item);
      if (type === 'servico') setServicoForm(item);
      if (type === 'funcionario') setFuncionarioForm(item);
      if (type === 'visita') setVisitaForm(item);
    } else {
      setEditingId(null);
      resetForms();
    }
  };

  const resetForms = () => {
    setClienteForm({ codigo: '', descricao: '', temContrato: false });
    setServicoForm({ codigo: '', descricao: '' });
    setFuncionarioForm({ nome: '', tipo: 'tecnico', percentual: 0, salarioFixo: 0 });
    setVisitaForm({ data: '', clienteId: '', servicoId: '', funcionarioId: '', valorLocomocao: '', valorServico: '' });
  };

  const handleSaveCliente = () => {
    if (editingId) {
      const updated = clientes.map(c => c.id === editingId ? { ...clienteForm, id: editingId } : c);
      setClientes(updated);
      saveData('clientes', updated);
    } else {
      const newCliente = { ...clienteForm, id: Date.now() };
      const updated = [...clientes, newCliente];
      setClientes(updated);
      saveData('clientes', updated);
    }
    setShowModal(false);
    resetForms();
  };

  const handleSaveServico = () => {
    if (editingId) {
      const updated = servicos.map(s => s.id === editingId ? { ...servicoForm, id: editingId } : s);
      setServicos(updated);
      saveData('servicos', updated);
    } else {
      const newServico = { ...servicoForm, id: Date.now() };
      const updated = [...servicos, newServico];
      setServicos(updated);
      saveData('servicos', updated);
    }
    setShowModal(false);
    resetForms();
  };

  const handleSaveFuncionario = () => {
    if (editingId) {
      const updated = funcionarios.map(f => f.id === editingId ? { ...funcionarioForm, id: editingId } : f);
      setFuncionarios(updated);
      saveData('funcionarios', updated);
    } else {
      const newFunc = { ...funcionarioForm, id: Date.now() };
      const updated = [...funcionarios, newFunc];
      setFuncionarios(updated);
      saveData('funcionarios', updated);
    }
    setShowModal(false);
    resetForms();
  };

  const handleSaveVisita = () => {
    if (editingId) {
      const updated = visitas.map(v => v.id === editingId ? { ...visitaForm, id: editingId } : v);
      setVisitas(updated);
      saveData('visitas', updated);
    } else {
      const newVisita = { ...visitaForm, id: Date.now() };
      const updated = [...visitas, newVisita];
      setVisitas(updated);
      saveData('visitas', updated);
    }
    setShowModal(false);
    resetForms();
  };

  const handleDelete = (type, id) => {
    if (!confirm('Deseja realmente excluir?')) return;
    
    if (type === 'cliente') {
      const updated = clientes.filter(c => c.id !== id);
      setClientes(updated);
      saveData('clientes', updated);
    } else if (type === 'servico') {
      const updated = servicos.filter(s => s.id !== id);
      setServicos(updated);
      saveData('servicos', updated);
    } else if (type === 'funcionario') {
      const updated = funcionarios.filter(f => f.id !== id);
      setFuncionarios(updated);
      saveData('funcionarios', updated);
    } else if (type === 'visita') {
      const updated = visitas.filter(v => v.id !== id);
      setVisitas(updated);
      saveData('visitas', updated);
    }
  };

  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImportText(e.target.result);
        setShowImportModal(true);
      };
      reader.readAsText(file);
    }
  };

  const processImport = () => {
    const lines = importText.split('\n').filter(line => line.trim() !== '');
    
    let maxCodigo = 0;
    clientes.forEach(cliente => {
      const num = parseInt(cliente.codigo);
      if (!isNaN(num) && num > maxCodigo) {
        maxCodigo = num;
      }
    });

    const novosClientes = lines.map((descricao, index) => ({
      id: Date.now() + index,
      codigo: String(maxCodigo + index + 1).padStart(3, '0'),
      descricao: descricao.trim(),
      temContrato: false
    }));

    const updated = [...clientes, ...novosClientes];
    setClientes(updated);
    saveData('clientes', updated);
    setShowImportModal(false);
    setImportText('');
  };

  const getCurrentWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { monday, sunday };
  };

  const getFilteredVisitas = () => {
    if (!semanaAtual) return visitas;
    
    const { monday, sunday } = getCurrentWeekDates();
    return visitas.filter(v => {
      const visitDate = new Date(v.data);
      return visitDate >= monday && visitDate <= sunday;
    });
  };

  const calcularEstatisticas = () => {
    const estatisticas = {};
    const visitasFiltradas = getFilteredVisitas();
    
    funcionarios.forEach(func => {
      const visitasFunc = visitasFiltradas.filter(v => parseInt(v.funcionarioId) === func.id);
      const totalVisitas = visitasFunc.length;
      const totalLocomocao = visitasFunc.reduce((sum, v) => sum + parseFloat(v.valorLocomocao || 0), 0);
      const totalServicos = visitasFunc.reduce((sum, v) => sum + parseFloat(v.valorServico || 0), 0);
      const totalGeral = totalServicos - totalLocomocao;
      
      let comissao = 0;
      let totalAPagar = 0;
      
      if (func.tipo === 'tecnico') {
        comissao = totalServicos * (parseFloat(func.percentual) / 100);
        const salarioSemanal = parseFloat(func.salarioFixo) / 4;
        totalAPagar = comissao + salarioSemanal;
      } else {
        totalAPagar = parseFloat(func.salarioFixo) / 4;
      }
      
      estatisticas[func.id] = {
        nome: func.nome,
        tipo: func.tipo,
        percentual: parseFloat(func.percentual),
        salarioFixo: parseFloat(func.salarioFixo),
        totalVisitas,
        totalLocomocao,
        totalServicos,
        totalGeral,
        comissao,
        totalAPagar
      };
    });
    
    return estatisticas;
  };

  const getClienteNome = (id) => {
    const cliente = clientes.find(c => c.id === parseInt(id));
    return cliente ? `${cliente.codigo} - ${cliente.descricao}` : 'N/A';
  };

  const getServicoNome = (id) => {
    const servico = servicos.find(s => s.id === parseInt(id));
    return servico ? `${servico.codigo} - ${servico.descricao}` : 'N/A';
  };

  const getFuncionarioNome = (id) => {
    const funcionario = funcionarios.find(f => f.id === parseInt(id));
    return funcionario ? funcionario.nome : 'N/A';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b-4 border-green-500 p-4 shadow-lg sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-green-500 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-green-500">SRM Visitas</h1>
              <p className="text-xs text-gray-400">Gerenciamento</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={downloadBackup}
              className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition"
              title="Baixar Backup"
            >
              <Download className="w-5 h-5 text-green-500" />
            </button>
            <label className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition cursor-pointer" title="Restaurar Backup">
              <RotateCcw className="w-5 h-5 text-yellow-500" />
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-24">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-green-500">Dashboard</h2>
              <button
                onClick={() => setSemanaAtual(!semanaAtual)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  semanaAtual 
                    ? 'bg-green-500 text-gray-900' 
                    : 'bg-gray-700 text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{semanaAtual ? 'Semana' : 'Tudo'}</span>
              </button>
            </div>
            
            {semanaAtual && (
              <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-sm">
                <p className="text-gray-300">
                  <strong className="text-green-500">Período:</strong> {getCurrentWeekDates().monday.toLocaleDateString('pt-BR')} até {getCurrentWeekDates().sunday.toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              {Object.entries(calcularEstatisticas()).map(([funcId, stats]) => (
                <div key={funcId} className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-xl">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-green-500">{stats.nome}</h3>
                      <span className={`inline-block text-xs px-2 py-1 rounded mt-1 font-semibold ${
                        stats.tipo === 'tecnico' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-purple-500 text-white'
                      }`}>
                        {stats.tipo === 'tecnico' ? 'TÉCNICO' : 'GERENTE'}
                      </span>
                    </div>
                    <button
                      onClick={() => generateReport(parseInt(funcId))}
                      className="bg-green-500 text-gray-900 p-2 rounded-lg hover:bg-green-600 transition"
                      title="Gerar Relatório"
                    >
                      <FileDown className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Visitas:</span>
                      <span className="font-bold text-white">{stats.totalVisitas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Locomoção:</span>
                      <span className="font-bold text-red-400">R$ {stats.totalLocomocao.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Serviços:</span>
                      <span className="font-bold text-green-400">R$ {stats.totalServicos.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300 font-semibold">Total Líquido:</span>
                        <span className="font-bold text-green-500">R$ {stats.totalGeral.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-green-900 bg-opacity-30 rounded-lg p-3 border border-green-700 mt-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300 font-semibold text-xs">Salário {semanaAtual ? '(Semanal)' : '(Mensal)'}:</span>
                        <span className="font-bold text-white text-sm">
                          R$ {(semanaAtual ? stats.salarioFixo / 4 : stats.salarioFixo).toFixed(2)}
                        </span>
                      </div>
                      {stats.tipo === 'tecnico' && (
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-300 font-semibold text-xs">Comissão ({stats.percentual}%):</span>
                          <span className="font-bold text-yellow-400 text-sm">
                            R$ {stats.comissao.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-green-700 pt-2">
                        <div className="flex justify-between">
                          <span className="text-green-400 font-bold">Total a Pagar:</span>
                          <span className="font-bold text-green-400 text-lg">R$ {stats.totalAPagar.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visitas */}
        {activeTab === 'visitas' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-green-500">Visitas</h2>
              <button
                onClick={() => openModal('visita')}
                className="bg-green-500 text-gray-900 p-3 rounded-lg font-semibold hover:bg-green-600 transition shadow-lg"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {visitas.sort((a, b) => new Date(b.data) - new Date(a.data)).map(visita => (
                <div key={visita.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-green-500 font-bold text-sm">{new Date(visita.data).toLocaleDateString('pt-BR')}</p>
                      <p className="text-white font-semibold">{getClienteNome(visita.clienteId)}</p>
                      <p className="text-gray-400 text-sm">{getServicoNome(visita.servicoId)}</p>
                      <p className="text-gray-400 text-sm">{getFuncionarioNome(visita.funcionarioId)}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="text-red-400 text-sm">Loc: R$ {parseFloat(visita.valorLocomocao).toFixed(2)}</span>
                      <span className="text-green-400 font-bold">R$ {parseFloat(visita.valorServico).toFixed(2)}</span>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => openModal('visita', visita)}
                          className="text-green-500 hover:text-green-400 p-1"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('visita', visita.id)}
                          className="text-red-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clientes */}
        {activeTab === 'clientes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-green-500">Clientes</h2>
              <div className="flex space-x-2">
                <label className="bg-gray-700 text-white p-3 rounded-lg font-semibold hover:bg-gray-600 transition cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => openModal('cliente')}
                  className="bg-green-500 text-gray-900 p-3 rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {clientes.map(cliente => (
                <div key={cliente.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{cliente.codigo}</h3>
                      <p className="text-gray-400">{cliente.descricao}</p>
                      {cliente.temContrato && (
                        <span className="inline-block bg-green-500 text-gray-900 text-xs px-2 py-1 rounded font-semibold mt-2">
                          COM CONTRATO
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('cliente', cliente)}
                        className="text-green-500 hover:text-green-400 p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('cliente', cliente.id)}
                        className="text-red-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Serviços */}
        {activeTab === 'servicos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-green-500">Serviços</h2>
              <button
                onClick={() => openModal('servico')}
                className="bg-green-500 text-gray-900 p-3 rounded-lg font-semibold hover:bg-green-600 transition"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {servicos.map(servico => (
                <div key={servico.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{servico.codigo}</h3>
                      <p className="text-gray-400">{servico.descricao}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('servico', servico)}
                        className="text-green-500 hover:text-green-400 p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('servico', servico.id)}
                        className="text-red-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Funcionários */}
        {activeTab === 'funcionarios' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-green-500">Funcionários</h2>
              <button
                onClick={() => openModal('funcionario')}
                className="bg-green-500 text-gray-900 p-3 rounded-lg font-semibold hover:bg-green-600 transition"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {funcionarios.map(funcionario => (
                <div key={funcionario.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{funcionario.nome}</h3>
                      <span className={`inline-block text-xs px-2 py-1 rounded font-semibold mt-1 ${
                        funcionario.tipo === 'tecnico' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-purple-500 text-white'
                      }`}>
                        {funcionario.tipo === 'tecnico' ? 'TÉCNICO' : 'GERENTE'}
                      </span>
                      <div className="text-sm text-gray-400 mt-2">
                        <p>Salário: <span className="text-green-400 font-semibold">R$ {parseFloat(funcionario.salarioFixo).toFixed(2)}</span></p>
                        {funcionario.tipo === 'tecnico' && (
                          <p>Comissão: <span className="text-yellow-400 font-semibold">{funcionario.percentual}%</span></p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('funcionario', funcionario)}
                        className="text-green-500 hover:text-green-400 p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('funcionario', funcionario.id)}
                        className="text-red-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t-4 border-green-500 shadow-lg z-50">
        <div className="flex justify-around items-center py-3">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
            { id: 'visitas', icon: MapPin, label: 'Visitas' },
            { id: 'clientes', icon: Users, label: 'Clientes' },
            { id: 'servicos', icon: Briefcase, label: 'Serviços' },
            { id: 'funcionarios', icon: UserCog, label: 'Equipe' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition ${
                activeTab === tab.id
                  ? 'text-green-500'
                  : 'text-gray-400'
              }`}
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-500">
                {editingId ? 'Editar' : 'Novo'} {
                  modalType === 'cliente' ? 'Cliente' : 
                  modalType === 'servico' ? 'Serviço' : 
                  modalType === 'funcionario' ? 'Funcionário' : 
                  'Visita'
                }
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {modalType === 'cliente' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Código</label>
                  <input
                    type="text"
                    value={clienteForm.codigo}
                    onChange={(e) => setClienteForm({ ...clienteForm, codigo: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                  <input
                    type="text"
                    value={clienteForm.descricao}
                    onChange={(e) => setClienteForm({ ...clienteForm, descricao: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="contrato"
                    checked={clienteForm.temContrato}
                    onChange={(e) => setClienteForm({ ...clienteForm, temContrato: e.target.checked })}
                    className="w-6 h-6 rounded border-gray-600 text-green-500 focus:ring-green-500"
                  />
                  <label htmlFor="contrato" className="text-gray-300 font-medium">Tem Contrato</label>
                </div>
                <button
                  onClick={handleSaveCliente}
                  className="w-full bg-green-500 text-gray-900 px-4 py-3 rounded-lg font-bold hover:bg-green-600 transition flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Salvar</span>
                </button>
              </div>
            )}

            {modalType === 'servico' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Código</label>
                  <input
                    type="text"
                    value={servicoForm.codigo}
                    onChange={(e) => setServicoForm({ ...servicoForm, codigo: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                  <input
                    type="text"
                    value={servicoForm.descricao}
                    onChange={(e) => setServicoForm({ ...servicoForm, descricao: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  />
                </div>
                <button
                  onClick={handleSaveServico}
                  className="w-full bg-green-500 text-gray-900 px-4 py-3 rounded-lg font-bold hover:bg-green-600 transition flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Salvar</span>
                </button>
              </div>
            )}

            {modalType === 'funcionario' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                  <input
                    type="text"
                    value={funcionarioForm.nome}
                    onChange={(e) => setFuncionarioForm({ ...funcionarioForm, nome: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                  <select
                    value={funcionarioForm.tipo}
                    onChange={(e) => setFuncionarioForm({ ...funcionarioForm, tipo: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="tecnico">Técnico</option>
                    <option value="gerente">Gerente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Salário Fixo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={funcionarioForm.salarioFixo}
                    onChange={(e) => setFuncionarioForm({ ...funcionarioForm, salarioFixo: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                    placeholder="1800.00"
                  />
                </div>
                {funcionarioForm.tipo === 'tecnico' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Comissão (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={funcionarioForm.percentual}
                      onChange={(e) => setFuncionarioForm({ ...funcionarioForm, percentual: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                      placeholder="30"
                    />
                  </div>
                )}
                <button
                  onClick={handleSaveFuncionario}
                  className="w-full bg-green-500 text-gray-900 px-4 py-3 rounded-lg font-bold hover:bg-green-600 transition flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Salvar</span>
                </button>
              </div>
            )}

            {modalType === 'visita' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Data</label>
                  <input
                    type="date"
                    value={visitaForm.data}
                    onChange={(e) => setVisitaForm({ ...visitaForm, data: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cliente</label>
                  <select
                    value={visitaForm.clienteId}
                    onChange={(e) => setVisitaForm({ ...visitaForm, clienteId: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="">Selecione...</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.codigo} - {c.descricao}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Serviço</label>
                  <select
                    value={visitaForm.servicoId}
                    onChange={(e) => setVisitaForm({ ...visitaForm, servicoId: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="">Selecione...</option>
                    {servicos.map(s => (
                      <option key={s.id} value={s.id}>{s.codigo} - {s.descricao}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Funcionário</label>
                  <select
                    value={visitaForm.funcionarioId}
                    onChange={(e) => setVisitaForm({ ...visitaForm, funcionarioId: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="">Selecione...</option>
                    {funcionarios.map(f => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Locomoção (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={visitaForm.valorLocomocao}
                    onChange={(e) => setVisitaForm({ ...visitaForm, valorLocomocao: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Valor Serviço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={visitaForm.valorServico}
                    onChange={(e) => setVisitaForm({ ...visitaForm, valorServico: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                    placeholder="0.00"
                  />
                </div>
                <button
                  onClick={handleSaveVisita}
                  className="w-full bg-green-500 text-gray-900 px-4 py-3 rounded-lg font-bold hover:bg-green-600 transition flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Salvar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-500">Importar Clientes</h3>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Uma descrição por linha
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows="10"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 font-mono text-sm"
                  placeholder="Cliente A&#10;Cliente B&#10;Cliente C"
                />
                <p className="text-gray-400 text-sm mt-2">
                  {importText.split('\n').filter(line => line.trim() !== '').length} cliente(s) para importar
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={processImport}
                  className="flex-1 bg-green-500 text-gray-900 px-4 py-3 rounded-lg font-bold hover:bg-green-600 transition flex items-center justify-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Importar</span>
                </button>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg font-bold hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SRMVisitas;