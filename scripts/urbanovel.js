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
  console.log(regex.test(str))
  return str === null || regex.test(str)
}

function urb_explore() {
  const queryString = window.location.search.substring(1);
  const urlParams = new URLSearchParams(queryString);
  const location = urlParams.get("location")
  window.history.replaceState({}, "Urban Novel", "index.html")
  if (!urb_valid_location(location)) {
    urb_go_home(1000)
    return
  }

  let current_node = urb_game["node"]
  if (current_node == null) {
    // new game, no location needed
    console.log("new game")
    urb_push_history("start")
      .then(() => urb_go_home(1000))
  } else {
    if (location) {
      const path = "nodes" + "/" + current_node + "/" + location + "/data.json"
      urb_fetch_json(path)
        .then(json => {
          console.log("got data from exploring: " + json)
          if (json["next"]) {
            urb_push_history(json["next"])
              .then(() => urb_go_home(1000))
          } else {
            urb_go_home(1000)
          }
        })
        .catch(err => {
          console.log("error while exploring: " + err)
          urb_go_home(1000)
        })
    } else {
      console.log("no location passed in")
      urb_go_home(1000)
    }
  }
}
