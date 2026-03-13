"""
Unified NPC sprite pipeline: LoRA generate → crop → bg remove → ESRGAN enhance → animation frames
Generates sprites for ALL custom NPCs and outputs npc_b64_all.json with multi-frame BGRA base64.
"""
import os, sys, json, math, base64
import torch
import numpy as np
from PIL import Image
from scipy import ndimage
from diffusers import StableDiffusionPipeline, StableDiffusionImg2ImgPipeline, DPMSolverMultistepScheduler
from realesrgan import RealESRGANer
from basicsr.archs.rrdbnet_arch import RRDBNet

BASE_MODEL = r"C:\Users\rdiol\Desktop\models\anythingV5.safetensors"
LORA_PATH = r"C:\Users\rdiol\Desktop\models\hou_mini.safetensors"
OUTPUT_BASE = os.path.join(os.path.dirname(__file__), "game_assets", "npcs")
B64_OUTPUT = os.path.join(os.path.dirname(__file__), "npc_b64_all.json")

NEGATIVE_PROMPT = (
    "realistic, 3d, photorealistic, blurry, low quality, watermark, text, "
    "signature, deformed, ugly, multiple characters, character sheet, multiple views, "
    "reference sheet, background scenery, multiple objects, nsfw"
)

# All custom NPCs — merged from gen_all_custom_npcs.py (detailed) + gen_all_sprites.py (complete list)
NPC_DESCRIPTIONS = {
    # Sage job instructors
    "9990001": "wise sage instructor in blue arcane robes with glowing staff",
    "9990002": "elementalist master with fire and ice swirling around hands, ornate robes",
    "9990003": "arcanum council member in elaborate golden and purple mage robes",
    "9990004": "ancient archsage elder with long white beard and crystal-topped staff",
    # Necromancer job instructors
    "9990010": "pale gravedigger with shovel and dark tattered clothes",
    "9990011": "elegant lady vampire in dark purple dress with pale skin",
    "9990012": "skeletal oracle with glowing green eyes and bone headdress",
    "9990013": "dark lich lord in black armor with green soul flames",
    "9990014": "creepy bone merchant with skull necklaces and tattered cape",
    # Core NPCs
    "9999001": "stocky blacksmith man, leather apron, hammer, muscular, forge worker",
    "9999002": "elegant alchemist woman, purple robes, glowing vials, witch hat",
    "9999003": "lean ranger man, dark green cloak, hood, bow, forest scout",
    "9999004": "round jolly chef, white coat, tall toque hat, friendly",
    "9999005": "old wise man, grey robes, walking staff, white beard, elder",
    "9999006": "broad warrior man, red and gold armor, arena fighter, strong",
    "9999007": "elegant gem merchant woman, teal silk coat, jeweled accessories",
    "9999008": "sea captain man, navy coat, tricorn hat, weathered, gold buttons",
    "9999009": "kind nurse girl, white uniform, pink hair, red cross cap, healer",
    "9999010": "adventurer man, dusty tan gear, wide brim explorer hat, backpack",
    "9999011": "mysterious dark mage, black robes, glowing purple eyes, hood",
    "9999012": "cheerful flower girl, colorful dress, flower basket, pigtails",
    "9999013": "armored guard, steel plate armor, spear, helmet, town guard",
    # Dungeon wardens
    "9999020": "ice armored warden woman, frost crystals, blue armor, cold",
    "9999021": "dark stone armored gatekeeper, shadow wreath, purple runes, forboding",
    # Sage NPCs
    "9999030": "radiant sage woman, blue and gold robes, arcane staff, wise",
    "9999031": "young apprentice mage boy, oversized hat, spell book, eager",
    # Blacksmiths / crafters
    "9999032": "massive ironsmith man, heat scorched plate, forge tongs, strong",
    "9999033": "slender arcanist woman, blue silver robes, arcane blueprints",
    "9999034": "wiry bowman craftsman, forest leathers, quiver of arrows, ranger",
    "9999035": "nimble shadow artisan woman, dark plum leathers, throwing knives",
    "9999036": "old pirate, peg leg, eyepatch, parrot on shoulder, treasure map",
    "9999037": "young priestess, white and gold robes, healing staff, gentle",
    "9999038": "dwarf miner, pickaxe, hard hat, thick beard, mining gear",
    # Arena
    "9999039": "fairy queen, tiny wings, glowing aura, flower crown, ethereal",
    "9999040": "samurai warrior, red armor, katana, fierce expression, honor",
    "9999041": "witch doctor, tribal mask, bone staff, feathers, mysterious",
    "9999042": "royal princess, elegant dress, tiara, long hair, graceful",
    # Weekly/Daily
    "9999043": "ninja assassin, dark outfit, face mask, shuriken, stealthy",
    "9999044": "bard musician, lute instrument, feathered hat, colorful clothes",
    "9999045": "mad scientist, lab coat, wild hair, goggles, bubbling flask",
    "9999046": "dragon tamer, scale armor, whip, dragon emblem, brave",
    "9999047": "celestial monk, orange robes, prayer beads, bald, peaceful",
    # Quest NPCs
    "9999050": "sheriff woman, star badge, cowboy hat, dual pistols, western",
    "9999051": "ghost spirit, translucent, flowing ethereal robes, glowing eyes",
    "9999052": "mechanical engineer, goggles, wrench, steam powered backpack",
    "9999053": "forest druid, leaf crown, wooden staff, moss robes, nature",
    "9999054": "vampire lord, red cape, pale skin, fangs, elegant dark suit",
    "9999055": "cat girl merchant, cat ears, tail, apron, cute, shopkeeper",
    # Extended NPCs
    "9999056": "challenge master in combat gear with daily challenge scroll",
    "9999057": "mystic fortune teller with crystal ball and silk veil",
    "9999058": "shady hooded merchant with mystery box and sly grin",
    "9999059": "fierce female boss hunter in red armor with trophy essences",
    "9999060": "female explorer guide with compass and training manual",
    "9999061": "wandering female collector with butterfly net and specimen jars",
    "9999062": "female historian with ancient artifacts and expedition journal",
    "9999063": "holy brother monk in brown robes with blessing aura",
    "9999064": "female librarian with glasses and stack of mastery books",
    "9999065": "fortune keeper fairy with golden coins and reward chest",
    "9999066": "martial arts stat master in white gi with glowing hands",
    "9999067": "mystical cosmic oracle with star-covered cloak and third eye",
    "9999068": "traveling merchant with cart of daily deal goods",
    "9999069": "ancient elder chronos with hourglass and time magic effects",
    "9999070": "brave captain in military uniform with valor medals",
    "9999071": "crystal sage girl with ice crystals and reset scroll",
    "9999072": "master crafter with goggles, tools and fusion anvil",
    "9999073": "mysterious girl next to dimensional mirror portal",
    "9999074": "naval captain with spyglass and daily challenge map",
    "9999075": "elegant celestial girl with milestone reward stars",
    "9999076": "professor fox-person with spectacles and training guide book",
    "9999077": "kind nurse girl, white uniform, pink hair, red cross cap, healer, warm smile",
    "9999078": "radiant guide girl, star-decorated blue cloak, glowing compass, silver hair, celestial theme",
    "9999079": "rugged bounty hunter woman, brown leather armor, wanted posters on belt, red bandana, battle-scarred, dual daggers",
}


