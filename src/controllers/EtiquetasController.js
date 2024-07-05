const dbDelsoft = require('../conections/dbDelsoft');
var  msg, msg_type
const zebraRede = require('../functions/zebraPrinterRede');
const zebraPrinterLocal = require('../functions/zebraPrinterLocal');
const PrintersModel = require('../../models/Impressoras');
const { centralizarString } = require('../functions/manipuladorStrings');

//IMPRIME A ETIQUETA DA QUALIDADE  ************************************************************************************************************
exports.coqLabelsPrintQuali = async (req, res) => {

    const {printerName, coq, data, qtdade} = req.body
    let printer;
    let cq = '';

    //tratamento caso o código cq venha vazio 'undefined'
    if(coq === undefined) {
        cq = 'XXXX';
    } else {
        cq = coq;
    };

    try {
        printer = await PrintersModel.findOne({
            attributes: ['printerName', 'model','ip','netUsb'],
            where: {
                printerName: printerName
            },
            raw: true,
            nest: true,
        });
    } catch (error) {
        console.log("Houve um erro interno", error);
        return res.status(500).json({ error: "Internal server error." });
    };

    let margemSuperior;

    if(printer.netUsb === 'usb'){
        margemSuperior = 0;
    } else {
        margemSuperior = 0;
    };

    const zplData = '^XA \n' + // Inicia o arquivo

    '^LH0,'+ margemSuperior + '\n' +
    '^CI28\n' + // Define a codificação UTF-8

    '^FX \n' +
    '^CF0,60 \n' +
    '^FO25,35^FD' + cq + '^FS \n' +
    '^CF0,30 \n' +
    '^FO25,105^FD' + data + '^FS \n' +

    '^FX \n' +
    '^CF0,60 \n' +
    '^FO240,35^FD' + cq + '^FS \n' +
    '^CF0,30 \n' +
    '^FO240,105^FD' + data + '^FS \n' +

    '^FX \n' +
    '^CF0,60 \n' +
    '^FO445,35^FD' + cq + '^FS \n' +
    '^CF0,30 \n' +
    '^FO445,105^FD' + data + '^FS \n' +

    '^FX \n' +
    '^CF0,60 \n' +
    '^FO655,35^FD' + cq + '^FS \n' +
    '^CF0,30 \n' +
    '^FO655,105^FD' + data + '^FS \n' +

    '^XZ'; // Fecha o arquivo

    if(printer.netUsb === 'usb'){
        zebraPrinterLocal(zplData, qtdade, printer.printerName, printer.ip) 
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        }); 
    } else {
        zebraRede(zplData, qtdade, printer.ip)
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        });
    };
};

//IMPRIME A ETIQUETA DA RASTREABILIDADE  ************************************************************************************************************
exports.coqLabelsPrintRastreabilidade = async (req, res) => {

    const {printerName, linha1, data, qtdade} = req.body
    let printer;

    try {
        printer = await PrintersModel.findOne({
            attributes: ['printerName', 'model','ip','netUsb'],
            where: {
                printerName: printerName
            },
            raw: true,
            nest: true,
        });
    } catch (error) {
        console.log("Houve um erro interno", error);
        return res.status(500).json({ error: "Internal server error." });
    };

    let margemSuperior;

    if(printer.netUsb === 'usb'){
        margemSuperior = 10;
    } else {
        margemSuperior = 0;
    };

    const zplData = '^XA \n' + // Inicia o arquivo

    '^LH0,'+ margemSuperior + '\n' +
    '^CI28\n' + // Define a codificação UTF-8

    '^FX \n' +
    '^CF0,60 \n' +
    '^FO65,35^FD' + linha1 + '^FS \n' +
    '^CF0,30 \n' +
    '^FO45,105^FD' + data + '^FS \n' +

    '^FX \n' +
    '^CF0,60 \n' +
    '^FO280,35^FD' + linha1 + '^FS \n' +
    '^CF0,30 \n' +
    '^FO260,105^FD' + data + '^FS \n' +

    '^FX \n' +
    '^CF0,60 \n' +
    '^FO485,35^FD' + linha1 + '^FS \n' +
    '^CF0,30 \n' +
    '^FO465,105^FD' + data + '^FS \n' +

    '^FX \n' +
    '^CF0,60 \n' +
    '^FO695,35^FD' + linha1 + '^FS \n' +
    '^CF0,30 \n' +
    '^FO675,105^FD' + data + '^FS \n' +

    '^XZ'; // Fecha o arquivo

    if(printer.netUsb === 'usb'){
        zebraPrinterLocal(zplData, qtdade, printer.printerName, printer.ip) 
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        }); 
    } else {
        zebraRede(zplData, qtdade, printer.ip)
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        });
    };
};

//IMPRIME A ETIQUETA DA CURA   ************************************************************************************************************
exports.coqLabelsPrintCura = async (req, res) => {

    const {printerName, ano, qtdade} = req.body

    let printer;

    try {
        printer = await PrintersModel.findOne({
            attributes: ['printerName', 'model','ip','netUsb'],
            where: {
                printerName: printerName
            },
            raw: true,
            nest: true,
        });
    } catch (error) {
        console.log("Houve um erro interno", error);
        return res.status(500).json({ error: "Internal server error." });
    };
    
    let margemSuperior;

    if(printer.netUsb === 'usb'){
        margemSuperior = 15;
    } else {
        margemSuperior = 0;
    };
    
    const zplData = '^XA \n' + // Inicia o arquivo

    '^LH0,'+ margemSuperior + '\n' +
    '^CI28\n' + // Define a codificação UTF-8
    '^FO145,0^GB550,55,5^FS' + // Adiciona a caixa gráfica com fundo preto

    '^CF0,36^FO130,15^FB600,1,0,C^FDINÍCIO DA CURA DO PRODUTO^FS' +
    '^CF0,35\n' +
    '^FO100,77^FD' + 'Data: ____/_____/ ' + ano + '    Hora: ____:____' + '^FS \n' +
    '^CF0,30 \n' +
    '^FO240,132^FD' + 'Doc. de Ref. Folha de Processo' + '^FS \n' +

    '^XZ'; // Fecha o arquivo

    if(printer.netUsb === 'usb'){
        zebraPrinterLocal(zplData, qtdade, printer.printerName, printer.ip) 
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        }); 
    } else {
        zebraRede(zplData, qtdade, printer.ip)
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        });
    };
};

