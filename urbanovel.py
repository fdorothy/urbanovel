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

HIT = template("hit.html")
MAIN = template("main.html")

def render(template, dst, data):
    result = pystache.render(template, data)
    f = open(dst, "w")
    f.write(result)
    f.close()

def build_zones(zones):
    os.makedirs("build/images/zones")
    for key, value in zones.items():
        story_path = "build/story/%s" % value["story"]["uuid"]
        hint_path = "build/hint/%s" % value["hint"]["uuid"]
        shutil.copytree(value["story"]["path"], story_path)
        shutil.copytree(value["hint"]["path"], hint_path)
        render(HIT, "build/story/%s/hit.html" % value["story"]["uuid"], {})
        if is_file(value["info"]["icon"]):
            shutil.copy(value["info"]["icon"], "build/images/zones")

def build_index(zones):
    render(MAIN, "build/index.html", {})

if __name__ == '__main__':
    config = get_json("config.json")
    zones = get_json(config["zones"])
    shutil.rmtree("build", True)
    os.mkdir("build")
    build_zones(zones)
    build_index(zones)
