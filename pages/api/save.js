import { GoogleSpreadsheet } from 'google-spreadsheet'
import moment from 'moment'

const doc = new GoogleSpreadsheet(process.env.SHEET_DOC_ID)

const genCupom = () => {
  const code = parseInt(moment().format('YYMMDDHHmmssSSS')).toString(16).toUpperCase()
  return code.substr(0, 4) + '-' + code.substr(4, 4) + '-' + code.substr(8, 4)
}

export default async (req, res) => {

  try {
    await doc.useServiceAccountAuth({
      private_key: process.env.SHEET_PRIVATE_KEY,
      client_email: process.env.SHEET_CLIENT_EMAIL
    })
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[1]
    const data = JSON.parse(req.body)

    const sheetConfig = doc.sheetsByIndex[2]
    await sheetConfig.loadCells('A3:B3')

    const ativarPromocaoCell = sheetConfig.getCell(2, 0)
    const textoCell = sheetConfig.getCell(2, 1)

    let Cupom = ''
    let Promo = ''
    if (ativarPromocaoCell.value === 'VERDADEIRO') {
      Cupom = genCupom()
      Promo = textoCell.value
    }

    await sheet.addRow({
      Nome: data.Nome,
      Email: data.Email,
      Whatsapp: data.Whatsapp,
      Cupom: genCupom(),
      Promo,
      'Data de Preenchimento': moment().format('L, h:mm:ss a'),
      Nota: parseInt(data.Nota)
    })
    res.end(JSON.stringify({
      showCupom: Cupom !== '',
      Cupom,
      Promo
    }))
  } catch (err) {
    console.log(err)
    res.end('error')
  }
}