//IMPRIME A ETIQUETA DA CURA2   ************************************************************************************************************
exports.coqLabelsPrintCuraEstufa = async (req, res) => {

    const {printerName, ano, qtdade} = req.body
    console.log(ano)
    let printer;

    try {
        printer = await PrintersModel.findOne({
            attributes: ['printerName', 'model','ip','netUsb'],
            where: {
                printerName: printerName
            },
            raw: true,
            nest: true,
        });
    } catch (error) {
        console.log("Houve um erro interno", error);
        return res.status(500).json({ error: "Internal server error." });
    };
    
    let margemSuperior;

    if(printer.netUsb === 'usb'){
        margemSuperior = 8;
    } else {
        margemSuperior = 0;
    };
    
    const zplData = '^XA \n' + // Inicia o arquivo

    '^LH0,'+ margemSuperior + '\n' +
    '^CI28\n' + // Define a codificação UTF-8
    '^FO145,0^GB550,55,5^FS' + // Adiciona a caixa gráfica com fundo preto

    '^CF0,36^FO130,15^FB600,1,0,C^FDINÍCIO DA CURA DO PRODUTO^FS' +
    '^CF0,30\n' +
    '^FO90,77^FD' + 'Data: ____/_____/ ' + ano + '     Saída da estufa: ____:____' + '^FS \n' +
    '^CF0,30 \n' +
    '^FO340,132^FD' + ' Início do polimento: ____:____' + '^FS \n' +

    '^XZ'; // Fecha o arquivo

    if(printer.netUsb === 'usb'){
        zebraPrinterLocal(zplData, qtdade, printer.printerName, printer.ip) 
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        }); 
    } else {
        zebraRede(zplData, qtdade, printer.ip)
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        });
    };
};

//IMPRIME A ETIQUETA DA DATA   ************************************************************************************************************
exports.coqLabelsPrintData = async (req, res) => {

    const {printerName, qtdade, data} = req.body;
    let printer;

    try {
        printer = await PrintersModel.findOne({
            attributes: ['printerName', 'model','ip','netUsb'],
            where: {
                printerName: printerName
            },
            raw: true,
            nest: true,
        });
    } catch (error) {
        console.log("Houve um erro interno", error);
        return res.status(500).json({ error: "Internal server error." });
    };
    
    const altura = 200 ; // Ajuste com base na sua resolução
    const comprimento = 160 * 8; // Ajuste com base na sua resolução
    let margemSuperior;

    if(printer.netUsb === 'usb'){
        margemSuperior = 15;
    } else {
        margemSuperior = 0;
    };
    
    const zplData = '^XA \n' + // Inicia o arquivo

    '^LL' + altura + '\n' + // Define o comprimento
    '^PW' + comprimento + '\n' + // Define a altura
    '^LH0,'+ margemSuperior + '\n' +
    '^CI28\n' + // Define a codificação UTF-8
    '^CF0,80\n' +
    '^FO220,45^FD' + data + '^FS \n' +

    '^XZ'; // Fecha o arquivo

    if(printer.netUsb === 'usb'){
        zebraPrinterLocal(zplData, qtdade, printer.printerName, printer.ip) 
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        }); 
    } else {
        zebraRede(zplData, qtdade, printer.ip)
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        });
    };
};

//IMPRIME A ETIQUETA DA TEXTO LIVRE   ************************************************************************************************************
exports.coqLabelsPrintTexto100x23 = async (req, res) => {

    const {printerName, qtdade, texto} = req.body;
    let printer;

    try {
        printer = await PrintersModel.findOne({
            attributes: ['printerName', 'model','ip','netUsb'],
            where: {
                printerName: printerName
            },
            raw: true,
            nest: true,
        });
    } catch (error) {
        console.log("Houve um erro interno", error);
        return res.status(500).json({ error: "Internal server error." });
    };
    
    let margemSuperior, margemEsquerda;

    if(printer.netUsb === 'usb'){
        margemSuperior = 0;
        margemEsquerda = 0;
    } else {
        margemSuperior = 0;
        margemEsquerda = 30;
    };
    
     const zplData = '^XA \n' + // Inicia o arquivo
    
    '^CI28\n' + // Define a codificação UTF-8
    '^LH' + margemEsquerda + ','+ margemSuperior + '\n' +
    '^FO10,40^FB800,1,0,C^A0N,80,80^FD ' + texto + '^FS' +

    '^XZ'; // Fecha o arquivo

    if(printer.netUsb === 'usb'){
        zebraPrinterLocal(zplData, qtdade, printer.printerName, printer.ip) 
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        }); 
    } else {
        zebraRede(zplData, qtdade, printer.ip)
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        });
    };
};

//IMPRIME A ETIQUETA DA TEXTO LIVRE   ************************************************************************************************************
exports.coqLabelsPrintTexto100x100 = async (req, res) => {

    const {dadosParaEnviar} = req.body;

    const printerName = dadosParaEnviar.selectedPrinterName;
    const qtdade = dadosParaEnviar.qtade;

    let printer;

    try {
        printer = await PrintersModel.findOne({
            attributes: ['printerName', 'model','ip','netUsb'],
            where: {
                printerName: printerName
            },
            raw: true,
            nest: true,
        });
    } catch (error) {
        console.log("Houve um erro interno", error);
        return res.status(500).json({ error: "Internal server error." });
    };
    
    let margemSuperior, margemEsquerda;

    if(printer.netUsb === 'usb'){
        margemSuperior = 0;
        margemEsquerda = 0;
    } else {
        margemSuperior = 0;
        margemEsquerda = 30;
    };
    
     const zplData = '^XA \n' + // Inicia o arquivo
    
    '^CI28\n' + // Define a codificação UTF-8
    '^LH' + margemEsquerda + ','+ margemSuperior + '\n' +
    '^CF0,85\n' +
    '^FO80,45^FD' + dadosParaEnviar.texto1 + '^FS' +
    '^FO80,130^FD' + dadosParaEnviar.texto2 + '^FS' +
    '^FO80,215^FD' + dadosParaEnviar.texto3 + '^FS' +
    '^FO80,300^FD' + dadosParaEnviar.texto4 + '^FS' +
    '^FO80,385^FD' + dadosParaEnviar.texto5 + '^FS' +
    '^FO80,470^FD' + dadosParaEnviar.texto6 + '^FS' +
    '^FO80,555^FD' + dadosParaEnviar.texto7 + '^FS' +
    '^FO80,640^FD' + dadosParaEnviar.texto8 + '^FS' +
    '^FO80,725^FD' + dadosParaEnviar.texto9 + '^FS' +

    '^XZ'; // Fecha o arquivo

    if(printer.netUsb === 'usb'){
        zebraPrinterLocal(zplData, qtdade, printer.printerName, printer.ip) 
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            console.log(erro)
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        }); 
    } else {
        zebraRede(zplData, qtdade, printer.ip)
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            console.log(erro)
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        });
    };
};

