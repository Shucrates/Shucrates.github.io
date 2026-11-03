# Camera model

`public/objects/camera/camera.glb` is generated from the Sketchfab model
["Digital Camera" by Dokono Kinokoda](https://sketchfab.com/3d-models/digital-camera-5b2573eab7bf48f2bb8cd5a6026795b1)
(CC BY 4.0, credited on the homepage). The build script:

- recolours it black,
- replaces the parody markings with Canon PowerShot SX510 HS ones (front logo,
  model name, 30x badge, top plate, lens ring),
- blanks the LCD (the site draws video on top),
- names the nodes the site animates (`lens-collar`, `lens-face`, `lens-blades`, `lcd`),
- compresses textures to 1024px WebP.

```sh
node scripts/camera/build-model.mjs "canon camera assets/digital_camera.glb" public/objects/camera/camera.glb
```

Text positions are in pixels of the model's original 2048px textures (see the
constants at the top of the script).
