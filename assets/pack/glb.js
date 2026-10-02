import { Quaternion, Euler } from "../../vendor/three.module.js";
export function exportGLB(root) {
  const gltf = {
      asset: { version: "2.0", generator: "Oficina local v2" },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [],
      meshes: [],
      materials: [],
      accessors: [],
      bufferViews: [],
      buffers: [],
    },
    parts = [],
    materials = new Map(),
    nodeNames = new Map();
  let length = 0;
  const append = (typed, target) => {
    const padding = (4 - (length % 4)) % 4;
    if (padding) {
      parts.push(new Uint8Array(padding));
      length += padding;
    }
    const bytes = new Uint8Array(
      typed.buffer,
      typed.byteOffset,
      typed.byteLength,
    );
    const index = gltf.bufferViews.length;
    gltf.bufferViews.push({
      buffer: 0,
      byteOffset: length,
      byteLength: bytes.length,
      target,
    });
    parts.push(bytes);
    length += bytes.length;
    return index;
  };
  const accessor = (attribute, type, target) => {
    let array = attribute.array;
    if (
      ![Float32Array, Uint16Array, Uint32Array].some((C) => array instanceof C)
    )
      array = new Float32Array(array);
    const view = append(array, target),
      entry = {
        bufferView: view,
        componentType:
          array instanceof Uint16Array
            ? 5123
            : array instanceof Uint32Array
              ? 5125
              : 5126,
        count: attribute.count,
        type,
      };
    if (type === "SCALAR") {
      entry.min = [Math.min(...array)];
      entry.max = [Math.max(...array)];
    }
    if (type === "VEC3") {
      entry.min = [Infinity, Infinity, Infinity];
      entry.max = [-Infinity, -Infinity, -Infinity];
      for (let i = 0; i < attribute.count; i++)
        for (let k = 0; k < 3; k++) {
          entry.min[k] = Math.min(entry.min[k], array[i * 3 + k]);
          entry.max[k] = Math.max(entry.max[k], array[i * 3 + k]);
        }
    }
    const index = gltf.accessors.length;
    gltf.accessors.push(entry);
    return index;
  };
  function material(m) {
    if (materials.has(m)) return materials.get(m);
    const index = gltf.materials.length;
    gltf.materials.push({
      name: m.name || "material",
      pbrMetallicRoughness: {
        baseColorFactor: [m.color.r, m.color.g, m.color.b, m.opacity ?? 1],
        metallicFactor: m.metalness ?? 0,
        roughnessFactor: m.roughness ?? 1,
      },
      doubleSided: m.side === 2,
      alphaMode: m.transparent ? "BLEND" : "OPAQUE",
    });
    materials.set(m, index);
    return index;
  }
  function node(object) {
    const index = gltf.nodes.length,
      entry = {
        name: object.name || object.type,
        translation: object.position.toArray(),
        rotation: object.quaternion.toArray(),
        scale: object.scale.toArray(),
      };
    gltf.nodes.push(entry);
    if (object.name) nodeNames.set(object.name, { index, object });
    if (object.isMesh) {
      const geometry = object.geometry,
        attributes = {
          POSITION: accessor(geometry.attributes.position, "VEC3", 34962),
        };
      if (geometry.attributes.normal)
        attributes.NORMAL = accessor(geometry.attributes.normal, "VEC3", 34962);
      if (geometry.attributes.uv)
        attributes.TEXCOORD_0 = accessor(geometry.attributes.uv, "VEC2", 34962);
      const primitive = {
        attributes,
        material: material(
          Array.isArray(object.material) ? object.material[0] : object.material,
        ),
        mode: 4,
      };
      if (geometry.index)
        primitive.indices = accessor(geometry.index, "SCALAR", 34963);
      entry.mesh = gltf.meshes.length;
      gltf.meshes.push({ primitives: [primitive] });
    }
    if (object.children.length)
      entry.children = object.children.filter((c) => c.visible).map(node);
    return index;
  }
  node(root);
  if (root.animations?.length) {
    gltf.animations = [];
    for (const clip of root.animations) {
      const grouped = new Map();
      for (const track of clip.tracks) {
        const match = /^(.+)\.(rotation|position)\[([xyz])\]$/.exec(track.name);
        if (!match || !nodeNames.has(match[1])) continue;
        const key = `${match[1]}:${match[2]}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push({ track, match });
      }
      const animation = { name: clip.name, samplers: [], channels: [] };
      for (const [key, tracks] of grouped) {
        const [name, type] = key.split(":"),
          entry = nodeNames.get(name),
          times = [
            ...new Set(tracks.flatMap((t) => Array.from(t.track.times))),
          ].sort((a, b) => a - b),
          values = [];
        for (const time of times) {
          const components = {
            x: entry.object[type].x,
            y: entry.object[type].y,
            z: entry.object[type].z,
          };
          for (const { track, match } of tracks)
            components[match[3]] = track.createInterpolant().evaluate(time)[0];
          if (type === "rotation")
            values.push(
              ...new Quaternion()
                .setFromEuler(
                  new Euler(components.x, components.y, components.z),
                )
                .toArray(),
            );
          else values.push(components.x, components.y, components.z);
        }
        const input = accessor(
            { array: new Float32Array(times), count: times.length },
            "SCALAR",
            undefined,
          ),
          output = accessor(
            { array: new Float32Array(values), count: times.length },
            type === "rotation" ? "VEC4" : "VEC3",
            undefined,
          ),
          sampler = animation.samplers.length;
        animation.samplers.push({ input, output, interpolation: "LINEAR" });
        animation.channels.push({
          sampler,
          target: {
            node: entry.index,
            path: type === "rotation" ? "rotation" : "translation",
          },
        });
      }
      if (animation.channels.length) gltf.animations.push(animation);
    }
  }
  const padding = (4 - (length % 4)) % 4;
  if (padding) {
    parts.push(new Uint8Array(padding));
    length += padding;
  }
  gltf.buffers = [{ byteLength: length }];
  const encoder = new TextEncoder(),
    json = encoder.encode(JSON.stringify(gltf)),
    jsonSize = Math.ceil(json.length / 4) * 4,
    total = 12 + 8 + jsonSize + 8 + length,
    result = new ArrayBuffer(total),
    view = new DataView(result),
    bytes = new Uint8Array(result);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, total, true);
  view.setUint32(12, jsonSize, true);
  view.setUint32(16, 0x4e4f534a, true);
  bytes.fill(32, 20, 20 + jsonSize);
  bytes.set(json, 20);
  view.setUint32(20 + jsonSize, length, true);
  view.setUint32(24 + jsonSize, 0x004e4942, true);
  let offset = 28 + jsonSize;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.length;
  }
  return result;
}