//IMPRIME A ETIQUETA DA TEXTO LIVRE   ************************************************************************************************************
exports.coqLabelsPrintTexto100x200 = async (req, res) => {

    const {dadosParaEnviar} = req.body;
    let zplData = '';
    const printerName = dadosParaEnviar.selectedPrinterName;
    const qtdade = dadosParaEnviar.qtade;
    const mostrarLogo = dadosParaEnviar.mostrarLogo;

    let printer;

    try {
        printer = await PrintersModel.findOne({
            attributes: ['printerName', 'model','ip','netUsb'],
            where: {
                printerName: printerName
            },
            raw: true,
            nest: true,
        });
    } catch (error) {
        console.log("Houve um erro interno", error);
        return res.status(500).json({ error: "Internal server error." });
    };
    
    let margemSuperior, margemEsquerda;

    if(printer.netUsb === 'usb'){
        margemSuperior = 0;
        margemEsquerda = 0;
    } else {
        margemSuperior = 0;
        margemEsquerda = 30;
    };

    if(mostrarLogo === true) {
        zplData = '^XA \n' + // Inicia o arquivo
    
        '^CI28\n' + // Define a codificação UTF-8
        '^FO50,50^GB750,1550,4,,150^FS' +
    
        '^FO100,80^GFA,17250,17250,75,,:::::::::::::::::::::::X0FFC,V03JFE,U03MF,T03OF,S01PFE,S07QFC,S0RFE,R03SF8,R0UF,Q01UF8,Q03UFE,Q07VF,Q0WF8,P01WFC,:P03WFE,P07XF,P07XF8,P0YFC,:O01YFE,O01gF,O01gF8,O03gF8,O03gFC,O03gFE,O03gGF,:O03gGF8jY03QFE,O03gGFCjQ0JFJ07QFE,O03gGFEjQ0JFJ07QFE,O03gGFEjP01JFJ07QFE,O03gHFjP03IFEJ0RFE,O03gHF8jO03IFEJ0RFE,O03gHFCjO07IFEJ0RFE,O03gHFCiW07CP0JFEJ0RFE,O01gHFEiV01FFO01JFEI01RFE,O01gIFiV07FFCN01JFEI01RFE,O01gIF8iU0783CN03JFEI01RFE,O01gIF8iU0E00EN03JFCI03RFE,O01gIFCiT01C707N07JFCI03RFE,O07gIFEiT01CFE7N0KFCI03RFE,O0gKFiT018FE3M01KFCI03IF,N01gKFiT038E638L01KFCI07FFE,N03gKF8iS038C638L03KFCI07FFE,N0FF0gIFCiS038FE38L07KFCI07FFC,M01FE07gHFEgP01FFS0FF8gJ038FE38L07KF8I0IFC,M03FC07gIFgP01FFS0FF8gJ038FE38L0LF8I0IFC,M03F803gIFS0FF8T01FFS0FF8gJ018EE3L01LF8I0IFC,M07F001gIF8Q0JFT01FFS0FF8gJ01CC67L01LF8I0IF8,M0FF001gIFCP03JFCS01FFS0FF8gJ01C007L03LF8001IF8,L01FEI0gIFEP0LFS01FFS0FF8gK0F01EL07LF8001IF8,L01FCI0gIFEO01LF8R01FFS0FF8gK0783CL07LF8001IF,L03F8I07gIFO03LFCR01FFS0FF8gK07FFCL0MFI01IF,L07F8I03gIF8N07LFER01FFS0FF8g07F8001FFL01MFI03IF,L07FJ03gIFCN0NFR01FFS0FF8g0FF8I038L03MFI03IF,L0FEJ01gIFCM01NFR01FFS0FF8g0FF8Q03MFI03FFE,L0FEK0gIFEM01IF00IF8Q01FFS0FF8g0FF8Q07FFEJFI07FFE,K01FCK0gJFM03FF8003FF8Q01FFS0FF8g0FF8Q07FFCJFI07FFE,K01F8K07gIF8L03FFI01FFCQ01FFS0FF8g0FF8Q0IFCJFI07FFE,K03F8K03gIF8L03FEJ0FFCQ01FFS0FF8g0FF8P01IF8IFEI07FFC,K03FL03gIFCL07FCJ07FCQ01FFS0FF8g0FF8P01IF8IFEI0IFC,K03FL01gIFEL07FCJ07FEQ01FFS0FF8g0FF8P03IF1IFEI0IFC,K07FM0gJFL07FCJ03FEQ01FFS0FF8g0FF8P07FFE1IFEI0IF8,K07EM0RFEJ03LF8K07FCJ03FEQ01FFL07FCJ0FF8I01FFCL03FEJ0FFCP0IFE1IFEI0IF8,K07EM07QFL03KF8K07FCJ03FE07FCI01FE01FF00FF03IFJ0FF8I0JFK01IFC01KFO0IFC1IFE001IF8,K07EM07QFM07JFCK07FCJ01FE07FCI01FE01FF00FF07IFCI0FF8003JFCJ03JF01KF8M01IF81IFE001IF8,K0FCM03NF3FFN07IFEK07FCN07FCI01FF01FF00FF1JFEI0FF8007KFJ0KF83KF8M03IF81IFC003IF,K0FCM01MFC1FF8N0JFK07FEN07FCI01FF01FF00FF3KF800FF801LF8001KFC1KF8M07IF03IFC00JF,K0FCN0MF80FF8N03IFK07FFN07FCI01FF01FF00FF7KFC00FF803LFC003KFE1KF8M07FFE03IFC00JF,K0FCN0MF00FFCO0IF8J03FF8M07FCI01FF01FF00NFC00FF803LFC007LF1KF8M0IFE03IFC00JF,K0F8N07KFE007FCO07FFCJ03FFEM07FCI01FF01FF00NFE00FF807LFE007LF1KFN0IFC03IFC00MFE,K0F8N07KFC007FEO01FFCJ03IFCL07FCI01FF01FF00JFCJF00FF80IF81IF00FFE03FF9KFM01IFC03IFC00NFE,J01F8N03KFC003FFP0FFEJ01JFCK07FCI01FF01FF00IFE00IF00FF80FFC003FF00FF801FF80FFCN03IF803IF8007NFC,J01F8N01KF8003FFP03FFJ01KFCJ07FCI01FF01FF00IF8003FF80FF80FF8001FF00FF800FF80FF8N03IF003IF8007OF,J01F8N01KF8001FF8O03FF8J0LFJ07FCI01FF01FF00IFI03FF80FF81FF8001FF00FFI07FC0FF8N07IF003IF8007OFC,J01F8O0KFI01FF8O01FF8J07KFEI07FCI01FF01FF00FFEI01FFC0FF81FFJ0FF81FFI07FC0FF8N0IFE007IF800PFE,J01F8O07JFJ0FFCP07FCJ03LF8007FCI01FF01FF00FFEJ0FFC0FF81FFJ0FF81FFI03FC0FF8M01IFC007IF800QF8,J01F8O07JFJ0FFEP07FEJ01LFC007FCI01FF01FF00FFCJ07FC0FF8M0FF81FFM0FF8M01IFC007IF800QFC,J01FCO03IFEJ0FFEP03FEK07KFE007FCI01FF01FF00FFCJ07FC0FF8M0FF80FF8L0FF8M03IF8007IF801RF,J01FCO03IFEJ07FFP01FFK01LF007FCI01FF01FF00FF8J07FE0FF8M0FF80FFCL0FF8M03IF8007IF001RF8,J01FCO01IFEJ07FFP01FFL03KF807FCI01FF01FF00FF8J03FE0FF8K01IF80IF8K0FF8M07IFI07IF001RFC,J01FCP0IFEJ07FF8P0FF8L01JFC07FCI01FF01FF00FF8J03FE0FF8J0KF80JFCJ0FF8M0IFEI07IF001RFE,K0FCP07FFEJ03FFCP07F8M01IFC07FCI01FF01FF00FFK03FE0FF8I0LF807JFCI0FF8L01IFEI0JF003SF,K0FEP07FFEJ03FFCP07F8N07FFE07FCI01FF01FF00FFK03FE0FF8003LF807KFI0FF8L01IFCI0JF003SF,K0FEP03FFEJ03FFEP03FCN01FFE07FCI01FF01FF00FFK03FE0FF800MF803KF800FF8L03IFCI0JF003IF8007LF8,K0FEP03FFEJ03IFP03FCO07FE07FCI01FF01FF00FFK03FE0FF803MF801KFE00FF8L07IF8I0JF007FF8J07KFC,K0FFP01FFEJ03IFP03FCO07FF07FCI01FF01FF00FFK03FE0FF807MF8007KF00FF8L07IFJ0IFE007FCL0KFE,K0FFQ0FFEJ03IF8O01FCO03FF07FCI01FF01FF00FFK03FE0FF80JFC0FF8001KF00FF8L0JFJ0IFE007FM03KF,K07F8P0FFEJ03IF8O01FEO03FF07FCI01FF01FF00FFK03FE0FF80IFC00FF8I03JF80FF8K01IFEJ0IFE007CM01KF,K07FCP07FFJ01IFCO01FE01FFK01FF07FCI01FF01FF00FF8J03FE0FF81FFCI0FF8J03IF80FF8K01IFEI01IFE00F8N07JF8,K07FEP03FFJ01IFEP0FE01FFK01FF07FCI01FF01FF00FF8J03FE0FF81FFJ0FF8K01FFC0FF8K03IFCI01IFE00CO03JFC,K03FEP01FFJ01IFEP0FE01FFK01FF07FCI03FF01FF00FF8J07FC0FF83FEJ0FF8L0FFC0FF8K07IFCI01IFE008P0JFC,K03FFP01FFJ01JFP0FE01FF8J01FF07FCI03FF01FF00FFCJ07FC0FF83FEJ0FF8L07FC0FF8K07SFEQ0JFE,K03FF8P0FF8I01JFP0FE00FF8J03FF07FCI03FF01FF00FFCJ07FC0FF83FEJ0FF83FCI07FC0FF8K0TFEQ07IFE,K01FFCP0FF8I03JF8O0FE00FFCJ03FE07FEI03FF01FF00FFEJ0FFC0FF83FEI01FF83FCI03FC0FF8J01TFEQ03JF,K01IFP07FCI03JFCO0FE00FFCJ07FE03FEI07FF01FF00IFI01FF80FF83FEI01FF83FEI03FC07FCJ01TFEQ01JF,K01IF8O03FCI03JFCO0FE007FEJ0FFE03FFI0IF01FF00IF8003FF80FF83FEI03FF83FEI07FC07FCJ03TFER0JF8,L0IFCO03FEI03JFEO0FE007FF8001FFC03FF001IF01FF00IFC007FF80FF83FEI07FF83FFI07FC07FEJ07TFER07IF8,L0IFEO01FEI03JFEO0FE007FFE00IFC03FFC03IF01FF00JF01IF00FF83FFI0IF81FF800FFC07IFI07TFER07IF8,L07IFCO0FFI07KFO0FE003NF801NF01FF00NFE00FF81FFC07IF81IF8IF807IFI0UFER03IFC,L03IFEO0FF800LF8N0FE001NF001NF01FF00NFE00FF81NF80MF807IF800UFCR03IFC,L03JF8N07F800LF8N0FEI0NFI0NF01FF00NFC00FF81NF80MF003IF800UFCR01IFC,L01KFN07FC01LFCN0FEI0MFEI0NF01FF00FFBKF800FF80LF7F807LF003IF800UFCR01IFC,L01KFEM03FC03LFCN0FEI07LFCI07JFDFF01FF00FF9KFI0FF807JFE7F803KFE001IFI0UFCS0IFE,M0LFCL01FE1MFEM01FCI01LFJ03JF1FF01FF00FF8JFEI0FF803JFC7F801KF8I0IFI0UFCS0IFE,M07LFCK01QFM01FCJ07JFCK0IFE0FF01FF00FF87IF8I0FF801JF07FC007IFEJ03FF001UFCS07FFE,M03MFCK0QFM01FCJ01JFL07FFC0FE00FE00FF81FFEJ0FF8007FFC03F8003IFCJ01FFI0UF8S07FFE,M03OF8I0QF8L01F8K03FFN07CP0FF803FQ0FEN03FCg07IFV07IF,N0gJFCL03F8gN0FF8hM07IFV07IF,N0gJFCL03F8gN0FF8hM0JFI038180407C03803IF,N07gIFEL03FgO0FF8hM0JFI0381C0E1FE0FC03IF,N03gIFEL07FgO0FF8hM0JFI0783C0E3FF0FE03IF,N01gJFL07FgO0FF8hM0JFI0783C0E78F1C403IF,O0gJF8K0FEgO0FF8hM0IFEI0FC3E0CF039C003IF,O0gJF8K0FEgO0FF8hM0IFEI0FC3F1CE039C003IF,O07gIFCJ01FCgO0FF8hM0IFE001DC3F1DC039E003IF,O03gIFEJ01FCgO0FF8hL01IFE001DC339DC039F803IF,O01gIFEJ03F8gO0FFhM01IFE0039C339DC038FC03IF,O01gJFJ07F8gO0FFhM01IFE0039C71DDC0383C03IF,P0gJFJ0FFgP0FFhM01IFE007FE71FDC0701C03IF,P07gIF8I0FEgP0FFhM01IFE007FE70F9C0701C03IF,P07gIFC001FEgP0FFhM01IFC00FFE7079E0F21C03IF,P03gIFC007FCgP0FFhM01IFC00E0E7078FFE73803IF,P01gIFE01FF8gP0FFhT0C0E6038FFC3F803IF,Q0gJF07FFjM0C0660387F03F003IF,Q0gMFEjU0C00C003IF,Q07gLFCkG07IF,Q03gLF8kG07FFE,Q01gLFkH07FFE,R0gKFCkH07FFE,R0gKFhN018hS0IFE,R07gIFP038O038001L06I0700EM0601CI01CM03P0CI018gJ0IFC,R03gIFM01F0FE0F830C3E0FC7E3861F01F800F83F83030C1F07E07C3C00FC1F0F87E0F801C3F0F83CgI01IFC,R01gIFM0180C70CC38C380C0703863B839C00C07183030C390E70607I0FE1C0C07F0E001C3301866gI01IFC,R01gIFM0181C30CC3CC30180703C639C30C00C061C3030C300C38606I0C6180C0630CI0C3301866O07S01IFC,S0gIF8L0181830CC3CC30180703E630C60600C060C3030C600C18607I0C3180E0618EI0C630187EO0FS03IF8,S07gHF8L01E1818FC36C3E1807C37630C606007860C3030C6018187C3C00C31F078618F800C370307EN03F8R07IF8,S03gHF8L0181830F833C301807033E30C606001860C3030C600C18600E00C31C01C618EI0C3F03066N07FCR07IF,S03gHFCL0181830D833C301807031E38C70C001860C3030C700C18600600C61801C638CI0C0E02066N0FFER0JF,S01gHFCL0180C70D831C301C07031E3B839C009871C30398300E30600600EE1C09C770EI0C0E06066M01FFEQ01JF,T0gHFCL0100FE0CC30C3E0FC7E30E3F01F800F83F83E1F81F07F07C7E00FC1F8F87E0FC00C0C0607EM03IFQ01IFE,T07gGFCL010038K0410038201041I06I0700EJ0600E01CI0180040080702004O018M07IF8P03IFE,T07gGFEhL06gY07IFCP07IFC,T03gGFEhL06gY07IFEP0JFC,T01gGFEhL04gY03JFO01JF8,U0gGFEjL01JF8N03JF,U0gGFEjL01JFCN0KF,U07gFEjM0KFM01JFE,U03gFCjM0KF8L03JFC,U01gFCjM07JFEK01KFC,U01gFCjM03KFCJ0LF,V0gFCjM01LFC00MF,V07YF8jN0UFE,V07YF8jN07TFC,V03YF8jN03TF8,V01YFjO01TF,W0YFjP0SFC,W07WFEjP07RF8,W03WFCjP03RF,X0WF8jQ0QFC,X07VF8jQ03PF,X03VFjR01OFE,X01UFEjS07NF8,Y07TFCjT0MFC,Y01TFjU01KFE,g07RFEjW0IF8,g01RFC,gG07QF,gH0PF8,gH01NFE,gI03MF,gJ03KF8,gL01F8,,:::::::::::::::::::::::::::::::^FS \n' +
    
        '^LH' + margemEsquerda + ','+ margemSuperior + '\n' +
        '^CF0,90\n' +
        '^FO80,370^FD' + dadosParaEnviar.texto1 + '^FS' +
        '^FO80,490^FD' + dadosParaEnviar.texto2 + '^FS' +
        '^FO80,610^FD' + dadosParaEnviar.texto3 + '^FS' +
        '^FO80,730^FD' + dadosParaEnviar.texto4 + '^FS' +
        '^FO80,850^FD' + dadosParaEnviar.texto5 + '^FS' +
        '^FO80,970^FD' + dadosParaEnviar.texto6 + '^FS' +
        '^FO80,1090^FD' + dadosParaEnviar.texto7 + '^FS' +
        '^FO80,1210^FD' + dadosParaEnviar.texto8 + '^FS' +
        '^FO80,1330^FD' + dadosParaEnviar.texto9 + '^FS' +
         '^FO80,1450^FD' + dadosParaEnviar.texto10 + '^FS' +
      /*  '^FO80,1350^FD' + dadosParaEnviar.texto11 + '^FS' +
        '^FO80,1470^FD' + dadosParaEnviar.texto12 + '^FS' + */
    
        '^XZ'; // Fecha o arquivo
    } else {
        zplData = '^XA \n' + // Inicia o arquivo
    
        '^CI28\n' + // Define a codificação UTF-8
        '^FO50,50^GB750,1550,4,,150^FS' +
        
        '^LH' + margemEsquerda + ','+ margemSuperior + '\n' +
        '^CF0,90\n' +
        '^FO80,170^FD' + dadosParaEnviar.texto1 + '^FS' +
        '^FO80,290^FD' + dadosParaEnviar.texto2 + '^FS' +
        '^FO80,410^FD' + dadosParaEnviar.texto3 + '^FS' +
        '^FO80,530^FD' + dadosParaEnviar.texto4 + '^FS' +
        '^FO80,650^FD' + dadosParaEnviar.texto5 + '^FS' +
        '^FO80,770^FD' + dadosParaEnviar.texto6 + '^FS' +
        '^FO80,890^FD' + dadosParaEnviar.texto7 + '^FS' +
        '^FO80,1010^FD' + dadosParaEnviar.texto8 + '^FS' +
        '^FO80,1130^FD' + dadosParaEnviar.texto9 + '^FS' +
        '^FO80,1250^FD' + dadosParaEnviar.texto10 + '^FS' +
        '^FO80,1370^FD' + dadosParaEnviar.texto11 + '^FS' +
        '^FO80,1490^FD' + dadosParaEnviar.texto12 + '^FS' +
        '^FO80,1610^FD' + dadosParaEnviar.texto13 + '^FS' +
    
        '^XZ'; // Fecha o arquivo
    }
    
    if(printer.netUsb === 'usb'){
        zebraPrinterLocal(zplData, qtdade, printer.printerName, printer.ip) 
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            console.log(erro)
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        }); 
    } else {
        zebraRede(zplData, qtdade, printer.ip)
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            console.log(erro)
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        });
    };
};

