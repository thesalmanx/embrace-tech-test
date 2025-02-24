import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Bounds } from "@react-three/drei";
import { Suspense, useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { a } from "@react-spring/three";
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
  const { scene } = useGLTF("/iPhone16.glb");
  const modelRef = useRef();

  useEffect(() => {
    if (textureUrl) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(textureUrl, (texture) => {
        texture.flipY = false;
        scene.traverse((child) => {
          if (child.isMesh) {
            child.material.map = texture;
            child.material.needsUpdate = true;
          }
        });
      });
    }
  }, [textureUrl, scene]);

  return (
    <a.primitive object={scene} ref={modelRef} scale={1.6} rotation={[0, rotation + 0.08, 0]} />
  );
}

function App() {
  const [textureUrl, setTextureUrl] = useState(null);
  const [rotation, setRotation] = useState(Math.PI);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (file.type === "image/heic") {
        try {
          const blob = new Blob([e.target.result], { type: file.type });
          const convertedBlob = await heic2any({
            blob,
            toType: "image/jpeg",
            quality: 0.8,
          });
          const convertedURL = URL.createObjectURL(convertedBlob);
          setTextureUrl(convertedURL);
        } catch (error) {
          console.error("HEIC conversion failed:", error);
        }
      } else {
        setTextureUrl(e.target.result);
      }
    };
    file.type === "image/heic" ? reader.readAsArrayBuffer(file) : reader.readAsDataURL(file);
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="app-container">
      <header className="header">
        <img className="logo" src="/logo.jpeg" alt="Embrace Technologies Logo" />
        <h1 className="logo-text">Embrace Technologies</h1>
      </header>

      <main className="main-container">
        <div className="canvas-wrapper">
          <Canvas className="canvas" shadows camera={{ position: [0, 0, 3], fov: 50 }}>
            <Suspense fallback={null}>
              <Bounds fit clip observe margin={1.1}>
                <Model textureUrl={textureUrl} rotation={rotation} />
              </Bounds>
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} intensity={0.3} castShadow />
              <Environment preset="city" />
              <OrbitControls enableDamping dampingFactor={0.1} />
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
