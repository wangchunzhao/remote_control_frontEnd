export default {
  update: function(el, bind) {
    if (bind.value === bind.oldValue) {
      return false
    }
    if (bind.value) {
      el.style.position = 'relative'

      let div = document.createElement('div')
      div.className = 'no-data-wrap'
      div.style.cssText =
        'position: absolute;top: 0; right: 0; bottom: 0;left: 0;display: flex;align-items: center;justify-content: center;'
      div.innerHTML = `
        <div>
          <img style="width: 80px;" src="
          https://cdn.sinocold.net/images/empty.png" alt="暂无数据">
          <div style="color: #dcdee2;margin-top: 15px;text-align: center;">暂无数据</div>
        </div>
      `
      el.appendChild(div)
    } else {
      const target = el.querySelector('.no-data-wrap')
      if (target) {
        el.removeChild(target)
      }
    }
  }
}
