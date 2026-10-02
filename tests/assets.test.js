import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../vendor/three.module.js";
import { createProp, CATALOG } from "../assets/pack/props.js";
import { readFile } from "node:fs/promises";
test("every exported prop loads independently and has usable geometry", async () => {
  for (const kind of Object.keys(CATALOG)) {
    const prop = createProp(kind),
      bounds = new THREE.Box3().setFromObject(prop);
    assert.ok(bounds.min.y >= -0.08, kind);
    assert.ok(bounds.max.y > 0.4, kind);
    assert.equal(prop.userData.asset, kind);
    const loaded = new THREE.ObjectLoader().parse(
      JSON.parse(
        await readFile(
          new URL(`../assets/pack/models/${kind}.json`, import.meta.url),
          "utf8",
        ),
      ),
    );
    assert.equal(loaded.name, kind);
    const loadedBounds = new THREE.Box3().setFromObject(loaded);
    assert.ok(
      loadedBounds
        .getSize(new THREE.Vector3())
        .distanceTo(bounds.getSize(new THREE.Vector3())) < 1e-5,
      `${kind}: export dimensions must match factory`,
    );
  }
});