def setup_sd_pipeline():
    print("Loading SD pipeline...")
    pipe = StableDiffusionPipeline.from_single_file(
        BASE_MODEL, torch_dtype=torch.float16, safety_checker=None
    )
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(
        pipe.scheduler.config, algorithm_type="dpmsolver++", use_karras_sigmas=True
    )
    pipe.text_encoder.config.num_hidden_layers -= 1  # clip skip 2
    pipe.load_lora_weights(LORA_PATH)
    pipe.fuse_lora(lora_scale=0.7)
    pipe = pipe.to("cuda")
    try:
        pipe.enable_xformers_memory_efficient_attention()
    except:
        pass
    print("SD pipeline ready.")
    return pipe


def setup_img2img_pipeline(txt2img_pipe):
    """Create img2img pipeline reusing txt2img components (no extra VRAM)."""
    print("Setting up img2img pipeline...")
    pipe = StableDiffusionImg2ImgPipeline(
        vae=txt2img_pipe.vae,
        text_encoder=txt2img_pipe.text_encoder,
        tokenizer=txt2img_pipe.tokenizer,
        unet=txt2img_pipe.unet,
        scheduler=txt2img_pipe.scheduler,
        safety_checker=None,
        feature_extractor=None,
        requires_safety_checker=False,
    )
    try:
        pipe.enable_xformers_memory_efficient_attention()
    except:
        pass
    print("img2img pipeline ready.")
    return pipe