//IMPRIME A ETIQUETA DA Roto   ************************************************************************************************************
exports.coqLabelsPrintRotoSearch = async (req, res) => {

    const {texto} = req.body;

    const resultadoConsulta = await dbDelsoft.query(
        'SELECT * FROM ETIQUETA_BuscarProdutosRelacionados(:codigo)',
        {
          replacements: { codigo: texto },
          type: dbDelsoft.QueryTypes.SELECT,
        }
    );
      
    if(resultadoConsulta[0] === undefined || resultadoConsulta[1] === undefined ) {
    // Extrai os dígitos da PRO_Descricao na posição específica
    const codigo = "NÃO";
    const material = "ENCONTRADO"
    return res.json({ codigo, material }); 
    } else {

        const match = resultadoConsulta[1].PRO_Descricao.match(/\d+/);
        const numeros  = match ? match[0] : null;
        const codigo = numeros ? `${numeros.slice(0, 3)}-${numeros.slice(3)}` : null;
        const material = resultadoConsulta[0].PRO_ProdutoCaracteValor;
        return res.json({ codigo, material }); 


    }
};

//IMPRIME A ETIQUETA DA Roto   ************************************************************************************************************
exports.coqLabelsPrintRoto = async (req, res) => {

    const { printerName, qtdade, codigo, material } = req.body;
    let printer;

    let palavras = material.split(" ");
    let materialComHifen = palavras.join("-");

    try {
        printer = await PrintersModel.findOne({
            attributes: ['printerName', 'model','ip','netUsb'],
            where: {
                printerName: printerName
            },
            raw: true,
            nest: true,
        });
    } catch (error) {
        console.log("Houve um erro interno", error);
        return res.status(500).json({ error: "Internal server error." });
    };
    
    const altura = 200 ; // Ajuste com base na sua resolução
    const comprimento = 160 * 8; // Ajuste com base na sua resolução
    let margemSuperior;

    if(printer.netUsb === 'usb'){
        margemSuperior = 15;
    } else {
        margemSuperior = 0;
    };

    const zplData = '^XA \n' + // Inicia o arquivo

    '^LL' + altura + '\n' + // Define o comprimento
    '^PW' + comprimento + '\n' + // Define a altura
    '^CF0,64\n' +
    '^FO110,75^FD' + codigo + ' ' + materialComHifen +  '^FS \n' +

    '^XZ'; // Fecha o arquivo

    if(printer.netUsb === 'usb'){
        zebraPrinterLocal(zplData, qtdade, printer.printerName, printer.ip) 
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        }); 
    } else {
        zebraRede(zplData, qtdade, printer.ip)
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        });
    };
};

