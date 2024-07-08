const LogsTrocaSenhasModel = require('../../models/LogsTrocaSenhas');
const DepartmentsModel = require('../../models/Departamentos');
const StatusesModel = require('../../models/Status');
const UsersModel = require('../../models/Usuarios');
const SettingsModel = require('../../models/Configuracoes');
const EmailsGruposModel = require('../../models/EmailsGrupos');
const EmailsGruposUsuariosModel = require('../../models/EmailsGruposUsuarios');
const TelasPermissoesUsuariosModel = require('../../models/TelasPermissoesUsuarios');
const SistemasModel = require('../../models/Sistemas');
const SistemasUsuariosModel = require('../../models/SistemasUsuarios');
const SistemasDepartamentosModel = require('../../models/SistemasDepartamentos');
const calcularDiferencaEmDias = require('../functions/paswordAge');
const { sendEmailPassword } = require('../functions/sendEmail');
const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
require('dotenv').config()

// Chave secreta para criptografia (mantenha isso seguro)
const secretKey = process.env.SECRET_KEY;

const decryptIdBadge = (encryptedIdBadge) => {
    if (!encryptedIdBadge) {
      return null; // ou trate conforme necessário para sua aplicação
    }
    const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
    let decryptedIdBadge = decipher.update(encryptedIdBadge, 'hex', 'utf-8');
    decryptedIdBadge += decipher.final('utf-8');
    return decryptedIdBadge;
  };

  const encryptData = (data) => {
    const cipher = crypto.createCipher('aes-256-cbc', secretKey);
    let encryptedData = cipher.update(data, 'utf-8', 'hex') || '';
    encryptedData += cipher.final('hex');
    return encryptedData;
  };


//RETORNA O USUÁRIO LOGADO ************************************************************************************************************
exports.userLogged = async (req, res) => {

  const user = req.body.user; 
  var dataAge;
  
  const logged = await UsersModel.findOne({
    where: { login: user },
      attributes: ['idUser', 'login', 'email', 'level', 'nameComplete', 'agePassword','forcedChangePassword', 'codCQ', 'badge'],
      include: [
        { 
          model: DepartmentsModel,
          attributes: ['department', 'idDept'],
        },
        {
          model: StatusesModel,
          attributes: ['status', 'idStatus'],
        }
    ],
    raw : true,
    nest : true
  });

  // Verifica se o campo idBadge não é nulo
  if (logged.badge !== null && logged.badge !== undefined && logged.badge !== '') {
      try {
          // Descriptografa o idBadge
          logged.badge = decryptIdBadge(logged.badge);
      } catch (error) {
          console.error('Erro ao descriptografar badge:', error);
          // Tratar o erro conforme necessário (por exemplo, atribuir um valor padrão)
      }
  }

  //BUSCA AS CONFIGURAÇÕES
  const settings = await SettingsModel.findAll({
    attributes: ['descriptionSet', 'valueSet'],
  });

  //CALCULA A IDADE DA SENHA
  const maxAgePassword = settings[0].valueSet
  if(logged.badge){
    dataAge = 9999;
  } else {
    dataAge = (maxAgePassword - calcularDiferencaEmDias(logged.agePassword));
  }

  return res.json({ logged, dataAge, settings });
};



//LISTAGEM DOS USUÁRIOS *********************************************************************************************************************************
exports.userList = async (req, res) => {

  try {
      const respostas = await UsersModel.findAll({
          attributes: ['idUser', 'login', 'email', 'nameComplete', 'level', 'idStatus', 'sendEmail', 'agePassword', 'createdAt', 'codCQ', 'badge', 'birthdate'],
          include: [{ 
            model: DepartmentsModel,
            attributes: ['department', 'idDept'],
          },
          {
            model: StatusesModel,
            attributes: ['status', 'idStatus'],
          }      
        ],
          raw: true,
          nest: true,
          order: [['login', 'ASC']]
      });

      const resp = await TelasPermissoesUsuariosModel.findAll();

      // Descriptografa o idBadge para cada usuário no resultado da consulta
      const users = respostas.map(resposta => {
        // Verifica se o campo idBadge não é nulo
        if (resposta.badge !== null && resposta.badge !== undefined && resposta.badge !== "") {
          try {
              // Descriptografa o idBadge
              resposta.badge = decryptIdBadge(resposta.badge);
          } catch (error) {
              console.error('Erro ao descriptografar badge:', error);
              console.log(resposta.badge)
              // Tratar o erro conforme necessário (por exemplo, atribuir um valor padrão)
          }
      }

      return resposta;
      });

      return res.json({ users });
  } catch (error) {
      console.log("Houve um erro interno", error);
      return res.status(500).json({ error: "Internal server error." });
  }
};


