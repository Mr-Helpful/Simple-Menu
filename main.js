/*
 * A test module to be used as an example of layout
 */

(function(global){
  let module = global.menu = {}

  let menus = {}

  let shown = [{style:{}}]
  module.menuW = 200
  module.menuH = 500

  let style = document.createElement("style")
  document.getElementsByTagName("head")[0].appendChild(style)
  setStyling()
  function setStyling(){
    let w = window.innerWidth, h = window.innerHeight
    style.innerHTML = `
    .subMenu {
      display: block;
      position: absolute;
      overflow: scroll;

      width: ${module.menuW}px;
      max-height: ${module.menuH}px;
      margin-top: -${module.menuH/2}px;
      margin-left: -${module.menuW/2}px;

      transform: translate(${w/2}px, -${h/2}px);
      transition: transform 0.5s ease;
    }

    .subItem {
      background-color: white;
      border: dashed black 1px;
      margin: 5px;
      border-radius: 5px;
    }

    .subItem.checked {
      border: solid black 1px;
    }
    `
  }

  module.append = addNode.bind(this, menus)

  /** Selects a submenu from the top-level menu
    * @param {String} name - the name of the submenu to select
    * @return {Object} - the interface of the selected submenu
    */
  module.select = selNode.bind(this, menus)

  module.elements = function(target){
    let div = subElems(menus, target)
    let clickF = div.onclick
    div.onclick = _ => {console.log("clicked"); clickF()}
    div.style.backgroundColor = "red"
    return div
  }

  /** Generates an object representing the default values from the menu
    * @return {Object} - an object representing the defaults for the menu
    */
  module.defaults = subDefs.bind(this, menus)

  module.selector = addSel.bind(this, menus)

  function setShown(depth, elem){
    let toRem = shown.splice(depth)
    shown.push(elem)

    if(toRem[0] == elem) toRem.shift()
    shiftElems(toRem)
  }

  function shiftElems(toRem){
    let T = 0
    let m = shown.length-1
    let n = toRem.length-1
    let W = window.innerWidth
    let H = window.innerHeight
    let x0 = W/2 - m*module.menuW
    let x1 = W/2 - n*module.menuW
    if(n >= 0){
      T = 500
      toRem.forEach(e => {
        e.style.transform = `translate(${x1}px, ${H*3/2}px)`
        x1 += module.menuW
      })
    }

    setTimeout(function(){
      toRem.forEach(e => {
        e.style.transitionDuration = "0s"
        e.style.transform = null
      })
      shown.forEach(e => {
        e.style.transitionDuration = "0.5s"
        e.style.display = "block"
        e.style.transform = `translate(${x0}px, ${H*1/2}px)`
        x0 += module.menuW
      })
    }, T)
  }

  /** Adds a new submenu to the top-level menu
    * @param {String} name - the new name of the submenu
    * @return {Object} - the interface of the new submenu
    */
  function addNode(nodes, name){
    let items = {}
    nodes[name] = {}
    nodes[name].append = name => addNode(items, name)
    nodes[name].select = name => selNode(items, name)
    nodes[name].remove = _    => delNode(nodes, name)
    nodes[name].elements = subElems.bind(this, items)
    nodes[name].defaults = subDefs.bind(this, items)
    nodes[name].selector = addSel.bind(this, items)

    return nodes[name]
  }

  /** Selects an item from nodes
    * @param {Object} items - the nodes to select the item from; when used, this is already bound
    * @param {String} name - the name of the item to select from the nodes
    * @return {Object} - the interface of the selected item
    */
  function selNode(nodes, name){
    return nodes[name]
  }

  /** Deletes an item from nodes
    * @param {Object} items - the nodes to delete the item from; when used, this is already bound
    * @param {String} name - the name of the item to delete from the nodes
    */
  function delNode(nodes, name){
    delete nodes[name]
  }

  module.setShown = function(depth, elem){
    elem.style.marginTop = `-${module.menuH/2}px`
    elem.style.marginLeft = `-${module.menuW/2}px`
    setShown(depth, elem)
  }

  function subElems(nodes, target, depth = 0){
    let menu = document.createElement("div")
    menu.classList.add("subMenu")
    target.appendChild(menu)

    for(const k in nodes){
      let optn = nodes[k].elements(target, depth + 1)
      optn.classList.add("subItem")
      optn.parentNode = div

      let name = document.createElement("div")
      name.style.gridRow = "1/ span 1"
      name.style.gridColumn = "1/ span 1"
      name.innerText = k
      optn.appendChild(name)
      menu.appendChild(optn)
    }

    let div = document.createElement("div")
    div.onclick = _ => {
      let p = div.parentNode
      Array.from(p.children).forEach(e => {
        e.classList.remove("checked")
      })
      p.selected = div.innerText
      div.classList.add("checked")
      setShown(depth, menu)
    }

    return div
  }

  /** Generates the defaults for some sub-elements
    * @param {Object} nodes - the object representing all the nodes to generate for
    * @return {Object} - an object representing the defaults for the nodes
    */
  function subDefs(nodes){
    let defaults = {}
    for(const k in nodes){
      defaults[k] = nodes[k].defaults()
    }
    return defaults
  }

  function addSel(nodes, name){
    let item = {}
    item.type = "hint"
    item.name = name
    item.hint = ""
    item.data = {}
    item.key  = null
    item.func = _ => {}

    nodes[name] = {}
    nodes[name].hint = setHint.bind(this, item, nodes[name])
    nodes[name].data = setData.bind(this, item, nodes[name])
    nodes[name].callback = setCall.bind(this, item, nodes[name])
    nodes[name].remove = delNode.bind(this, nodes, name)
    nodes[name].defaults = _ => item.data[item.key]
    nodes[name].elements = itemElems.bind(this, item)

    return nodes[name]
  }

  /** A function used to set the hint on a single item
    * @param {Object} item - the item to set the hint for; when used, this is already bound
    * @param {String} h - the hint to set for the item
    * @return {Object} - the item with the set hint
    */
  function setHint(item, node, h){
    item.data.hint = h
    return node
  }

  /** A function used to set the data on a single item
    * @param {Object} item - the item to set the data for; when used, this is already bound
    * @param {Object} d - the data to set for the item
    * @return {Object} - the item with the set data
    */
  function setData(item, node, d, k = 0){
    item.data = d
    item.type = guessType(d)
    item.hint = d.hint || item.hint
    item.key = selectKey(item, d, k)
    return node
  }

  function only(arr1, arr2){
    return arr1.every(v => arr2.includes(v))
  }

  /** Takes a guess as to what selector to use for the data given
    * @param {Function/Object/String/Integer} data - the data to be guessed for
    * @return {String} - a string representing the type of selector
    */
  function guessType(data){
    let type = typeof data
    let keys = Object.keys(data)
    if(type != "object") return "optn"
    if(only(keys, ["hint"])) return "hint"
    if(only(keys, ["default", "hint"])) return "text"
    if(only(keys, ["min", "max", "hint"])) return "slde"
    if(only(keys, ["true", "false", "hint"])) return "swch"
    return "hint"
  }

  /** Creates a key used to determine a default value from data
    * @param {Object} d - the data to be selected from
    * @param {Function/Integer/String} defTo - the selector to generate a function from
    * @return {Function} - a function which can be used to determine a default value from data
    */
  function selectKey(item, d, k){
    if(item.type == "optn") return 0
    if(item.type == "text") return ""

    if(k in d) return k
    if(typeof k == "number") return toKey(d, k)
    return toKey(0)
  }

  /** Returns the key at the index in the data
    * @param {Integer} k - the index used to select a key
    * @return {Function} - the key at that index in the data
    */
  function toKey(d, k){
    let keys = Object.keys(d)
    if(keys.length == 0) return null
    return keys[k]
  }

  function setKey(item, k){
    item.key = k
    item.func(item.data[k])
  }

  function setCall(item, node, f){
    item.func = f
    return node
  }

  let itemHandlers = {}
  itemHandlers.hint = hintHandler
  itemHandlers.slde = slideHandler
  itemHandlers.swch = switchHandler
  itemHandlers.text = textboxHandler
  itemHandlers.drop = dropdownHandler
  function itemElems(item){
    let div = document.createElement("div")
    div.style.display = "grid"
    div.style.gridTemplateRows = "auto auto 1fr"
    div.style.gridTemplateColumns = "1fr auto"

    if(item.data.hint){
      let hint = document.createElement("div")
      hint.innerText = item.data.hint
      hint.style.gridRow = "3/ span 1"
      hint.style.gridColumn = "1/ span 2"
      div.appendChild(hint)
    }
    itemHandlers[item.type](item, div)

    return div
  }

  function hintHandler(){}

  function slideHandler(item, elem){
    let slct = document.createElement("input")
    slct.setAttribute("type", "range")
    slct.setAttribute("min", item.data.min || 0)
    slct.setAttribute("max", item.data.max || 100)
    slct.oninput = _ => item.func(slct.value)

    slct.style.gridRow = "2/ span 1"
    slct.style.gridColumn = "1/ span 2"
    elem.appendChild(slct)
  }

  function switchHandler(item, elem){
    let slct = document.createElement("input")
    slct.setAttribute("type", "checkbox")
    slct.checked = (item.key === "true")
    slct.onclick = _ => setKey.call(this, item, slct.checked)

    slct.style.gridRow = "1/ span 1"
    slct.style.gridColumn = "2/ span 1"
    elem.appendChild(slct)
  }

  function textboxHandler(item, elem){

  }

  function dropdownHandler(item, elem){
    let slct = document.createElement("div")
    slct.style.width = module.menuW
    slct.style.maxHeight = module.menuH
    slct.style.display = "none"

    let disp = document.createElement("div")
    disp.style.gridRow = "2/ span 1"
    disp.style.gridColumn = "1/ span 2"
    elem.appendChild(disp)

    let elems = []
    for(let k in item.data){
      let optn = document.createElement("div")
      optn.innerText = k
      optn.onclick = radioSelect.bind(this, item, disp, optn, elems)
      elems.push(optn)
      slct.appendChild(optn)
    }

    elem.onclick = "todo"//---------------------------------------------------------------------------------
  }

  function getDropdown(){
    let slct = document.createElement("div")
    this.elems = []
    for(let k in this.data){
      let div = document.createElement("div")
      div.innerText = k
      div.onclick = radioSelect.bind(this, div)
      this.elems.push(div)
      slct.appendChild(div)
    }
    return slct
  }

  function radioSelect(item, display, elem, elems){
    elems.forEach(e => {
      e.classList.remove("checked")
    })
    elem.classList.add("checked")
    display.innerText = elem.innerText
    setKey.call(this, item, elem.innerText)
  }

  function addDropdown(gridElem){
    let slct = document.createElement("div")
    this.display = document.createElement("div")
    this.display.style.gridColumn = "1/ span 2"
    this.display.style.gridRow = "2/ span 1"
    gridElem.appendChild(this.display)
    this.display.innerText = "hello world"
    /*
    this.elems = []
    for(let k in this.data){
      let div = document.createElement("div")
      div.innerText = k
      div.onclick = radioSelect.bind(this, div)
      this.elems.push(div)
      slct.appendChild(div)
    }
    */
  }
})(this)
