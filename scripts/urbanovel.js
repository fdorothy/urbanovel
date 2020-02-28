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
    story_div.innerHTML = "<h2>" + node.name + "</h2><p>Click <a href=" + node["story"] + "here</a>" + " to read"
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

function urb_show_nothing() {
  urb_set_header("Nothing here")
  urb_set_status("There's nothing here. Try a different location. Want a hint? Try going home and read carefully in the stories")
}

function urb_explore() {
  const queryString = window.location.search.substring(1);
  const urlParams = new URLSearchParams(queryString);
  const location = urlParams.get("location")
  window.history.replaceState({}, "Urban Novel", "index.html")
  if (!urb_valid_location(location)) {
    urb_set_header("Uh oh...")
    urb_set_status("Something went wrong. This appears to be an invalid QR code. More than likely the QR code was printed wrong, let us know where you are and what happened.")
    return
  }

  let current_node = urb_game["node"]
  if (current_node == null) {
    // new game, no location needed
    console.log("new game")
    urb_push_history("start")
      .then(() => urb_show_intro())
      .then(() => urb_show_link("urb-explore", urb_node_story(urb_game.node)))
  } else {
    if (location) {
      const path = "nodes" + "/" + current_node + "/" + location + "/data.json"
      urb_fetch_json(path)
        .then(json => {
          console.log("got data from exploring: " + json)
          if (json["next"]) {
            urb_push_history(json["next"])
              .then(() => urb_show_found_something())
              .then(() => urb_show_link("urb-explore", urb_node_story(urb_game.node)))
          } else {
            urb_show_nothing()
          }
        })
        .catch(err => {
          console.log("error while exploring: " + err)
          urb_show_nothing()
        })
    } else {
      console.log("no location passed in")
      urb_show_nothing()
    }
  }
}