//FORM DE EDIÇÃO DOS USUÁRIOS
exports.userEdit = async (req, res) => {

  const userId = parseInt(req.body.userId);

  const user = await UsersModel.findOne({
    where: { idUser: userId },
      attributes: ['idUser', 'login', 'email', 'nameComplete', 'idDept','sendEmail', 'idStatus' , 'codCQ', 'level', 'badge', 'birthdate', 'forcedChangePassword'],
      include: [
        { 
          model: DepartmentsModel,
          attributes: ['department', 'idDept'],
        },
        {
          model: StatusesModel,
          attributes: ['status', 'idStatus'],
        }
      ],
        raw : true,
        nest : true
  });

  // Verifica se o campo idBadge não é nulo
  if (user.badge !== null && user.badge !== undefined) {
    try {
        // Descriptografa o idBadge
        user.badge = decryptIdBadge(user.badge);
    } catch (error) {
        console.error('Erro ao descriptografar badge:', error);
        // Tratar o erro conforme necessário (por exemplo, atribuir um valor padrão)
    }
}

  const deptto = await DepartmentsModel.findAll({
    attributes: ['department'],
    raw : true,
    nest : true
  });

  const stattus = await StatusesModel.findAll({
    attributes: ['status', 'idStatus'],
    raw : true,
    nest : true
  });

  return res.json({ user, deptto, stattus });
};

//FORM PARA CRIAÇÃO DE NOVO USUÁRIO
exports.userCreate = async (req, res) => {

  const userId = parseInt(req.body.userId)

  const user = await UsersModel.findOne({
    where: { idUser: userId },
      attributes: ['idUser', 'login', 'email', 'nameComplete', 'idStatus', 'sendEmail'],
      include: [{ 
        model: DepartmentsModel,
        attributes: ['department'],
    }],
    raw : true,
    nest : true
  });

  const deptto = await DepartmentsModel.findAll({
    attributes: ['department'],
    raw : true,
    nest : true
  })

  return res.json({ user: user, deptto: deptto });
};

//BUSCA O DEPARTAMENTO E STATUS DO USER
exports.depptoStattus = async (req, res) => {

  const deptto = await DepartmentsModel.findAll({
    attributes: ['idDept', 'department'],
    raw : true,
    nest : true,
    order: [['department', 'ASC']]
  });

  const stattus = await StatusesModel.findAll({
    attributes: ['idStatus', 'status'],
    raw : true,
    nest : true
 });


  return res.json({ deptto, stattus });

};

//VERIFICA SE EXITE LOGIN E EMAIL E COQ e CRACHÁ
exports.loginEmail = async (req, res) => {

  const { login, email, codCQ, cracha } = req.body;
  const newCracha = parseInt(cracha) || 999999;
  
  var CQ;

  if(codCQ === null || codCQ === "") {
    CQ = 'AA'
  } else {
    if (codCQ.includes('CQ')) {
      const indexCQ = codCQ.indexOf('CQ');
      CQ = 'CQ' + codCQ.slice(indexCQ + 2, indexCQ + 4);
        console.log(CQ);
    }
  }
  
  var haveLogin, haveEmail, haveCodCQ, haveCracha;
  haveLogin = haveEmail = haveCodCQ = haveCracha = false;

  const findLogin = await UsersModel.findOne({
    where: {login: login}, 
    attributes: ['login'],
    raw : true,
    nest : true
  })

  const findEmail = await UsersModel.findOne({
    where: {email: email},
    attributes: ['email'],
    raw : true,
    nest : true
  })

  const findCQ = await UsersModel.findOne({
    where: {
      codCQ: {
        [Sequelize.Op.like]: `%${CQ}%`
      }
    },
    attributes: ['codCQ'],
    raw : true,
    nest : true
  })


  findCracha = await UsersModel.findOne({
    where: {badge: newCracha},
    attributes: ['badge'],
    raw : true,
    nest : true
  })

  if(findLogin) haveLogin = findLogin.login
  if(findEmail) haveEmail = findEmail.email
  if(findCQ) haveCodCQ = findCQ.codCQ
  if(findCracha) haveCracha = findCracha.idBadge

  return res.json({ haveLogin, haveEmail, haveCodCQ, haveCracha });
};


