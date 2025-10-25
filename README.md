# 📊 SRM Visitas - Sistema de Gerenciamento

<div align="center">
  <img src="public/logo.png" alt="SRM Visitas Logo" width="200"/>
  
  [![Version](https://img.shields.io/badge/version-2.0.0-green.svg)](https://github.com/seu-usuario/srm-visitas)
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)](https://reactjs.org/)
  [![Capacitor](https://img.shields.io/badge/Capacitor-5.5.1-119eff.svg)](https://capacitorjs.com/)
</div>

## 📋 Sobre o Projeto

**SRM Visitas** é um sistema completo de gerenciamento de visitas técnicas, desenvolvido para facilitar o controle de serviços, clientes e pagamentos de equipes técnicas. O aplicativo oferece uma interface intuitiva e profissional para registro de visitas, cálculo automático de comissões e geração de relatórios detalhados.

### 🎯 Principais Características

- **✅ Gestão Completa de Visitas** - Registre todas as visitas técnicas com detalhes de cliente, serviço, valores e responsável
- **💰 Cálculo Automático de Pagamentos** - Sistema inteligente que calcula salários, comissões e totais automaticamente
- **📊 Dashboard Analítico** - Visualize estatísticas em tempo real, filtradas por semana ou período completo
- **📄 Relatórios em PDF** - Gere relatórios profissionais com detalhamento completo de pagamentos e visitas
- **💾 Backup e Restauração** - Sistema robusto de backup automático e manual dos dados
- **📱 Design Responsivo** - Interface otimizada para dispositivos móveis Android
- **🔒 Armazenamento Local** - Todos os dados ficam no dispositivo, garantindo privacidade

---

## 🚀 Tecnologias Utilizadas

### Core
- **React 18.2** - Biblioteca JavaScript para construção de interfaces
- **Vite 5.0** - Build tool moderna e rápida
- **Tailwind CSS** - Framework CSS utilitário via CDN

### Mobile
- **Capacitor 5.5** - Framework para transformar web apps em aplicativos nativos
- **@capacitor/filesystem** - API para manipulação de arquivos
- **@capacitor/share** - API para compartilhamento de conteúdo
- **@capacitor/status-bar** - Controle da barra de status nativa

### Bibliotecas
- **jsPDF 2.5** - Geração de documentos PDF
- **jspdf-autotable 3.8** - Criação de tabelas em PDF
- **Lucide React** - Ícones modernos e otimizados

---

## 📦 Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Android Studio** ([Download](https://developer.android.com/studio))
- **JDK 17** ([Download](https://www.oracle.com/java/technologies/downloads/))

### 1️⃣ Clone o Repositório
```bash
git clone https://github.com/seu-usuario/srm-visitas.git
cd srm-visitas
```

### 2️⃣ Instale as Dependências
```bash
npm install
```

### 3️⃣ Execute em Modo Desenvolvimento
```bash
npm run dev
```

Acesse: `http://localhost:5173`

### 4️⃣ Build para Produção
```bash
npm run build
```

### 5️⃣ Configurar para Android
```bash
# Adicionar plataforma Android
npx cap add android

# Sincronizar arquivos
npx cap sync android

# Abrir no Android Studio
npx cap open android
```

### 6️⃣ Gerar APK

No Android Studio:
1. Aguarde o Gradle Sync concluir
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Localize o APK em: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📱 Funcionalidades Detalhadas

### 🏠 Dashboard
- Visualização de estatísticas por funcionário
- Filtro por semana atual ou período completo
- Cálculo automático de:
  - Total de visitas realizadas
  - Valores de locomoção e serviços
  - Comissões sobre valor líquido (para técnicos)
  - Total a pagar (salário + comissões)

### 📍 Gestão de Visitas
- Registro completo de cada visita:
  - Data da visita
  - Cliente atendido
  - Serviço prestado
  - Funcionário responsável
  - Valor de locomoção
  - Valor do serviço
- Edição e exclusão de registros
- Ordenação cronológica automática

### 👥 Gestão de Clientes
- Cadastro com código e descrição
- Indicador de contrato ativo
- Importação em massa via arquivo `.txt`
- Geração automática de códigos sequenciais

### 🛠️ Gestão de Serviços
- Cadastro de tipos de serviços
- Código e descrição personalizáveis
- Organização visual em cards

### 👨‍💼 Gestão de Funcionários
- Dois tipos de funcionários:
  - **Técnicos**: Recebem salário fixo + comissão sobre valor líquido
  - **Gerentes**: Recebem apenas salário fixo
- Configuração de percentual de comissão
- Cálculo automático de pagamentos

### 📄 Relatórios PDF
- Geração automática de relatórios profissionais
- Inclui:
  - Resumo financeiro completo
  - Cálculo detalhado de pagamento
  - Lista de todas as visitas do período
  - Espaço para assinaturas
- Compartilhamento direto via WhatsApp, Email, etc.
- Salvamento em Documentos do dispositivo

### 💾 Backup e Restauração
- **Backup Automático**: Criado a cada alteração nos dados
- **Backup Manual**: Exportação de arquivo JSON para local seguro
- **Restauração**: Importação completa de dados salvos
- Formato: JSON estruturado e legível

---

## 🔧 Estrutura do Projeto
```
srm-visitas/
├── android/                      # Projeto Android nativo
│   ├── app/
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/com/srm/visitas/
│   │       │   └── MainActivity.java
│   │       └── res/
│   │           ├── mipmap/       # Ícones do app
│   │           ├── values/
│   │           │   ├── colors.xml
│   │           │   ├── strings.xml
│   │           │   └── styles.xml
│   │           └── xml/
│   │               └── file_paths.xml
│   └── build.gradle
├── public/
│   ├── capacitor-storage.js     # Polyfill para storage
│   └── logo.png                 # Logo do aplicativo
├── src/
│   ├── utils/
│   │   ├── permissions.js       # Gerenciamento de permissões
│   │   └── pdfGenerator.js      # Gerador de PDFs
│   ├── App.jsx                  # Componente principal
│   ├── App.css                  # Estilos globais
│   └── main.jsx                 # Entry point
├── capacitor.config.json        # Configuração do Capacitor
├── index.html                   # HTML principal
├── package.json                 # Dependências do projeto
├── vite.config.js              # Configuração do Vite
└── README.md                    # Este arquivo
```

---

## 🎨 Customização

### Cores do Tema

Edite `android/app/src/main/res/values/colors.xml`:
```xml
<color name="colorPrimary">#22C55E</color>        <!-- Verde principal -->
<color name="colorPrimaryDark">#111827</color>    <!-- Cinza escuro -->
<color name="colorAccent">#22C55E</color>         <!-- Verde destaque -->
```

### Ícone do Aplicativo

Substitua os arquivos em `android/app/src/main/res/mipmap/`:
- `ic_launcher.png` (várias resoluções)
- `ic_launcher_round.png` (ícone redondo)

Recomendado: Use [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/) para gerar todos os tamanhos.

---

## 🔐 Permissões

O aplicativo solicita as seguintes permissões:

- **Armazenamento**: Para salvar backups e relatórios PDF
- **Internet**: Para futuras integrações (atualmente não utilizado)

Todas as permissões são solicitadas na primeira inicialização do app.

---

## 📊 Lógica de Cálculos

### Comissão de Técnicos
```javascript
valorLiquido = valorServico - valorLocomocao
comissao = valorLiquido × (percentual / 100)
totalAPagar = (salarioFixo / 4) + comissao  // Para semana atual
```

### Pagamento de Gerentes
```javascript
totalAPagar = salarioFixo / 4  // Para semana atual
```

---

## 🐛 Solução de Problemas

### APK não instala no Android
- Ative "Instalar de fontes desconhecidas" nas configurações
- Verifique se o Android é versão 7.0+

### Permissões não solicitadas
- Desinstale e reinstale o app
- Verifique o `AndroidManifest.xml`

### PDF não é gerado
- Verifique permissões de armazenamento
- Limpe o cache do app

### Backup não restaura
- Verifique se o arquivo JSON está íntegro
- Formato deve ser: `{ "version": "2.0", "data": {...} }`

---

## 📈 Roadmap

- [ ] Integração com banco de dados em nuvem (Firebase)
- [ ] Sistema de autenticação de usuários
- [ ] Sincronização multi-dispositivo
- [ ] Exportação para Excel
- [ ] Gráficos e análises avançadas
- [ ] Versão Web (PWA)
- [ ] Notificações push
- [ ] Modo offline completo

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma Branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Seu Nome**
- GitHub: [@EmanuelF31](https://github.com/EmanuelF31)
- LinkedIn: [Emanuel Ítalo Ferreira Menezes](https://www.linkedin.com/in/emanuelifm31/)
- Email: ferreira.emanuelf31@gmail.com

---
 
  **SRM Visitas** © 2025
</div>
