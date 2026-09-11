import * as THREE from
  "three";

import { OrbitControls } from
  "three/addons/controls/OrbitControls.js";

let scene;
let camera;
let renderer;
let clock;

let hero;
let objective;
let lab;
let webLine;

let started = false;
let health = 100;
let xp = 0;
let attacking = 0;

const velocity = new THREE.Vector3();

const keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

const buildings = [];
const enemies = [];

init();
animate();

function init() {

  scene = new THREE.Scene();

  scene.background =
    new THREE.Color(0x8ba7c7);

  scene.fog =
    new THREE.Fog(0x8ba7c7, 180, 850);

  camera =
    new THREE.PerspectiveCamera(
      65,
      innerWidth / innerHeight,
      0.1,
      1400
    );

  camera.position.set(0, 7, 18);

  renderer =
    new THREE.WebGLRenderer({
      antialias: true
    });

  renderer.setPixelRatio(
    Math.min(devicePixelRatio, 2)
  );

  renderer.setSize(
    innerWidth,
    innerHeight
  );

  renderer.shadowMap.enabled = true;

  document.body.appendChild(
    renderer.domElement
  );

  clock = new THREE.Clock();

  createLighting();
  createCity();
  createHero();
  createObjective();
  createLab();
  createEnemies();
  setupControls();

  addEventListener(
    "resize",
    resize
  );
}

function material(color) {

  return new THREE.MeshStandardMaterial({
    color: color,
    roughness: .75,
    metalness: .08
  });

}

function createLighting() {

  scene.add(
    new THREE.HemisphereLight(
      0xbfdcff,
      0x27301f,
      2
    )
  );

  const sun =
    new THREE.DirectionalLight(
      0xffffff,
      3
    );

  sun.position.set(
    150,
    250,
    100
  );

  sun.castShadow = true;

  sun.shadow.mapSize.set(
    2048,
    2048
  );

  scene.add(sun);
}

function createCity() {

  const ground =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        900,
        900
      ),
      material(0x3b4147)
    );

  ground.rotation.x =
    -Math.PI / 2;

  ground.receiveShadow = true;

  scene.add(ground);

  createRoads();
  createBuildings();
  createTrees();
}

function createRoads() {

  const road =
    material(0x20252a);

  for (
    let x = -420;
    x <= 420;
    x += 120
  ) {

    const r =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          34,
          .12,
          900
        ),
        road
      );

    r.position.set(
      x,
      .03,
      0
    );

    scene.add(r);
  }

  for (
    let z = -420;
    z <= 420;
    z += 120
  ) {

    const r =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          900,
          .12,
          34
        ),
        road
      );

    r.position.set(
      0,
      .04,
      z
    );

    scene.add(r);
  }
}

function createBuildings() {

  const colors = [
    0x6b7480,
    0x45515e,
    0x8b8176,
    0x59616c,
    0x746b63
  ];

  for (
    let x = -390;
    x <= 390;
    x += 60
  ) {

    for (
      let z = -390;
      z <= 390;
      z += 60
    ) {

      if (
        Math.abs(x) < 80 &&
        Math.abs(z) < 80
      ) continue;

      if (Math.random() < .28)
        continue;

      const height =
        15 + Math.random() * 75;

      const width =
        34 + Math.random() * 18;

      const building =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            width,
            height,
            width
          ),
          material(
            colors[
              Math.floor(
                Math.random() *
                colors.length
              )
            ]
          )
        );

      building.position.set(
        x + (Math.random() - .5) * 12,
        height / 2,
        z + (Math.random() - .5) * 12
      );

      building.castShadow = true;
      building.receiveShadow = true;

      scene.add(building);
      buildings.push(building);
    }
  }
}

function createTrees() {

  for (let i = 0; i < 80; i++) {

    const trunk =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          .7,
          .9,
          5,
          8
        ),
        material(0x4b3324)
      );

    const crown =
      new THREE.Mesh(
        new THREE.IcosahedronGeometry(
          3.2,
          1
        ),
        material(0x294f31)
      );

    const x =
      (Math.random() - .5) * 820;

    const z =
      (Math.random() - .5) * 820;

    trunk.position.set(
      x,
      2.5,
      z
    );

    crown.position.set(
      x,
      6,
      z
    );

    scene.add(
      trunk,
      crown
    );
  }
}