//INSERÇÃO DE NOVO USUÁRIO NO BD
exports.userAddBD = async (req, res) => {

  const dataAtual = new Date();
  const idBadge = req.body.cracha && req.body.cracha.trim() !== '' ? req.body.cracha : null;

  //CRIPTOGRAFA A SENHA PARA GUARDAR NO BANCO
  var password = await bcrypt.hash(req.body.senha, 10);
  var crachaCrypto = (idBadge !== null && idBadge !== undefined && idBadge !== '') ? encryptData(idBadge) : '';
  var msg, msg_type;

  const sistemasMarcados = req.body.sistemasMarcados

  console.log(sistemasMarcados)

  //COLOCA O NOVO VALOR NUMA VARIAVEL
  const novoUsuario  = {
      login: req.body.login,
      nameComplete: req.body.name,
      email: req.body.email,
      idDept: req.body.setorId,
      level: req.body.level,
      idStatus: req.body.statusId,
      sendEmail: req.body.recebeEmail,
      forcedChangePassword: req.body.trocaSenha,
      password: password,
      agePassword: dataAtual,
      codCQ: req.body.codCQ,
      badge: crachaCrypto,
      birthdate: req.body.birthdate
  };


  //ATUALIZA A TABELA COM O NOVO VALOR
  await UsersModel.create(novoUsuario).then(() => {
      console.log("Usuário criado com sucesso");
      msg = "Usuário criado com sucesso"
      msg_type = "success"
  }).catch((err) => {
      console.log("erro", err);
      msg = "Houve um erro interno."
      msg_type = "error"
  }) ;

  //SALVA A CRIAÇÃO DE SENHA NO LOG DE SENHAS
  //busca o id do usuário criado
  const createdUser = await UsersModel.findOne({
    where: { login: req.body.login },
      attributes: ['idUser'],
    raw : true,
    nest : true
  });

  //SALVA A CRIAÇÃO DE SENHA NO LOG DE SENHAS
  //busca quem usuário fez a alteração/criação
  const logged = await UsersModel.findOne({
    where: { login: req.body.login },
      attributes: ['login'],
    raw : true,
    nest : true
  });

  if(sistemasMarcados.length > 0) {
    sistemasMarcados.forEach(item => {
      inserirRegistroNaTabela(item); // 
    });
  } else {
    msg = "Não houve acesso para criar"
  }

  //SALVA SISTEMAS NA TABELA SISTEMASUSUÁRIOS
  function inserirRegistroNaTabela(item) {
    const idUser = createdUser.idUser
    SistemasUsuariosModel.create({
      idSys: item,
      idUser: idUser,
    }).then(() => {
        console.log(`Registro adicionado`, item, idUser);
    }).catch(err => {
        console.error(`Erro ao adicionar registro: ${err}`);
    });
  }

  //busca os dados do ip e navegador
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // Remove o prefixo ::ffff: se estiver presente
    const ipv4Address = ipAddress.replace(/^::ffff:/, '');

  //coloca os dados numa variavel
  const logSenhas = {
    userLogin: req.body.login,
    createdAlterated: 'C',
    ipAddress: ipv4Address ,
    createdAlteratedBy: logged.login
  };

  //ATUALIZA A TABELA COM O NOVO VALOR
  await LogsTrocaSenhasModel.create(logSenhas).then(() => {
    console.log("Log criado com sucesso");
  }).catch((err) => {
      console.log("erro", err);
  }) ;

  return res.json({ msg, msg_type, createdUser });
};

