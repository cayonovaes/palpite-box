import { GoogleSpreadsheet } from 'google-spreadsheet'

const doc = new GoogleSpreadsheet(process.env.SHEET_DOC_ID)

const fromBase64 = value => {
  const buff = Buffer.from(value, 'base64');
  return buff.toString('ascii')
}

export default async (req, res) => {
  try {
    // await doc.useServiceAccountAuth(credentials)
    await doc.useServiceAccountAuth({
      private_key: fromBase64(process.env.SHEET_PRIVATE_KEY),
      client_email: process.env.SHEET_CLIENT_EMAIL
    })
    await doc.loadInfo()

    const sheet = doc.sheetsByIndex[2]
    await sheet.loadCells('A3:B3')

    const ativarPromocaoCell = sheet.getCell(2, 0)

    const textoCell = sheet.getCell(2, 1)

    res.end(JSON.stringify({
      showCoupon: ativarPromocaoCell.value === 'VERDADEIRO',
      message: textoCell.value
    }))

  } catch (err) {
    res.end(JSON.stringify({
      showCoupon: false,
      message: ''
    }))
  }
}