const initial_game = {
  "node": null,
  "history": []
}

var urb_game = initial_game

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
    const link = urb_ink_link(node)
    story_div.innerHTML = "<p class=\"choice\"><a href=" + link + ">" + node.name + "</a></p>"
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

function urb_fetch_node(node) {
  return urb_fetch_json("nodes" + "/" + node + "/data.json")
}

function urb_fetch_location(location) {
  return urb_fetch_json("locations" + "/" + location + "/data.json")
}

function urb_fetch_next(location, current_node) {
  return urb_fetch_json("nodes" + "/" + current_node + "/" + location + "/data.json")
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

function urb_get_and_clear_location() {
  const queryString = window.location.search.substring(1);
  const urlParams = new URLSearchParams(queryString);
  const location = urlParams.get("location")
  window.history.replaceState({}, "Urban Novel", "index.html")
  return location
}

function urb_explore_node(location, current_node) {
  return urb_fetch_next(location, current_node)
    .then(json => {
      if (json["next"]) {
        return urb_push_history(json["next"])
      } else {
        return urb_fetch_location(location)
          .catch(err => urb_fetch_location("unknown"))
      }
    })
    .catch(err => urb_fetch_location(location))
}

function urb_explore() {
  const location = urb_get_and_clear_location()
  if (!urb_valid_location(location)) {
    return urb_fetch_location("unknown")
  }
  
  let current_node = urb_game["node"]
  if (current_node == null) {
    return urb_push_history("start")
  }

  return urb_explore_node(location, current_node)
}

function urb_play_story(ink_url, player) {
  urb_fetch_json(ink_url).then(json => player(json))
}

function urb_ink_link(data) {
  return "ink.html?data=" + btoa(JSON.stringify(data))
}

function urb_show_ink(data) {
  window.location.replace(urb_ink_link(data))
}

function urb_delay(fun) {
  setTimeout(fun, 500)
}