def setup_esrgan():
    print("Loading ESRGAN...")
    model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=6, num_grow_ch=32, scale=4)
    upsampler = RealESRGANer(
        scale=4,
        model_path="https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth",
        model=model, tile=0, tile_pad=10, pre_pad=0, half=True, device="cuda",
    )
    print("ESRGAN ready.")
    return upsampler


def generate_base(pipe, description, seed):
    """Generate 256x256 base sprite with chibi LoRA."""
    prompt = (
        "h_mini, chibi, (single character:1.5), solo, thick black outline, "
        "flat cel shading, " + description +
        ", standing idle pose, (white background:1.4), 2d game sprite, side view, full body"
    )
    gen = torch.Generator(device="cuda").manual_seed(seed)
    image = pipe(
        prompt=prompt, negative_prompt=NEGATIVE_PROMPT,
        num_inference_steps=15, guidance_scale=7.5,
        generator=gen, width=256, height=256,
    ).images[0]
    return image


def crop_and_remove_bg(image):
    """Crop to character bounds and remove white background via edge flood-fill."""
    img = image.convert("RGBA")
    arr = np.array(img)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

    mask = ~((r > 235) & (g > 235) & (b > 235))
    ys, xs = np.where(mask)
    if len(ys) == 0:
        return img

    pad = 5
    y1 = max(0, ys.min() - pad)
    y2 = min(arr.shape[0] - 1, ys.max() + pad)
    x1 = max(0, xs.min() - pad)
    x2 = min(arr.shape[1] - 1, xs.max() + pad)
    cropped = img.crop((x1, y1, x2 + 1, y2 + 1))

    carr = np.array(cropped)
    wm = (carr[:, :, 0] > 225) & (carr[:, :, 1] > 225) & (carr[:, :, 2] > 225)
    labeled, _ = ndimage.label(wm.astype(np.uint8))
    edge_labels = set()
    edge_labels.update(labeled[0, :].tolist(), labeled[-1, :].tolist(),
                       labeled[:, 0].tolist(), labeled[:, -1].tolist())
    edge_labels.discard(0)
    for l in edge_labels:
        carr[:, :, 3][labeled == l] = 0

    return Image.fromarray(carr)


def esrgan_enhance(upsampler, sprite):
    """ESRGAN 4x upscale then downscale back for quality enhancement."""
    orig_size = sprite.size
    alpha = np.array(sprite)[:, :, 3]
    rgb_bgr = np.array(sprite.convert("RGB"))[:, :, ::-1]

    output, _ = upsampler.enhance(rgb_bgr, outscale=4)
    upscaled = Image.fromarray(output[:, :, ::-1])

    enhanced = upscaled.resize(orig_size, Image.LANCZOS)
    alpha_restored = Image.fromarray(alpha)
    enhanced = enhanced.convert("RGBA")
    enhanced.putalpha(alpha_restored)
    return enhanced


def resize_to_npc(sprite, max_w=70, max_h=90):
    """Resize sprite to v83 NPC proportions."""
    w, h = sprite.size
    scale = min(max_w / w, max_h / h)
    if scale >= 1.0:
        return sprite
    new_w = max(1, int(w * scale))
    new_h = max(1, int(h * scale))
    return sprite.resize((new_w, new_h), Image.LANCZOS)


