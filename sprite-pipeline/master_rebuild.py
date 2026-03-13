"""
Master rebuild: Extract ALL WZ from source of truth, add all custom content, repack, deploy.
Handles: ALL 12 WZ files. Modifies: Npc.wz, Mob.wz, String.wz, Skill.wz
"""
import subprocess, json, os, time, threading, shutil, re

WZIMG_EXE = r"C:\Users\rdiol\sela\workspace\WzImg-MCP-Server\WzImgMCP\bin\Debug\net8.0-windows\WzImgMCP.exe"
WZ_INJECTOR_DIR = r"C:\Users\rdiol\Desktop\wz-injector"
VANILLA_WZ_DIR = r"C:\Users\rdiol\Downloads\Character.wz"  # Untouched vanilla WZ files
ORIGINAL_WZ_DIR = r"C:\Users\rdiol\sela\workspace\Cosmic-client"  # Source of truth
FRESH_DATA = r"C:\Users\rdiol\Desktop\fresh-wz-data"
OUTPUT_DIR = os.path.join(FRESH_DATA, "output")
PATCHER_DIR = os.path.expanduser("~/sela/workspace/v83-client-patched")
COSMIC_WZ = os.path.expanduser("~/sela/workspace/Cosmic/wz")
NPC_B64_FILE = r"C:\Users\rdiol\maple-lora\npc_b64_all.json"
MOB_B64_FILE = r"C:\Users\rdiol\maple-lora\mob_b64_all.json"
SKILL_B64_FILE = r"C:\Users\rdiol\maple-lora\skill_effects_b64.json"
OLD_PATCHED = r"C:\Users\rdiol\Desktop\cosmic-wz-patched"

# Skill rename mappings (source skill ID -> custom skill ID)
SKILL_JOBS = {
    "600.img": {
        "source": "200.img",
        "renames": {
            "2000000": "6001000", "2000001": "6001001", "2001001": "6001002",
            "2001002": "6001003", "2001003": "6001004", "2001004": "6001005",
        }
    },
    "610.img": {
        "source": "210.img",
        "renames": {
            "2101001": "6101000", "2101002": "6101001", "2101003": "6101002",
            "2101004": "6101003", "2101005": "6101004", "2100000": "6101005",
        }
    },
    "611.img": {
        "source": "211.img",
        "renames": {
            "2111001": "6111000", "2111002": "6111001", "2111003": "6111002",
            "2111005": "6111003", "2111006": "6111004", "2110001": "6111005",
            "2110000": "6111006",
        }
    },
    "612.img": {
        "source": "212.img",
        "renames": {
            "2121000": "6121000", "2121001": "6121001", "2121003": "6121002",
            "2121004": "6121003", "2121005": "6121004", "2121006": "6121005",
            "2121007": "6121006", "2121008": "6121007", "2120000": "6121008",
            "2120001": "6121009",
        }
    },
    "700.img": {
        "source": "200.img",
        "renames": {
            "2000000": "7001000", "2000001": "7001001", "2001001": "7001002",
            "2001002": "7001003", "2001003": "7001004", "2001004": "7001005",
        }
    },
    "710.img": {
        "source": "220.img",
        "renames": {
            "2201001": "7101000", "2201002": "7101001", "2201003": "7101002",
            "2201004": "7101003", "2201005": "7101004", "2200000": "7101005",
        }
    },
    "711.img": {
        "source": "221.img",
        "renames": {
            "2211001": "7111000", "2211002": "7111001", "2211003": "7111002",
            "2211005": "7111003", "2211006": "7111004", "2210001": "7111005",
            "2210000": "7111006",
        }
    },
    "712.img": {
        "source": "222.img",
        "renames": {
            "2221000": "7121000", "2221001": "7121001", "2221003": "7121002",
            "2221004": "7121003", "2221005": "7121004", "2221006": "7121005",
            "2221007": "7121006", "2221008": "7121007", "2220000": "7121008",
            "2220001": "7121009",
        }
    },
}

SKILL_STRINGS = {}
for jid, name in [("600","Sage Basics"),("610","Elementalist Skills"),("611","Arcanum Skills"),("612","Archsage Skills"),
                   ("700","Necromancer Basics"),("710","Dark Acolyte Skills"),("711","Soul Reaper Skills"),("712","Lich King Skills")]:
    SKILL_STRINGS[jid] = {"bookName": name}
for sid, sname in {
    "6001000": "Arcane Bolt", "6001001": "Mana Shield", "6001002": "Elemental Attunement",
    "6001003": "Sage's Wisdom", "6001004": "Runic Strike", "6001005": "Teleport",
    "6101000": "Flame Pillar", "6101001": "Frost Nova", "6101002": "Lightning Chain",
    "6101003": "Elemental Boost", "6101004": "Spell Mastery", "6101005": "Mana Surge",
    "6101006": "Arcane Barrier", "6101007": "Element Shift",
    "6111000": "Meteor Shower", "6111001": "Blizzard", "6111002": "Thunder Spear",
    "6111003": "Elemental Convergence", "6111004": "Sage Meditation", "6111005": "Runic Ward",
    "6111006": "Arcane Explosion", "6111007": "Mystic Door",
    "6121000": "Primordial Inferno", "6121001": "Absolute Zero", "6121002": "Divine Thunder",
    "6121003": "Elemental Unity", "6121004": "Sage's Enlightenment", "6121005": "Arcane Mastery",
    "6121006": "Infinity", "6121007": "Hero's Will", "6121008": "Maple Warrior", "6121009": "Elemental Storm",
    "7001000": "Dark Bolt", "7001001": "Soul Drain", "7001002": "Dark Aura",
    "7001003": "Bone Shield", "7001004": "Shadow Strike", "7001005": "Teleport",
    "7101000": "Plague Touch", "7101001": "Corpse Explosion", "7101002": "Summon Skeleton",
    "7101003": "Dark Mastery", "7101004": "Life Tap", "7101005": "Necrotic Boost",
    "7101006": "Fear", "7101007": "Curse of Weakness",
    "7111000": "Death Coil", "7111001": "Army of the Dead", "7111002": "Soul Harvest",
    "7111003": "Blight", "7111004": "Dark Meditation", "7111005": "Bone Armor",
    "7111006": "Necrotic Explosion", "7111007": "Death Gate",
    "7121000": "Doom", "7121001": "Raise Lich", "7121002": "Soul Shatter",
    "7121003": "Plague Lord", "7121004": "Dark Pact", "7121005": "Necro Mastery",
    "7121006": "Undying Will", "7121007": "Hero's Will", "7121008": "Maple Warrior", "7121009": "Death's Embrace",
}.items():
    SKILL_STRINGS[sid] = {"name": sname}

