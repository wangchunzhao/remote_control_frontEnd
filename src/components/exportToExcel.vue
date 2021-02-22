<template>
  <div />
</template>

<script>
import FileSaver from 'file-saver'
export default {
  methods: {
    createExcel(DOM) {
      let wb = XLSX.utils.table_to_book(DOM)
      /* get binary string as output */
      let wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'binary'
      })
      /* force a download */
      FileSaver.saveAs(
        new Blob([this.s2ab(wbout)], {
          type: 'application/octet-stream'
        }),
        'File.xlsx'
      )
    },
    s2ab(s) {
      let buf
      if (typeof ArrayBuffer !== 'undefined') {
        buf = new ArrayBuffer(s.length)
        var view = new Uint8Array(buf)
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
        return buf
      } else {
        buf = new Array(s.length)
        for (let i = 0; i !== s.length; ++i) buf[i] = s.charCodeAt(i) & 0xff
        return buf
      }
    }
  }
}
</script>