//ALTERAÇÃO DE USUÁRIO NO BD
exports.userUpdateBD = async (req, res) => {

  var msg, msg_type;
  const sistemasMarcados = req.body.sistemasMarcados;
  const sistemasMarcadosChange = req.body.sistemasMarcadosChange

  console.log(req.body)
  console.log(sistemasMarcados)
  console.log(sistemasMarcadosChange)

  const idBadge = req.body.cracha && req.body.cracha.trim() !== '' ? req.body.cracha : null;
  var crachaCrypto = (idBadge !== null && idBadge !== undefined && idBadge !== '') ? encryptData(idBadge) : '';

  //COLOCA O NOVO VALOR NUMA VARIAVEL
  const alteraUsuario  = {
      nameComplete: req.body.textName,
      email: req.body.textEmail,
      idDept: req.body.setorId,
      level: req.body.level,
      idStatus: req.body.statusId,
      sendEmail: req.body.recebeEmail,
      codCQ: req.body.codCQ,
      badge: crachaCrypto,
      birthdate: req.body.birthdate
  };

  // ATUALIZA A TABELA COM O NOVO VALOR
  await UsersModel.update(alteraUsuario, {
    where: {
      idUser: userId
    }
  }).then(() => {
    console.log("Usuário atualizado com sucesso");
    msg = "Usuário atualizado com sucesso";
    msg_type = "success";
  }).catch((err) => {
    console.log("erro", err);
    msg = "Houve um erro interno.";
    msg_type = "error";
  });

    //verifica se houve alteração no sistemas
    if(sistemasMarcadosChange) {
      //se houve alteração no sistemas
      SistemasUsuariosModel.destroy({
        where: {
          idUser: userId
        }
      }).then(() => {
        console.log("registros de sistemas excluido com sucesso");
      }).catch((err) => {
          console.log("erro", err);
      });
  
      if(sistemasMarcados.length > 0) {
        sistemasMarcados.forEach(item => {
          inserirRegistroNaTabela(item); // 
        });
      } else {
        msg = "Não houve acesso para criar"
      }
    
      //ATUALIZA SISTEMAS NA TABELA SISTEMASUSUÁRIOS
      function inserirRegistroNaTabela(item) {
        SistemasUsuariosModel.create({
          idSys: item,
          idUser: userId,
        }).then(() => {
            console.log(`Registro adicionado`, item, userId);
        }).catch(err => {
            console.error(`Erro ao adicionar registro: ${err}`);
        })
      }
    } else {
      console.log(`RegisNçao houve alteração de sistemas`);
    }

  return res.json({ msg, msg_type });
};


