import fs from "fs";
import { Buffers } from "3d-tiles-tools"
import { TileFormats } from "./node_modules/3d-tiles-tools/src/tileFormats/TileFormats";
import { TileDataLayouts } from "./node_modules/3d-tiles-tools/src/tileFormats/TileDataLayouts";

function makeCandidatesList(basePath:string):Array<string> {
	const ls:Array<string> = [];

	const dataDir = `${basePath}/data`;
	const filenames = fs.readdirSync(dataDir);
	for (const f of filenames) {
		if ( (/\.b3dm$/).test(f) ) {
			ls.push(`${dataDir}/${f}`);
		}
	}

	return ls;
}

function findB3dm(inList:Array<string>, target_id:string) {
	const foundList:Array<string> = [];

	for (const path of inList) {
		const inputBuffer = fs.readFileSync(path);
		const magic = Buffers.getMagicString(inputBuffer, 0);
		
		if (magic === "b3dm") {
			// Handle the basic legacy tile formats
			const tileDataLayout = TileDataLayouts.create(inputBuffer);
			const tileData = TileFormats.extractTileData(inputBuffer, tileDataLayout);
			const attrs = tileData.batchTable.json.attributes;

			if (containsGmlId(attrs, target_id)) {
				foundList.push(path);
			}
		}
	}

	return foundList;
}

function containsGmlId(ls:Array<any>, dest_id:string):boolean {
	for (const ent of ls) {
		if (ent["gml:id"] === dest_id) {
			return true;
		}
	}

	return false;
}

function makeOutFileName(src:any, ext:string):string {
	return src.replaceAll("/", "_").replaceAll(".", "_") + "." + ext;
}

const indir = process.argv[2];
const in_id = process.argv[3];
const prefix = process.argv[4] || "";

if (!indir || !in_id) {
	console.log("Specify [directory name] [gml_id]");
} else {
	const candidates = makeCandidatesList(indir);
	const founds = findB3dm(candidates, in_id);
	console.log( founds.map( path => `${path} ${ makeOutFileName(path, "glb")} ${ makeOutFileName(path, "gltf")}` ).join("\n") );
}