import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface CarbonCredit3DProps {
  className?: string;
}

const CarbonCredit3D: React.FC<CarbonCredit3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 1, 100);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create carbon credit tokens
    const tokens: THREE.Mesh[] = [];
    const tokenGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.1);
    
    for (let i = 0; i < 15; i++) {
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.1, 0.8, 0.6),
        transparent: true,
        opacity: 0.8,
        shininess: 100
      });
      
      const token = new THREE.Mesh(tokenGeometry, material);
      token.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4
      );
      token.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      // Add glow effect
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: material.color,
        transparent: true,
        opacity: 0.3
      });
      const glowMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.6, 0.2),
        glowMaterial
      );
      token.add(glowMesh);
      
      tokens.push(token);
      scene.add(token);
    }

    // Add floating particles
    const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.6
    });

    for (let i = 0; i < 50; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6
      );
      scene.add(particle);
    }

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Rotate tokens
      tokens.forEach((token, index) => {
        token.rotation.x += 0.01;
        token.rotation.y += 0.015;
        token.rotation.z += 0.005;
        
        // Floating motion
        token.position.y += Math.sin(Date.now() * 0.001 + index) * 0.002;
        token.position.x += Math.cos(Date.now() * 0.001 + index) * 0.001;
      });

      // Rotate camera slightly
      camera.position.x = Math.sin(Date.now() * 0.0005) * 0.5;
      camera.position.y = Math.cos(Date.now() * 0.0003) * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className={`w-full h-96 rounded-lg overflow-hidden ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
};

export default CarbonCredit3D;
