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
CHEAT = template("cheat.html")
MAIN = template("main.html")

def render(template, dst, data):
    result = pystache.render(template, data)
    f = open(dst, "w")
    f.write(result)
    f.close()

def build_zones(config, zones):
    os.makedirs("build/images/zones")
    for key, value in zones.items():
        story_path = "build/story/%s" % value["story"]["uuid"]
        hint_path = "build/hint/%s" % value["hint"]["uuid"]
        shutil.copytree(value["story"]["path"], story_path)
        shutil.copytree(value["hint"]["path"], hint_path)
        hit_data = {
            "name": key,
            "uuid": value["story"]["uuid"]
        }
        render(HIT, "build/story/%s/hit.html" % value["story"]["uuid"], hit_data)
        if is_file(value["info"]["icon"]):
            shutil.copy(value["info"]["icon"], "build/images/zones")

def build_main(config, zones):
    zone_data = []
    for key, value in zones.items():
        extras = {
            "id": key
        }
        zone_data.append(dict(value["info"], **extras))
    f = open("build/zones.json", "w")
    json.dump(zone_data, f)
    f.close()
    render(MAIN, "build/index.html", {"zones": zone_data, "config": config})

def build_cheat(config, zones):
    zone_data = []
    for key, value in zones.items():
        extras = {
            "hit": "story/%s/hit.html" % value["story"]["uuid"],
            "hint": "hint/%s" % value["hint"]["uuid"],
            "domain": config["domain"]
        }
        data = dict(value["info"], **extras)
        print(data)
        zone_data.append(data)
    render(CHEAT, "build/cheat.html", {"zones": zone_data, "config": config})

def build_common(config, zones):
    shutil.copytree(os.path.join(BASE_PATH, "scripts"), "build/scripts")
    shutil.copytree(os.path.join(BASE_PATH, "css"), "build/css")
    shutil.copy(os.path.join(template_path(), "reset.html"), "build")
    build_main(config, zones)
    build_cheat(config, zones)

if __name__ == '__main__':
    config = get_json("config.json")
    zones = get_json(config["zones"])
    shutil.rmtree("build", True)
    build_zones(config, zones)
    build_common(config, zones)
