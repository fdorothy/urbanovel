#!/usr/bin/env python3
import json
import sys
import os
import shutil
import pystache
import pyqrcode
import subprocess
import hashlib

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

def render(template, dst, data):
    result = pystache.render(template, {**data, 'partials': PARTIALS})
    f = open(dst, "w")
    f.write(result)
    f.close()

PARTIALS = {
    'nav': pystache.render(template("partials/nav.html"), {})
}
QRCODES = template("qrcodes.html")
INDEX = template("index.html")
RESET = template("reset.html")
INK = template("ink.html")
EXPLORE = template("explore.html")

def build_ink(src, dst):
    subprocess.run(["inklecate", src])
    shutil.copyfile(src + ".json", dst)

def write_json(dst, data):
    f = open(dst, "w")
    f.write(json.dumps(data))
    f.close()

def get_location_key(locations, name):
    return locations[name]["key"]

def get_node_key(nodes, name):
    return nodes[name]["key"]

def hash_name(config, name):
    return hashlib.sha1(config["salt"].encode() + name.encode()).hexdigest()

def _generate_keys(config, objs):
    for name, obj in objs.items():
        if obj.get("hide", True):
            obj["key"] = hash_name(config, name)
        else:
            obj["key"] = name

def generate_keys(config, nodes, locations):
    _generate_keys(config, locations)
    _generate_keys(config, nodes)

def build_locations(config, locations):
    os.makedirs("build/locations")
    for name, location in locations.items():
        base = os.path.join("build", "locations", location["key"])
        os.makedirs(base)

        # build the ink files
        build_ink(location["ink"], os.path.join(base, "ink.json"))

        # write data about the location
        location["ink"] = "locations/%s/ink.json" % location["key"]
        location_path = os.path.join(base, "data.json")
        write_json(location_path, location)

def build_nodes(config, locations, nodes):
    for name, node in nodes.items():
        base = "build/nodes/%s" % node["key"]
        os.makedirs(base)

        # build the ink files
        build_ink(node["ink"], os.path.join(base, "ink.json"))

        # write node's information
        ink = "nodes/%s/ink.json" % node["key"]
        data = {"type": "node", "name": node["name"], "ink": ink}
        write_json(os.path.join(base, "data.json"), data)

        # write places you can go from the node
        for n in node["next"]:
            location_key = get_location_key(locations, n["location"])
            npath = os.path.join(base, location_key)
            os.makedirs(npath)
            data = {"type": "next", "next": get_node_key(nodes, n["node"])}
            write_json(os.path.join(npath, "data.json"), data)

def build_qrcode_image(config, location):
    url = config["domain"] + '/explore.html?location=%s' % location["key"]
    qr = pyqrcode.create(url)
    qr.svg("build/images/qrcodes/%s.svg" % location["key"], scale=4)
    return "/images/qrcodes/%s.svg"

def build_qrcodes(config, locations):
    os.makedirs("build/images/qrcodes")
    location_data = []
    for key, location in locations.items():
        extras = {
            "domain": config["domain"]
        }
        data = dict(location, **extras)
        location_data.append(data)
        build_qrcode_image(config, location)
    render(QRCODES, "build/qrcodes.html", {"locations": location_data, "config": config})

def build_common(config, locations):
    shutil.copytree(os.path.join(BASE_PATH, "scripts"), "build/scripts")
    shutil.copytree(os.path.join(BASE_PATH, "css"), "build/css")
    render(INDEX, "build/index.html", {"config": config})
    render(RESET, "build/reset.html", {"config": config})
    render(INK, "build/ink.html", {"config": config})
    render(EXPLORE, "build/explore.html", {"config": config})

if __name__ == '__main__':
    config = get_json("config.json")
    locations = get_json(config["locations"])
    nodes = get_json(config["nodes"])
    shutil.rmtree("build", True)
    generate_keys(config, nodes, locations)
    build_locations(config, locations)
    build_nodes(config, locations, nodes)
    build_common(config, locations)
    build_qrcodes(config, locations)
