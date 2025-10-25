import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = async (funcionario, stats, visitas, periodo, semanaAtual, getClienteNome, getServicoNome) => {
  try {
    const doc = new jsPDF();
    const reportDate = new Date().toLocaleDateString('pt-BR');
    
    // Cabeçalho
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE PAGAMENTO', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('SRM Visitas - Sistema de Gerenciamento', doc.internal.pageSize.getWidth() / 2, 26, { align: 'center' });
    
    // Linha separadora
    doc.setDrawColor(34, 197, 94); // Verde
    doc.setLineWidth(0.5);
    doc.line(14, 30, doc.internal.pageSize.getWidth() - 14, 30);
    
    // Informações do funcionário
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Funcionário: ${funcionario.nome}`, 14, 40);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Tipo: ${funcionario.tipo === 'tecnico' ? 'TÉCNICO' : 'GERENTE'}`, 14, 46);
    doc.text(`Período: ${periodo}`, 14, 52);
    doc.text(`Data do Relatório: ${reportDate}`, 14, 58);

    // Resumo Financeiro
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo Financeiro', 14, 70);
    
    doc.autoTable({
      startY: 74,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94], textColor: [17, 24, 39], fontStyle: 'bold' },
      head: [['Descrição', 'Valor']],
      body: [
        ['Total de Visitas', stats.totalVisitas.toString()],
        ['Total de Serviços', `R$ ${stats.totalServicos.toFixed(2)}`],
        ['Total de Locomoção', `R$ ${stats.totalLocomocao.toFixed(2)}`],
        ['Total Líquido', `R$ ${stats.totalGeral.toFixed(2)}`],
      ],
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' }
      }
    });

    // Cálculo de Pagamento
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Cálculo de Pagamento', 14, finalY);
    
    const salarioTxt = `Salário Fixo ${semanaAtual ? '(Semanal)' : '(Mensal)'}`;
    const salarioVal = `R$ ${(semanaAtual ? stats.salarioFixo / 4 : stats.salarioFixo).toFixed(2)}`;
    
    let bodyPagamento = [[salarioTxt, salarioVal]];
    
    if (funcionario.tipo === 'tecnico') {
      bodyPagamento.push([
        `Comissão sobre Líquido (${stats.percentual}%)`, 
        `R$ ${stats.comissao.toFixed(2)}`
      ]);
    }
    
    bodyPagamento.push([
      'TOTAL A PAGAR',
      `R$ ${stats.totalAPagar.toFixed(2)}`
    ]);

    doc.autoTable({
      startY: finalY + 4,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94], textColor: [17, 24, 39], fontStyle: 'bold' },
      head: [['Tipo de Pagamento', 'Valor']],
      body: bodyPagamento,
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' }
      },
      bodyStyles: (data) => {
        if (data.row.index === bodyPagamento.length - 1) {
          return { fillColor: [220, 252, 231], fontStyle: 'bold', fontSize: 11 };
        }
      }
    });

    // Detalhamento das Visitas
    finalY = doc.lastAutoTable.finalY + 10;
    
    if (visitas.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalhamento das Visitas', 14, finalY);
      
      const visitasBody = visitas.map((visita, index) => [
        (index + 1).toString(),
        new Date(visita.data).toLocaleDateString('pt-BR'),
        getClienteNome(visita.clienteId).substring(0, 30),
        getServicoNome(visita.servicoId).substring(0, 30),
        `R$ ${parseFloat(visita.valorLocomocao).toFixed(2)}`,
        `R$ ${parseFloat(visita.valorServico).toFixed(2)}`,
      ]);

      doc.autoTable({
        startY: finalY + 4,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94], textColor: [17, 24, 39], fontStyle: 'bold' },
        head: [['#', 'Data', 'Cliente', 'Serviço', 'Locomoção', 'Valor']],
        body: visitasBody,
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 20 },
          2: { cellWidth: 45 },
          3: { cellWidth: 45 },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
        }
      });
    }

    // Assinatura
    finalY = doc.lastAutoTable.finalY + 20;
    if (finalY > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      finalY = 20;
    }
    
    doc.setDrawColor(34, 197, 94);
    doc.line(14, finalY, 80, finalY);
    doc.setFontSize(10);
    doc.text('Assinatura do Funcionário', 14, finalY + 5);
    
    doc.line(120, finalY, 186, finalY);
    doc.text('Responsável', 120, finalY + 5);
    
    doc.setFontSize(8);
    doc.text(`Data: ${reportDate}`, 14, finalY + 15);

    return doc;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};