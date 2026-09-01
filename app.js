let currentProject = null;
let currentStep = 0;

function showScreen(screenName, button = null) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const target = document.getElementById(screenName);

  if (target) {
    target.classList.add("active");
  }

  document.querySelectorAll("nav button").forEach(btn => {
    btn.classList.remove("active");
  });

  if (button) {
    button.classList.add("active");
  }

  if (screenName === "saved") {
    displaySavedProjects();
  }

  window.scrollTo(0, 0);
}

function openProject(projectId) {
  const project = projects[projectId];

  if (!project) {
    return;
  }

  currentProject = projectId;
  currentStep = Number(localStorage.getItem("progress_" + projectId)) || 0;

  document.getElementById("projectTitle").textContent = project.title;
  document.getElementById("projectDescription").textContent = project.description;
  document.getElementById("projectDifficulty").textContent = project.difficulty;
  document.getElementById("projectTime").textContent = project.time;
  document.getElementById("projectCost").textContent = project.cost;

  const materialsList = document.getElementById("materialsList");
  materialsList.innerHTML = "";

  project.materials.forEach(material => {
    const li = document.createElement("li");
    li.textContent = material;
    materialsList.appendChild(li);
  });

  const toolsList = document.getElementById("toolsList");
  toolsList.innerHTML = "";

  project.tools.forEach(tool => {
    const li = document.createElement("li");
    li.textContent = tool;
    toolsList.appendChild(li);
  });

  const cutList = document.getElementById("cutList");
  cutList.innerHTML = "";

  project.cuts.forEach(cut => {
    const row = document.createElement("tr");

    cut.forEach(item => {
      const cell = document.createElement("td");
      cell.textContent = item;
      row.appendChild(cell);
    });

    cutList.appendChild(row);
  });

  const stepsContainer = document.getElementById("stepsContainer");
  stepsContainer.innerHTML = "";

  project.steps.forEach((step, index) => {
    const div = document.createElement("div");

    div.className = "step";

    div.innerHTML = `
      <div class="step-number">Step ${index + 1}</div>
      <div>${step}</div>
    `;

    stepsContainer.appendChild(div);
  });

  updateStepDisplay();
  showScreen("project");
}

function updateStepDisplay() {
  const steps = document.querySelectorAll("#stepsContainer .step");

  steps.forEach((step, index) => {
    if (index <= currentStep) {
      step.style.opacity = "1";
    } else {
      step.style.opacity = "0.45";
    }
  });

  updateProgress();
  updateStepButtons();
}

function updateProgress() {
  if (!currentProject) {
    return;
  }

  const totalSteps = projects[currentProject].steps.length;

  const completed = Math.min(currentStep, totalSteps);

  const percentage = totalSteps === 0
    ? 0
    : Math.round((completed / totalSteps) * 100);

  document.getElementById("progressBar").style.width = percentage + "%";
  document.getElementById("progressText").textContent =
    completed + " of " + totalSteps + " steps completed";
}

function nextStep() {
  if (!currentProject) {
    return;
  }

  const totalSteps = projects[currentProject].steps.length;

  if (currentStep < totalSteps) {
    currentStep++;
    saveProgress();
    updateStepDisplay();
  }
}

function previousStep() {
  if (currentStep > 0) {
    currentStep--;
    saveProgress();
    updateStepDisplay();
  }
}

function finishProject() {
  if (!currentProject) {
    return;
  }

  const totalSteps = projects[currentProject].steps.length;

  currentStep = totalSteps;

  saveProgress();
  updateStepDisplay();

  alert("Nice one! Project completed.");
}

function updateStepButtons() {
  const totalSteps = projects[currentProject].steps.length;

  document.getElementById("previousButton").disabled =
    currentStep <= 0;

  document.getElementById("nextButton").disabled =
    currentStep >= totalSteps;

  document.getElementById("finishButton").disabled =
    currentStep >= totalSteps;
}

function saveProgress() {
  if (!currentProject) {
    return;
  }

  localStorage.setItem(
    "progress_" + currentProject,
    currentStep
  );
}

function saveProject(projectId) {
  let saved = JSON.parse(
    localStorage.getItem("woodcraftSaved") || "[]"
  );

  if (!saved.includes(projectId)) {
    saved.push(projectId);

    localStorage.setItem(
      "woodcraftSaved",
      JSON.stringify(saved)
    );

    alert("Project saved.");
  } else {
    alert("This project is already saved.");
  }
}

function saveCurrentProject() {
  if (currentProject) {
    saveProject(currentProject);
  }
}

