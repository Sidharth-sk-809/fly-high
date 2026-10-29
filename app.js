const model = document.querySelector("#hubble-model");
const progressValue = document.querySelector(".progress-value");
const pauseButton = document.querySelector("#pause-button");
const partInfo = document.querySelector("#part-info");
const partTitle = partInfo.querySelector("h2");
const partDescription = partInfo.querySelector(".part-description");
let isOpen = false;
let isPaused = false;
let wasAutoRotating = false;

const partDetails = {
  primaryMirror: {
    title: "Primary mirror",
    description:
      "A 2.4 m mirror gathers and focuses faint light from distant astronomical objects. Hubble’s position above Earth’s atmosphere gives it a clear view across ultraviolet, visible, and near-infrared wavelengths.",
  },
  solarArrays: {
    title: "Solar arrays",
    description:
      "The two wing-like arrays convert sunlight into electrical power for the observatory. Their photovoltaic cells also recharge Hubble’s batteries while it is in sunlight.",
  },
  fineGuidance: {
    title: "Fine Guidance Sensors",
    description:
      "These precision sensors lock onto guide stars and keep Hubble accurately pointed during long observations. They can also support precise stellar position measurements.",
  },
  wideFieldCamera: {
    title: "Wide Field Camera",
    description:
      "Hubble’s wide-field imaging instruments capture detailed views of galaxies, nebulae, stars, and planets across multiple wavelengths.",
  },
  instruments: {
    title: "Science instruments",
    description:
      "The instrument bay houses cameras and spectrographs that analyze the universe from ultraviolet through near-infrared light.",
  },
  insulation: {
    title: "Thermal insulation",
    description:
      "The reflective multilayer insulation helps control the telescope’s temperature as it moves between direct sunlight and Earth’s shadow.",
  },
  antennas: {
    title: "Communication antennas",
    description:
      "The high-gain antennas send science data and receive commands through NASA’s Tracking and Data Relay Satellite System.",
  },
  connections: {
    title: "Connection hardware",
    description:
      "These structural lines, pipes, and fittings route support hardware along the observatory and help connect its serviceable systems.",
  },
  structure: {
    title: "Support structure",
    description:
      "The spacecraft structure protects the optical and electronic systems and provides attachment points for the instruments, antennas, and solar arrays.",
  },
};

const getPartDetails = (materialIndex) => {
  if ([13, 14, 15, 16, 17, 18].includes(materialIndex)) return partDetails.solarArrays;
  if ([29, 30, 54, 55, 56, 57, 64, 65].includes(materialIndex)) return partDetails.connections;
  if (materialIndex === 1) return partDetails.fineGuidance;
  if (materialIndex === 2) return partDetails.wideFieldCamera;
  if ([3, 4, 5, 6].includes(materialIndex)) return partDetails.instruments;
  if ([19, 20, 21, 22, 23, 24].includes(materialIndex)) return partDetails.primaryMirror;
  if ([50, 51].includes(materialIndex)) return partDetails.insulation;
  if ([7, 8, 9, 10, 11, 12].includes(materialIndex)) return partDetails.antennas;
  return partDetails.structure;
};

const showPartInfo = (event, details) => {
  partTitle.textContent = details.title;
  partDescription.textContent = details.description;
  partInfo.hidden = false;
  const margin = 16;
  const width = partInfo.offsetWidth;
  const height = partInfo.offsetHeight;
  partInfo.style.left = `${Math.min(event.clientX, window.innerWidth - width - margin)}px`;
  partInfo.style.top = `${Math.min(event.clientY, window.innerHeight - height - margin)}px`;
};

const hidePartInfo = () => {
  partInfo.hidden = true;
};

model.addEventListener("pointermove", (event) => {
  if (!model.loaded || typeof model.materialFromPoint !== "function") return;
  const material = model.materialFromPoint(event.clientX, event.clientY);
  if (!material) {
    hidePartInfo();
    return;
  }
  showPartInfo(event, getPartDetails(model.model.materials.indexOf(material)));
});

model.addEventListener("pointerleave", hidePartInfo);

const updatePauseButton = () => {
  pauseButton.classList.toggle("is-paused", isPaused);
  pauseButton.setAttribute("aria-label", isPaused ? "Resume model movement" : "Pause model movement");
  pauseButton.querySelector(".pause-icon").textContent = isPaused ? "▶" : "Ⅱ";
  pauseButton.querySelector(".pause-label").textContent = isPaused ? "RESUME" : "PAUSE";
};

pauseButton.addEventListener("click", () => {
  if (!model.loaded) return;
  const shouldResume = pauseButton.classList.contains("is-paused");
  if (shouldResume) {
    if (wasAutoRotating) model.setAttribute("auto-rotate", "");
    if (model.animationName) model.play();
    isPaused = false;
  } else {
    wasAutoRotating = model.hasAttribute("auto-rotate");
    model.removeAttribute("auto-rotate");
    model.pause();
    isPaused = true;
  }
  updatePauseButton();
});

model.addEventListener("progress", (event) => {
  progressValue.style.width = `${Math.max(4, event.detail.totalProgress * 100)}%`;
});

const hideLoading = () => {
  progressValue.style.width = "100%";
  document.querySelector(".loading").hidden = true;
};

const applyGoldConnections = () => {
  const materials = model.model?.materials ?? [];
  for (const index of [29, 30, 43, 54, 55, 56, 57, 64, 65]) {
    const material = materials[index];
    if (!material) continue;
    const pbr = material.pbrMetallicRoughness;
    pbr.setBaseColorFactor([1, 0.52, 0.035, 1]);
    pbr.setMetallicFactor(0.65);
    pbr.setRoughnessFactor(0.22);
  }
};

const applyInteriorAndAntennaFinish = () => {
  const materials = model.model?.materials ?? [];

  for (const index of [7, 8, 9, 10, 11, 12]) {
    const material = materials[index];
    if (!material) continue;
    const pbr = material.pbrMetallicRoughness;
    pbr.setBaseColorFactor([0.58, 0.2, 0.07, 1]);
    pbr.setMetallicFactor(0.72);
    pbr.setRoughnessFactor(0.26);
  }

  for (const index of [19, 20, 21, 22, 23, 24]) {
    const material = materials[index];
    if (!material) continue;
    const pbr = material.pbrMetallicRoughness;
    pbr.setBaseColorFactor([0.18, 0.07, 0.025, 1]);
    pbr.setMetallicFactor(0.2);
    pbr.setRoughnessFactor(0.46);
  }
};

model.addEventListener("load", () => {
  if (!isPaused) model.setAttribute("auto-rotate", "");
  hideLoading();
});
model.addEventListener("load", () => setTimeout(applyGoldConnections, 0));
model.addEventListener("load", () => setTimeout(applyInteriorAndAntennaFinish, 0));
if (model.loaded) {
  if (!isPaused) model.setAttribute("auto-rotate", "");
  hideLoading();
  setTimeout(applyGoldConnections, 0);
  setTimeout(applyInteriorAndAntennaFinish, 0);
}

const playAnimation = (name, speed, time) => {
  model.pause();
  model.animationName = name;
  model.animationSpeed = speed;
  model.currentTime = time;
  model.play();
  isPaused = false;
  updatePauseButton();
};

const toggleOpening = () => {
  const duration = model.duration;
  isOpen = !isOpen;
  playAnimation("exploded_view", isOpen ? 1 : -1, isOpen ? 0 : duration);
};

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (model.loaded) toggleOpening();
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (model.loaded) playAnimation("ambient_animation", 1, 0);
  }
});
