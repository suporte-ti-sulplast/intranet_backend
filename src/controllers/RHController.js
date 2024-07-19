const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { sendEmailRhFolha } = require('../functions/sendEmail');
var msg, msg_type;
const EmailsGruposUsuariosModel = require('../../models/EmailsGruposUsuarios');
const UsersModel = require('../../models/Usuarios');

// Função auxiliar para converter letras de colunas para números
function colToNumber(col) {
  let number = 0;
  for (let i = 0; i < col.length; i++) {
    number = number * 26 + (col.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return number;
}


// BUSCA ARQUIVOS NA PASTA IN
exports.findFilesIn = async (req, res) => {
  // Função para listar arquivos em um diretório
  const listarArquivos = (caminhoDiretorio) => {
    try {
      const arquivos = fs.readdirSync(caminhoDiretorio);
      return arquivos;
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return [];
    }
  };

  const caminhoDiretorio = path.join(__dirname, '../../public/sharedFiles/rh/in');
  const arquivos = listarArquivos(caminhoDiretorio);

  // Envia a lista de arquivos em formato JSON para o cliente
  res.json({ arquivos });
};

// BUSCA ARQUIVOS  NA PASTA OUT
exports.findFilesOut = async (req, res) => {
  // Função para listar arquivos em um diretório
  const listarArquivos = (caminhoDiretorio) => {
    try {
      const arquivos = fs.readdirSync(caminhoDiretorio);
      return arquivos;
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return [];
    }
  };

  const caminhoDiretorio = path.join(__dirname, '../../public/sharedFiles/rh/out');
  const arquivos = listarArquivos(caminhoDiretorio);

  // Envia a lista de arquivos em formato JSON para o cliente
  res.json({ arquivos });
};

// CONVERTE ARQUIVOS
exports.convertFile = async (req, res) => {
  const arquivo = req.body.arquivo;

  async function modifyExcelFile(file) {
    const pastaComArquivosEntrada = path.join(__dirname, '../../public/sharedFiles/rh/in');
    const pastaComArquivosSaida = path.join(__dirname, '../../public/sharedFiles/rh/out');
    const caminhoArquivoEntrada = path.join(pastaComArquivosEntrada, file);
    const caminhoArquivoSaida = path.join(pastaComArquivosSaida, `S${file}`);

    // Lê a planilha
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(caminhoArquivoEntrada);
    const worksheet = workbook.getWorksheet('Plan1');

    let currentIdCounter = 0;
    let lastValue = null;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Pula a primeira linha (cabeçalho)

      const cell = row.getCell(2); // Coluna B (índice 2)
      if (cell.value !== lastValue) {
        lastValue = cell.value;
        currentIdCounter++;
      }
      const currentId = `ID${String(currentIdCounter).padStart(2, '0')}`;
      row.getCell(2).value = currentId; // Atualiza o valor na coluna B
    });

    // Remover as colunas específicas
    const colunasParaRemover = ['A', 'C', 'D', 'F', 'G','H','I', 'O', 'P', 'S', 'T', 'W', 'X', 'Y', 'Z', 'AA', 'AC', 'AD','AE','AF'];

    colunasParaRemover.reverse().forEach(col => {
      worksheet.spliceColumns(colToNumber(col), 1);
    });

    // Salva a planilha modificada
    await workbook.xlsx.writeFile(caminhoArquivoSaida);

    // Remove o arquivo original
    fs.unlink(caminhoArquivoEntrada, async (err) => {
      if (err) {
        console.error("Erro ao deletar o arquivo original:", err);
      } else {
        // Enviar email comunicando novo arquivo
        const getUsersWithFullName = async () => {
          try {

            const idGrp = 4; //aqui vai o ID do grupo que recebe email dessa função

            const users = await EmailsGruposUsuariosModel.findAll({
              where: { idGrp },
              attributes: ['idUser'],
              include: [
                {
                  model: UsersModel,
                  as: 'emailsUser',
                  attributes: ['nameComplete', 'email'],
                }
              ],
              raw: true,
              nest: true
            });

            return users.map(user => ({
              nameComplete: user.emailsUser.nameComplete,
              email: user.emailsUser.email
            }));

          } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            throw error;
          }
        }

        const users = await getUsersWithFullName();
        sendEmailRhFolha(users);

        console.log("Arquivo original deletado com sucesso.");
      }
    });
  }

  try {
    await modifyExcelFile(arquivo);
    res.json({ msg: 'Conversão concluída com sucesso.', msg_type: 'success' });
  } catch (error) {
    console.error("Erro na conversão:", error);
    res.json({ msg: 'Erro na conversão', msg_type: 'error' });
  }
};

//LISTA DE ARQUIVOS PDF ************************************************************************************************************
exports.listarArquivosPdf = async (req, res) => {

  // Função para listar arquivos em um diretório
  const listarArquivospdf = (caminhoDiretorio) => {
      try {
          const arquivos = fs.readdirSync(caminhoDiretorio);
          const arquivosPDF = arquivos.filter((arquivo) => arquivo.toLowerCase().endsWith('.pdf'));

          return arquivosPDF;
      } catch (error) {
          console.error('Erro ao listar arquivos:', error);
          return [];
      }
  };

  const caminhoDiretorio = path.join(__dirname, '../../public/sharedFiles/rh/pdf')
  const Arquivos = listarArquivospdf(caminhoDiretorio);
  // Envia a lista de arquivos em formato JSON para o cliente
  res.json({ arquivos: Arquivos });
};



