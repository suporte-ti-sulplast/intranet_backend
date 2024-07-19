const e = require('cors');
const nodemailer = require('nodemailer');

//ENVIO DE EMAIL PARA ALTERAÇÃO DE SENHA
function sendEmailPassword(nameComplete, e_mail, password) {

    const nome = nameComplete.split(' '); 
    const email = e_mail;
    const senha = password;

    const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.mailgun.org',
    port: process.env.MAIL_PORT || 587,
    secure: false, // Para TLS
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  async function sendEmail() {
    try {
      const mailSent = await transporter.sendMail({
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: "Alteração de senha da INTRANET",
        html: `
          <br>
          <h1 style="background-color: green; color: white;"><strong>SENHA ALTERADA!</strong>
          </h1>
          <p>Olá, <strong>${nome[0].toUpperCase()}</strong>.</p>
          <p>Sua senha foi alterada com sucesso!</p>
          <p>Sua nova senha é:</p>
          <p><strong>${senha}</strong></p>
          <p>Caso você não tenha feito essa alteração, entre em contato com o TI pelo ramal 114.</p>
          <p><strong>Este é um e-mail gerado automaticamente pelo sistema INTRANET SULPLAST, favor não responder.</strong></p>
          <p  style="background-color: black; color: white;" >At.te, TECNOLOGIA DA INFORMAÇÃO</strong></p>
        `,
      });
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      return ('Erro ao enviar e-mail!');
    }
  }
  
  sendEmail();

  return ('Email enviado com sucesso!');

}

//ENVIO DE EMAIL PARA CRIAÇÃO EDIÇÃO DE IT
function sendEmailIT(users, it, tipo){

  const sendEmailNewIT = async (users, it, tipo) => {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.mailgun.org',
      port: process.env.MAIL_PORT || 587,
      secure: false, // Para TLS
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  
    const successfulEmails = [];
    const failedEmails = [];
  
    for (const user of users) {
      try {
        await sendEmail(transporter, user, it, tipo);
        successfulEmails.push(user.nameComplete);
      } catch (error) {
        console.error(`Erro ao enviar e-mail para ${user.nameComplete}:`, error);
        failedEmails.push(user.nameComplete);
      }
    }
  
    if (successfulEmails.length > 0) {
      console.log(`E-mails enviados com sucesso para: ${successfulEmails.join(', ')}`);
    }
  
    if (failedEmails.length > 0) {
      console.error(`Erro ao enviar e-mails para: ${failedEmails.join(', ')}`);
    }
  };
  
  const sendEmail = async (transporter, user, it, tipo) => {
    const { nameComplete, email } = user;
    let texto;
    if (tipo === 'novaIT') {
      texto = 'Há uma nova Instrução de Trabalho disponível para seu setor!';
    } else {
      texto = 'Houve uma alteração na Instrução de Trabalho:';
    }
  
    try {
      const mailSent = await transporter.sendMail({
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: tipo === 'novaIT' ? 'Nova IT' : 'Alteração IT',
        html: `
          <br>
          <h1 style="background-color: green; color: white;"><strong>${tipo === 'novaIT' ? 'Nova IT' : 'Alteração IT'}</strong>
          </h1>
          <p>Olá, <strong>${nameComplete.split(' ')[0].toUpperCase()}</strong>.</p>
          <p>${texto}</p>
          <p  style="color: red"><strong>${it}</strong></p>
          <p>Você pode acessar através da INTRANET -> SGIs -> ITs.</p>
          <p><strong>Este é um e-mail gerado automaticamente pelo sistema INTRANET SULPLAST, favor não responder.</strong></p>
          <p  style="background-color: black; color: white;" >At.te, TECNOLOGIA DA INFORMAÇÃO</strong></p>
        `,
      });
      console.log('Email enviado com sucesso para: ', email);
      return 'Email enviado com sucesso!';
    } catch (error) {
      throw new Error('');
    }
  };

  sendEmailNewIT(users, it, tipo)
  return 'Email enviados com sucesso!';
} 

//ENVIO DE EMAIL PARA SOLICITAÇÃO DE VOUCHER
function sendEmailVoucher(horas, email) {

  const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.mailgun.org',
  port: process.env.MAIL_PORT || 587,
  secure: false, // Para TLS
  auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  async function sendEmail() {
    try {
      const mailSent = await transporter.sendMail({
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: "Gerar Voucher de Wifi",
        html: `
          <br>
          <h1 style="background-color: green; color: white;"><strong>GERAR VOUCHER!</strong>
          </h1>
          <p>Olá, <strong>Sr. Leandro</strong>.</p>
          <p>Favor gerar novos vouchers de wifi para ${horas} horas.</p>
          <p><strong>Este é um e-mail gerado automaticamente pelo sistema INTRANET SULPLAST, favor não responder.</strong></p>
          <p  style="background-color: black; color: white;" >At.te, TECNOLOGIA DA INFORMAÇÃO</strong></p>
        `,
      });
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      return ('Erro ao enviar e-mail!');
    }
  }

  sendEmail();

  return ('Email enviado com sucesso!');

};