//ALTERAÇÃO DE SENHA DO USUÁRIO
exports.userAlterPassword = async (req, res) => {

  const dataAtual = new Date();

  var id = parseInt(req.body.id);
  var trocaSenha = req.body.forceChange ? 'S' : 'N';
  var idLoggeg = parseInt(req.body.idLoggeg);

  console.log(trocaSenha);
  console.log(req.body.newPasword);
  console.log(req.body.idLoggeg);

  //CRIPTOGRAFA A SENHA PARA GUARDAR NO BANCO
  var password = await bcrypt.hash(req.body.newPasword, 10);
  var msg, msg_type;

  //buscas as ultimas senhas
  const senhas = await UsersModel.findOne({
    where: { idUser: id },
      attributes: ['idUser','login','nameComplete', 'email', 'sendEmail', 'password', 'passwordOld1', 'passwordOld2', 'agePassword', 'forcedChangePassword' ],
        raw : true,
        nest : true
      });

  //COLOCA O NOVO VALOR NUMA VARIAVEL
  const novaSenha  = {
      password: password, //salva a senha nova no slot de senha
      passwordOld1: senhas.password, //salva a senha antiga no slot de senha 1
      passwordOld2: senhas.passwordOld1, // salva a senha 1 no slot de senha 2
      agePassword: dataAtual,
      forcedChangePassword: trocaSenha
  };

  // ATUALIZA A TABELA COM O NOVO VALOR
  await UsersModel.update(novaSenha, {
    where: {
      idUser: id
    }
  }).then(() => {
    msg = "Senha alterada com sucesso";
    msg_type = "success";
  }).catch((err) => {
    console.log("erro", err);
    msg = "Houve um erro interno.";
    msg_type = "error";
  });

  //SALVA A CRIAÇÃO DE SENHA NO LOG DE SENHAS
  //busca quem usuário fez a alteração/criação
  const logged = await UsersModel.findOne({
    where: { idUser: idLoggeg },
      attributes: ['login'],
    raw : true,
    nest : true
  });

  //busca os dados do ip e navegador
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  // Remove o prefixo ::ffff: se estiver presente
  const ipv4Address = ipAddress.replace(/^::ffff:/, '');
  
  const logSenhas = {
    userLogin: senhas.login,
    createdAlterated: 'A',
    ipAddress: ipv4Address ,
    createdAlteratedBy: logged.login
  };

  //ATUALIZA A TABELA COM O NOVO VALOR
  await LogsTrocaSenhasModel.create(logSenhas).then(() => {
      console.log("Log criado com sucesso");
  }).catch((err) => {
      console.log("erro", err);
  }) ;

  if(senhas.sendEmail === 'S' && id !== idLoggeg) {
    const envioEmail = sendEmailPassword(senhas.nameComplete, senhas.email, req.body.newPasword);
    console.log(envioEmail);
  }
  
  return res.json({ msg, msg_type });
};

//EXCLUSÃO DO USUÁRIO
exports.userDelete = async (req, res) => {

  var id = parseInt(req.body.id)
  var msg, msg_type;

  // Exclui as linhas correspondentes na tabela TelasPermissoesUsuariosModel
  await TelasPermissoesUsuariosModel.destroy({
    where: {
      idUser: id
    }
  });

  // Exclui as linhas correspondentes na tabela SistemasUsuariosModel
  await SistemasUsuariosModel.destroy({
    where: {
      idUser: id
    }
  });
  
  // Exclui o usuário da tabela USERS
  await UsersModel.destroy({
    where: {
      idUser: id
    }
  }).then(async () => {

   
    
    msg = "Usuário excluído com sucesso";
    msg_type = "success";
  }).catch((err) => {
    console.log("erro", err);
    msg = "Usuário relacionado com outras tabelas. Impossível deletar.";
    msg_type = "error";
  });

  return res.json({ msg, msg_type });
};

//VALIDA AS ULTIMAS 3 SENHAS
exports.userValidPassword = async (req, res) => {

  var id = parseInt(req.body.id);
  var password = req.body.newPasword;
  var validated = false;
  var compar1, compar2, compar3; 

  const senhas = await UsersModel.findOne({
    where: { idUser: id },
      attributes: ['idUser','password', 'passwordOld1', 'passwordOld2' ],
        raw : true,
        nest : true
      });

      //compara se a nova senha é igual a uma das ultimas 3 senhas.
      try {
        compar1 = bcrypt.compareSync(password, senhas.password);
      } catch (error) {
        compar1 = false;
      }
      try {
        compar2 = bcrypt.compareSync(password, senhas.passwordOld1);
      } catch (error) {
        compar2 = false;
      }
      try {
        compar3 = bcrypt.compareSync(password, senhas.passwordOld2);
      } catch (error) {
        compar3 = false;
      }

      //caso uma das comparações seja verdadeira não permite a alteração ... retorna um FALSE
      if(compar1 || compar2 || compar3) {
      } else {
        //caso todas das comparações sejas falsas permite a alteração ... retorna um TRUE
        validated = true; //
      }

  return res.json({ validated });
};

//verifica idade e troca de senha
exports.pwdAgeforce = async (req, res) => {

  var id = parseInt(req.body.id)

  const resposta = await UsersModel.findOne({
    where: { idUser: id },
      attributes: ['agePassword', 'forcedChangePassword' ],
        raw : true,
        nest : true
      });

  return res.json({resposta});
};

