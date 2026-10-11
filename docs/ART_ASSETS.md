# Cat asset provenance

The supplied `cat.png` remains untouched. The two new PNG assets were produced with the built-in Imagegen tool using that file as identity reference. They are generated interpretations, not a measured 3D reconstruction.

## Running atlas prompt

Photorealistic eight-frame cat running atlas, 4 columns by 2 rows, transparent background. Preserve the reference cat's warm brown coat, black mackerel stripes, stocky broad torso, short sturdy legs, round face, small folded ears and thick ringed tail. Same rear three-quarter elevated camera in every cell, cat running away from viewer. Eight consecutive quadruped gait phases; same scale and anchor; full body, paws and tail within each cell. Soft warm daylight. No text, grid, floor or cast shadow. No cartoon anatomy or clothing.

## Crouch prompt

One square transparent sprite of the same cat, matching the atlas camera and lighting. Natural low crouch with paws bent underneath the torso, lowered head and belly, tail extending behind. Preserve anatomy and coat; do not squash or stretch. Full body in lower 65% of frame, transparent upper margin. No floor, cast shadow, obstacle, text or other cats.

## Rendering

`game.js` reads the atlas as equal cells at runtime. Every frame is drawn as a complete image at a uniform scale. The crouch uses its own complete image, also scaled uniformly. No image body-part sampling or independently stretched limbs remain.
