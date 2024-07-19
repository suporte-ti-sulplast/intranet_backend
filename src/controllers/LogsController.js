require('dotenv').config()
const LogsTrocaSenhasModel = require('../../models/LogsTrocaSenhas');
const LogsAcessosModel = require('../../models/LogsAcessos');

//BUSCA LOG DE ALTERAÇÃO DE SENHA*******************************************************************************************
exports.alteracaoSenha = async (req, res) => {

  try {
    const logs = await LogsTrocaSenhasModel.findAll({
      where: { /* suas condições de busca */ },
      raw: true, // Retorna os resultados como objetos simples, sem instâncias do Sequelize
      nest: true, // Aninhar os resultados para evitar arrays aninhados
      timezone: '-03:00', // Configura o fuso horário para São Paulo (GMT-03:00)
      order: [['createdAt', 'DESC']], // Ordena os resultados pela coluna 'createdAt' em ordem descendente
    })

      return res.json({ logs });
      
  } catch (error) {
      console.log("Houve um erro interno", error);
    return res.status(500).json({ error: "Internal server error." });
  };
};

//BUSCA LOG DE ALTERAÇÃO DE SENHA*******************************************************************************************
exports.acessos = async (req, res) => {

  try {
    const logs = await LogsAcessosModel.findAll({
      where: { /* suas condições de busca */ },
      raw: true, // Retorna os resultados como objetos simples, sem instâncias do Sequelize
      nest: true, // Aninhar os resultados para evitar arrays aninhados
      timezone: '-03:00', // Configura o fuso horário para São Paulo (GMT-03:00)
      order: [['createdAt', 'DESC']], // Ordena os resultados pela coluna 'createdAt' em ordem descendente
      limit: 200, // Limita os resultados a 200 registros
    });

      return res.json({ logs });
      
  } catch (error) {
      console.log("Houve um erro interno", error);
    return res.status(500).json({ error: "Internal server error." });
  };
};