def create_anim_frames_img2img(img2img_pipe, base_img_256, description, seed):
    """Generate animation frames via img2img from the base sprite.
    Uses pose-varied prompts to create natural stand idle and walk frames.
    base_img_256: the 256x256 cropped sprite (before ESRGAN/resize).
    Returns dict of frame_name -> PIL Image (already cropped+bg-removed)."""

    base_prompt = (
        "h_mini, chibi, (single character:1.5), solo, thick black outline, "
        "flat cel shading, " + description
    )

    # Frame definitions: (name, prompt suffix, strength, seed_offset)
    # Lower strength = closer to original, higher = more variation
    frame_defs = [
        # Stand idle: subtle breathing/bobbing variations
        ("stand_0", ", standing idle pose, relaxed, (white background:1.4), 2d game sprite, side view, full body", 0.35, 0),
        ("stand_1", ", standing idle pose, breathing in, slight lean, (white background:1.4), 2d game sprite, side view, full body", 0.40, 1),
        ("stand_2", ", standing idle pose, breathing out, (white background:1.4), 2d game sprite, side view, full body", 0.38, 2),
        # Walk/move: leg and arm movement
        ("move_0", ", walking pose, left foot forward, arms swaying, (white background:1.4), 2d game sprite, side view, full body", 0.45, 10),
        ("move_1", ", mid-step walking pose, right foot forward, (white background:1.4), 2d game sprite, side view, full body", 0.45, 11),
        ("move_2", ", walking pose, left foot back, arms swaying forward, (white background:1.4), 2d game sprite, side view, full body", 0.45, 12),
        ("move_3", ", stepping pose, feet together, slight bounce, (white background:1.4), 2d game sprite, side view, full body", 0.42, 13),
    ]

    # Prepare base image for img2img (needs to be RGB on white bg, 256x256)
    if base_img_256.mode == "RGBA":
        bg = Image.new("RGB", base_img_256.size, (255, 255, 255))
        bg.paste(base_img_256, mask=base_img_256.split()[3])
        input_img = bg
    else:
        input_img = base_img_256.convert("RGB")

    # Pad to 256x256 if needed (img2img needs consistent size)
    if input_img.size != (256, 256):
        padded = Image.new("RGB", (256, 256), (255, 255, 255))
        ox = (256 - input_img.width) // 2
        oy = (256 - input_img.height) // 2
        padded.paste(input_img, (ox, oy))
        input_img = padded

    frames = {}
    for fname, prompt_suffix, strength, seed_off in frame_defs:
        prompt = base_prompt + prompt_suffix
        gen = torch.Generator(device="cuda").manual_seed(seed + seed_off)
        result = img2img_pipe(
            prompt=prompt,
            negative_prompt=NEGATIVE_PROMPT,
            image=input_img,
            strength=strength,
            num_inference_steps=20,
            guidance_scale=7.5,
            generator=gen,
        ).images[0]

        # Crop + remove bg (same as base sprite)
        result_rgba = crop_and_remove_bg(result)
        frames[fname] = result_rgba

    return frames


def img_to_bgra_b64(img):
    """Convert RGBA PIL Image to BGRA raw base64."""
    arr = np.array(img)
    bgra = np.stack([arr[:, :, 2], arr[:, :, 1], arr[:, :, 0], arr[:, :, 3]], axis=2)
    return base64.b64encode(bgra.tobytes()).decode('ascii')


