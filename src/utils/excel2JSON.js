export const excel2JSON = (file, propNames) => {
  return readerData(file, propNames)
}

function readerData(rawFile, propNames) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const data = e.target.result
      const fixedData = fixData(data)
      const workbook = XLSX.read(btoa(fixedData), { type: 'base64' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const header = getHeaderRow(worksheet)
      let option = { defval: '' }
      propNames && (option.header = propNames)
      const results = XLSX.utils.sheet_to_json(worksheet, option)
      resolve({ header, results })
    }
    reader.readAsArrayBuffer(rawFile)
  })
}
function fixData(data) {
  let o = ''
  let l = 0
  const w = 10240
  for (; l < data.byteLength / w; ++l)
    o += String.fromCharCode.apply(
      null,
      new Uint8Array(data.slice(l * w, l * w + w))
    )
  o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)))
  return o
}
function getHeaderRow(sheet) {
  const headers = []
  const range = XLSX.utils.decode_range(sheet['!ref'])
  let C
  const R = range.s.r
  /* start in the first row */
  for (C = range.s.c; C <= range.e.c; ++C) {
    /* walk every column in the range */
    const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })]
    /* find the cell in the first row */
    let hdr = 'UNKNOWN ' + C // <-- replace with your desired default
    if (cell && cell.t) hdr = XLSX.utils.format_cell(cell)
    headers.push(hdr)
  }
  return headers
}