//IMPRIME A ETIQUETA BARCODE39   ************************************************************************************************************
exports.coqLabelsPrintBarCode39 = async (req, res) => {

    const { printerName, qtdade, codigo, setLegenda } = req.body;
    const Y = setLegenda ? "Y" : "";

    let printer;

    try {
        printer = await PrintersModel.findOne({
            attributes: ['printerName', 'model','ip','netUsb'],
            where: {
                printerName: printerName
            },
            raw: true,
            nest: true,
        });
    } catch (error) {
        console.log("Houve um erro interno", error);
        return res.status(500).json({ error: "Internal server error." });
    };

    const altura = 200 ; // Ajuste com base na sua resolução
    const comprimento = 160 * 8; // Ajuste com base na sua resolução
    let margemSuperior;

    const zplData = '^XA \n' + // Inicia o arquivo

    '^LL' + altura + '\n' + // Define o comprimento
    '^PW' + comprimento + '\n' + // Define a altura
    '^LH0,'+ margemSuperior + '\n' +
    '^BY6,2,270\n' +
    '^FO270,35^BY4^BCN,100,' + Y + 'N,N\n' +
    '^FD>;' + codigo + '^FS \n' +

    '^XZ'; // Fecha o arquivo

    if(printer.netUsb === 'usb'){
        zebraPrinterLocal(zplData, qtdade, printer.printerName, printer.ip) 
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!"
                msg_type = "success"
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!"
                msg_type = "error"
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!"
            msg_type = "error"
            return res.json({ msg, msg_type }); 
        }); 
    } else {
        zebraRede(zplData, qtdade, printer.ip)
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!"
                msg_type = "success"
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!"
                msg_type = "error"
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!"
            msg_type = "error"
            return res.json({ msg, msg_type }); 
        });
    }
};