//ENVIO DE EMAIL PARA SOLICITAÇÃO ALERTA DE TEMPERATURA
function sendEmailTempRackSalaTI(equipamento, local, category, direcaoMovimento, estado, temperatura, destinatario) {

  const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.mailgun.org',
  port: process.env.MAIL_PORT || 587,
  secure: false, // Para TLS
  auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  async function sendEmail() {
    try {
      const mailSent = await transporter.sendMail({
        from: process.env.MAIL_FROM_ADDRESS,
        to: destinatario,
        subject: `Alteração de ${category}`,
        html: `
          <br>
          <h1 style="background-color: ${estado === 'DESASTRE' ? '#e45959' : 
            estado === 'ALTO' ? '#e97659' : 
            estado === 'MODERADO' ? '#ffa059' : 
            estado === 'ATENÇÃO' ? '#ffc859' : 
            'green'}; color: white;"><strong>ALERTA!</strong>
          </h1>
          <p>Temperatura do equipamento: <strong>${equipamento}</strong>, localizado em:  <strong>${local}</strong>.</p>
          <p>Está em: <strong>${temperatura}°C</strong></p>
          <p>${direcaoMovimento}
            <span
              style="color: ${estado === 'DESASTRE' ? '#e45959' : 
                  estado === 'ALTO' ? '#e97659' : 
                  estado === 'MODERADO' ? '#ffa059' : 
                  estado === 'ATENÇÃO' ? '#ffc859' : 
                  'green'};"
            ><strong>${estado}</strong></span>
         </p>
          <p><strong>Este é um e-mail gerado automaticamente pelo sistema INTRANET SULPLAST, favor não responder.</strong></p>
        <p  style="background-color: black; color: white;" >At.te, TECNOLOGIA DA INFORMAÇÃO</strong></p>
        `,
      });
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      return ('Erro ao enviar e-mail!');
    }
  }

  sendEmail();

  return ('Email enviado com sucesso!');

};

//ENVIO DE EMAIL PARA ALTERAÇÃO DE SENHA
function sendSenhasPDF(user, pdfBuffer) {

  const { nameComplete, email } = user;
  const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.mailgun.org',
  port: process.env.MAIL_PORT || 587,
  secure: false, // Para TLS
  auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  async function sendEmail() {
    try {
      const mailSent = await transporter.sendMail({
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `PDF do cofre de senhas`,
        attachments: [
            {
                filename: 'relatorio cofre de senhas.pdf', // Nome do anexo
                content: pdfBuffer // Conteúdo do PDF em buffer
            }
        ],
        html: `
          <br>
          <h1 style="background-color: green; color: white;"><strong>RELATÓRIO COFRE DE SENHAS!</strong>
          </h1>
          <p>Olá, <strong>${nameComplete.split(' ')[0].toUpperCase()}</strong>.</p>
          <p>Conform solicitado, segue anexo, o PDF com a lista do cofre de senhas.</p>
          <p>Lembre-se de que se for feito o download é importante não deixar salvo na máquina local.</p>
          <p><strong>Este é um e-mail gerado automaticamente pelo sistema INTRANET SULPLAST, favor não responder.</strong></p>
          <p  style="background-color: black; color: white;" >At.te, TECNOLOGIA DA INFORMAÇÃO</strong></p>
        `,
      });
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      return ('Erro ao enviar e-mail!');
    }
  }

  sendEmail();

  return ('Email enviado com sucesso!');

};  

//ENVIO DE EMAIL PARA NOVO ARQUIVO FOLHA PAGAMENTO
function sendEmailRhFolha(users){

  const sendEmailFolha = async (users) => {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.mailgun.org',
      port: process.env.MAIL_PORT || 587,
      secure: false, // Para TLS
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  
    const successfulEmails = [];
    const failedEmails = [];
  
    for (const user of users) {
      try {
        await sendEmail(transporter, user);
        successfulEmails.push(user.nameComplete);
      } catch (error) {
        console.error(`Erro ao enviar e-mail para ${user.nameComplete}:`, error);
        failedEmails.push(user.nameComplete);
      }
    }
  
    if (successfulEmails.length > 0) {
      console.log(`E-mails enviados com sucesso para: ${successfulEmails.join(', ')}`);
    }
  
    if (failedEmails.length > 0) {
      console.error(`Erro ao enviar e-mails para: ${failedEmails.join(', ')}`);
    }
  };
  
  const sendEmail = async (transporter, user) => {
    const { nameComplete, email } = user;
  
    try {
      const mailSent = await transporter.sendMail({
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: 'Novo arquivo de folha',
        html: `
          <br>
          <h1 style="background-color: green; color: white;"><strong>Novo arquivo de folha</strong>
          </h1>
          <br>
          <p>Olá, <strong>${nameComplete.split(' ')[0].toUpperCase()}</strong>.</p>
          <p>Novo arquivo de folha de pagamento gerado.</p>
          <p>Você pode acessar através da INTRANET -> RH -> Aplicações -> Conversor dados folha.</p>
          <p><strong>Este é um e-mail gerado automaticamente pelo sistema INTRANET SULPLAST, favor não responder.</strong></p>
          <p  style="background-color: black; color: white;" >At.te, TECNOLOGIA DA INFORMAÇÃO</strong></p>
        `,
      });
      console.log('Email enviado com sucesso para: ', email);
      return 'Email enviado com sucesso!';
    } catch (error) {
      throw new Error('');
    }
  };

  sendEmailFolha(users)
  return 'Email enviados com sucesso!';
} 


module.exports = {sendEmailRhFolha, sendEmailPassword, sendEmailIT, sendEmailVoucher, sendEmailTempRackSalaTI, sendSenhasPDF};