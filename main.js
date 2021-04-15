/*
 * A test module to be used as an example of layout
 */

(function(global){
  let module = global.menu = {}
  const DefaultF = d => console.log(d)

  let menus = {}
  let shown = [{style:{}}]
  module.menuW = 200
  module.menuH = 500
  module.target = document.getElementsByTagName("body")[0]

  module.menus = menus

  let style = document.createElement("style")
  // we have to prepend the styling to ensure any later styling overrides it
  document.getElementsByTagName("head")[0].prepend(style)
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
      border-radius: 5px;

      display: grid;
      grid-template-rows: auto auto 1fr;
      grid-template-columns: 1fr auto;

      margin: 5px;
      padding: 2px;
    }

    .subItem.checked {
      border: solid black 1px;
    }

    .display {
      background-color: white;
      border: solid black 1px;
      border-radius: 5px;

      margin: 2px;
    }
    `
  }

  module.append = addNode.bind(this, menus, 2)

  /** Selects a submenu from the top-level menu
    * @param {String} name - the name of the submenu to select
    * @return {Object} - the interface of the selected submenu
    */
  module.select = selNode.bind(this, menus)

  module.elements = function(){
    let div = nodeElems({type:"menu", data:{}, depth:1}, menus)
    div.style.backgroundColor = "red"
    return div
  }

  /** Generates an object representing the default values from the menu
    * @return {Object} - an object representing the defaults for the menu
    */
  module.defaults = subDefs.bind(this, menus)

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

  /** A function used to set the data on a single item
    * @param {Object} item - the item to set the data for; when used, this is already bound
    * @param {Object} d - the data to set for the item
    * @return {Object} - the item with the set data
    */
  function setData(priv, node, d){
    priv.type = guessType(d)
    if(priv.type != "optn"){
      removeWords(priv, d)
    }

    if(priv.type == "menu"){
      for(k in d){
        node.append(k).data(d[k])
      }
      priv.data = {}
    } else {
      priv.func = d.func || DefaultF
      priv.data = d
    }

    return node
  }

  /** Takes a guess as to what selector to use for the data given
    * @param {Function/Object/String/Integer} data - the data to be guessed for
    * @return {String} - a string representing the type of selector
    */
  function guessType(data){
    let type = typeof data
    let has = (obj, arr) => arr.every(v => v in obj)

    if(type != "object") return "optn"
    if(has(data, ["text"])) return "text"
    if(has(data, ["default"])) return "drop"
    if(has(data, ["min", "max"])) return "slde"
    if(has(data, ["true", "false"])) return "swch"
    return "menu"
  }

  function removeWords(priv, data){
    let restricted = ["hint", "text", "default", "min", "max", "callback"]

    for(k in data){
      if(restricted.includes(k)){
        priv[k] = data[k]
        delete data[k]
      }
    }
  }

  /** Adds a new submenu to the top-level menu
    * @param {String} name - the new name of the submenu
    * @return {Object} - the interface of the new submenu
    */
  function addNode(nodes, depth, name){
    let priv = {}
    priv.name = name
    priv.depth = depth
    priv.func = DefaultF

    let items = {}
    nodes[name] = {}
    nodes[name].data = setData.bind(this, priv, nodes[name])
    nodes[name].hint = setHint.bind(this, priv, nodes[name])
    nodes[name].callback = setCall.bind(this, priv, nodes[name])
    nodes[name].append = addNode.bind(this, items, depth+1)
    nodes[name].select = selNode.bind(this, items)
    nodes[name].remove = delNode.bind(this, nodes, name)
    nodes[name].elements = nodeElems.bind(this, priv, items)
    nodes[name].defaults = subDefs.bind(this, priv, items)
    nodes[name].data({})
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

  /** A function used to set the hint on a single item
    * @param {Object} item - the item to set the hint for; when used, this is already bound
    * @param {String} h - the hint to set for the item
    * @return {Object} - the item with the set hint
    */
  function setHint(priv, node, h){
    priv.hint = h
    return node
  }

  function setCall(item, node, f){
    item.func = f
    return node
  }

  let itemHandlers = {}
  itemHandlers.optn = _ => _
  itemHandlers.menu = menuHandler
  itemHandlers.slde = slideHandler
  itemHandlers.swch = switchHandler
  itemHandlers.text = textboxHandler
  itemHandlers.drop = dropdownHandler
  function nodeElems(priv, nodes){
    let div = document.createElement("div")
    div.classList.add("subItem")

    if(priv.hint){
      let hint = document.createElement("div")
      hint.innerText = priv.hint
      hint.style.gridRow = "3/ span 1"
      hint.style.gridColumn = "1/ span 2"
      div.appendChild(hint)
    }

    let emptyMenu = priv.type == "menu" && Object.keys(nodes).length == 0
    if(!emptyMenu){
      itemHandlers[priv.type](priv, div, nodes)
    }

    return div
  }

  function menuHandler(priv, div, nodes){
    let menu = document.createElement("div")
    menu.classList.add("subMenu")
    module.target.appendChild(menu)

    div.onclick = _ => {
      radioSelect(div)
      setShown(priv.depth, menu)
    }

    if(priv.depth > 1){
      let back = document.createElement("div")
      back.classList.add("subItem")
      back.style.borderStyle = "solid"
      back.style.width = "auto"
      back.innerText = "<"
      back.onclick = _ => {
        let N = priv.depth - 1
        setShown(N, shown[N])
      }
      menu.appendChild(back)
    }

    for(const k in nodes){
      let optn = nodes[k].elements()
      optn.classList.add("subItem")
      optn.parentNode = div

      let name = document.createElement("div")
      name.style.gridRow = "1/ span 1"
      name.style.gridColumn = "1/ span 1"
      name.innerText = k
      optn.appendChild(name)
      menu.appendChild(optn)
    }

    return div
  }

  function slideHandler(priv, elem){
    let slct = document.createElement("input")
    slct.setAttribute("type", "range")
    slct.setAttribute("min", priv.min)
    slct.setAttribute("max", priv.max)
    slct.onmouseup = _ => priv.func(slct.value)

    slct.style.gridRow = "2/ span 1"
    slct.style.gridColumn = "1/ span 2"
    elem.appendChild(slct)
  }

  function switchHandler(priv, elem){
    let slct = document.createElement("input")
    slct.setAttribute("type", "checkbox")
    slct.checked = (priv.key == "true")
    slct.onclick = _ => priv.func(priv.data[slct.checked])

    slct.style.gridRow = "1/ span 1"
    slct.style.gridColumn = "2/ span 1"
    elem.appendChild(slct)
  }

  function textboxHandler(priv, elem){
    let slct = document.createElement("input")
    slct.classList.add("display")
    slct.setAttribute("type", "text")
    slct.setAttribute("value", priv.text)
    slct.onchange = _ => priv.func(slct.value)

    slct.style.gridRow = "2/ span 1"
    slct.style.gridColumn = "1/ span 2"
    elem.appendChild(slct)
  }

  function dropdownHandler(priv, div){
    let slct = document.createElement("div")
    slct.classList.add("subMenu")
    module.target.appendChild(slct)

    let disp = document.createElement("div")
    disp.classList.add("display")
    disp.style.gridRow = "2/ span 1"
    disp.style.gridColumn = "1/ span 2"
    disp.innerText = priv.default
    div.appendChild(disp)

    for(let k in priv.data){
      let optn = document.createElement("div")
      optn.classList.add("subItem")
      optn.innerText = k
      optn.parentNode = slct
      optn.onclick = _ => {
        radioSelect(optn)
        disp.innerText = optn.innerText
        priv.func(priv.data[optn.innerText])
      }
      slct.appendChild(optn)
    }

    div.onclick = _ => {
      radioSelect(div)
      setShown(priv.depth, slct)
    }
  }

  function radioSelect(elem){
    let p = elem.parentNode
    Array.from(p.children).forEach(e => {
      e.classList.remove("checked")
    })
    elem.classList.add("checked")
  }
})(this)
