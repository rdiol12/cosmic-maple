# Cosmic MapleStory v83 — Custom Content & Tools

Custom content, tools, and automation for a MapleStory v83 private server built on top of [Cosmic](https://github.com/P0nk/Cosmic).

## What's in here

```
cosmic-maple/
├── server/              # Server-side customizations
│   ├── scripts/npc/     # 72 custom NPC scripts (Rhino JS)
│   ├── java-mods/       # Modified Java source files (29 files)
│   └── config.yaml      # Server configuration
├── wz-xml/              # WZ data as XML (client + server)
│   ├── Npc.wz/          # 71 custom NPC image definitions
│   ├── Mob.wz/          # Custom mob definitions
│   ├── Skill.wz/        # 8 custom job skill trees (Sage + Necromancer)
│   ├── String.wz/       # NPC names, functions, idle chat lines
│   └── Map.wz/          # Modified maps + 2766 custom maps (Map9/)
├── sprite-pipeline/     # AI sprite generation & WZ build tools
│   ├── gen_all_npcs_unified.py   # LoRA → crop → bg remove → ESRGAN → animation
│   ├── master_rebuild.py         # Full WZ extract → inject → repack → deploy
│   ├── npc_b64_all.json          # 72 NPC sprite data (BGRA base64, 7 frames each)
│   └── skill_effects_b64.json   # 64 custom skill effect sprites
├── patcher/             # Auto-update patcher system
│   ├── server/          # HTTP patch server (port 3500)
│   └── client/          # Client-side patcher (Electron)
└── docs/                # Build guides & automation config
    ├── skills/          # 11 MapleStory builder guides (NPC, map, skill, job, etc.)
    └── cycle-config.json # Autonomous agent cycle configuration
```

## Custom Content Overview

### Custom Jobs (2 full job lines, 64 unique skills)
- **Sage** (600 → 610 → 611 → 612) — Arcane magic specialization
- **Necromancer** (700 → 710 → 711 → 712) — Dark arts specialization

### Custom NPCs (72 with AI-generated sprites)
All NPCs use IDs `9990xxx` and `9999xxx`. Each has:
- 7 animation frames (3 stand idle + 4 walk) generated via Stable Diffusion img2img
- Rhino-compatible JS scripts
- String.wz entries with idle chat bubbles
- Map placements

Notable NPCs:
- **Cosmic Guide Stella** (9999078) — Server feature guide with teleport
- **Bounty Board Mika** (9999079) — Timed bounty hunt system (5 tiers)
- **Sage/Necromancer instructors** (9990001-9990014) — Job advancement NPCs
- **Dungeon wardens, arena masters, crafters, daily quest givers**

### Custom Maps
- 2766 custom maps in the Map9/ range
- Includes Frozen Caverns, Shadow Crypts, custom dungeons

### Custom Mobs
- 2 custom mobs with 29 animation frames each (5 states)

## Prerequisites

- Java 17+ (server)
- Node.js 18+ (patcher)
- Python 3.11+ with CUDA (sprite pipeline)
- [Cosmic server](https://github.com/P0nk/Cosmic) cloned and built
- [WzImg MCP Server](https://github.com/rdiol12/WzImg-MCP-Server) for WZ packing

### Sprite Pipeline Dependencies
```bash
pip install torch diffusers transformers accelerate scipy pillow numpy realesrgan basicsr
```

### Required Models (not included — too large)
- `anythingV5.safetensors` — Base SD 1.5 model
- `hou_mini.safetensors` — Chibi sprite LoRA
- Place both in a `models/` directory and update paths in `gen_all_npcs_unified.py`

## Setup

### 1. Build the Cosmic Server

```bash
cd path/to/Cosmic
./mvnw clean package -DskipTests
```

### 2. Apply Custom Content

Copy server-side files into your Cosmic installation:

```bash
# NPC scripts
cp server/scripts/npc/999*.js path/to/Cosmic/scripts/npc/

# WZ XMLs (server reads these for NPC data)
cp wz-xml/Npc.wz/*.xml path/to/Cosmic/wz/Npc.wz/
cp wz-xml/String.wz/*.xml path/to/Cosmic/wz/String.wz/
cp wz-xml/Skill.wz/*.xml path/to/Cosmic/wz/Skill.wz/
cp wz-xml/Mob.wz/*.xml path/to/Cosmic/wz/Mob.wz/

# Custom maps
cp -r wz-xml/Map.wz/Map9/*.xml path/to/Cosmic/wz/Map.wz/Map/Map9/
```

### 3. Build Client WZ Files

The sprite pipeline generates NPC sprites and packs everything into `.wz` files for the client.

```bash
cd sprite-pipeline

# Generate sprites for all NPCs (takes ~30 min on GPU)
python gen_all_npcs_unified.py

# Generate for a single NPC only
python gen_all_npcs_unified.py --only 9999078

# Rebuild all WZ files and deploy to patcher
python master_rebuild.py
```

**`master_rebuild.py` does:**
1. Extracts vanilla WZ files from source of truth
2. Copies custom NPC/mob `.img` files
3. Imports sprite bitmaps from `npc_b64_all.json` into `.img` files
4. Builds custom Skill `.img` files (clones + renames + injects effects)
5. Adds String.wz entries (names, functions, idle chat lines)
6. Repacks all modified WZ files
7. Deploys to patcher directory

**Important paths to configure in `master_rebuild.py`:**
- `ORIGINAL_WZ_DIR` — Clean vanilla WZ files (source of truth, never modified)
- `OLD_PATCHED` — Directory with custom `.img` template files
- `PATCHER_DIR` — Output directory for the patcher server

### 4. Run the Patcher Server

```bash
cd patcher/server
node patch-server.cjs
```

Serves on port 3500:
- `GET /manifest` — File list with SHA-256 hashes
- `GET /files/<name>` — Download a WZ/DLL/EXE file
- `GET /health` — Server status
- `GET /patcher` — Download the patcher executable

The server watches the distribution directory and auto-regenerates the manifest when files change.

### 5. Start the Server

```bash
cd path/to/Cosmic
java -jar target/Cosmic.jar
```

## Adding New NPCs

Full pipeline for creating a new NPC with proper sprites:

1. **Pick ID** — Check `scripts/npc/9999*.js` for next available
2. **Add to sprite generator** — Add description to `NPC_DESCRIPTIONS` in `gen_all_npcs_unified.py`
3. **Generate sprite** — `python gen_all_npcs_unified.py --only {ID}`
4. **Create WZ XML** — `wz-xml/Npc.wz/{ID}.img.xml` with canvas structure
5. **Add String.wz entry** — Name, function, description, idle chat lines
6. **Write NPC script** — `server/scripts/npc/{ID}.js` (Rhino JS, no template literals)
7. **Place in map** — Add to map's `<imgdir name="life">` section
8. **Rebuild & deploy** — `python master_rebuild.py`
9. **Restart server**

See `docs/skills/maple-npc-builder.md` for detailed rules and templates.

## NPC Script Rules (Rhino JS Engine)

```javascript
// CORRECT — string concatenation
var msg = "Line 1\r\n" +
          "Line 2\r\n" +
          "Line 3";

// WRONG — template literals crash Rhino
var msg = `Line 1
Line 2`;

// WRONG — bare newlines crash Rhino
var msg = "Line 1
Line 2";
```

## Sprite Pipeline Details

The AI sprite pipeline generates MapleStory-style chibi sprites:

1. **txt2img** — Stable Diffusion 1.5 + chibi LoRA generates 256x256 base sprite
2. **Crop + BG remove** — Edge flood-fill removes white background
3. **img2img animation** — 7 frames generated from base sprite:
   - 3 stand frames (idle breathing/bobbing, strength 0.35-0.40)
   - 4 walk frames (leg/arm movement, strength 0.45)
4. **ESRGAN** — 4x upscale then downscale for quality enhancement
5. **Resize** — Scale to v83 NPC proportions (max 70x90px)
6. **BGRA encode** — Convert to MapleStory's BGRA4444 format

## License

Custom content (scripts, sprites, configs) is provided as-is for educational purposes.
The Cosmic server is a separate project — see [its license](https://github.com/P0nk/Cosmic).