//BUSCA DADOS DA ETIQUETA DA MODALGEM   ************************************************************************************************************
exports.coqLabelsPrintMoldagemSearch = async (req, res) => {

    const {texto} = req.body;
    var resultadoConsulta1, resultadoConsulta2, resultadoConsulta3;
    var moldagem, material, codigo;

    resultadoConsulta1 = await dbDelsoft.query(
        'SELECT * FROM ETIQUETA_BuscarProdutosMoldagem2(:codigo)',
        {
          replacements: { codigo: texto },
          type: dbDelsoft.QueryTypes.SELECT,
        }
    );

    resultadoConsulta2 = await dbDelsoft.query(
        'SELECT * FROM ETIQUETA_BuscarProdutosMoldagem3(:codigo)',
        {
          replacements: { codigo: texto },
          type: dbDelsoft.QueryTypes.SELECT,
        }
    );

    if (resultadoConsulta1.length > 0 && resultadoConsulta2.length > 0) {
        // Extrai o código do resultado da busca 1
        const match = resultadoConsulta1[0].PRO_Descricao.match(/\d+/);
        const numeros  = match ? match[0] : null;
        codigo = numeros ? `${numeros.slice(0, 3)}-${numeros.slice(3)}` : null;
    
        // Extrai o material do resultado da busca 3
        const chapa = resultadoConsulta2[0].PRO_Descricao;
        const partes = chapa.split(/\s+/);

        material = partes.slice(1, 3).concat(partes.slice(4, 5)).join(' ');
    
        // Extrai o código da moldagem do resultado da busca 2
        moldagem = resultadoConsulta1[0].PRO_Codigo.trim();
    } else {
        codigo = material = moldagem = 'NA';
    }

    return res.json({ codigo, material, moldagem, texto }); 

};