//BUSCA O DEPARTAMENTO E STATUS DO USER
exports.deppto = async (req, res) => {

  const deptto = await DepartmentsModel.findAll({
    attributes: ['idDept', 'department'],
    raw : true,
    nest : true,
    order: [['department', 'ASC']]
  });

  return res.json({ deptto });

};

//LISTAGEM DOS USUÁRIOS *********************************************************************************************************************************
exports.userActivyDirectory = async (req, res) => {

  const inputFilePath = 'public/files/usersAd.json';

  // Lê os dados do arquivo JSON
  const jsonData = fs.readFileSync(inputFilePath, 'utf-8');
  const usersArray = JSON.parse(jsonData);
  
  // Inicializa os arrays para Exists e NotExists
  const existsArray = [];
  const notExistsArray = [];

  try{

    // Verifica a existência de cada sAMAccountName na tabela UsersModel
    for (const userObj of usersArray) {
      const { sAMAccountName } = userObj;
      const user = await UsersModel.findOne({ where: { login: sAMAccountName } });
    
      if (user) {
        existsArray.push(sAMAccountName);
      } else {
        notExistsArray.push(sAMAccountName);
      }
    }
    
    // Salva os resultados em um novo arquivo JSON
    const results = {
      Exists: existsArray,
      NotExists: notExistsArray
    };

    console.log(existsArray)
    console.log(notExistsArray)

      return res.json({ existsArray, notExistsArray });
  } catch (error) {
      console.log("Houve um erro interno", error);
      return res.status(500).json({ error: "Internal server error." });
  }
};

//CRIA GRUPOS EMAILS
exports.emailsGroupCreate = async (req, res) => {

  var {nome, descricao, createdBy} = req.body.dados;
  console.log(nome, descricao, createdBy)

  const novoValor = {
      nome,
      descricao,
      createdBy
  }

  // ATUALIZA A TABELA COM O NOVO VALOR
  await EmailsGruposModel.create(novoValor)
  .then(() => {
      console.log("Grupo criado com sucesso");
      msg = "Grupo criado com sucesso";
      msg_type = "success";
      return res.json({ msg, msg_type });
  })
  .catch((err) => {
      console.log("erro", err);
      msg = "Houve um erro interno.";
      msg_type = "error";
      return res.json({ msg, msg_type });
    }
  );
};

//CHECA SE EXISTE GRUPOS EMAILS
exports.grupoEmailFind = async (req, res) => {

  var nome = req.body.nome

  const isUsing = await EmailsGruposModel.findOne({
      where: {
        nome
      }
  });

  if(isUsing) {
      msg = "Grupo já existe.";
      msg_type = "existe";
      return res.json({ msg, msg_type });
  } else {
      msg = "";
      msg_type = "hidden";
      return res.json({ msg, msg_type });
  }
};

//LISTA OS GRUPOS EMAILS
exports.grupoEmailList = async (req, res) => {

  try {
      const grupos = await EmailsGruposModel.findAll({
          include: [{
              model: UsersModel,
              attributes: ['login'],
              as: 'createdByUser'
          }],
          raw: true,
          nest: true,
      }); //BUSCAR O USUÁRIO NA TABELA USER 

      return res.json({grupos});
      
  } catch (error) {
      console.log("Houve um erro interno", error);
      return res.status(500).json({ error: "Internal server error." });
  }   
};

//EXCLUSÃO DE GRUPOS EMAILS
exports.grupoEmailDelete = async (req, res) => {

  var id = parseInt(req.body.id)

  await EmailsGruposUsuariosModel.destroy({
    where: {
        idGrp: id
    }
  });

  await EmailsGruposModel.destroy({
      where: {
          idGrp: id
      }
  }).then(() => {
      msg = "Grupo excluído com sucesso";
      msg_type = "success";
  }).catch((err) => {
      console.log("erro", err);
      msg = "Houve um erro interno.";
      msg_type = "error";
  });

  return res.json({ msg, msg_type });
};

