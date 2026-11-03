# Laptop model

`public/objects/laptop/laptop.glb` is generated from the Sketchfab model
["MacBook Air M2" by rtql8d](https://sketchfab.com/3d-models/macbook-air-m2-786fa23d402a4f90ae36c4168997f9cc)
(CC BY 4.0, credited on /projects). The build script:

- recolours the aluminium and keyboard deck silver-blue (keys stay dark),
- names the nodes the site animates (`lid-shell`, `screen`, `lid-bezel`, `logo`, `base`),
- compresses textures to 1024px WebP.

```sh
node scripts/laptop/build-model.mjs "canon camera assets/macbook_air_m2.glb" public/objects/laptop/laptop.glb
```

The hinge and display positions the site uses are constants at the top of
`src/components/laptop/model.ts`.
