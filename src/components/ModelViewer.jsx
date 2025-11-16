import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import ClothingModels from "../utils/clothingModels";

const ModelViewer = ({
  modelPath,
  category,
  gender,
  color = "#ffffff",
  graphic = "None",
  pattern = "Solid",
  onReset,
  useProceduralModel = false,
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const initialCameraPosition = useRef(new THREE.Vector3(0, 0.5, 3));
  const initialCameraTarget = useRef(new THREE.Vector3(0, 0, 0));
  const initialModelRotation = useRef(new THREE.Euler(0, 0, 0));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.5, 3);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.domElement.style.cursor = "grab";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Update cursor on mouse interactions
    renderer.domElement.addEventListener("mousedown", () => {
      renderer.domElement.style.cursor = "grabbing";
    });
    renderer.domElement.addEventListener("mouseup", () => {
      renderer.domElement.style.cursor = "grab";
    });

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 5;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (
        container &&
        renderer.domElement &&
        container.contains(renderer.domElement)
      ) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Load 3D model
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    let isMounted = true;

    // Remove old model
    if (modelRef.current) {
      scene.remove(modelRef.current.group);
      modelRef.current = null;
    }

    // Use procedural model if requested
    if (useProceduralModel) {
      const loadProceduralModel = () => {
        try {
          const threeColor = new THREE.Color(color);
          const proceduralModel = ClothingModels.getModel(scene, category);

          // Apply initial color
          proceduralModel.materials.forEach((material) => {
            if (material.color) {
              material.color.set(threeColor);
            }
          });

          // Store initial model rotation
          initialModelRotation.current.copy(proceduralModel.group.rotation);

          modelRef.current = proceduralModel;

          if (isMounted) {
            setLoading(false);
          }
        } catch (err) {
          console.error("Failed to create procedural model:", err);
          if (isMounted) {
            setError(true);
            setLoading(false);
          }
        }
      };

      // Use setTimeout to avoid synchronous setState
      setTimeout(loadProceduralModel, 0);

      return () => {
        isMounted = false;
      };
    }

    // Otherwise load GLB model
    const getModelPath = () => {
      if (modelPath) return modelPath;

      const cat = category?.toLowerCase() || "t-shirt";
      const gen = gender?.toLowerCase() || "men";

      const modelMap = {
        "t-shirt": {
          men: "/models/tshirt_men.glb",
          women: "/models/tshirt_women.glb",
          unisex: "/models/tshirt_men.glb",
        },
        shirt: {
          men: "/models/tshirt_men.glb",
          women: "/models/dress_women.glb",
          unisex: "/models/tshirt_men.glb",
        },
        hoodie: {
          men: "/models/hoodie_men.glb",
          women: "/models/hoodie_women.glb",
          unisex: "/models/hoodie_men.glb",
        },
        dress: {
          women: "/models/free_model--bow_knot_dress.glb",
          unisex: "/models/free_model--bow_knot_dress.glb",
          men: "/models/free_model--bow_knot_dress.glb",
        },
        kurthi: {
          women: "/models/shalwar-kameez.glb",
          unisex: "/models/shalwar-kameez.glb",
          men: "/models/shalwar-kameez.glb",
        },
        jeans: {
          men: "/models/jeans.glb",
          women: "/models/jeans.glb",
          unisex: "/models/jeans.glb",
        },
      };

      const categoryModels = modelMap[cat];
      if (categoryModels && categoryModels[gen]) {
        return categoryModels[gen];
      }

      return "/models/tshirt_men.glb";
    };

    const modelFilePath = getModelPath();
    const loader = new GLTFLoader();

    loader.load(
      `http://localhost:3000${modelFilePath}`,
      (gltf) => {
        if (!isMounted) return;
        console.log("3D model loaded successfully");

        setLoading(false);

        const model = {
          group: gltf.scene,
          materials: [],
        };

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model.group);
        box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.group.position.set(0, 0, 0);

        const maxSize = Math.max(size.x, size.y, size.z);
        const scale = 1.8 / maxSize;
        model.group.scale.setScalar(scale);

        const scaledBox = new THREE.Box3().setFromObject(model.group);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());

        model.group.position.x = -scaledCenter.x;
        model.group.position.y = -scaledCenter.y + 0.1;
        model.group.position.z = -scaledCenter.z;

        // Collect all materials from the GLB model
        model.group.traverse((child) => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              model.materials.push(...child.material);
            } else {
              model.materials.push(child.material);
            }
          }
        });

        // Store initial model rotation
        initialModelRotation.current.copy(model.group.rotation);

        scene.add(model.group);
        modelRef.current = model;
      },
      undefined,
      (err) => {
        if (!isMounted) return;
        console.error("Failed to load 3D model:", err);
        setError(true);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [category, gender, modelPath, useProceduralModel, color]);

  // Apply color and graphic/pattern to model
  useEffect(() => {
    if (!modelRef.current) return;

    const model = modelRef.current;

    // Convert hex color to THREE.Color
    const threeColor = new THREE.Color(color);

    // For procedural models
    if (useProceduralModel) {
      // Apply color
      model.materials.forEach((material) => {
        if (material.color) {
          material.color.set(threeColor);
        }
      });

      // Apply pattern
      if (pattern && pattern !== "Solid" && pattern !== "None") {
        ClothingModels.applyPattern(model.materials, threeColor, pattern);
      } else {
        // Remove pattern
        model.materials.forEach((material) => {
          if (material.map) {
            material.map = null;
            material.needsUpdate = true;
          }
        });
      }

      // Apply graphic texture for procedural models
      if (graphic && graphic !== "None") {
        const textureLoader = new THREE.TextureLoader();
        const graphicTexture = textureLoader.load(
          `http://localhost:3000/images/graphics/${graphic}`,
          () => {
            console.log("Graphic texture loaded:", graphic);
          },
          undefined,
          (error) => {
            console.error("Failed to load graphic texture:", error);
          }
        );

        model.materials.forEach((material) => {
          material.map = graphicTexture;
          material.needsUpdate = true;
        });
      }
    } else {
      // For GLB models
      model.group.traverse((child) => {
        if (child.isMesh && child.material) {
          // Apply color
          if (child.material.color) {
            child.material.color.set(threeColor);
          }

          // Apply graphic texture
          if (graphic && graphic !== "None") {
            const textureLoader = new THREE.TextureLoader();
            const graphicTexture = textureLoader.load(
              `http://localhost:3000/images/graphics/${graphic}`,
              () => {
                console.log("Graphic texture loaded:", graphic);
              },
              undefined,
              (error) => {
                console.error("Failed to load graphic texture:", error);
              }
            );

            // Apply texture to material
            if (child.material.map) {
              child.material.map = graphicTexture;
            } else {
              // Create new material with texture if none exists
              const newMaterial = new THREE.MeshPhongMaterial({
                map: graphicTexture,
                color: threeColor,
              });
              child.material = newMaterial;
            }

            child.material.needsUpdate = true;
          } else {
            // Remove texture if 'None' is selected
            if (child.material.map) {
              child.material.map = null;
              child.material.needsUpdate = true;
            }
          }
        }
      });
    }
  }, [color, graphic, pattern, useProceduralModel]);

  // Reset camera and model view
  const handleReset = () => {
    if (cameraRef.current && controlsRef.current) {
      // Reset camera position
      cameraRef.current.position.copy(initialCameraPosition.current);

      // Reset controls target
      controlsRef.current.target.copy(initialCameraTarget.current);

      controlsRef.current.update();
    }

    // Reset model rotation
    if (modelRef.current && modelRef.current.group) {
      modelRef.current.group.rotation.copy(initialModelRotation.current);
    }

    // Call parent's onReset to reset form data (color, graphic, etc.)
    if (onReset) {
      onReset();
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "450px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#f8f9fa",
        position: "relative",
      }}
    >
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading 3D model...</span>
          </div>
          <p className="mt-2 text-muted small">Loading 3D model...</p>
        </div>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            padding: "20px",
            zIndex: 10,
          }}
        >
          <i className="fas fa-exclamation-triangle text-warning fa-3x mb-3"></i>
          <p className="text-muted">Failed to load 3D model</p>
          <small className="text-muted">
            Please check your internet connection
          </small>
        </div>
      )}

      {!loading && !error && (
        <>
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 5,
            }}
          >
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={handleReset}
              title="Reset View"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #0d6efd",
              }}
            >
              <i className="fas fa-sync-alt me-1"></i> Reset
            </button>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              zIndex: 5,
            }}
          >
            <i className="fas fa-hand-pointer me-2"></i>
            Drag to rotate • Scroll to zoom
          </div>
        </>
      )}
    </div>
  );
};

export default ModelViewer;
