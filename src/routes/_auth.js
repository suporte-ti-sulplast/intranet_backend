const express = require("express");
const auth = express.Router();
const { authenticateUser}  = require('../functions/authLdap')

const { Op, literal } = require('sequelize');
const LogsAcessos = require('../../models/LogsAcessos');
const DepartmentsModel = require('../../models/Departamentos');
const StatusModel = require('../../models/Status');
const Users = require('../../models/Usuarios');
const Settings = require('../../models/Configuracoes');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const { text } = require("body-parser");
require('dotenv').config();

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


const jwtConfig = {
    expiresIn: '4d',  // <- Faz com que o token expire depois de 4 dias
    algorithm: 'HS256',  // <- Indica o algoritmo de hash HS256 para criptografia
};

auth.use(express.json()); 

//PAGINA INICIAL DE LOGIN
auth.post('/', async (req, res) => {

    var idStatus = 0;
    var token;
    var logDescription, userStatus, passwordMatch, fail, idUser, idDept, inactivityTime;

    var userLogin, token;
    var userOK = null;
    const { login, password, screen } = req.body;
    console.log(login, password, screen)

/*     try {
        const authenticate = await authenticateUser(login, password )
        console.log(authenticate)
    } catch (error) {
        console.log(error)
    } */


    const loginErrorAttempts = await Settings.findOne({
        where: { descriptionSet: 'loginErrorAttempts' },
        attributes: ['valueSet'],
    });

    const errorAttempts = parseInt(loginErrorAttempts.valueSet)

    //variaval userok
    // não tem user => 1
    // tem, mas está diferente de ativo => 2
    // tem, mas a senha está errada => 3
    // tem, mas errou a senha e foi bloqueado => 4
    // tudo certo => 5

     //usar qdo precisar criptografar uma senha
        var passworddd = await bcrypt.hash(password, 10);

        console.log("Login q tentou acessar", req.body.login)
        console.log("Senha sem criptografia", req.body.password)
        console.log("Senha criptografada", passworddd)

 
    //BUSCAR USERR E SENNHA NO BANCO
    const user = await Users.findOne({
        where: { login: login },
        attributes: ['idUser', 'login', 'password'],
        include: [
            { 
                model: DepartmentsModel,
                attributes: ['idDept','inactivityTime'],
            },
            {
                model: StatusModel,
                    attributes: ['idStatus','status'],
            }],
        raw : true,
        nest : true
      });

      console.log(user)

      if(user) {
        idUser = user.idUser;
        idDept = user.Departamento.idDept;
        inactivityTime = user.Departamento.inactivityTime;
        idStatus = user.Status.idStatus;
        userStatus = user.Status.status
      }

    if(!user)
        { //se não existir usuário       
            userOK = 1;
            userLogin = "";
            token = "";
        } 
        else if( idStatus != 1) 
        {  //se tm user mas o status for diferente de ativo

            if(idStatus === 3){
                userOK = 4;
                userLogin = "";
                token = "";
            } else {
                userOK = 2;
                userLogin = "";
                token = "";
            }
        }  
        else 
        { // existir usuário

        //VALIDA SE AS SENHAS BATEM
        passwordMatch = bcrypt.compareSync(password, user.password);

        if(!passwordMatch)
        { //se as senhas não baterem
            userOK = 3;
            userLogin = "";
            token = "";       
        }
            else
            { //se as senhas bateren
            try 
            {
                const secret = process.env.SECRET;

                token = jwt.sign(
                    {
                     user: user.login,
                    },
                    secret,
                    jwtConfig,
                )
            }
            catch (error)
            {
                console.log(error);
            }  
            userOK = 5;
            userLogin = user.login;
            token = token;
        }
    }

    //SALVA AS INFORMAÇÕES DE LOGIN NA TABELA LOG DE ACESSOS **********************************************************************************
    //COLOCA O NOVO VALOR NUMA VARIAVEL
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // Remove o prefixo ::ffff: se estiver presente
    const ipv4Address = ipAddress.replace(/^::ffff:/, '');
    const userAgent = req.headers['user-agent']; // captura o navegador

    const lastAccessLog = await LogsAcessos.findOne({
    attributes: ['idLog', 'userLogin','failedAttempts','status'],
    where: {
        userLogin: login,
    },
    order: [['idLog', 'DESC']], // Ordene pelo campo 'createdAt' em ordem decrescente
    });

    console.log("Numero de tentativas erradas", lastAccessLog);

    //verifica se não existe o usuário 
    if (!user)
    {
        logDescription = "usuário não encontrado"
        userStatus = "NA"
        fail = "0"
    };

    //verifica se o usuário existe, mas as senhas não batem, ou se o usuário é diferente de ativo
    if (user && ( !passwordMatch || idStatus != 1))
    {
        if(!passwordMatch) //se for o caso da senha estar errada
        {
            logDescription = "senha errada"
        };
        if(idStatus != 1) //se for o caso do usuário não estar ativo
        {
            logDescription = "usuáro não ativo"
        };

        //verifica se já tem esse usuário no log de acessos e qual o numero de tentaivas erradas
        if(lastAccessLog)
        {
            //se tem pega o número de tentativas erradas e soma + 1
            fail = lastAccessLog.failedAttempts === 5 || lastAccessLog.status === 'Bloqueado' ? 0 : lastAccessLog.failedAttempts + 1;
            if(fail === errorAttempts)
            {  
                try 
                {
                    const bloq = await Users.update(
                      {
                        idStatus: 3, // Define o status para 3 -> bloqueado
                      },
                      {
                        where: {
                            login: login, // Filtra pelo ID do usuário que você deseja atualizar
                        },
                      }
                    );
                    console.error('usuário bloqueado!');
                }
                catch (error)
                {
                    console.error('Erro ao atualizar o status do usuário:', error);
                    throw error;
                }       
              /*   fail = 0; */
                userOK = 4;
            }
        }
        else
        {
            // se não tem inicia o contador de tentativas erradas
            fail = 1;
        }
    }

    //se chegou até aqui é porque está tudo ok, então zera o contador de erros.
    if(user && passwordMatch && idStatus === 1)
    {
        logDescription = "tudo certo"
        fail = 0; //reseta o numero de erros
    }

    const novoAcesso  = {
        userLogin: req.body.login,
        status: fail === errorAttempts ? 'Bloqueado' : userStatus,
        action: ( userOK === 5 ? "permitido" : "negado" ),
        description: logDescription,
        failedAttempts: fail,
        ipAddress: ipv4Address,
        browser: userAgent,
        screen: `${screen.larguraTela} - ${screen.alturaTela} - ${screen.browserDPI} `,
    };

    //ATUALIZA A TABELA COM O NOVO VALOR
    await LogsAcessos.create(novoAcesso).then(() => {
    }).catch((err) => {
        console.log("erro", err);
    }) ; 

    return res.json(
        {   
            userOK,
            userLogin,
            token,
            idUser,
            idDept,
            inactivityTime
        }
    );
});

