# Folder model

`public/objects/folder/folder.glb` is generated from the Sketchfab model
["Document File Folder" by Kami Rapacz](https://sketchfab.com/3d-models/document-file-folder-11390179bba7462484d344e2fe22c703)
(CC BY 4.0, credited on /posters). The build script:

- recolours the grey card to manila, keeping its paper grain,
- patches out the Bell System logos (colour, normal and roughness maps) and prints a "shu’s" label,
- keeps only the cover's opening from its open-and-shut morph animation, every 4th frame,
- compresses textures to 1024px WebP.

```sh
node scripts/folder/build-model.mjs "canon camera assets/document_file_folder.glb" public/objects/folder/folder.glb
```

Logo positions are in pixels of the model's 1024px textures (see the constants at the top of the script).
