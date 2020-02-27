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

def render(template, dst, data):
    result = pystache.render(template, data)
    f = open(dst, "w")
    f.write(result)
    f.close()

def write_json(dst, data):
    f = open(dst, "w")
    f.write(json.dumps(data))
    f.close()

def get_zone_key(zones, name):
    return zones[name]["key"]

def get_node_key(nodes, name):
    return nodes[name]["key"]

def build_zones(config, zones):
    os.makedirs("build/images/zones")
    os.makedirs("build/zones")
    for name, zone in zones.items():
        zone_path = os.path.join("build", "zones", zone["key"] + ".json")
        write_json(zone_path, zone)

def build_nodes(config, zones, nodes):
    for name, node in nodes.items():
        base = "build/nodes/%s" % node["key"]
        os.makedirs(base)

        # write node's information
        data = {"type": "node", "name": name, "path": node["path"]}
        write_json(os.path.join(base, "data.json"), data)

        # write places you can go from the node
        for n in node["next"]:
            zone_key = get_zone_key(zones, n["zone"])
            npath = os.path.join(base, zone_key)
            os.makedirs(npath)
            data = {"type": "next", "next": get_node_key(nodes, n["node"])}
            write_json(os.path.join(npath, "data.json"), data)

def build_cheat(config, zones):
    zone_data = []
    for key, zone in zones.items():
        extras = {
            "domain": config["domain"]
        }
        data = dict(zone, **extras)
        zone_data.append(data)
    render(CHEAT, "build/cheat.html", {"zones": zone_data, "config": config})

def build_common(config, zones):
    shutil.copytree(os.path.join(BASE_PATH, "scripts"), "build/scripts")
    shutil.copytree(os.path.join(BASE_PATH, "css"), "build/css")
    shutil.copy(os.path.join(template_path(), "reset.html"), "build")
    render(MAIN, "build/index.html", {"config": config})
    render(EXPLORE, "build/explore.html", {"config": config})

if __name__ == '__main__':
    config = get_json("config.json")
    zones = get_json(config["zones"])
    nodes = get_json(config["nodes"])
    shutil.rmtree("build", True)
    build_zones(config, zones)
    build_nodes(config, zones, nodes)
    build_common(config, zones)
    build_cheat(config, zones)