//PAGINA INICIAL DE LOGIN POR CRACHA
auth.post('/cracha', async (req, res) => {

    const { cracha } = req.body
    var idStatus = 0;
    var token;
    var logDescription, userStatus, fail, idUser, idDept, inactivityTime;

    var token;
    var userLogin = userOK = login = null;

    //busca todos e apenas usuários que tem crachá e traz o crachá descriptografado
    const decryptedUserCracha2 = await Users.findAll({
        where: {
            badge: {
            [Op.not]: null, // Ou qualquer outra condição que você precise
          },
        },
        attributes: [
          'idUser',
          ['badge', 'decryptedIdBadge'], // Renomeando o campo para 'decryptedIdBadge'
        ],
        raw: true,
        nest: true,
      }).then(users => users.map(user => ({ idUser: user.idUser, decryptedIdBadge: decryptIdBadge(user.decryptedIdBadge) })));
      
    //procura na lista se exite o crachá usado no login e se existe traz de volta qual é o usuário
    const foundUser = decryptedUserCracha2.find(user => user.decryptedIdBadge === cracha);
    const userId = foundUser ? foundUser.idUser : 0;

    //BUSCA o USER E dados NO BANCO
    const userCracha = await Users.findOne({
        where: { idUser: userId },
        attributes: ['idUser', 'login', 'password'],
        include: [
            { 
                model: DepartmentsModel,
                attributes: ['idDept','inactivityTime'],
            },
            {
                model: StatusModel,
                    attributes: ['idStatus','status'],
            }],
        raw : true,
        nest : true
      });

    const loginErrorAttempts = await Settings.findOne({
        where: { descriptionSet: 'loginErrorAttempts' },
        attributes: ['valueSet'],
    });

    const errorAttempts = parseInt(loginErrorAttempts.valueSet)

    //variaval userok
    // pode ter user, mas não ser permitido o login por cracha => 1
    // login permitido por crachá, mas está diferente de ativo => 2

    // login permitido por crachá, está bloqueado => 4
    // tudo certo => 5

     //usar qdo precisar criptografar uma senha
        var passworddd = await bcrypt.hash(cracha, 10);

        console.log("Login q tentou acessar", cracha)
        console.log(userCracha)

    if(userCracha) {
        idUser = userCracha.idUser;
        idDept = userCracha.Departamento.idDept;
        inactivityTime = userCracha.Departamento.inactivityTime;
        idStatus = userCracha.Status.idStatus;
        userStatus = userCracha.Status.status;
        login = userCracha.login;
    }

    if(!userCracha)
        { //se não existir crachá    
            login = cracha;
            userOK = 1;
            userLogin = "";
            token = "";
        } 
            else if( idStatus != 1) 
        {  //se tm crachá mas o status for diferente de ativo

            if(idStatus === 3){ //usuário bloqueado
                userOK = 4;
                userLogin = "";
                token = "";
            } else {
                userOK = 2; //usuário inativo
                userLogin = "";
                token = "";
            }
        }  
            else 
        { // existir usuário

            try 
            {
                const secret = process.env.SECRET;

                token = jwt.sign(
                    {
                        user: userCracha.login,
                    },
                    secret,
                    jwtConfig,
                )
            }
            catch (error)
            {
                console.log(error);
            }  
            userOK = 5;
            userLogin = userCracha.login;
            token = token;
    }

    //SALVA AS INFORMAÇÕES DE LOGIN NA TABELA LOG DE ACESSOS **********************************************************************************
    //COLOCA O NOVO VALOR NUMA VARIAVEL
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // Remove o prefixo ::ffff: se estiver presente
    const ipv4Address = ipAddress.replace(/^::ffff:/, '');
    const userAgent = req.headers['user-agent']; // captura o navegador

    const lastAccessLog = await LogsAcessos.findOne({
    attributes: ['idLog', 'userLogin','failedAttempts'],
    where: {
        userLogin: login,
    },
    order: [['idLog', 'DESC']], // Ordene pelo campo 'createdAt' em ordem decrescente
    });

   //verifica se não existe o usuário 
    if (!userCracha)
    {
        logDescription = "usuário não encontrado"
        userStatus = "NA"
        fail = "0"
    };

    //verifica se o usuário existe, mas as senhas não batem, ou se o usuário é diferente de ativo
    if (userCracha && ( idStatus != 1))
    {
        if(idStatus != 1) //se for o caso do usuário não estar ativo
        {
            logDescription = "usuáro não ativo"
        };

        //verifica se já tem esse usuário no log de acessos e qual o numero de tentaivas erradas
        if(lastAccessLog)
        {
            //se tem pega o número de tentativas erradas e soma + 1
            fail = lastAccessLog.failedAttempts + 1;
            if(fail === errorAttempts)
            {  
                try 
                {
                    const bloq = await Users.update(
                      {
                        idStatus: 3, // Define o status para 3 -> bloqueado
                      },
                      {
                        where: {
                            login: login, // Filtra pelo ID do usuário que você deseja atualizar
                        },
                      }
                    );
                    console.error('usuário bloqueado!');
                }
                catch (error)
                {
                    console.error('Erro ao atualizar o status do usuário:', error);
                    throw error;
                }       
                fail = 0;
                userOK = 4;
            }
        }
        else
        {
            // se não tem inicia o contador de tentativas erradas
            fail = 1;
        }
    }

    //se chegou até aqui é porque está tudo ok, então zera o contador de erros.
    if(userCracha && idStatus === 1)
    {
        logDescription = "tudo certo"
        fail = 0; //reseta o numero de erros
    }

    const novoAcesso  = {
        userLogin: login,
        status: userStatus,
        action: ( userOK === 5 ? "permitido" : "negado" ),
        description: logDescription,
        failedAttempts: fail,
        ipAddress: ipv4Address,
        browser: userAgent,
    };

    //ATUALIZA A TABELA COM O NOVO VALOR
    await LogsAcessos.create(novoAcesso).then(() => {
    }).catch((err) => {
        console.log("erro", err);
    });

    return res.json(
        {   
            userOK,
            userLogin,
            token,
            idUser,
            idDept,
            inactivityTime
        }
    );
});

module.exports = auth