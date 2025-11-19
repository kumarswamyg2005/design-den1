// 3D Clothing Models for DesignDen React
// This file contains improved 3D models created with Three.js primitives

import * as THREE from "three";

class ClothingModels {
  // Helper method to draw checkered pattern
  static drawCheckered(ctx, width, height) {
    const squareSize = width / 16;
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";

    for (let x = 0; x < width; x += squareSize * 2) {
      for (let y = 0; y < height; y += squareSize * 2) {
        ctx.fillRect(x, y, squareSize, squareSize);
        ctx.fillRect(x + squareSize, y + squareSize, squareSize, squareSize);
      }
    }
  }

  // Helper method to draw striped pattern
  static drawStriped(ctx, width, height) {
    const stripeWidth = width / 20;
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";

    for (let x = 0; x < width; x += stripeWidth * 2) {
      ctx.fillRect(x, 0, stripeWidth, height);
    }
  }

  // Helper method to draw polka dot pattern
  static drawPolkaDot(ctx, width, height) {
    const dotRadius = width / 30;
    const spacing = width / 10;
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";

    for (let x = dotRadius; x < width; x += spacing) {
      for (let y = dotRadius; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Helper method to draw floral pattern
  static drawFloral(ctx, width, height) {
    const flowerSize = width / 20;
    const spacing = width / 8;

    for (let x = flowerSize; x < width; x += spacing) {
      for (let y = flowerSize; y < height; y += spacing) {
        // Draw flower
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";

        // Petals
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          const angle = (i / 5) * Math.PI * 2;
          const petalX = x + (Math.cos(angle) * flowerSize) / 2;
          const petalY = y + (Math.sin(angle) * flowerSize) / 2;
          ctx.arc(petalX, petalY, flowerSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Center
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.beginPath();
        ctx.arc(x, y, flowerSize / 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Create a shirt model using Three.js primitives
  static createShirtModel(scene, color = 0xffffff) {
    const shirtGroup = new THREE.Group();

    // Create the main body of the shirt with better proportions
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1, 0.2);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
      flatShading: false,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0;
    shirtGroup.add(body);

    // Create shoulders
    const shoulderGeometry = new THREE.BoxGeometry(1, 0.2, 0.2);
    const shoulders = new THREE.Mesh(shoulderGeometry, bodyMaterial);
    shoulders.position.y = 0.4;
    shirtGroup.add(shoulders);

    // Create left sleeve
    const sleeveGeometry = new THREE.CylinderGeometry(0.12, 0.1, 0.6, 16);
    const leftSleeve = new THREE.Mesh(sleeveGeometry, bodyMaterial);
    leftSleeve.rotation.z = Math.PI / 2;
    leftSleeve.position.set(-0.5, 0.3, 0);
    shirtGroup.add(leftSleeve);

    // Create right sleeve
    const rightSleeve = new THREE.Mesh(sleeveGeometry, bodyMaterial);
    rightSleeve.rotation.z = -Math.PI / 2;
    rightSleeve.position.set(0.5, 0.3, 0);
    shirtGroup.add(rightSleeve);

    // Create collar
    const collarGeometry = new THREE.CylinderGeometry(
      0.15,
      0.15,
      0.3,
      16,
      1,
      true
    );
    const collarMaterial = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
    });
    const collar = new THREE.Mesh(collarGeometry, collarMaterial);
    collar.position.set(0, 0.5, 0);
    shirtGroup.add(collar);

    // Create buttons
    const buttonGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.02, 16);
    const buttonMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
    });

    // Add multiple buttons down the front
    for (let i = 0; i < 5; i++) {
      const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button.rotation.x = Math.PI / 2;
      button.position.set(0, 0.3 - i * 0.15, 0.11);
      shirtGroup.add(button);
    }

    // Add pocket
    const pocketGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.01);
    const pocket = new THREE.Mesh(pocketGeometry, bodyMaterial);
    pocket.position.set(-0.25, 0.25, 0.11);
    shirtGroup.add(pocket);

    scene.add(shirtGroup);

    return {
      group: shirtGroup,
      materials: [bodyMaterial, collarMaterial, buttonMaterial],
    };
  }

  // Create a t-shirt model
  static createTShirtModel(scene, color = 0xffffff) {
    const tshirtGroup = new THREE.Group();

    // Create the main body of the t-shirt
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.15);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
      flatShading: false,
    });

    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0;
    tshirtGroup.add(body);

    // Create shoulders
    const shoulderGeometry = new THREE.BoxGeometry(1, 0.15, 0.15);
    const shoulders = new THREE.Mesh(shoulderGeometry, bodyMaterial);
    shoulders.position.y = 0.5;
    tshirtGroup.add(shoulders);

    // Create left sleeve - shorter for t-shirt
    const sleeveGeometry = new THREE.CylinderGeometry(0.12, 0.14, 0.25, 16);
    const leftSleeve = new THREE.Mesh(sleeveGeometry, bodyMaterial);
    leftSleeve.rotation.z = Math.PI / 2;
    leftSleeve.position.set(-0.5, 0.4, 0);
    tshirtGroup.add(leftSleeve);

    // Create right sleeve
    const rightSleeve = new THREE.Mesh(sleeveGeometry, bodyMaterial);
    rightSleeve.rotation.z = -Math.PI / 2;
    rightSleeve.position.set(0.5, 0.4, 0);
    tshirtGroup.add(rightSleeve);

    // Create collar - round neck for t-shirt
    const collarGeometry = new THREE.TorusGeometry(0.15, 0.04, 16, 32, Math.PI);
    const collarMaterial = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
    });
    const collar = new THREE.Mesh(collarGeometry, collarMaterial);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.55, 0);
    tshirtGroup.add(collar);

    scene.add(tshirtGroup);

    return {
      group: tshirtGroup,
      materials: [bodyMaterial, collarMaterial],
    };
  }

  // Create a hoodie model
  static createHoodieModel(scene, color = 0xffffff) {
    const hoodieGroup = new THREE.Group();

    // Create the main body of the hoodie
    const bodyGeometry = new THREE.BoxGeometry(0.9, 1.1, 0.4);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
      flatShading: false,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0;
    hoodieGroup.add(body);

    // Create left sleeve
    const sleeveGeometry = new THREE.CylinderGeometry(0.18, 0.15, 0.6, 16);
    const leftSleeve = new THREE.Mesh(sleeveGeometry, bodyMaterial);
    leftSleeve.rotation.z = Math.PI / 2;
    leftSleeve.position.set(-0.55, 0.2, 0);
    hoodieGroup.add(leftSleeve);

    // Create right sleeve
    const rightSleeve = new THREE.Mesh(sleeveGeometry, bodyMaterial);
    rightSleeve.rotation.z = -Math.PI / 2;
    rightSleeve.position.set(0.55, 0.2, 0);
    hoodieGroup.add(rightSleeve);

    // Create hood
    const hoodGeometry = new THREE.SphereGeometry(
      0.25,
      16,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
    const hoodMaterial = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
    });
    const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
    hood.rotation.x = Math.PI;
    hood.position.set(0, 0.6, -0.15);
    hoodieGroup.add(hood);

    // Create pocket
    const pocketGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.05);
    const pocket = new THREE.Mesh(pocketGeometry, bodyMaterial);
    pocket.position.set(0, -0.2, 0.23);
    hoodieGroup.add(pocket);

    scene.add(hoodieGroup);

    return {
      group: hoodieGroup,
      materials: [bodyMaterial, hoodMaterial],
    };
  }

  // Create a kurthi model
  static createKurthiModel(scene, color = 0xffffff) {
    const kurthiGroup = new THREE.Group();

    // Create the main body of the kurthi (longer than shirt)
    const bodyGeometry = new THREE.BoxGeometry(0.7, 1.5, 0.2);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
      flatShading: false,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -0.2;
    kurthiGroup.add(body);

    // Create side slits
    const slitGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.05);
    const slitMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.2,
    });

    const leftSlit = new THREE.Mesh(slitGeometry, slitMaterial);
    leftSlit.position.set(-0.35, -0.7, 0.1);
    kurthiGroup.add(leftSlit);

    const rightSlit = new THREE.Mesh(slitGeometry, slitMaterial);
    rightSlit.position.set(0.35, -0.7, 0.1);
    kurthiGroup.add(rightSlit);

    // Create left sleeve
    const sleeveGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.7, 16);
    const leftSleeve = new THREE.Mesh(sleeveGeometry, bodyMaterial);
    leftSleeve.rotation.z = Math.PI / 2;
    leftSleeve.position.set(-0.45, 0.3, 0);
    kurthiGroup.add(leftSleeve);

    // Create right sleeve
    const rightSleeve = new THREE.Mesh(sleeveGeometry, bodyMaterial);
    rightSleeve.rotation.z = -Math.PI / 2;
    rightSleeve.position.set(0.45, 0.3, 0);
    kurthiGroup.add(rightSleeve);

    // Create collar
    const collarGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.05);
    const collarMaterial = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
    });
    const collar = new THREE.Mesh(collarGeometry, collarMaterial);
    collar.position.set(0, 0.5, 0.1);
    kurthiGroup.add(collar);

    // Create neck slit
    const neckSlitGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.05);
    const neckSlit = new THREE.Mesh(neckSlitGeometry, slitMaterial);
    neckSlit.position.set(0, 0.35, 0.11);
    kurthiGroup.add(neckSlit);

    // Create embroidery details
    const embroideryGeometry = new THREE.PlaneGeometry(0.6, 0.2);
    const embroideryMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });

    const frontEmbroidery = new THREE.Mesh(
      embroideryGeometry,
      embroideryMaterial
    );
    frontEmbroidery.position.set(0, 0.2, 0.11);
    kurthiGroup.add(frontEmbroidery);

    const hemEmbroideryGeometry = new THREE.PlaneGeometry(0.7, 0.1);
    const hemEmbroidery = new THREE.Mesh(
      hemEmbroideryGeometry,
      embroideryMaterial
    );
    hemEmbroidery.position.set(0, -0.9, 0.11);
    kurthiGroup.add(hemEmbroidery);

    scene.add(kurthiGroup);

    return {
      group: kurthiGroup,
      materials: [bodyMaterial, collarMaterial, embroideryMaterial],
    };
  }

  // Create a dress model
  static createDressModel(scene, color = 0xffffff) {
    const dressGroup = new THREE.Group();

    // Create the top part of the dress
    const topGeometry = new THREE.BoxGeometry(0.7, 0.6, 0.3);
    const dressMaterial = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
      flatShading: false,
    });
    const top = new THREE.Mesh(topGeometry, dressMaterial);
    top.position.y = 0.3;
    dressGroup.add(top);

    // Create the skirt part
    const skirtGeometry = new THREE.CylinderGeometry(0.6, 0.9, 1.2, 16);
    const skirt = new THREE.Mesh(skirtGeometry, dressMaterial);
    skirt.position.y = -0.3;
    dressGroup.add(skirt);

    // Create left sleeve
    const sleeveGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 16);
    const leftSleeve = new THREE.Mesh(sleeveGeometry, dressMaterial);
    leftSleeve.rotation.z = Math.PI / 2;
    leftSleeve.position.set(-0.45, 0.4, 0);
    dressGroup.add(leftSleeve);

    // Create right sleeve
    const rightSleeve = new THREE.Mesh(sleeveGeometry, dressMaterial);
    rightSleeve.rotation.z = -Math.PI / 2;
    rightSleeve.position.set(0.45, 0.4, 0);
    dressGroup.add(rightSleeve);

    // Create collar
    const collarGeometry = new THREE.CylinderGeometry(
      0.15,
      0.15,
      0.2,
      16,
      1,
      true
    );
    const collar = new THREE.Mesh(collarGeometry, dressMaterial);
    collar.position.set(0, 0.6, 0);
    dressGroup.add(collar);

    scene.add(dressGroup);

    return {
      group: dressGroup,
      materials: [dressMaterial],
    };
  }

  // Create jeans model
  static createJeansModel(scene, color = 0x0000ff) {
    const jeansGroup = new THREE.Group();

    // Create waist part
    const waistGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
    const jeansMaterial = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
      flatShading: false,
    });
    const waist = new THREE.Mesh(waistGeometry, jeansMaterial);
    waist.position.y = 0.4;
    jeansGroup.add(waist);

    // Create left leg
    const legGeometry = new THREE.CylinderGeometry(0.2, 0.15, 1, 16);
    const leftLeg = new THREE.Mesh(legGeometry, jeansMaterial);
    leftLeg.position.set(-0.2, -0.1, 0);
    jeansGroup.add(leftLeg);

    // Create right leg
    const rightLeg = new THREE.Mesh(legGeometry, jeansMaterial);
    rightLeg.position.set(0.2, -0.1, 0);
    jeansGroup.add(rightLeg);

    scene.add(jeansGroup);

    return {
      group: jeansGroup,
      materials: [jeansMaterial],
    };
  }

  // Get the appropriate model based on category and gender
  static getModel(scene, category) {
    const cat = category?.toLowerCase() || "t-shirt";

    switch (cat) {
      case "shirt":
        return this.createShirtModel(scene);
      case "t-shirt":
        return this.createTShirtModel(scene);
      case "hoodie":
        return this.createHoodieModel(scene);
      case "kurthi":
        return this.createKurthiModel(scene);
      case "dress":
        return this.createDressModel(scene);
      case "jeans":
        return this.createJeansModel(scene);
      default:
        return this.createTShirtModel(scene);
    }
  }

  // Apply pattern to materials
  static applyPattern(materials, color, pattern) {
    if (!pattern || pattern === "Solid" || pattern === "None") {
      materials.forEach((material) => {
        if (material.map) {
          material.map = null;
          material.needsUpdate = true;
        }
      });
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Fill with base color
    ctx.fillStyle = new THREE.Color(color).getStyle();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add pattern
    switch (pattern) {
      case "Checkered":
        this.drawCheckered(ctx, canvas.width, canvas.height);
        break;
      case "Striped":
        this.drawStriped(ctx, canvas.width, canvas.height);
        break;
      case "Polka Dot":
        this.drawPolkaDot(ctx, canvas.width, canvas.height);
        break;
      case "Floral":
        this.drawFloral(ctx, canvas.width, canvas.height);
        break;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);

    materials.forEach((material) => {
      material.map = texture;
      material.needsUpdate = true;
    });
  }
}

export default ClothingModels;
