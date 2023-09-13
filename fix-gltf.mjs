import fs from "fs";
import qt from "quaternion";

const FIX_ROTATION = true;

function loadGltf(path) {
	const body = fs.readFileSync(path, 'utf8');
	const j = JSON.parse(body);
	return j;
}

function removeExtension(j) {
	if (Array.isArray(j.extensionsRequired)) {
		const indexToRm = j.extensionsRequired.indexOf("CESIUM_RTC");
		if (indexToRm >= 0) {
			j.extensionsRequired.splice(indexToRm, 1);
			console.log(`Removed #${indexToRm} of [extensionsRequired]`);
		}
	}

	return j;
}

function getNormalizedVec3(v) {
	const length = Math.sqrt( v.reduce( (sum, cur) => sum + cur*cur, 0 ) );
	return v.map( val => val/length );
}

function calcRotation(j) {
	if (j.extensions && j.extensions.CESIUM_RTC) {
		const center = j.extensions.CESIUM_RTC.center;
		if (center) {
			// Z = north pole
			const nvec = getNormalizedVec3(center);
			const q = qt.Quaternion.fromBetweenVectors(nvec, [0, 0, 1]);
			if (FIX_ROTATION) {
				if (Array.isArray(j.nodes)) {
					const qa = [q.x, q.z, -q.y, q.w];
					for (const nd of j.nodes) {
						nd.rotation = qa;
					}
					console.log(`Added a transform information to correct posture: Q=[${qa.join(', ')}]`);
				}
			} else {
				console.log("Use this quaternion to correct posture:");
				console.log(q);
			}
		}
	}
	
	return j;
}

const infile = process.argv[2];
const outfile = process.argv[3];
if (!infile) {
	console.log("Specify input file(.gltf)");
} else {
	const j = calcRotation(removeExtension(loadGltf(infile)));
	if (outfile) {
		fs.writeFileSync(outfile, JSON.stringify(j), 'utf8');
	}
}