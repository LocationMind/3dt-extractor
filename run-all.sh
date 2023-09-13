#!/bin/bash
echo "Compiling TypeScript..."
npx tsc
echo "Searching data file..."
RAW=`node extractor.js bldg_13111_ota-ku_lod2_no_texture bldg_96c5aebd-2cb5-40e5-8cb3-55fcc563a6ed | head -1`
RESULT_LIST=(${RAW})
echo "Extracting glb..."
npx 3d-tiles-tools b3dmToGlb -i  ${RESULT_LIST[0]} --force -o ${RESULT_LIST[1]}
echo "Converting glb to glTF..."
npx gltf-pipeline -i ${RESULT_LIST[1]} -o ${RESULT_LIST[2]}