//EDITA GRUPOS EMAILS
exports.emailsGroupEdit = async (req, res) => {

  var {nome, descricao, createdBy, idGrp} = req.body.dados;

  //primeiro verifica se o nome não está em uso por outro grupo
  const isUsing = await EmailsGruposModel.findOne({
    where: {
      nome
    }
  });

  if(isUsing) {
    if(isUsing.idGrp !== idGrp ) {
        msg = "Grupo já existe.";
        msg_type = "existe";
        return res.json({ msg, msg_type });
    } 
  }
    const novoValor = {
      nome,
      descricao,
      createdBy
    }

    // ATUALIZA A TABELA COM O NOVO VALOR
    await EmailsGruposModel.update(novoValor, {
      where: {
        idGrp
      }
    })
    .then(() => {
        console.log("Grupo alterado com sucesso");
        msg = "Grupo alterado com sucesso";
        msg_type = "success";
        return res.json({ msg, msg_type });
    })
    .catch((err) => {
        console.log("erro", err);
        msg = "Houve um erro interno.";
        msg_type = "error";
        return res.json({ msg, msg_type });
      }
    );
};

//CRIA GRUPOS EMAILS
exports.emailsGroupFindUsers = async (req, res) => {

  var {idGrp} = req.body;

  try {
    const emailsUsers = await EmailsGruposUsuariosModel.findAll({
        where: {
          idGrp: idGrp
        },
        include: [{
          model: UsersModel,
          attributes: ['login'],
          as: 'createdByUser'
        },
        {
            model: UsersModel,
            attributes: ['idUser','email','login'],
            as: 'emailsUser'
        }],
        raw: true,
        nest: true,
    }); //BUSCAR O USUÁRIO NA TABELA USER 

    return res.json({emailsUsers});
    
  } catch (error) {
      console.log("Houve um erro interno", error);
      return res.status(500).json({ error: "Internal server error." });
  }  
};

//EXCLUSÃO DE EMAILS DO GRUPO
exports.grupoEmailDeleteUsers = async (req, res) => {

  var idGrpUser = parseInt(req.body.idGrpUser)

  await EmailsGruposUsuariosModel.destroy({
      where: {
        idGrpUser
      }
  }).then(() => {
      msg = "Usuário excluído com sucesso";
      msg_type = "success";
  }).catch((err) => {
      console.log("erro", err);
      msg = "Houve um erro interno.";
      msg_type = "error";
  });

  return res.json({ msg, msg_type });
};

//ADIÇÃO DE DE EMAILS DO GRUPO
exports.grupoEmailAdd = async (req, res) => {

  var {idGpr, selectedEmail, idUser} = req.body

  const dados = {
    idGrp: idGpr,
    idUser: selectedEmail,
    createdUpdatedBy: idUser
  }

  await EmailsGruposUsuariosModel.create(dados)
  .then(() => {
      msg = "Email inserido com sucesso";
      msg_type = "success";
  }).catch((err) => {
      console.log("erro", err);
      msg = "Houve um erro interno.";
      msg_type = "error";
  });

  return res.json({ msg, msg_type });
};

//BUSCA DOS SISTEMAS
exports.findSystems = async (req, res) => {

  try {
    const sistemas = await SistemasModel.findAll();

    return res.json({sistemas});
    
  } catch (error) {
      console.log("Houve um erro interno", error);
      return res.status(500).json({ error: "Internal server error." });
  }   
};

//BUSCA DOS SISTEMAS do usuário
exports.findSystemsUser = async (req, res) => {

  const { idUser } = req.body;

  try {
    const sistemasUsuário = await SistemasUsuariosModel.findAll({
      attributes: ['idSys'],
      where: {
        idUser: idUser
      }
    });

    return res.json({sistemasUsuário});
    
  } catch (error) {
      console.log("Houve um erro interno", error);
      return res.status(500).json({ error: "Internal server error." });
  }   
};

//BUSCA DOS SISTEMAS do departamento
exports.findSystemsDepartments = async (req, res) => {
  
  const { idDept } =  req.body;

  try {
    const sistemasDepartamentos = await SistemasDepartamentosModel.findAll({
      attributes: ['idSys'],
      where: {
        idDept: idDept
      }
    });

    return res.json({sistemasDepartamentos});
    
  } catch (error) {
      console.log("Houve um erro interno", error);
      return res.status(500).json({ error: "Internal server error." });
  }   
};









