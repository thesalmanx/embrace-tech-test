import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Bounds } from "@react-three/drei";
import { Suspense, useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { a, useSpring } from "@react-spring/three";
import heic2any from "heic2any";
import "./App.css";
import { AiOutlineArrowRight, AiOutlineArrowLeft } from "react-icons/ai";

function LoadingAnimation() {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <div className="loading-text">Embrace IT</div>
    </div>
  );
}

function Model({ textureUrl, rotation }) {
  const { scene } = useMemo(() => useGLTF("/iPhone16.glb"), []);
  const modelRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Animate the scaling effect
  const { scale } = useSpring({
    scale: hovered ? 1.7 : 1.6, // Scale up when hovered
    config: { mass: 1, tension: 200, friction: 20 }, // Smooth transition
  });

  useEffect(() => {
    if (textureUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(
        textureUrl,
        (texture) => {
          texture.flipY = false;
          scene.traverse((child) => {
            if (child.isMesh) {
              child.material.map = texture;
              child.material.needsUpdate = true;
            }
          });
        },
        undefined,
        (err) => console.error("Texture load failed:", err)
      );
    }
  }, [textureUrl, scene]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y = rotation;
    }
  });

  return (
    <a.primitive
      object={scene}
      ref={modelRef}
      scale={scale}
      rotation={[0, 3.25, 0]} // Slight tilt to reveal side buttons
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
  );
}

function App() {
  const [textureUrl, setTextureUrl] = useState(null);
  const [rotation, setRotation] = useState(Math.PI);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (file.type === "image/heic") {
        try {
          const convertedBlob = await heic2any({
            blob: new Blob([e.target.result], { type: file.type }),
            toType: "image/jpeg",
            quality: 0.8,
          });
          setTextureUrl(URL.createObjectURL(convertedBlob));
        } catch (error) {
          console.error("HEIC conversion failed:", error);
        }
      } else {
        setTextureUrl(e.target.result);
      }
    };

    file.type === "image/heic" ? reader.readAsArrayBuffer(file) : reader.readAsDataURL(file);
  };

  if (isLoading) return <LoadingAnimation />;

  return (
    <div className="app-container">
      <header className="header">
        <img className="logo" src="/logo.jpeg" alt="Embrace Technologies Logo" />
        <h1 className="logo-text">Embrace Technologies</h1>
      </header>

      <main className="main-container">
        <div className="canvas-wrapper">
          <Canvas shadows camera={{ position: [0, 0, 3], fov: 50 }}>
            <Suspense fallback={null}>
              <Bounds fit clip observe margin={1.1}>
                <Model textureUrl={textureUrl} rotation={rotation} />
              </Bounds>
              <ambientLight intensity={0.15} />
              <directionalLight position={[3, 5, 2]} intensity={0.1} />
              <Environment preset="city" />
              <OrbitControls enableDamping dampingFactor={0.15} />
            </Suspense>
          </Canvas>

          <div className="controls-container">
            <button className="control-btn" onClick={() => setRotation(rotation - 0.2)}>
              <AiOutlineArrowLeft className="abc" />
            </button>
            <button className="control-btn" onClick={() => setRotation(rotation + 0.2)}>
              <AiOutlineArrowRight className="abc" />
            </button>
          </div>

          <h1 className="iphone-text">iPhone 16 Case</h1>
          <div className="customization-section">
            <input
              id="texture-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="upload-input"
            />
            <label htmlFor="texture-upload" className="upload-btn">
              Customize
            </label>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
