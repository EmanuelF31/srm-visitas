# 📊 SRM Visitas - Gerenciamento

Este é um aplicativo de gerenciamento de visitas técnicas, focado no controlo de serviços, clientes e pagamentos de funcionários.

## ✨ Funcionalidades

* **Dashboard:** Visualização rápida das estatísticas de pagamento da equipa (semanal ou geral).
* **Gestão de Visitas:** Registo detalhado de cada visita, incluindo valores de serviço e locomoção.
* **Gestão de Clientes:** Cadastro de clientes com códigos e indicação de contrato.
* **Gestão de Serviços:** Cadastro dos tipos de serviços prestados.
* **Gestão de Equipa:** Cadastro de funcionários (Técnicos ou Gerentes) com salário e comissão.
* **Relatórios em PDF:** Geração de relatórios de pagamento detalhados por funcionário, com opção de download e compartilhamento.
* **Backup e Restauração:** Funcionalidades para salvar (backup) e restaurar (restore) todos os dados da aplicação em formato `.json`.

## 🚀 Tecnologias Utilizadas

* **React:** Biblioteca principal para a construção da interface.
* **Capacitor:** Para transformar a aplicação web num aplicativo nativo (Android/iOS).
* **Lucide Icons:** Para os ícones da interface.
* **jsPDF** & **jspdf-autotable:** Para a geração dos relatórios em PDF.

## 🏁 Como Rodar o Projeto

Siga os passos abaixo para configurar e rodar o projeto localmente.

### 1. Pré-requisitos

* [Node.js](https://nodejs.org/) (versão 18+)
* [Android Studio](https://developer.android.com/studio) (para a versão Android)

### 2. Instalação

Clone o repositório e instale as dependências:

```bash
# Clone este repositório
git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)

# Entre na pasta do projeto
cd seu-repositorio

# Instale as dependências do Node.js
npm install