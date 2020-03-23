# About

This is an Urban Novel framework for ink (https://www.inklestudios.com/ink/).

An urban novel is a book that requires the reader to travel around to get new pieces of the story. This is done by the author putting up QR codes in various places, and providing hints to the reader about where the new pieces of the story may be.

The content is statically hosted with each part of the story containing a random UUID in the path. There's some extra JS that will traverse the story graph as new QR codes are found. You should be able to take a build and throw it up on some static hosting site, like netlify, for free and paste QR codes around.

# Example Game

Here's an example game: https://fdorothy.github.io/urbanovel/qrcodes.html

All of the example game files are in the 'examples' directory in this git repo, and the build is in 'docs'.

# Usage

```
$ cd /path/to/my/urban/novel

$ ls
config.json locations locations.json nodes.json story
```

Open up 'config.json'.

 - domain: set this to wherever you will host
 - contact: update this with the contact info you want to appear below QR codes
 - salt: set this to something secret-ish so that it's hard to cheat

Next, build the site:

```
$ urbanovel.py

$ ls
build config.json locations locations.json nodes.json story

$ ls build/
css explore.html images index.html ink.html locations nodes qrcodes.html reset.html scripts
```

Now, upload this somewhere or just serve it up from localhost:9080. You can click on the QR codes on the 'locations' to simulate a QR code scan.

# Writing a Story

There are two main components to building these stories: locations and nodes.

## Locations

A location represents a single QR code. It ties a location in the real world into your fictional story world.

Each location is listed in the locations.json file. There are a few generic locations, like 'help' and 'unknown'. We'll talk about those later. Here's two locations from the example:

```js
{
  "lobby": {
    "name": "The Lobby",
    "description": "The office park lobby",
    "ink": "locations/lobby.ink"
  },
  "recroom": {
    "name": "Recreation Room",
    "description": "The recreation room",
    "ink": "locations/recroom.ink"
  }
}
```

Locations must have a .ink file associated with them. These ink files are used when a reader visits a location that isn't currently relevant to the story. The ink file should contain generic information about the location since users can revisit nodes that may not having anything to do with the story at the point in time.

## Nodes

Nodes defines the story. You can think of it like a big state machine where each state is a 'node' and each arrow is a 'location'. Let's take a look at the first few lines of the example story.json file:

```js
  "start": {
    "hide": false,
    "ink": "story/intro.ink",
    "name": "Introduction",
    "next": [
      {
        "location": "recroom",
        "node": "search_rec"
      }
    ]
  },
  "search_rec": {
    "ink": "story/search_rec.ink",
    "name": "Searching the Recreation Room",
    "next": [
      {
        "location": "business_card",
        "node": "find_card"
      }
    ]
  },
  ...
```

We always need a 'start' node. The urban novel code will jump right into the story at the 'start' node when someone scans a QR code for the first time. It's important that this node is not hidden (set hide = false), and that its key is 'start', otherwise it won't be possible for anyone to start the story!

The 'hide' parameter defaults to true. This means we do top secret hashing of that node's files, making it nearly impossible to cheat without knowing the location QR codes.

The 'next' parameter is a list of possible places you can go from that node. If you visit those locations then you will move on to the next 'node'. Both nodes and locations can be reused in this graph, but watch out for infinite loops.