msg_id = 0

def bgra_to_png_b64(b64_bgra, w, h, remove_bg=False):
    """Convert BGRA raw bitmap base64 to PNG base64, optionally removing white background."""
    import base64 as b64mod
    from io import BytesIO
    from PIL import Image
    import numpy as np
    raw_bytes = b64mod.b64decode(b64_bgra)
    pil_img = Image.frombytes("RGBA", (w, h), raw_bytes, "raw", "BGRA")
    if remove_bg:
        from scipy import ndimage
        arr = np.array(pil_img)
        # Flood-fill white background from edges (same algo as gen_all_custom_npcs.py)
        wm = (arr[:, :, 0] > 225) & (arr[:, :, 1] > 225) & (arr[:, :, 2] > 225)
        labeled, _ = ndimage.label(wm.astype(np.uint8))
        edge_labels = set()
        edge_labels.update(labeled[0, :].tolist(), labeled[-1, :].tolist(),
                           labeled[:, 0].tolist(), labeled[:, -1].tolist())
        edge_labels.discard(0)
        for l in edge_labels:
            arr[:, :, 3][labeled == l] = 0
        pil_img = Image.fromarray(arr)
    buf = BytesIO()
    pil_img.save(buf, format="PNG")
    return b64mod.b64encode(buf.getvalue()).decode('ascii')

def stderr_reader(proc):
    for line in proc.stderr:
        pass

def send_recv(proc, method, params):
    global msg_id
    msg_id += 1
    msg = {"jsonrpc": "2.0", "id": msg_id, "method": method, "params": params}
    proc.stdin.write((json.dumps(msg) + "\n").encode('utf-8'))
    proc.stdin.flush()
    while True:
        resp_line = proc.stdout.readline()
        if not resp_line:
            raise Exception("EOF")
        resp = json.loads(resp_line.decode('utf-8'))
        if "id" in resp:
            return resp

def call_tool(proc, name, args):
    resp = send_recv(proc, "tools/call", {"name": name, "arguments": args})
    result = resp.get("result", {})
    content = result.get("content", [])
    text = content[0].get("text", "") if content else ""
    is_error = result.get("isError", False)
    try:
        return json.loads(text), is_error
    except:
        return text, is_error