//IMPRIME A ETIQUETA DA MOLDAGEM   ************************************************************************************************************
exports.coqLabelsPrintMoldagem = async (req, res) => {

    const { printerName, qtdade, codigo, material, moldagem, acabado } = req.body;
    let printer;

    try {
        printer = await PrintersModel.findOne({
            attributes: ['printerName', 'model','ip','netUsb'],
            where: {
                printerName: printerName
            },
            raw: true,
            nest: true,
        });
    } catch (error) {
        console.log("Houve um erro interno", error);
        return res.status(500).json({ error: "Internal server error." });
    };

    const altura = 200 ; // Ajuste com base na sua resolução
    const comprimento = 160 * 8; // Ajuste com base na sua resolução
    let margemSuperior;

    if(printer.netUsb === 'usb'){
        margemSuperior = 25;
    } else {
        margemSuperior = 0;
    };

    const zplData = '^XA \n' + // Inicia o arquivo

    '^LL' + altura + '\n' + // Define o comprimento
    '^PW' + comprimento + '\n' + // Define a altura
    '^LH0,'+ margemSuperior + '\n' +
    '^CI28\n' + // Define a codificação UTF-8
    '^CF0,40\n' +
    '^FO290,0^FD' + codigo + '^FS \n' +
    '^CF0,40\n' +
    '^FO290,60^FD ' + material + ' ^FS \n' +
    '^CF0,40\n' +
    '^FO135,115^FD ' + moldagem + '                     ' + acabado + '^FS \n' +

    '^FO135,20^GFA,750,750,10,N01F,N07FC,N0FFE,M01IF,M03IF8,:M07F1FC,M07E0FC,M0FC07E,L01FC07F,L01F803F,L03F803F8,L03F001F8,L07EI0FC,L0FEI0FE,L0FCI07E,K01FCI07F,K01F8I03F038,K03FJ01F87C,:K01EK0FC7C,L0CK0FEFC,R07EFC,R07FFC,R03FF8,Q0F1FF8,Q0JF8,P01JF,J0FK01JF,I0FF8K0JF,007FF8K07IF,03IF8L07FE,07IFCM07E,07IFC,:07EFFC,I0FFE,001FFE,:003F3E,007F3FO078,007E3FO07C,00FE1FO07E,00FC1EO07E,01F8Q03F,:03FR01F8,07FR01FC,07ES0FC,0FES0FE,0FCS07E,1F8S03F,:3FO04J01F8,7FN01FJ01FC,7EN03FK0FC,7EN07FK0FC,FCN0FFK07E,FCM01FEK07E,FCM03FCK07E,FCM07F8K07E,7KF800OFC,7KFC01OFC,3KFE01OF8,1KFE01OF,0KFE01NFE,03JF800NF8,O07F8,O03FC,O01FE,P0FF,P07F,P03F,P01F,Q0E,^FS \n' +

    '^XZ'; // Fecha o arquivo

    if(printer.netUsb === 'usb'){
        zebraPrinterLocal(zplData, qtdade, printer.printerName, printer.ip) 
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        }); 
    } else {
        zebraRede(zplData, qtdade, printer.ip)
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        });
    };

};

//BUSCA DADOS DA ETIQUETA DA VOLKSWAGEN   ************************************************************************************************************
exports.coqLabelsPrintVolkswagenSearch = async (req, res) => {

    const {texto} = req.body;
    var resultadoConsulta1
    var descricao, pn;

    resultadoConsulta1 = await dbDelsoft.query(
        'SELECT * FROM ETIQUETA_BuscarProdutosVolkswagen(:codigo)',
        {
          replacements: { codigo: texto },
          type: dbDelsoft.QueryTypes.SELECT,
        }
    );

     if (resultadoConsulta1 != null && resultadoConsulta1.length !== 0) {
        // Extrai a descrição do resultado da busca 1
        const descricaoCompleta = resultadoConsulta1[0].PRO_Descricao;

        // Usando regex para extrair as partes desejadas
        const match = descricaoCompleta.match(/\(([^)]+)\)\s*(.*)/);
        
        // match[1] contém a primeira parte, match[2] contém a segunda parte
        pn = match ? match[1] : null;
        descricao = match ? match[2] : null;
        
    } else {
        codigo = pn = descricao = 'NA';
    } 

    return res.json({ pn, descricao, texto }); 

};

//IMPRIME A ETIQUETA DA VOLKSWAGEN   ************************************************************************************************************
exports.coqLabelsPrintVolkswagen = async (req, res) => {

    const { printerName, qtdade, codigo, pn, desc, lote, aprov, fabric } = req.body;
    const titulo = 'SULPLAST      APROVAÇÃO FINAL';
    let printer;

    try {
        printer = await PrintersModel.findOne({
            attributes: ['printerName', 'model','ip','netUsb'],
            where: {
                printerName: printerName
            },
            raw: true,
            nest: true,
        });
    } catch (error) {
        console.log("Houve um erro interno", error);
        return res.status(500).json({ error: "Internal server error." });
    };

    const altura = 200 ; // Ajuste com base na sua resolução
    const comprimento = 160 * 8; // Ajuste com base na sua resolução
    let margemSuperior;
    let margemEsquerda;

    if(printer.netUsb === 'usb'){
        margemSuperior = 15;
        margemEsquerda = 10;
    } else {
        margemSuperior = 0;
        margemEsquerda = 10;
    };
    

    const zplData = '^XA \n' + // Inicia o arquivo

    '^LL' + altura + '\n' + // Define o comprimento
    '^PW' + comprimento + '\n' + // Define a altura
    '^LH' + margemEsquerda + ','+ margemSuperior + '\n' +
    '^CI28\n' + // Define a codificação UTF-8
    '^FO75,0^ADN,30,15^FD' + titulo + '^FS \n' +
    '^CF0,26\n' +
    '^FO69,39^FD Desc. da peça: ' + desc + ' ^FS \n' +
    '^CF0,26\n' +
    '^FO69,70^FD Cód. final da peça: ' + codigo + '^FS \n' +
    '^CF0,26\n' +
    '^FO69,100^FD Lote: ' + lote + '                                             P.N.: ' + pn + '^FS \n' +
    '^CF0,20\n' +
    '^FO69,130^FD Data aprovação: ' + aprov + '                                      Data fabricação: ' + fabric + '^FS \n' +

    '^XZ'; // Fecha o arquivo


    if(printer.netUsb === 'usb'){
        zebraPrinterLocal(zplData, qtdade, printer.printerName, printer.ip) 
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        }); 
    } else {
        zebraRede(zplData, qtdade, printer.ip)
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        });
    };
};

