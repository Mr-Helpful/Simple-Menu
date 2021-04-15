let menu1 = menu
  .append("menu1")

menu
  .append("menu2")
  .data("heya")
  .hint("Has data: 'heya'")

let menu3 = menu
  .append("menu3")

let sub1 = menu3
  .append("sub1")

menu.append("menu4")
menu
  .select("menu3")
  .append("sub2")
  .data({default: "optn1", "optn1":"I'd", "optn2":"like", "optn3":"some", "optn4":"tea"})
  .callback(d => console.log(d))

sub1
  .append("item0")
  .data({true: "a", false: "b"})
  .callback(d => console.log(d))

sub1
  .append("item1")
  .data({true: "a", false: "b"}, 1)
  .hint("have a go at toggling this!")
  .callback(d => console.log(d))

sub1
  .append("item2")
  .data({"c":"c", true: "a", false: "b"})
  .hint("A much, much longer hint, used to test the wrapping capabilities of the item layout. Shouldn't be capable of being rendered on a single line of the hint box")
  .callback(d => console.log(d))

menu1
  .data({"item3":{"min":20, "max":50, "hint":"An attempt to add a new slider", "callback":console.log},
         "item4":{"hint":"The first part of an attempt to cause the complete submenu box to overflow"},
         "item5":{"hint":"The continuation of our attempt to cause the menu box to overflow, hopefully pushing the entire menu past its default max-height of 500px"},
         "item6":{"hint":"The behavoir that we hope to acheive is that the submenu should create a scrollbar on its right hand side, allowing these bottom items to be seen along with all the others"},
         "item7":{"hint":"This item is likely also needed in order to cause the overflow to eventually happen"},
         "item8":{"text":"A wonderful world"}})

/*
menu1
  .append("item3")
  .data({"min":20, "max":50})
  .hint("An attempt to add a new slider")
  .callback(d => console.log(d))

menu1
  .append("item4")
  .hint("The first part of an attempt to cause the complete submenu box to overflow")

menu1
  .append("item5")
  .hint("The continuation of our attempt to cause the menu box to overflow, hopefully pushing the entire menu past its default max-height of 500px")

menu1
  .append("item6")
  .hint("The behavoir that we hope to acheive is that the submenu should create a scrollbar on its right hand side, allowing these bottom items to be seen along with all the others")

menu1
  .append("item7")
  .hint("This item is likely also needed in order to cause the overflow to eventually happen")

menu1
  .append("item8")
  .data({text:"A wonderful world"})*/

let body = document.getElementsByTagName("body")[0]
let elem = menu.elements(body)
elem.style.width = "20px"
elem.style.height = "20px"
body.appendChild(elem)
