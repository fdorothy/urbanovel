var storyContent = ﻿{"inkVersion":19,"root":[[{"->":"start"},["done",{"#f":5,"#n":"g-0"}],null],"done",{"start":["^A helicopter is idling on the landing pad. It has an umbrella-like logo on its side. A man is loading boxes with a biological hazard symbol onto the helicopter.","\n",{"->":"options"},{"#f":1}],"options":[["^What would you like to do?","\n","ev","str","^Wave","/str","/ev",{"*":".^.c-0","flg":20},"ev","str","^Run to the helicopter","/str","/ev",{"*":".^.c-1","flg":20},"ev","str","^Leave","/str","/ev",{"*":".^.c-2","flg":20},{"c-0":["^ ",{"->":"wave"},"\n",{"#f":5}],"c-1":["^ ",{"->":"run"},"\n",{"#f":5}],"c-2":["^ ","done","\n",{"#f":5}]}],{"#f":1}],"wave":["^You wave at the pilot. He gives you an odd look.","\n",{"->":"options"},{"#f":1}],"run":[["^You run up to the helicopter, just before you reach it a man steps out with a gun.","\n","ev","str","^Karate chop","/str","/ev",{"*":".^.c-0","flg":20},"ev","str","^Run away","/str","/ev",{"*":".^.c-1","flg":20},{"c-0":["^ ",{"->":"karate_chop"},"\n",{"#f":5}],"c-1":["^ ",{"->":"run_away"},"\n",{"#f":5}]}],{"#f":1}],"run_away":["^You run away. Maybe try again later?","\n","done",{"#f":1}],"karate_chop":[["^You karate chop the pilot. He is stunned.","\n","ev","str","^Take the gun","/str","/ev",{"*":".^.c-0","flg":20},"ev","str","^Rush the pilot","/str","/ev",{"*":".^.c-1","flg":20},"ev","str","^Run away","/str","/ev",{"*":".^.c-2","flg":20},{"c-0":["^ ",{"->":"take_gun"},"\n",{"#f":5}],"c-1":["^ ",{"->":"rush_pilot"},"\n",{"#f":5}],"c-2":["^ ",{"->":"run_away"},"\n",{"#f":5}]}],{"#f":1}],"rush_pilot":["^You rush the pilot. However, the man with the gun gets up and clubs you upside the head. You stagger back away from the helicopter.","\n","done",{"#f":1}],"take_gun":[["^You take the gun and club the man with it over the forehead. The pilot begs for mercy as you take in the scene.","\n","^You pull out your phone and call the emergency line. An officer arrives in a few minutes, and thanks you for your service.","\n",["ev",{"^->":"take_gun.0.4.$r1"},{"temp=":"$r"},"str",{"->":".^.s"},[{"#n":"$r1"}],"/str","/ev",{"*":".^.^.c-0","flg":18},{"s":["^GAME OVER ",{"->":"$r","var":true},null]}],{"c-0":["ev",{"^->":"take_gun.0.c-0.$r2"},"/ev",{"temp=":"$r"},{"->":".^.^.4.s"},[{"#n":"$r2"}],"done","\n",{"#f":5}]}],{"#f":1}],"#f":1}],"listDefs":{}};