//IMPRIME A ETIQUETA DO Texto20x20  ************************************************************************************************************
exports.coqLabelsPrintTexto20x20 = async (req, res) => {

    const {printerName, qtdade, linha1, linha2} = req.body
    let printer;

    const isTextoPar = (txt) => txt.length % 2 === 0;
    const posicaoX1 = isTextoPar(linha1) ? 7 : 25;
    const posicaoX2 = isTextoPar(linha2) ? 7 : 25;
    const posicaoX3 = isTextoPar(linha1) ? 220 : 238;
    const posicaoX4 = isTextoPar(linha2) ? 220 : 238;
    const posicaoX5 = isTextoPar(linha1) ? 425 : 443;
    const posicaoX6 = isTextoPar(linha2) ? 425 : 443;
    const posicaoX7 = isTextoPar(linha1) ? 640 : 658;
    const posicaoX8 = isTextoPar(linha2) ? 640 : 658;

    const txt1 = centralizarString(linha1, 6);
    const txt2 = centralizarString(linha2, 6);

    try {
        printer = await PrintersModel.findOne({
            attributes: ['printerName', 'model','ip','netUsb'],
            where: {
                printerName: printerName
            },
            raw: true,
            nest: true,
        });
    } catch (error) {
        console.log("Houve um erro interno", error);
        return res.status(500).json({ error: "Internal server error." });
    };

    const altura = 200 ; // Ajuste com base na sua resolução
    const comprimento = 160 * 8; // Ajuste com base na sua resolução
    let margemSuperior, margemEsquerda;

    if(printer.netUsb === 'usb'){
        margemSuperior = 5;
        margemEsquerda = 5;
    } else {
        margemSuperior = 15;
        margemEsquerda = 15;
    };

    const zplData = '^XA \n' + // Inicia o arquivo
    '^LL' + altura + '\n' + // Define o comprimento
    '^PW' + comprimento + '\n' + // Define a altura
    '^LH' + margemEsquerda + ','+ margemSuperior + '\n' +
    '^CI28\n' + // Define a codificação UTF-8

    '^FX \n' +
    '^CF0,45 \n' +
    '^FO' + posicaoX1 + ',30^FD' + txt1 + '^FS \n' +
    '^CF0,45 \n' +
    '^FO' + posicaoX2 + ',85^FD' + txt2 + '^FS \n' +

    '^FX \n' +
    '^CF0,45 \n' +
    '^FO' + posicaoX3 + ',30^FD' + txt1 + '^FS \n' +
    '^CF0,45 \n' +
    '^FO' + posicaoX4 + ',85^FD' + txt2 + '^FS \n' +

    '^FX \n' +
    '^CF0,45 \n' +
    '^FO' + posicaoX5 + ',30^FD' + txt1 + '^FS \n' +
    '^CF0,45 \n' +
    '^FO' + posicaoX6 + ',85^FD' + txt2 + '^FS \n' +

    '^FX \n' +
    '^CF0,45 \n' +
    '^FO' + posicaoX7 + ',30^FD' + txt1 + '^FS \n' +
    '^CF0,45 \n' +
    '^FO' + posicaoX8 + ',85^FD' + txt2 + '^FS \n' +

    '^XZ'; // Fecha o arquivo

    if(printer.netUsb === 'usb'){
        zebraPrinterLocal(zplData, qtdade, printer.printerName, printer.ip) 
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        }); 
    } else {
        zebraRede(zplData, qtdade, printer.ip)
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        });
    };
};

//BUSCA DADOS DA ETIQUETA DA MODALGEM   ************************************************************************************************************
exports.coqLabelsPrintGraosSearch = async (req, res) => {

    const {texto} = req.body;
    var resultadoConsulta1;
    var material;

    resultadoConsulta1 = await dbDelsoft.query(
        'SELECT * FROM ETIQUETA_BuscarProdutoGraos(:codigo)',
        {
          replacements: { codigo: texto },
          type: dbDelsoft.QueryTypes.SELECT,
        }
    );

     if (resultadoConsulta1.length > 0) {
        // Extrai o código do resultado da busca 1
    
        // Extrai o material do resultado da busca 3
        material = resultadoConsulta1[0].PRO_Descricao;
    
    } else {
        material = 'NA';
    } 

    return res.json({ material }); 
};

//IMPRIME A ETIQUETA DA GRAOS   ************************************************************************************************************
exports.coqLabelsPrintGraos = async (req, res) => {

    const {dadosParaEnviar} = req.body;
    const printerName = dadosParaEnviar.selectedPrinterName;
    const qtdade = dadosParaEnviar.qtade;
    const texto = dadosParaEnviar.texto;
    const material = dadosParaEnviar.material;
    const codMaterial = dadosParaEnviar.codMaterial;
    const lote = dadosParaEnviar.lote;
    const data = dadosParaEnviar.data;
    const hora = dadosParaEnviar.hora;
    const operador = dadosParaEnviar.operador;
    const peso = dadosParaEnviar.peso;

    const tamanhoMaterialString = material.length;
    console.log(tamanhoMaterialString);

    let printer;

    try {
        printer = await PrintersModel.findOne({
            attributes: ['printerName', 'model','ip','netUsb'],
            where: {
                printerName: printerName
            },
            raw: true,
            nest: true,
        });
    } catch (error) {
        console.log("Houve um erro interno", error);
        return res.status(500).json({ error: "Internal server error." });
    };

    const altura = 200 ; // Ajuste com base na sua resolução
    const comprimento = 160 * 8; // Ajuste com base na sua resolução
    let margemSuperior;
    let margemEsquerda;
    let tamanhoFonte = ''

    if(tamanhoMaterialString > 17) {
        tamanhoFonte = '60'
    } else {
        tamanhoFonte = '75'
    }

    if(printer.netUsb === 'usb'){
        margemSuperior = 15;
        margemEsquerda = 10;
    } else {
        margemSuperior = 0;
        margemEsquerda = 10;
    };
    

    const zplData = '^XA \n' + // Inicia o arquivo

    '^LL' + altura + '\n' + // Define o comprimento
    '^PW' + comprimento + '\n' + // Define a altura
    '^LH' + margemEsquerda + ','+ margemSuperior + '\n' +
    '^CI28\n' + // Define a codificação UTF-8
    '^CF0,120\n' +
    '^FO20,20^FD' + codMaterial + '^FS' +
    '^CF0,' + tamanhoFonte + '\n' +
    '^FO20,155^FD' + material + '^FS' +
    '^CF0,120\n' +
    '^FO150,270^FD' + texto + '^FS' +
    '^CF0,70\n' +
    '^FO20,425^FDLOTE: ' + lote + '^FS' +
    '^FO20,515^FDDATA: ' + data + '^FS' +
    '^CF0,50\n' +
    '^FO20,590^FDHORA: ' + hora + '^FS' +
    '^FO20,650^FDOPERADOR: ' + operador + '^FS' +
    '^CF0,74\n' +
    '^FO20,710^FDPESO: ' + peso + 'Kg  APROVADO^FS \n' +

    '^XZ'; // Fecha o arquivo


    if(printer.netUsb === 'usb'){
        zebraPrinterLocal(zplData, qtdade, printer.printerName, printer.ip) 
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        }); 
    } else {
        zebraRede(zplData, qtdade, printer.ip)
        .then((resultado) => {
            if(resultado === true) {
                msg = "Impressão concluída com sucesso!";
                msg_type = "success";
                return res.json({ msg, msg_type }); 
            } else {
                msg = "Houve um erro ao conectar com a impressora!";
                msg_type = "error";
                return res.json({ msg, msg_type }); 
            }
        })
        .catch((erro) => {
            msg = "Houve um erro ao conectar com a impressora!";
            msg_type = "error";
            return res.json({ msg, msg_type }); 
        });
    };
};