def main():
    force = "--force" in sys.argv
    # --only 9999XXX: generate only specific NPC(s), merge into existing JSON
    only_ids = None
    for i, arg in enumerate(sys.argv):
        if arg == "--only" and i + 1 < len(sys.argv):
            only_ids = [x.strip() for x in sys.argv[i + 1].split(",")]
            break

    os.makedirs(OUTPUT_BASE, exist_ok=True)

    pipe = setup_sd_pipeline()
    img2img_pipe = setup_img2img_pipeline(pipe)
    upsampler = setup_esrgan()

    # When using --only, load existing b64 data to merge into
    b64_data = {}
    if only_ids and os.path.exists(B64_OUTPUT):
        with open(B64_OUTPUT, 'r') as f:
            b64_data = json.load(f)

    descs = NPC_DESCRIPTIONS
    if only_ids:
        descs = {k: v for k, v in NPC_DESCRIPTIONS.items() if k in only_ids}
        missing = [x for x in only_ids if x not in NPC_DESCRIPTIONS]
        if missing:
            print(f"WARNING: IDs not in NPC_DESCRIPTIONS: {missing}")
            print("Add them to NPC_DESCRIPTIONS in gen_all_npcs_unified.py first!")
            sys.exit(1)
        force = True  # always regenerate when using --only

    total = len(descs)
    done = 0
    errors = 0

    for npc_id, desc in sorted(descs.items()):
        done += 1
        out_dir = os.path.join(OUTPUT_BASE, f"{npc_id}_pipeline")
        os.makedirs(out_dir, exist_ok=True)

        # Skip if already done (unless --force)
        stand0_path = os.path.join(out_dir, "stand_0.png")
        if not force and os.path.exists(stand0_path):
            print(f"[{done}/{total}] {npc_id} exists, loading frames...")
            npc_frames = {}
            for fname in ["stand_0", "stand_1", "stand_2", "move_0", "move_1", "move_2", "move_3"]:
                fpath = os.path.join(out_dir, f"{fname}.png")
                if os.path.exists(fpath):
                    img = Image.open(fpath).convert("RGBA")
                    w, h = img.size
                    npc_frames[fname] = {"b64": img_to_bgra_b64(img), "w": w, "h": h}
            if npc_frames:
                b64_data[npc_id] = npc_frames
            continue

        try:
            print(f"[{done}/{total}] {npc_id}: {desc[:50]}...")

            # 1. Generate 256x256 base sprite
            seed = int(npc_id) % 99999
            raw = generate_base(pipe, desc, seed)
            raw.save(os.path.join(out_dir, "raw_256.png"))

            # 2. Crop + remove bg (base)
            cropped = crop_and_remove_bg(raw)
            cropped.save(os.path.join(out_dir, "cropped.png"))

            # 3. Generate animation frames via img2img (from raw 256x256)
            print(f"  Generating animation frames via img2img...")
            raw_frames = create_anim_frames_img2img(img2img_pipe, cropped, desc, seed)

            # 4. ESRGAN enhance + resize each frame
            npc_frames = {}
            for fname, fimg in raw_frames.items():
                fimg.save(os.path.join(out_dir, f"{fname}_raw.png"))
                enhanced = esrgan_enhance(upsampler, fimg)
                resized = resize_to_npc(enhanced, max_w=70, max_h=90)
                resized.save(os.path.join(out_dir, f"{fname}.png"))
                w, h = resized.size
                npc_frames[fname] = {"b64": img_to_bgra_b64(resized), "w": w, "h": h}

            # Also save the base enhanced/resized for reference
            enhanced_base = esrgan_enhance(upsampler, cropped)
            enhanced_base.save(os.path.join(out_dir, "enhanced.png"))
            resized_base = resize_to_npc(enhanced_base, max_w=70, max_h=90)
            resized_base.save(os.path.join(out_dir, "resized.png"))

            b64_data[npc_id] = npc_frames
            print(f"  -> {len(npc_frames)} frames generated via img2img")

        except Exception as e:
            print(f"  ERROR {npc_id}: {e}", file=sys.stderr)
            errors += 1

        # Free VRAM periodically
        if done % 10 == 0:
            torch.cuda.empty_cache()

    # Write multi-frame b64 JSON
    with open(B64_OUTPUT, 'w') as f:
        json.dump(b64_data, f)
    print(f"\nWrote {len(b64_data)} NPCs to {B64_OUTPUT}")
    print(f"=== DONE: {done - errors}/{total} NPCs, {errors} errors ===")


if __name__ == "__main__":
    main()
