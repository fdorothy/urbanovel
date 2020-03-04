const initial_game = {
  "node": null,
  "history": []
}

var urb_game = initial_game

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
  urb_game = initial_game
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

function urb_fill_history() {
  const history_div = document.getElementsByClassName("urb-history")[0]
  urb_game.history.forEach(node => {
    const story_div = document.createElement("div")
    story_div.innerHTML = "<h2>" + node.name + "</h2><p>Click <a href=" + node["story"] + ">here</a> to read"
    history_div.appendChild(story_div)
  })
}

function urb_fetch_json(url) {
  return (
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        return response.json();
      })
  )
}

function urb_fetch_node(key) {
  return urb_fetch_json("nodes" + "/" + key + "/data.json")
}

function urb_push_history(key) {
  return (
    urb_fetch_node(key)
      .then(node => {
        urb_game["node"] = key
        urb_game["history"].push(node)
        urb_save()
        return node
      })
  )
}

function urb_valid_location(str) {
  const regex = /[A-Ba-z0-9\-]+/
  return str === null || regex.test(str)
}

function urb_show_link(id, url) {
  let elem = document.getElementById(id)
  if (elem) {
    elem.classList.remove('urb-hidden')
    elem.href = url
  }
}

function urb_set_text(id, text) {
  const elem = document.getElementById(id)
  if (elem) {
    elem.innerHTML = text
  }
}

const urb_set_status = (text) => urb_set_text("urb-status", text)
const urb_set_header = (text) => urb_set_text("urb-header", text)

const urb_node_story = (nodename) => 'nodes/' + nodename + '/ink.html'

function urb_show_intro() {
  urb_set_header("New Game")
  urb_set_status("Welcome to the game. There are QR codes scattered around for this game. If you find the next location then an 'explore' link will appear. Here's an explore link to get you started. Good luck.")
}

function urb_show_found_something() {
  urb_set_header("Oh? What is this...")
  urb_set_status("You appeared to have found something new! Click explore to see what it is, or you can read it later the game's home screen")
}

const urb_show_nothing = () => window.location.href = "/locations/unknown/ink.html"

function urb_show_location(location) {
  const path = "/locations/" + location + "/ink.js"
  fetch(path)
    .then((response) => {
        if (!response.ok) {
          urb_show_nothing()
        } else {
          const path = "/locations/" + location + "/ink.html"
          window.location.href = path
        }
    })
    .catch(err => urb_show_nothing())
}

function urb_show_node(location, node) {
  const path = "nodes" + "/" + node + "/" + location + "/data.json"
  urb_fetch_json(path)
    .then(json => {
      console.log("got data from exploring: " + json)
      if (json["next"]) {
        urb_push_history(json["next"])
          .then(node => window.location.href = node["story"])
      } else {
        urb_show_location(location)
      }
    })
    .catch(err => urb_show_location(location))
}

function urb_explore() {
  const queryString = window.location.search.substring(1);
  const urlParams = new URLSearchParams(queryString);
  const location = urlParams.get("location")
  window.history.replaceState({}, "Urban Novel", "index.html")
  if (!urb_valid_location(location)) {
    urb_show_nothing()
    return
  }

  let current_node = urb_game["node"]
  if (current_node == null) {
    // new game, no location needed
    console.log("new game")
    urb_push_history("start")
      .then(node => window.location.href = node["story"])
  } else {
    if (location) {
      urb_show_node(location, current_node)
    } else {
      console.log("no location passed in")
      urb_show_nothing()
    }
  }
}