function createHero() {

  hero = new THREE.Group();

  const suit =
    material(0x162a63);

  const dark =
    material(0x11141a);

  const accent =
    material(0xb91c2a);

  const body =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        1.15,
        2.4,
        8,
        16
      ),
      suit
    );

  body.position.y = 3.1;
  body.castShadow = true;

  hero.add(body);

  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        .85,
        24,
        16
      ),
      dark
    );

  head.position.y = 5.2;
  head.castShadow = true;

  hero.add(head);

  const chest =
    new THREE.Mesh(
      new THREE.CircleGeometry(
        .48,
        24
      ),
      accent
    );

  chest.position.set(
    0,
    3.5,
    -1.08
  );

  chest.rotation.x =
    Math.PI;

  hero.add(chest);

  for (const x of [-.65, .65]) {

    const arm =
      new THREE.Mesh(
        new THREE.CapsuleGeometry(
          .35,
          1.7,
          6,
          10
        ),
        suit
      );

    arm.position.set(
      x,
      3.25,
      0
    );

    hero.add(arm);
  }

  for (const x of [-.48, .48]) {

    const leg =
      new THREE.Mesh(
        new THREE.CapsuleGeometry(
          .4,
          1.8,
          6,
          10
        ),
        dark
      );

    leg.position.set(
      x,
      1.45,
      0
    );

    hero.add(leg);
  }

  hero.position.set(
    0,
    0,
    15
  );

  scene.add(hero);
}

function createObjective() {

  objective =
    new THREE.Mesh(
      new THREE.TorusKnotGeometry(
        2.3,
        .22,
        80,
        12
      ),
      material(0x42d9ff)
    );

  objective.position.set(
    0,
    16,
    -150
  );

  scene.add(objective);
}

function createLab() {

  lab = new THREE.Group();

  const building =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        70,
        16,
        55
      ),
      material(0x29333b)
    );

  building.position.y = 8;

  lab.add(building);

  const roof =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        76,
        2,
        61
      ),
      material(0x111820)
    );

  roof.position.y = 17;

  lab.add(roof);

  lab.position.set(
    0,
    0,
    -150
  );

  scene.add(lab);
}

function createEnemies() {

  for (let i = 0; i < 8; i++) {

    const enemy =
      new THREE.Mesh(
        new THREE.CapsuleGeometry(
          .9,
          2,
          7,
          12
        ),
        material(0x6b1b25)
      );

    enemy.position.set(
      (Math.random() - .5) * 180,
      2,
      (Math.random() - .5) * 220 - 90
    );

    enemy.userData.hp = 3;

    enemy.castShadow = true;

    scene.add(enemy);
    enemies.push(enemy);
  }
}

function setupControls() {

  document
    .getElementById("startBtn")
    .onclick = () => {

      started = true;

      document
        .getElementById("start")
        .classList
        .add("start-hidden");

      renderer
        .domElement
        .requestPointerLock?.();
    };

  addEventListener(
    "keydown",
    event => {

      const key =
        event.key.toLowerCase();

      if (key in keys)
        keys[key] = true;

      if (event.code === "Space")
        jump();

      if (key === "e")
        webSwing();

      if (key === "f")
        attack();
    }
  );

  addEventListener(
    "keyup",
    event => {

      const key =
        event.key.toLowerCase();

      if (key in keys)
        keys[key] = false;
    }
  );

  addEventListener(
    "mousemove",
    event => {

      if (
        !started ||
        document.pointerLockElement !==
        renderer.domElement
      ) return;

      hero.rotation.y -=
        event.movementX * .0025;
    }
  );

  document
    .querySelectorAll("[data-key]")
    .forEach(button => {

      const key =
        button.dataset.key;

      button.onpointerdown =
        () => keys[key] = true;

      button.onpointerup =
        () => keys[key] = false;

      button.onpointercancel =
        () => keys[key] = false;
    });

  document
    .getElementById("jump")
    .onpointerdown = jump;

  document
    .getElementById("web")
    .onpointerdown = webSwing;

  document
    .getElementById("attack")
    .onpointerdown = attack;
}

function jump() {

  if (!started)
    return;

  if (hero.position.y <= .05)
    velocity.y = 18;
}

function webSwing() {

  if (!started)
    return;

  const direction =
    objective.position
      .clone()
      .sub(hero.position)
      .normalize();

  velocity.addScaledVector(
    direction,
    24
  );

  showMessage(
    "WEB ZIP! Reach the laboratory."
  );

  drawWeb(
    objective.position
  );
}

