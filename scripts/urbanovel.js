var urb_game = {"hits": {}}

function urb_hit(name, uuid) {
  const game = localStorage.getItem("urb-game")
  urb_game = JSON.parse(game)
  urb_game["hits"][name] = uuid
  urb_save()
}

function urb_go_home(delay) {
  setTimeout(() => {
    console.log(window.location.hostname)
    window.location.href = "http://localhost:9080/index.html"
  }, delay)
}

function urb_main() {
  console.log('main!')
}

function urb_init_game() {
  urb_game = {"hits": {}}
}

function urb_save() {
  localStorage.setItem("urb-game", JSON.stringify(urb_game))
}

function urb_load_config() {
  const game = localStorage.getItem("urb-game")
  urb_game = JSON.parse(game)
  if (urb_game == null) {
    urb_init_game()
  }
}

function urb_fill_zones() {
  Object.keys(urb_game.hits).map((key) => {
    let elem = document.getElementById("urb-zone-" + key)
    if (elem) {
      elem.classList.add('urb-visited')
    }
    const uuid = urb_game.hits[key]
    const links = elem.getElementsByClassName("urb-zone-link")
    for (let i=0; i<links.length; i++) {
      const link = links[i]
      link.href = "story/" + uuid
    }
  })
}
