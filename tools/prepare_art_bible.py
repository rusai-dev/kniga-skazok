#!/usr/bin/env python3
"""Extract verified Art Bible attachments and build cover candidates (not a release).

Build-time only: pip install pymupdf pillow
Usage: python tools/prepare_art_bible.py MASTER_PROMPT.pdf art-pack.zip
"""
import argparse, hashlib, io, json, zipfile
from pathlib import Path
import fitz
from PIL import Image

NAMES = {
    'ART-01':'art-01-night-bats.webp', 'ART-02':'art-02-night-owl.webp',
    'ART-03':'art-03-egypt-nile.webp', 'ART-04':'art-04-writer-fox.webp',
    'ART-05':'art-05-math-manipulatives.webp', 'ART-06':'art-06-coloring-forest.png',
}
COVERS = {'ART-01':'night-bats-scene','ART-02':'night-owl-cover','ART-03':'egypt-nile-cover','ART-04':'writer-fox'}

def sha(b):
    return hashlib.sha256(b).hexdigest()

def prepare(pdf, output):
    with fitz.open(pdf) as doc:
        manifest_bytes = doc.embfile_get('art-reference-manifest.json')
        items = json.loads(manifest_bytes)['assets']
        if len(items) != 6 or {a['id']:a['filename'] for a in items} != NAMES:
            raise ValueError('Unexpected attachment inventory')
        files = {'masters/art-reference-manifest.json':manifest_bytes}
        records = []
        for a in items:
            n = a['filename']
            b = doc.embfile_get(n)
            if len(b) != a['bytes'] or sha(b) != a['sha256']:
                raise ValueError('Source checksum mismatch: '+n)
            with Image.open(io.BytesIO(b)) as im:
                im.load()
                if im.size != (a['width'],a['height']):
                    raise ValueError('Source dimensions mismatch: '+n)
                files['masters/'+n] = b
                if a['id'] not in COVERS:
                    continue
                for width in ((144,) if a['id']=='ART-04' else (320,504) if a['id']=='ART-01' else (128,320,504)):
                    if width > im.width:
                        raise ValueError('No upscaling allowed')
                    pic = im.convert('RGB').resize((width,round(im.height*width/im.width)),Image.Resampling.LANCZOS)
                    out = io.BytesIO()
                    pic.save(out,'WEBP',quality=55 if width in (128,144) else 75,method=6)
                    encoded = out.getvalue()
                    stem = COVERS[a['id']].replace('-cover','-thumb') if width == 128 else COVERS[a['id']]
                    folder = 'ui' if a['id']=='ART-04' else 'world'
                    name = f'assets/{folder}/{stem}-{width}-v1.webp'
                    with Image.open(io.BytesIO(encoded)) as check:
                        check.load()
                        if check.size != pic.size:
                            raise ValueError('Encoded dimensions mismatch')
                    files[name] = encoded
                    records.append({'id':a['id'],'path':name,'width':pic.width,
                        'height':pic.height,'bytes':len(encoded),'sha256':sha(encoded),
                        'source_sha256':a['sha256'],'status':'draft','alt':'',
                        'role':'decorative author entry' if a['id']=='ART-04' else 'decorative cover only; not a species plate or historical reconstruction',
                        'source':a['source']})
        files['art-candidates.json'] = json.dumps({'version':1,'assets':records},ensure_ascii=False,indent=2).encode()
        files['README.txt'] = ('Art Bible 1–99: original references and optimized cover candidates.\n'
            'ART-02: night-world cover; ART-03: Ancient Egypt cover.\n'
            'Use 128 thumbnails at 64 CSS px; use 320/504 variants with srcset, explicit dimensions and SVG fallback.\n'
            'Only ART-04 is for the home screen; ART-01–03 remain on demand. Retain exact scientific diagrams.\n'
            'Real-screen visual, accessibility and browser checks required before deployment.\n').encode()
        files['prepare_art_bible.py'] = Path(__file__).read_bytes()
    with zipfile.ZipFile(output,'x',zipfile.ZIP_DEFLATED) as z:
        for name,b in files.items():
            z.writestr(name,b)
    with zipfile.ZipFile(output) as z:
        if z.testzip() is not None:
            raise ValueError('ZIP CRC failed')
        for name,b in files.items():
            if sha(z.read(name)) != sha(b):
                raise ValueError('Archive verification failed: '+name)
    return records

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pdf',type=Path)
    parser.add_argument('output',type=Path)
    args = parser.parse_args()
    print(json.dumps(prepare(args.pdf,args.output),ensure_ascii=False,indent=2))
