import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

window.addEventListener("load", () => {
    console.log("Three.js carregado?", THREE);

    /* ============================
        DATA DOS ITENS
    ============================ */
    const items3D = [
        {
            title: "Colar Lua & Estrelas Prata 925",
            description: "Delicado e cheio de significado, este colar lua e estrelas traz charme e leveza ao visual. Perfeito para quem ama peças com personalidade.",
            model: "/models/colar_lua_3d.glb",
        },
        {
            title: "Colar Triplo Prata Premium",
            description: "Colar triplo em prata com camadas que dão volume e brilho na medida certa. Um toque moderno que transforma qualquer look.",
            model: "models/colar2.glb",
        },
        {
            title: "Pulseira Prata Trançada Masculina",
            description: "Pulseira de prata com design trançado robusto e elegante. Um acessório versátil, ideal para destacar estilo e personalidade em qualquer ocasião.",
            model: "/models/pulseira.glb",
        }
    ];

    let currentIndex = 0;

    function updateUI() {
        const item = items3D[currentIndex];
        document.querySelector(".title-item").textContent = item.title;
        document.querySelector(".description-item").textContent = item.description;

        document.querySelectorAll(".circle").forEach((c, i) =>
            c.classList.toggle("active", i === currentIndex)
        );

        loadModel(item.model);
    }

    /* ============================
        THREE.JS — SETUP
    ============================ */
    let scene, camera, renderer, currentModel;
    const loader = new GLTFLoader();

    function initThree() {
        const canvas = document.getElementById("viewer-3d");

        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true
        });

        renderer.setPixelRatio(window.devicePixelRatio);
        resizeRenderer(); // **NOVO**

        camera = new THREE.PerspectiveCamera(
            45,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            100
        );

        camera.position.set(0, 1.5, 3);

        const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        scene.add(light);

        animate();

        window.addEventListener("resize", resizeRenderer);
    }

    /* ============================
        AJUSTE DE RENDERER (NOVO)
    ============================ */
    function resizeRenderer() {
        const canvas = renderer.domElement;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        renderer.setSize(width, height, false);

        if (camera) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    }

    /* ============================
        THREE.JS — CARREGAR MODELO
    ============================ */
    function loadModel(path) {
        if (currentModel) {
            scene.remove(currentModel);
            currentModel = null;
        }

        loader.load(
            path,
            (gltf) => {
                currentModel = gltf.scene;

                currentModel.scale.set(1.5, 1.5, 1.5); // maior

                scene.add(currentModel);

                const box = new THREE.Box3().setFromObject(currentModel);
                const size = box.getSize(new THREE.Vector3()).length();
                const center = box.getCenter(new THREE.Vector3());

                currentModel.position.sub(center);

                const distance = size / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2));
                camera.position.set(0, 0, distance * 0.9);
                camera.lookAt(0, 0, 0);
            },
            undefined,
            (err) => console.error("Erro ao carregar modelo:", err)
        );
    }

    /* ============================
   ROTACIONAR COM MOUSE + TOUCH
============================ */
    let dragging = false;
    let lastX = 0;

    // MOUSE
    window.addEventListener("mousedown", (e) => {
        dragging = true;
        lastX = e.clientX;
    });

    window.addEventListener("mouseup", () => {
        dragging = false;
    });

    window.addEventListener("mousemove", (e) => {
        if (!dragging || !currentModel) return;

        const delta = (e.clientX - lastX) * 0.01;
        currentModel.rotation.y += delta;

        lastX = e.clientX;
    });

    // TOUCH
    window.addEventListener("touchstart", (e) => {
        dragging = true;
        lastX = e.touches[0].clientX;
    }, { passive: true });

    window.addEventListener("touchend", () => {
        dragging = false;
    });

    window.addEventListener("touchmove", (e) => {
        if (!dragging || !currentModel) return;

        const touchX = e.touches[0].clientX;

        const delta = (touchX - lastX) * 0.01;
        currentModel.rotation.y += delta;

        lastX = touchX;
    }, { passive: true });

    /* ============================
        LOOP DE ANIMAÇÃO
    ============================ */
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    /* ============================
        NAVEGAÇÃO
    ============================ */
    document.querySelector(".btn-next").onclick = () => {
        currentIndex = (currentIndex + 1) % items3D.length;
        updateUI();
    };

    document.querySelector(".btn-prev").onclick = () => {
        currentIndex = (currentIndex - 1 + items3D.length) % items3D.length;
        updateUI();
    };

    document.querySelectorAll(".circle").forEach((circle, i) => {
        circle.addEventListener("click", () => {
            currentIndex = i;
            updateUI();
        });
    });

    /* ============================
        INICIALIZAÇÃO
    ============================ */
    initThree();
    updateUI();
});