function drawWeb(target) {

  if (webLine)
    scene.remove(webLine);

  const geometry =
    new THREE.BufferGeometry()
      .setFromPoints([
        hero.position
          .clone()
          .add(new THREE.Vector3(0, 4, 0)),
        target
      ]);

  webLine =
    new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: 0xffffff
      })
    );

  scene.add(webLine);

  setTimeout(() => {

    if (webLine) {
      scene.remove(webLine);
      webLine = null;
    }

  }, 250);
}

function attack() {

  if (!started)
    return;

  attacking = .25;

  for (const enemy of enemies) {

    if (
      enemy.position.distanceTo(
        hero.position
      ) < 7
    ) {

      enemy.userData.hp--;
      xp += 25;

      if (enemy.userData.hp <= 0) {

        enemy.position.y = -50;

        showMessage(
          "Enemy defeated! +25 XP"
        );

      } else {

        showMessage("Hit!");
      }
    }
  }
}

function updateHero(delta) {

  const forward =
    new THREE.Vector3(
      Math.sin(hero.rotation.y),
      0,
      Math.cos(hero.rotation.y)
    );

  const right =
    new THREE.Vector3(
      Math.cos(hero.rotation.y),
      0,
      -Math.sin(hero.rotation.y)
    );

  const movement =
    new THREE.Vector3();

  if (keys.w)
    movement.add(forward);

  if (keys.s)
    movement.sub(forward);

  if (keys.d)
    movement.add(right);

  if (keys.a)
    movement.sub(right);

  if (movement.lengthSq())
    movement.normalize();

  const speed = 28;

  velocity.x =
    THREE.MathUtils.lerp(
      velocity.x,
      movement.x * speed,
      Math.min(1, delta * 7)
    );

  velocity.z =
    THREE.MathUtils.lerp(
      velocity.z,
      movement.z * speed,
      Math.min(1, delta * 7)
    );

  velocity.y -= 35 * delta;

  hero.position.addScaledVector(
    velocity,
    delta
  );

  if (hero.position.y < 0) {

    hero.position.y = 0;
    velocity.y = 0;
  }

  hero.position.x =
    THREE.MathUtils.clamp(
      hero.position.x,
      -440,
      440
    );

  hero.position.z =
    THREE.MathUtils.clamp(
      hero.position.z,
      -440,
      440
    );

  attacking =
    Math.max(
      0,
      attacking - delta
    );

  if (objective)
    objective.rotation.y +=
      delta * 2;

  if (
    lab &&
    hero.position.distanceTo(
      lab.position
    ) < 45
  ) {

    completeMission();
  }
}

function updateEnemies(delta) {

  for (const enemy of enemies) {

    if (enemy.position.y < 0)
      continue;

    const distance =
      enemy.position.distanceTo(
        hero.position
      );

    if (distance < 35) {

      const direction =
        hero.position
          .clone()
          .sub(enemy.position);

      direction.y = 0;

      if (direction.length() > 2) {

        direction.normalize();

        enemy.position
          .addScaledVector(
            direction,
            delta * 7
          );
      }

      if (distance < 3) {

        health -= delta * 10;

        if (health < 0)
          health = 0;
      }
    }
  }
}

function completeMission() {

  if (!objective)
    return;

  scene.remove(objective);

  objective = null;

  xp += 100;

  document
    .getElementById("mission")
    .textContent =
    "Mission complete: Explore the city";

  showMessage(
    "Mission complete! The lab is secure."
  );
}

function updateCamera(delta) {

  const offset =
    new THREE.Vector3(
      0,
      7,
      15
    ).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      hero.rotation.y
    );

  const desired =
    hero.position
      .clone()
      .add(offset);

  camera.position.lerp(
    desired,
    1 - Math.pow(.001, delta)
  );

  camera.lookAt(
    hero.position.x,
    hero.position.y + 3,
    hero.position.z
  );
}

function showMessage(text) {

  document
    .getElementById("message")
    .textContent = text;
}

function animate() {

  requestAnimationFrame(animate);

  const delta =
    Math.min(
      clock.getDelta(),
      .033
    );

  if (started) {

    updateHero(delta);
    updateEnemies(delta);
    updateCamera(delta);
  }

  document
    .getElementById("hp")
    .textContent =
    Math.round(health);

  document
    .getElementById("xp")
    .textContent = xp;

  renderer.render(
    scene,
    camera
  );
}

function resize() {

  camera.aspect =
    innerWidth / innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    innerWidth,
    innerHeight
  );
}