function displaySavedProjects() {
  const container = document.getElementById("savedProjects");

  const saved = JSON.parse(
    localStorage.getItem("woodcraftSaved") || "[]"
  );

  container.innerHTML = "";

  if (saved.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <h3>No saved projects yet</h3>
        <p>Save a project and it will appear here.</p>
      </div>
    `;

    return;
  }

  saved.forEach(projectId => {
    const project = projects[projectId];

    if (!project) {
      return;
    }

    const card = document.createElement("div");

    card.className = "project-card";

    card.innerHTML = `
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <button class="primary-button"
        onclick="openProject('${projectId}')">
        Open Project
      </button>

      <button class="danger-button"
        onclick="removeSavedProject('${projectId}')">
        Remove
      </button>
    `;

    container.appendChild(card);
  });
}

function removeSavedProject(projectId) {
  let saved = JSON.parse(
    localStorage.getItem("woodcraftSaved") || "[]"
  );

  saved = saved.filter(id => id !== projectId);

  localStorage.setItem(
    "woodcraftSaved",
    JSON.stringify(saved)
  );

  displaySavedProjects();
}

function searchProjects() {
  const search = document
    .getElementById("projectSearch")
    .value
    .toLowerCase();

  document.querySelectorAll(".project-card[data-project]").forEach(card => {
    const text = card.textContent.toLowerCase();

    card.style.display =
      text.includes(search) ? "block" : "none";
  });
}

function calculateCost() {
  const timber =
    Number(document.getElementById("timberCost").value) || 0;

  const hardware =
    Number(document.getElementById("hardwareCost").value) || 0;

  const finish =
    Number(document.getElementById("finishCost").value) || 0;

  const total = timber + hardware + finish;

  document.getElementById("totalCost").textContent =
    "Estimated total: £" + total.toFixed(2);
}


/* CUSTOM BUILD CALCULATOR */

function generateCustomCutList() {
  const projectType =
    document.getElementById("builderType").value;

  const width =
    Number(document.getElementById("builderWidth").value);

  const height =
    Number(document.getElementById("builderHeight").value);

  const depth =
    Number(document.getElementById("builderDepth").value);

  const thickness =
    Number(document.getElementById("builderThickness").value);

  const result = document.getElementById("builderResult");

  if (
    !width ||
    !height ||
    !depth ||
    !thickness ||
    width <= 0 ||
    height <= 0 ||
    depth <= 0 ||
    thickness <= 0
  ) {
    result.innerHTML =
      "Please enter positive dimensions in millimetres.";

    return;
  }

  if (width <= thickness * 2 || depth <= thickness * 2) {
    result.innerHTML =
      "Width and depth need to be more than twice the material thickness.";

    return;
  }

  let cuts = [];

  if (projectType === "planter") {
    cuts = [
      ["2", "Side", height, depth, thickness],
      [
        "2",
        "End",
        height,
        width - (2 * thickness),
        thickness
      ],
      [
        "1",
        "Bottom",
        width - (2 * thickness),
        depth - (2 * thickness),
        thickness
      ]
    ];
  }

  if (projectType === "box") {
    cuts = [
      ["2", "Side", height, depth, thickness],
      [
        "2",
        "End",
        height,
        width - (2 * thickness),
        thickness
      ],
      [
        "1",
        "Bottom",
        width - (2 * thickness),
        depth - (2 * thickness),
        thickness
      ]
    ];
  }

  if (projectType === "shelf") {
    cuts = [
      ["2", "Side", height, depth, thickness],
      [
        "1",
        "Top", 
        width,
        depth,
        thickness
      ],
      [
        "1",
        "Bottom",
        width,
        depth,
        thickness
      ]
    ];
  }

  let html = `
    <h3>Your Cut List</h3>

    <p>
      Dimensions are shown in millimetres.
    </p>

    <table class="cut-table">
      <thead>
        <tr>
          <th>Qty</th>
          <th>Part</th>
          <th>Length</th>
          <th>Width</th>
          <th>Thickness</th>
        </tr>
      </thead>

      <tbody>
  `;

  cuts.forEach(cut => {
    html += `
      <tr>
        <td>${cut[0]}</td>
        <td>${cut[1]}</td>
        <td>${cut[2]} mm</td>
        <td>${cut[3]} mm</td>
        <td>${cut[4]} mm</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>

    <div class="builder-note">
      <strong>Important:</strong>
      This is a planning calculator, not an engineering-certified
      design. Check your joinery, timber dimensions, screw positions,
      clearances and structural requirements before cutting.
    </div>
  `;

  result.innerHTML = html;
}


/* START APP */

displaySavedProjects();