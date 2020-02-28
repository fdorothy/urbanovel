#!/usr/bin/env python3
import json
import sys
import os
import shutil
import pystache

BASE_PATH = os.path.dirname(os.path.realpath(__file__))

def get_json(path):
    with open(path) as f:
        return json.load(f)

def is_file(path):
    return path and os.path.exists(path)

def template_path():
    return os.path.join(BASE_PATH, "templates")

def template(name):
    path = os.path.join(template_path(), name)
    with open(path) as f:
        return pystache.parse(f.read())

CHEAT = template("cheat.html")
MAIN = template("main.html")
EXPLORE = template("explore.html")
INK = template("ink.html")

def render(template, dst, data):
    result = pystache.render(template, data)
    f = open(dst, "w")
    f.write(result)
    f.close()

def write_json(dst, data):
    f = open(dst, "w")
    f.write(json.dumps(data))
    f.close()

def get_location_key(locations, name):
    return locations[name]["key"]

def get_node_key(nodes, name):
    return nodes[name]["key"]

def build_locations(config, locations):
    os.makedirs("build/images/locations")
    os.makedirs("build/locations")
    for name, location in locations.items():
        location_path = os.path.join("build", "locations", location["key"] + ".json")
        write_json(location_path, location)

def build_nodes(config, locations, nodes):
    for name, node in nodes.items():
        base = "build/nodes/%s" % node["key"]
        os.makedirs(base)

        # copy the ink files to the node
        ink_url = os.path.join(base, "ink.js")
        shutil.copyfile(node["ink"], ink_url)

        # write out the ink html file
        data = {"config": config, "node": node, "ink_url": "ink.js"}
        story_path = os.path.join(base, "ink.html")
        render(INK, story_path, data)

        # write node's information
        story_url = os.path.join("nodes", node["key"], "ink.html")
        data = {"type": "node", "name": name, "ink": ink_url, "story": story_url}
        write_json(os.path.join(base, "data.json"), data)

        # write places you can go from the node
        for n in node["next"]:
            location_key = get_location_key(locations, n["location"])
            npath = os.path.join(base, location_key)
            os.makedirs(npath)
            data = {"type": "next", "next": get_node_key(nodes, n["node"])}
            write_json(os.path.join(npath, "data.json"), data)

def build_cheat(config, locations):
    location_data = []
    for key, location in locations.items():
        extras = {
            "domain": config["domain"]
        }
        data = dict(location, **extras)
        location_data.append(data)
    render(CHEAT, "build/cheat.html", {"locations": location_data, "config": config})

def build_common(config, locations):
    shutil.copytree(os.path.join(BASE_PATH, "scripts"), "build/scripts")
    shutil.copytree(os.path.join(BASE_PATH, "css"), "build/css")
    shutil.copy(os.path.join(template_path(), "reset.html"), "build")
    render(MAIN, "build/index.html", {"config": config})
    render(EXPLORE, "build/explore.html", {"config": config})

if __name__ == '__main__':
    config = get_json("config.json")
    locations = get_json(config["locations"])
    nodes = get_json(config["nodes"])
    shutil.rmtree("build", True)
    build_locations(config, locations)
    build_nodes(config, locations, nodes)
    build_common(config, locations)
    build_cheat(config, locations)
