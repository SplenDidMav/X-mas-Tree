import * as THREE from "three";

export function createTreePlaceholder() {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.12, 0.45, 16),
    new THREE.MeshStandardMaterial({ color: 0x5a3a21, roughness: 1 })
  );
  trunk.position.y = 0.2;
  group.add(trunk);

  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(0.55, 1.1, 24),
    new THREE.MeshStandardMaterial({ color: 0x1e8f4f, roughness: 0.9 })
  );
  foliage.position.y = 0.8;
  group.add(foliage);

  return group;
}