def parse_xml_entries(xml_path):
    entries = {}
    with open(xml_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    for m in re.finditer(r'<imgdir name="(\d+)">(.*?)</imgdir>', content, re.DOTALL):
        nid = m.group(1)
        block = m.group(2)
        props = {}
        for sm in re.finditer(r'<string name="(\w+)" value="([^"]*)"', block):
            props[sm.group(1)] = sm.group(2)
        if props:
            entries[nid] = props
    return entries

def main():
    # ── Step 1: Extract ALL WZ from source of truth ──
    print("=== Step 1: Extract from source of truth ===")
    TEMP_WZ = r"C:\Users\rdiol\Desktop\temp-wz-extract"
    if os.path.exists(TEMP_WZ):
        shutil.rmtree(TEMP_WZ)
    os.makedirs(TEMP_WZ)
    if os.path.exists(FRESH_DATA):
        shutil.rmtree(FRESH_DATA)
    os.makedirs(FRESH_DATA)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Copy only the WZ files we need to modify
    all_wz = [f for f in os.listdir(ORIGINAL_WZ_DIR) if f.endswith('.wz')]
    modify_wz = ["Npc.wz", "Mob.wz", "String.wz", "Skill.wz"]
    for wz in modify_wz:
        src = os.path.join(ORIGINAL_WZ_DIR, wz)
        shutil.copy2(src, os.path.join(TEMP_WZ, wz))
        print(f"  Copied {wz} ({os.path.getsize(src)/(1024*1024):.1f} MB)")

    # Start MCP
    env = os.environ.copy()
    env["WZIMGMCP_DATA_PATH"] = r"C:\Users\rdiol\sela\workspace\v83-img-data"
    proc = subprocess.Popen(
        [WZIMG_EXE], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env,
    )
    t = threading.Thread(target=stderr_reader, args=(proc,), daemon=True)
    t.start()
    time.sleep(2)

    send_recv(proc, "initialize", {
        "protocolVersion": "2024-11-05", "capabilities": {},
        "clientInfo": {"name": "master-rebuild", "version": "1.0"}
    })
    proc.stdin.write((json.dumps({"jsonrpc": "2.0", "method": "notifications/initialized"}) + "\n").encode('utf-8'))
    proc.stdin.flush()
    time.sleep(0.5)

    # Extract all WZ to .img
    print("  Extracting all WZ files...")
    result, err = call_tool(proc, "extract_to_img", {
        "wzPath": TEMP_WZ,
        "outputDir": FRESH_DATA,
        "createManifest": False
    })
    if isinstance(result, dict):
        print(f"  Categories: {result.get('categoriesExtracted', '?')}, Images: {result.get('imagesExtracted', '?')}")

    # Verify key dirs
    for d in ["Npc", "Mob", "String", "Skill"]:
        path = os.path.join(FRESH_DATA, d)
        if os.path.exists(path):
            count = len([f for f in os.listdir(path) if f.endswith('.img')])
            print(f"  {d}/: {count} .img files")
        else:
            print(f"  {d}/: MISSING!")
            proc.stdin.close(); proc.terminate()
            return

    # ── Step 2: Create custom mob .img files from clean vanilla template ──
    print("\n=== Step 2: Create custom mob .img from vanilla template ===")
    dst_mob_dir = os.path.join(FRESH_DATA, "Mob")
    # Use a small vanilla mob (Green Snail) as template
    mob_template = os.path.join(dst_mob_dir, "0100100.img")
    if os.path.exists(MOB_B64_FILE):
        with open(MOB_B64_FILE, 'r') as f:
            mob_ids = list(json.load(f).keys())
        for mob_id in sorted(mob_ids):
            dst = os.path.join(dst_mob_dir, f"{mob_id}.img")
            if not os.path.exists(dst):
                shutil.copy2(mob_template, dst)
        print(f"  Created {len(mob_ids)} custom mob .img files from clean template")

    # ── Step 2b: Import custom mob sprites ──
    print("\n=== Step 2b: Import mob sprites ===")
    if os.path.exists(MOB_B64_FILE):
        with open(MOB_B64_FILE, 'r') as f:
            mob_b64 = json.load(f)
        print(f"  Have sprites for {len(mob_b64)} mobs")

        call_tool(proc, "init_data_source", {"basePath": FRESH_DATA})

        # Mob animation states and their frame counts
        MOB_STATES = ["stand", "move", "attack1", "hit1", "die1"]

        mob_imported = 0
        mob_failed = 0
        for mob_id in sorted(mob_b64.keys()):
            img_name = f"{mob_id}.img"
            img_path = os.path.join(dst_mob_dir, img_name)
            if not os.path.exists(img_path):
                print(f"  SKIP {mob_id}: no .img template")
                mob_failed += 1
                continue

            mob_frames = mob_b64[mob_id]
            if "stand_0" not in mob_frames:
                mob_failed += 1
                continue

            # Convert all frames to PNG
            png_frames = {}
            try:
                for fname, fdata in mob_frames.items():
                    png_frames[fname] = bgra_to_png_b64(fdata["b64"], fdata["w"], fdata["h"])
            except Exception as e:
                print(f"  SKIP {mob_id}: PNG convert failed: {e}")
                mob_failed += 1
                continue

            # Parse the template mob .img
            call_tool(proc, "parse_image", {"category": "mob", "image": img_name})

            # Get existing tree to see what states exist in template
            tree, terr = call_tool(proc, "get_tree_structure", {
                "category": "mob", "image": img_name, "depth": 2, "maxChildrenPerNode": 100
            })
            existing_states = set()
            if isinstance(tree, dict) and "data" in tree:
                for child in tree["data"]["tree"].get("children", []):
                    existing_states.add(child["name"])

            # For each animation state, replace existing canvases or create new state
            for state in MOB_STATES:
                state_frames = sorted([f for f in png_frames if f.startswith(f"{state}_")])
                if not state_frames:
                    continue

                if state in existing_states:
                    # State exists in template — get its children
                    stree, _ = call_tool(proc, "get_tree_structure", {
                        "category": "mob", "image": img_name,
                        "path": state, "depth": 2, "maxChildrenPerNode": 50
                    })
                    existing_frames = set()
                    if isinstance(stree, dict) and "data" in stree:
                        for child in stree["data"]["tree"].get("children", []):
                            existing_frames.add(child["name"])

                    # Replace frame 0 into all existing canvases
                    fd0 = mob_frames[state_frames[0]]
                    for ef in existing_frames:
                        # Only replace numeric frame canvases
                        if ef.isdigit():
                            call_tool(proc, "set_canvas_bitmap", {
                                "category": "mob", "image": img_name,
                                "path": f"{state}/{ef}", "base64Png": png_frames[state_frames[0]]
                            })
                            call_tool(proc, "set_canvas_origin", {
                                "category": "mob", "image": img_name,
                                "path": f"{state}/{ef}",
                                "x": fd0["w"] // 2, "y": fd0["h"]
                            })
                            # Update lt/rb/head to match new sprite dimensions
                            w, h = fd0["w"], fd0["h"]
                            call_tool(proc, "set_vector", {
                                "category": "mob", "image": img_name,
                                "path": f"{state}/{ef}/lt",
                                "x": -(w // 2), "y": -h
                            })
                            call_tool(proc, "set_vector", {
                                "category": "mob", "image": img_name,
                                "path": f"{state}/{ef}/rb",
                                "x": w // 2, "y": 0
                            })
                            call_tool(proc, "set_vector", {
                                "category": "mob", "image": img_name,
                                "path": f"{state}/{ef}/head",
                                "x": -(w // 3), "y": -(h - 2)
                            })

                    # Import additional frames beyond what template has
                    for sf in state_frames:
                        idx = sf.split("_")[1]
                        if idx not in existing_frames:
                            fd = mob_frames[sf]
                            call_tool(proc, "import_png", {
                                "category": "mob", "image": img_name,
                                "parentPath": state, "name": idx,
                                "base64Png": png_frames[sf],
                                "originX": fd["w"] // 2, "originY": fd["h"]
                            })
                            call_tool(proc, "add_property", {
                                "category": "mob", "image": img_name,
                                "parentPath": f"{state}/{idx}", "name": "delay",
                                "type": "Int", "value": "120"
                            })
                            # v83 client requires lt, rb, head vectors on every mob frame
                            w, h = fd["w"], fd["h"]
                            for vname, vx, vy in [("lt", -(w // 2), -h), ("rb", w // 2, 0), ("head", -(w // 3), -(h - 2))]:
                                call_tool(proc, "add_property", {
                                    "category": "mob", "image": img_name,
                                    "parentPath": f"{state}/{idx}", "name": vname,
                                    "type": "Vector"
                                })
                                call_tool(proc, "set_vector", {
                                    "category": "mob", "image": img_name,
                                    "path": f"{state}/{idx}/{vname}",
                                    "x": vx, "y": vy
                                })
                else:
                    # State doesn't exist — create it
                    call_tool(proc, "add_property", {
                        "category": "mob", "image": img_name,
                        "parentPath": "", "name": state,
                        "type": "SubProperty"
                    })
                    for sf in state_frames:
                        idx = sf.split("_")[1]
                        fd = mob_frames[sf]
                        call_tool(proc, "import_png", {
                            "category": "mob", "image": img_name,
                            "parentPath": state, "name": idx,
                            "base64Png": png_frames[sf],
                            "originX": fd["w"] // 2, "originY": fd["h"]
                        })
                        call_tool(proc, "add_property", {
                            "category": "mob", "image": img_name,
                            "parentPath": f"{state}/{idx}", "name": "delay",
                            "type": "Int", "value": "120"
                        })
                        # v83 client requires lt, rb, head vectors on every mob frame
                        w, h = fd["w"], fd["h"]
                        call_tool(proc, "add_property", {
                            "category": "mob", "image": img_name,
                            "parentPath": f"{state}/{idx}", "name": "lt",
                            "type": "Vector", "value": f"{-(w // 2)},{-h}"
                        })
                        call_tool(proc, "add_property", {
                            "category": "mob", "image": img_name,
                            "parentPath": f"{state}/{idx}", "name": "rb",
                            "type": "Vector", "value": f"{w // 2},0"
                        })
                        call_tool(proc, "add_property", {
                            "category": "mob", "image": img_name,
                            "parentPath": f"{state}/{idx}", "name": "head",
                            "type": "Vector", "value": f"{-(w // 3)},{-(h - 2)}"
                        })

            # Set stand/move delays slightly different
            for sf in sorted([f for f in png_frames if f.startswith("stand_")]):
                idx = sf.split("_")[1]
                call_tool(proc, "set_int", {
                    "category": "mob", "image": img_name,
                    "path": f"stand/{idx}/delay", "value": 200
                })
            for sf in sorted([f for f in png_frames if f.startswith("die1_")]):
                idx = sf.split("_")[1]
                call_tool(proc, "set_int", {
                    "category": "mob", "image": img_name,
                    "path": f"die1/{idx}/delay", "value": 150
                })

            call_tool(proc, "save_image", {"category": "mob", "image": img_name})
            mob_imported += 1
            print(f"  {mob_id}: imported {len(png_frames)} frames across {len(MOB_STATES)} states")

        print(f"  Mob sprites imported: {mob_imported}, Failed: {mob_failed}")
    else:
        print(f"  SKIP: {MOB_B64_FILE} not found")

    # ── Step 3: Copy custom NPC .img files and import sprites ──
    print("\n=== Step 3: Import NPC sprites ===")
    src_npc_dir = os.path.join(OLD_PATCHED, "Npc")
    dst_npc_dir = os.path.join(FRESH_DATA, "Npc")

    custom_npcs = [f for f in os.listdir(src_npc_dir) if f.startswith("999") and f.endswith(".img") and not f.endswith(".tmp")]
    for f in sorted(custom_npcs):
        shutil.copy2(os.path.join(src_npc_dir, f), os.path.join(dst_npc_dir, f))
    print(f"  Copied {len(custom_npcs)} custom NPC .img files")

    with open(NPC_B64_FILE, 'r') as f:
        npc_b64 = json.load(f)
    print(f"  Have sprites for {len(npc_b64)} NPCs")

    call_tool(proc, "init_data_source", {"basePath": FRESH_DATA})

    imported = 0
    failed = 0
    for npc_id in sorted(npc_b64.keys()):
        img_name = f"{npc_id}.img"
        img_path = os.path.join(dst_npc_dir, img_name)
        if not os.path.exists(img_path):
            failed += 1
            continue

        npc_frames = npc_b64[npc_id]
        # Need at least stand_0
        if "stand_0" not in npc_frames:
            failed += 1
            continue

        # Convert all frames to PNG (with bg removal for old single-frame data)
        has_multi = "stand_1" in npc_frames or "move_0" in npc_frames
        png_frames = {}
        try:
            for fname, fdata in npc_frames.items():
                png_frames[fname] = bgra_to_png_b64(fdata["b64"], fdata["w"], fdata["h"],
                                                     remove_bg=not has_multi)
        except Exception as conv_err:
            print(f"  SKIP {npc_id}: PNG conversion failed: {conv_err}")
            failed += 1
            continue

        # Get existing tree to find stand canvases
        tree, terr = call_tool(proc, "get_tree_structure", {
            "category": "npc", "image": img_name, "depth": 3, "maxChildrenPerNode": 50
        })
        if terr or not isinstance(tree, dict):
            failed += 1
            continue

        # Find existing canvas paths to stamp stand_0 into
        canvas_paths = []
        def find_canvases(node, path=""):
            if node.get("type") == "Canvas":
                canvas_paths.append(path)
            for child in node.get("children", []):
                child_path = f"{path}/{child['name']}" if path else child['name']
                find_canvases(child, child_path)
        find_canvases(tree.get("data", {}).get("tree", {}))

        s0 = npc_frames["stand_0"]
        s0w, s0h = s0["w"], s0["h"]

        # Stamp stand_0 into all existing canvases (stand/0, finger/0, wink/0, wink/1 etc)
        for cp in canvas_paths:
            call_tool(proc, "set_canvas_bitmap", {
                "category": "npc", "image": img_name,
                "path": cp, "base64Png": png_frames["stand_0"]
            })
            call_tool(proc, "set_canvas_origin", {
                "category": "npc", "image": img_name,
                "path": cp, "x": s0w // 2, "y": s0h
            })

        # Import extra stand frames (stand_1, stand_2) if available
        for si in range(1, 3):
            fname = f"stand_{si}"
            if fname not in png_frames:
                continue
            fd = npc_frames[fname]
            call_tool(proc, "import_png", {
                "category": "npc", "image": img_name,
                "parentPath": "stand", "name": str(si),
                "base64Png": png_frames[fname],
                "originX": fd["w"] // 2, "originY": fd["h"]
            })
            # Add delay property
            call_tool(proc, "add_property", {
                "category": "npc", "image": img_name,
                "parentPath": f"stand/{si}", "name": "delay",
                "type": "Int", "value": "200"
            })

        # Create move/ imgdir and import move frames if available
        move_frames = [f for f in png_frames if f.startswith("move_")]
        if move_frames:
            call_tool(proc, "add_property", {
                "category": "npc", "image": img_name,
                "parentPath": "", "name": "move",
                "type": "SubProperty"
            })
            for mf in sorted(move_frames):
                idx = mf.split("_")[1]  # "0", "1", "2", "3"
                fd = npc_frames[mf]
                call_tool(proc, "import_png", {
                    "category": "npc", "image": img_name,
                    "parentPath": "move", "name": idx,
                    "base64Png": png_frames[mf],
                    "originX": fd["w"] // 2, "originY": fd["h"]
                })
                call_tool(proc, "add_property", {
                    "category": "npc", "image": img_name,
                    "parentPath": f"move/{idx}", "name": "delay",
                    "type": "Int", "value": "200"
                })

        call_tool(proc, "save_image", {"category": "npc", "image": img_name})
        imported += 1
        if imported % 10 == 0:
            print(f"  Imported {imported}...")

    print(f"  Imported sprites: {imported}, Failed: {failed}")

    # ── Step 4: Build custom Skill .img files (copy + rename IDs) ──
    print("\n=== Step 4: Build custom Skill .img files ===")
    skill_dir = os.path.join(FRESH_DATA, "Skill")

    for img_name, info in SKILL_JOBS.items():
        src = os.path.join(skill_dir, info["source"])
        dst = os.path.join(skill_dir, img_name)
        shutil.copy2(src, dst)
        print(f"  {info['source']} -> {img_name}")

    # Re-init to pick up new files
    call_tool(proc, "init_data_source", {"basePath": FRESH_DATA})

    # Rename skill IDs in each custom .img
    print("\n=== Step 4b: Rename skill IDs ===")
    for img_name, info in SKILL_JOBS.items():
        call_tool(proc, "parse_image", {"category": "skill", "image": img_name})

        tree, _ = call_tool(proc, "get_tree_structure", {
            "category": "skill", "image": img_name, "depth": 2, "maxChildrenPerNode": 200
        })
        if not isinstance(tree, dict) or "data" not in tree:
            print(f"  [{img_name}] ERROR: can't read tree")
            continue

        skill_node = None
        for child in tree["data"]["tree"].get("children", []):
            if child["name"] == "skill":
                skill_node = child
                break
        if not skill_node:
            print(f"  [{img_name}] ERROR: no skill node")
            continue

        existing = {c["name"] for c in skill_node.get("children", [])}

        renamed = 0
        for old_id, new_id in info["renames"].items():
            if old_id in existing:
                result, err = call_tool(proc, "rename_property", {
                    "category": "skill", "image": img_name,
                    "path": f"skill/{old_id}", "newName": new_id
                })
                if not err:
                    renamed += 1

        # Delete leftover unmapped skills
        tree2, _ = call_tool(proc, "get_tree_structure", {
            "category": "skill", "image": img_name, "depth": 2, "maxChildrenPerNode": 200
        })
        if isinstance(tree2, dict) and "data" in tree2:
            for child in tree2["data"]["tree"].get("children", []):
                if child["name"] == "skill":
                    new_ids = set(info["renames"].values())
                    for sc in child.get("children", []):
                        if sc["name"] not in new_ids:
                            call_tool(proc, "delete_property", {
                                "category": "skill", "image": img_name,
                                "path": f"skill/{sc['name']}"
                            })

        print(f"  [{img_name}] Renamed {renamed}/{len(info['renames'])}")
        call_tool(proc, "save_image", {"category": "skill", "image": img_name})

    # ── Step 4c: Import custom skill effects ──
    print("\n=== Step 4c: Import custom skill effects ===")
    if os.path.exists(SKILL_B64_FILE):
        with open(SKILL_B64_FILE, 'r') as f:
            skill_b64 = json.load(f)
        print(f"  Loaded effects for {len(skill_b64)} skills")

        # Group by .img
        by_img = {}
        for skill_id in skill_b64:
            job_id = int(skill_id) // 10000
            img = f"{job_id}.img"
            by_img.setdefault(img, []).append(skill_id)

        total_replaced = 0
        for img_name in sorted(by_img.keys()):
            skill_ids = sorted(by_img[img_name])
            img_path = os.path.join(skill_dir, img_name)
            if not os.path.exists(img_path):
                continue

            call_tool(proc, "parse_image", {"category": "skill", "image": img_name})

            for skill_id in skill_ids:
                data = skill_b64[skill_id]

                tree, _ = call_tool(proc, "get_tree_structure", {
                    "category": "skill", "image": img_name,
                    "path": f"skill/{skill_id}", "depth": 2, "maxChildrenPerNode": 100
                })
                existing_children = set()
                if isinstance(tree, dict) and "data" in tree:
                    for child in tree["data"]["tree"].get("children", []):
                        existing_children.add(child["name"])

                # Icon
                icon_data = data["icon"]
                icon_png = bgra_to_png_b64(icon_data["b64"], icon_data["w"], icon_data["h"])
                if "icon" in existing_children:
                    call_tool(proc, "set_canvas_bitmap", {
                        "category": "skill", "image": img_name,
                        "path": f"skill/{skill_id}/icon",
                        "base64Png": icon_png
                    })
                for icon_name in ["iconMouseOver", "iconDisabled"]:
                    if icon_name in existing_children:
                        call_tool(proc, "set_canvas_bitmap", {
                            "category": "skill", "image": img_name,
                            "path": f"skill/{skill_id}/{icon_name}",
                            "base64Png": icon_png
                        })

                # Effect frames
                if "effect" in existing_children and data.get("effect"):
                    etree, _ = call_tool(proc, "get_tree_structure", {
                        "category": "skill", "image": img_name,
                        "path": f"skill/{skill_id}/effect",
                        "depth": 1, "maxChildrenPerNode": 50
                    })
                    effect_children = set()
                    if isinstance(etree, dict) and "data" in etree:
                        for child in etree["data"]["tree"].get("children", []):
                            effect_children.add(child["name"])
                    for i, frame in enumerate(data["effect"]):
                        if str(i) in effect_children:
                            frame_png = bgra_to_png_b64(frame["b64"], frame["w"], frame["h"])
                            call_tool(proc, "set_canvas_bitmap", {
                                "category": "skill", "image": img_name,
                                "path": f"skill/{skill_id}/effect/{i}",
                                "base64Png": frame_png
                            })
                            call_tool(proc, "set_canvas_origin", {
                                "category": "skill", "image": img_name,
                                "path": f"skill/{skill_id}/effect/{i}",
                                "x": frame["w"] // 2, "y": frame["h"] // 2
                            })
                            total_replaced += 1

                # Hit frames
                if "hit" in existing_children and data.get("hit"):
                    htree, _ = call_tool(proc, "get_tree_structure", {
                        "category": "skill", "image": img_name,
                        "path": f"skill/{skill_id}/hit",
                        "depth": 2, "maxChildrenPerNode": 50
                    })
                    hit_sub = set()
                    if isinstance(htree, dict) and "data" in htree:
                        for child in htree["data"]["tree"].get("children", []):
                            hit_sub.add(child["name"])
                    if "0" in hit_sub:
                        h0tree, _ = call_tool(proc, "get_tree_structure", {
                            "category": "skill", "image": img_name,
                            "path": f"skill/{skill_id}/hit/0",
                            "depth": 1, "maxChildrenPerNode": 50
                        })
                        hit_frames_existing = set()
                        if isinstance(h0tree, dict) and "data" in h0tree:
                            for child in h0tree["data"]["tree"].get("children", []):
                                hit_frames_existing.add(child["name"])
                        for i, frame in enumerate(data["hit"]):
                            if str(i) in hit_frames_existing:
                                hit_png = bgra_to_png_b64(frame["b64"], frame["w"], frame["h"])
                                call_tool(proc, "set_canvas_bitmap", {
                                    "category": "skill", "image": img_name,
                                    "path": f"skill/{skill_id}/hit/0/{i}",
                                    "base64Png": hit_png
                                })
                                call_tool(proc, "set_canvas_origin", {
                                    "category": "skill", "image": img_name,
                                    "path": f"skill/{skill_id}/hit/0/{i}",
                                    "x": frame["w"] // 2, "y": frame["h"] // 2
                                })
                                total_replaced += 1

            call_tool(proc, "save_image", {"category": "skill", "image": img_name})
            print(f"  [{img_name}] {len(skill_ids)} skills processed")

        print(f"  Total canvas replacements: {total_replaced}")
    else:
        print(f"  SKIP: {SKILL_B64_FILE} not found")

    # ── Step 5: Add String.wz entries ──
    print("\n=== Step 5: Add String.wz entries ===")

    # NPC entries from server XML
    npc_xml = os.path.join(COSMIC_WZ, "String.wz", "Npc.img.xml")
    mob_xml = os.path.join(COSMIC_WZ, "String.wz", "Mob.img.xml")
    all_npc_entries = parse_xml_entries(npc_xml)
    all_mob_entries = parse_xml_entries(mob_xml)

    custom_npc_entries = {k: v for k, v in all_npc_entries.items() if k.startswith('99')}
    custom_mob_entries = {k: v for k, v in all_mob_entries.items() if k.startswith('99')}

    npc_img_ids = set(f.replace('.img', '') for f in custom_npcs)
    for nid in sorted(npc_img_ids - set(custom_npc_entries.keys())):
        custom_npc_entries[nid] = {"name": f"NPC {nid}"}
    if os.path.exists(MOB_B64_FILE):
        with open(MOB_B64_FILE, 'r') as f:
            mob_img_ids = set(json.load(f).keys())
    else:
        mob_img_ids = set()
    for mid in sorted(mob_img_ids - set(custom_mob_entries.keys())):
        custom_mob_entries[mid] = {"name": f"Mob {mid}"}

    # Get existing entries
    tree, _ = call_tool(proc, "get_tree_structure", {
        "category": "string", "image": "Npc.img", "depth": 1, "maxChildrenPerNode": 10000
    })
    existing_npc = set()
    if isinstance(tree, dict) and "data" in tree:
        for child in tree["data"]["tree"]["children"]:
            existing_npc.add(child["name"])

    tree, _ = call_tool(proc, "get_tree_structure", {
        "category": "string", "image": "Mob.img", "depth": 1, "maxChildrenPerNode": 10000
    })
    existing_mob = set()
    if isinstance(tree, dict) and "data" in tree:
        for child in tree["data"]["tree"]["children"]:
            existing_mob.add(child["name"])

    # Add NPC strings
    to_add = {k: v for k, v in custom_npc_entries.items() if k not in existing_npc}
    if to_add:
        print(f"  Adding {len(to_add)} NPC string entries...")
        for nid, props in sorted(to_add.items()):
            call_tool(proc, "add_property", {
                "category": "string", "image": "Npc.img",
                "parentPath": "", "name": nid, "type": "SubProperty", "value": ""
            })
            for pname, pval in props.items():
                call_tool(proc, "add_property", {
                    "category": "string", "image": "Npc.img",
                    "parentPath": nid, "name": pname, "type": "String", "value": pval
                })
        call_tool(proc, "save_image", {"category": "string", "image": "Npc.img"})

    # Add idle speak lines (n0/n1/n2, f0/f1/f2, w0/w1/w2) for custom NPCs
    # Dynamically generated from name/func/desc — works for any NPC the agent adds
    def generate_speak_lines(name, func, desc):
        """Auto-generate 9 speak lines from NPC metadata. No hardcoding."""
        func_l = (func or "").lower()
        name_s = name or "stranger"
        # n = normal idle, f = finger/point, w = wink
        lines = {}
        if any(w in func_l for w in ["blacksmith", "forge", "craft", "smith"]):
            lines = {"n0": "Need something forged?", "n1": "My anvil is ready!", "n2": "Only the finest steel here.",
                     "f0": "I can fix that armor for you.", "f1": "These weapons are my pride!", "f2": "Careful, the forge is hot!",
                     "w0": "Nothing beats a well-forged blade.", "w1": "Hammering away, as always...", "w2": "Come back when you need repairs!"}
        elif any(w in func_l for w in ["merchant", "shop", "vendor", "trader", "dealer"]):
            lines = {"n0": "Take a look at my wares!", "n1": "Best prices in town!", "n2": "I have just what you need.",
                     "f0": "Special deal, just for you!", "f1": "You won't find this elsewhere!", "f2": "Everything must go!",
                     "w0": "Business is good today!", "w1": "Quality goods, fair prices!", "w2": "Come again soon!"}
        elif any(w in func_l for w in ["mage", "sage", "arcan", "wizard", "oracle", "element", "instruct"]):
            lines = {"n0": "The arcane energies are strong today.", "n1": "Knowledge is true power.", "n2": "I sense great potential in you.",
                     "f0": "Study hard, young one.", "f1": "The mysteries of magic run deep.", "f2": "Let me share some wisdom...",
                     "w0": "The stars reveal much...", "w1": "Magic flows through all things.", "w2": "Stay focused on your training!"}
        elif any(w in func_l for w in ["warrior", "fighter", "arena", "guard", "captain", "combat"]):
            lines = {"n0": "Ready for a challenge?", "n1": "Strength comes through battle!", "n2": "Only the brave survive.",
                     "f0": "Show me what you've got!", "f1": "Train harder, fight stronger!", "f2": "A true warrior never gives up.",
                     "w0": "The arena awaits!", "w1": "Victory favors the prepared!", "w2": "Stay sharp, adventurer!"}
        elif any(w in func_l for w in ["dark", "shadow", "necro", "lich", "undead", "bone", "grave", "death"]):
            lines = {"n0": "The shadows welcome you...", "n1": "Death is only the beginning.", "n2": "Do you dare seek dark power?",
                     "f0": "The spirits are restless today.", "f1": "Embrace the darkness within.", "f2": "I can teach you forbidden arts...",
                     "w0": "Something stirs in the shadows...", "w1": "The dead whisper secrets...", "w2": "Beware what lurks in the dark."}
        elif any(w in func_l for w in ["heal", "nurse", "priest", "monk", "holy", "cleric"]):
            lines = {"n0": "Are you feeling alright?", "n1": "I can mend your wounds.", "n2": "Rest here, you're safe now.",
                     "f0": "Take care of yourself!", "f1": "Health is your greatest treasure.", "f2": "Let me take a look...",
                     "w0": "Stay healthy, adventurer!", "w1": "Prevention is the best cure.", "w2": "Come back if you need healing!"}
        elif any(w in func_l for w in ["guide", "explorer", "scout", "ranger", "warden"]):
            lines = {"n0": "Need directions?", "n1": "There's so much to explore!", "n2": "This area has many secrets.",
                     "f0": "I know every corner of this land.", "f1": "Follow me, I'll show the way!", "f2": "Don't get lost out there!",
                     "w0": "Adventure awaits!", "w1": "Have you visited the other areas?", "w2": "Safe travels, friend!"}
        elif any(w in func_l for w in ["scholar", "librar", "lore", "histor", "book", "archiv"]):
            lines = {"n0": "Ah, a seeker of knowledge!", "n1": "I've been reading all day...", "n2": "There's always more to learn.",
                     "f0": "Have you read this volume?", "f1": "History holds many lessons.", "f2": "Knowledge awaits the curious.",
                     "w0": "So many books, so little time...", "w1": "The library is always open!", "w2": "Study well, adventurer!"}
        else:
            # Fallback: use the NPC name for personalized generic lines
            lines = {"n0": f"Hey there, adventurer!", "n1": f"Looking for something?", "n2": f"What brings you here?",
                     "f0": f"Come closer, I can help.", "f1": f"Don't be shy, take a look!", "f2": f"I'm {name_s}, at your service.",
                     "w0": f"Nice weather today!", "w1": f"Be careful out there!", "w2": f"Good luck on your journey!"}
        return lines

    speak_added = 0
    for nid, props in sorted(custom_npc_entries.items()):
        # Skip if speak lines already in the XML data
        if "n0" in props:
            continue
        name = props.get("name", f"NPC {nid}")
        func = props.get("func", "")
        desc = props.get("desc", "")
        lines = generate_speak_lines(name, func, desc)
        for key, text in lines.items():
            call_tool(proc, "add_property", {
                "category": "string", "image": "Npc.img",
                "parentPath": nid, "name": key, "type": "String", "value": text
            })
        speak_added += 1
    if speak_added:
        call_tool(proc, "save_image", {"category": "string", "image": "Npc.img"})
        print(f"  Added speak lines to {speak_added} NPCs")

    # Add mob strings
    to_add = {k: v for k, v in custom_mob_entries.items() if k not in existing_mob}
    if to_add:
        print(f"  Adding {len(to_add)} mob string entries...")
        for mid, props in sorted(to_add.items()):
            call_tool(proc, "add_property", {
                "category": "string", "image": "Mob.img",
                "parentPath": "", "name": mid, "type": "SubProperty", "value": ""
            })
            for pname, pval in props.items():
                call_tool(proc, "add_property", {
                    "category": "string", "image": "Mob.img",
                    "parentPath": mid, "name": pname, "type": "String", "value": pval
                })
        call_tool(proc, "save_image", {"category": "string", "image": "Mob.img"})

    # Add skill strings
    tree, _ = call_tool(proc, "get_tree_structure", {
        "category": "string", "image": "Skill.img", "depth": 1, "maxChildrenPerNode": 10000
    })
    existing_skill = set()
    if isinstance(tree, dict) and "data" in tree:
        for child in tree["data"]["tree"]["children"]:
            existing_skill.add(child["name"])

    to_add = {k: v for k, v in SKILL_STRINGS.items() if k not in existing_skill}
    if to_add:
        print(f"  Adding {len(to_add)} skill string entries...")
        for sid, props in sorted(to_add.items()):
            call_tool(proc, "add_property", {
                "category": "string", "image": "Skill.img",
                "parentPath": "", "name": sid, "type": "SubProperty", "value": ""
            })
            for pname, pval in props.items():
                call_tool(proc, "add_property", {
                    "category": "string", "image": "Skill.img",
                    "parentPath": sid, "name": pname, "type": "String", "value": pval
                })
        call_tool(proc, "save_image", {"category": "string", "image": "Skill.img"})

    # ── Step 6: Repack modified WZ files ──
    print("\n=== Step 6: Repack ===")
    # Mob.wz: use C# injector (MCP packer corrupts large WZ files)
    # Other categories: use MCP packer (works fine for smaller WZ files)
    for cat in ["npc", "string", "skill"]:
        print(f"  Packing {cat}...")
        result, err = call_tool(proc, "pack_to_wz", {
            "imgPath": FRESH_DATA, "outputDir": OUTPUT_DIR, "category": cat
        })
        if err:
            print(f"    ERROR: {str(result)[:200]}")
        else:
            wz_name = f"{cat.capitalize()}.wz"
            wz_path = os.path.join(OUTPUT_DIR, wz_name)
            if os.path.exists(wz_path):
                new_mb = os.path.getsize(wz_path) / (1024*1024)
                orig = os.path.join(ORIGINAL_WZ_DIR, wz_name)
                orig_mb = os.path.getsize(orig) / (1024*1024) if os.path.exists(orig) else 0
                print(f"    OK: {new_mb:.1f} MB (orig: {orig_mb:.1f} MB)")

    # Mob.wz: inject custom mob .img files into vanilla Mob.wz via C# injector
    print("  Packing mob (C# injector)...")
    mob_wz_out = os.path.join(OUTPUT_DIR, "Mob.wz")
    vanilla_mob = os.path.join(VANILLA_WZ_DIR, "Mob.wz")
    custom_mob_dir = os.path.join(FRESH_DATA, "Mob")
    injector_result = subprocess.run(
        ["dotnet", "run", "--project", WZ_INJECTOR_DIR, "--",
         vanilla_mob, mob_wz_out, custom_mob_dir],
        capture_output=True, text=True, timeout=600
    )
    print(injector_result.stdout)
    if injector_result.returncode != 0:
        print(f"    ERROR: {injector_result.stderr[:300]}")
    elif os.path.exists(mob_wz_out):
        new_mb = os.path.getsize(mob_wz_out) / (1024*1024)
        print(f"    OK: {new_mb:.1f} MB")

    # Unchanged WZ files are copied directly from source of truth in deploy step

    proc.stdin.close()
    proc.terminate()

    # ── Step 7: Deploy ALL to patcher ──
    print("\n=== Step 7: Deploy ===")
    os.makedirs(PATCHER_DIR, exist_ok=True)

    # Deploy repacked modified WZ files
    deployed = 0
    for wz in modify_wz:
        src = os.path.join(OUTPUT_DIR, wz)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(PATCHER_DIR, wz))
            mb = os.path.getsize(src) / (1024*1024)
            print(f"  {wz}: {mb:.1f} MB (rebuilt)")
            deployed += 1
        else:
            print(f"  {wz}: ERROR not found in output!")

    # Copy unchanged WZ files directly from source of truth
    for wz in sorted(all_wz):
        if wz not in modify_wz:
            src = os.path.join(ORIGINAL_WZ_DIR, wz)
            shutil.copy2(src, os.path.join(PATCHER_DIR, wz))
            mb = os.path.getsize(src) / (1024*1024)
            print(f"  {wz}: {mb:.1f} MB (from source)")
            deployed += 1

    print(f"  Total: {deployed} WZ files deployed")

    # Cleanup
    shutil.rmtree(TEMP_WZ, ignore_errors=True)

    # ── Step 8: Regenerate manifest ──
    print("\n=== Step 8: Regenerate manifest ===")
    import subprocess as sp
    sp.run(["node", "generate-manifest.cjs"],
           cwd=os.path.expanduser("~/sela/workspace/maple-patcher/server"),
           capture_output=False)

    print("\n=== Final patcher directory ===")
    for f in sorted(os.listdir(PATCHER_DIR)):
        if f.endswith('.wz'):
            mb = os.path.getsize(os.path.join(PATCHER_DIR, f)) / (1024*1024)
            print(f"  {f}: {mb:.1f} MB")
    print("\nDone!")

if __name__ == "__main__":
    main()
