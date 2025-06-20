// DOM Elements
const studentTableBody = document.getElementById("studentTableBody");
const noStudentsMessage = document.getElementById("noStudentsMessage");
const addStudentBtn = document.getElementById("addStudentBtn");
const addFirstStudentBtn = document.getElementById("addFirstStudentBtn");
const studentModal = document.getElementById("studentModal");
const confirmModal = document.getElementById("confirmModal");
const studentForm = document.getElementById("studentForm");
const saveStudentBtn = document.getElementById("saveStudentBtn");
const cancelStudentBtn = document.getElementById("cancelStudentBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const searchInput = document.getElementById("searchInput");
const deptFilter = document.getElementById("deptFilter");
const yearFilter = document.getElementById("yearFilter");
const marksMinFilter = document.getElementById("marksMinFilter");
const marksMaxFilter = document.getElementById("marksMaxFilter");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

// State variables
let students = JSON.parse(localStorage.getItem("students")) || [];
let currentStudentId = null;
let sortColumn = null;
let sortDirection = "asc";

// Initialize the app
function init() {
  renderStudentTable();
  setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
  addStudentBtn.addEventListener("click", () => openStudentModal());
  addFirstStudentBtn.addEventListener("click", () => openStudentModal());
  saveStudentBtn.addEventListener("click", saveStudent);
  cancelStudentBtn.addEventListener("click", closeStudentModal);
  confirmDeleteBtn.addEventListener("click", confirmDelete);
  cancelDeleteBtn.addEventListener("click", closeConfirmModal);

  // Search and filter events
  searchInput.addEventListener("input", renderStudentTable);
  deptFilter.addEventListener("change", renderStudentTable);
  yearFilter.addEventListener("change", renderStudentTable);
  marksMinFilter.addEventListener("input", renderStudentTable);
  marksMaxFilter.addEventListener("input", renderStudentTable);
}

// Render student table
function renderStudentTable() {
  const searchTerm = searchInput.value.toLowerCase();
  const deptFilterValue = deptFilter.value;
  const yearFilterValue = yearFilter.value;
  const marksMinValue = marksMinFilter.value
    ? parseInt(marksMinFilter.value)
    : 0;
  const marksMaxValue = marksMaxFilter.value
    ? parseInt(marksMaxFilter.value)
    : 100;

  // Filter students
  let filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm) ||
      student.regNo.toLowerCase().includes(searchTerm);
    const matchesDept = deptFilterValue
      ? student.dept === deptFilterValue
      : true;
    const matchesYear = yearFilterValue
      ? student.year === yearFilterValue
      : true;
    const matchesMarks =
      parseInt(student.marks) >= marksMinValue &&
      parseInt(student.marks) <= marksMaxValue;

    return matchesSearch && matchesDept && matchesYear && matchesMarks;
  });

  // Sort students if sort column is set
  if (sortColumn) {
    filteredStudents.sort((a, b) => {
      let valueA = a[sortColumn];
      let valueB = b[sortColumn];

      // Handle numeric sorting for marks and year
      if (sortColumn === "marks" || sortColumn === "year") {
        valueA = parseInt(valueA);
        valueB = parseInt(valueB);
      }

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  }

  // Clear table
  studentTableBody.innerHTML = "";

  // Show no students message if no results
  if (filteredStudents.length === 0) {
    noStudentsMessage.classList.remove("hidden");
    return;
  } else {
    noStudentsMessage.classList.add("hidden");
  }

  // Add rows to table
  filteredStudents.forEach((student) => {
    const row = document.createElement("tr");
    row.className = "hover:bg-gray-50 transition-all";
    row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${
                      student.name
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
                      student.regNo
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
                      student.dept
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Year ${
                      student.year
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              student.marks >= 80
                                ? "bg-green-100 text-green-800"
                                : student.marks >= 50
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }">
                            ${student.marks}%
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-purple-600 hover:text-purple-900 mr-3 edit-btn" data-id="${
                          student.id
                        }">Edit</button>
                        <button class="text-red-600 hover:text-red-900 delete-btn" data-id="${
                          student.id
                        }">Delete</button>
                    </td>
                `;
    studentTableBody.appendChild(row);
  });

  // Add event listeners to edit and delete buttons
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      editStudent(id);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      showConfirmModal(id);
    });
  });
}

// Sort table by column
function sortTable(column) {
  // Reset all sort icons
  document.querySelectorAll('[id$="SortIcon"]').forEach((icon) => {
    icon.textContent = "↕";
  });

  // If clicking the same column, toggle direction
  if (sortColumn === column) {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
  } else {
    sortColumn = column;
    sortDirection = "asc";
  }

  // Update sort icon
  const iconId = `${column}SortIcon`;
  const icon = document.getElementById(iconId);
  icon.textContent = sortDirection === "asc" ? "↑" : "↓";

  renderStudentTable();
}

// Open student modal for adding/editing
function openStudentModal(student = null) {
  const modalTitle = document.getElementById("modalTitle");

  if (student) {
    modalTitle.textContent = "Edit Student";
    document.getElementById("studentId").value = student.id;
    document.getElementById("name").value = student.name;
    document.getElementById("regNo").value = student.regNo;
    document.getElementById("dept").value = student.dept;
    document.getElementById("year").value = student.year;
    document.getElementById("marks").value = student.marks;
  } else {
    modalTitle.textContent = "Add New Student";
    studentForm.reset();
    currentStudentId = null;
  }

  studentModal.classList.remove("hidden");
}

// Close student modal
function closeStudentModal() {
  studentModal.classList.add("hidden");
}

// Save student (add or update)
function saveStudent() {
  // Get form values
  const id = document.getElementById("studentId").value || generateId();
  const name = document.getElementById("name").value;
  const regNo = document.getElementById("regNo").value;
  const dept = document.getElementById("dept").value;
  const year = document.getElementById("year").value;
  const marks = document.getElementById("marks").value;

  // Validate form
  if (!name || !regNo || !dept || !year || !marks) {
    showToast("Please fill in all fields", "error");
    return;
  }

  // Check if regNo already exists (for new students or when regNo is changed)
  const existingStudent = students.find(
    (s) => s.regNo === regNo && s.id !== id
  );
  if (existingStudent) {
    showToast("Registration number already exists", "error");
    return;
  }

  // Create student object
  const student = {
    id,
    name,
    regNo,
    dept,
    year,
    marks,
  };

  // Add or update student
  const existingIndex = students.findIndex((s) => s.id === id);
  if (existingIndex >= 0) {
    students[existingIndex] = student;
    showToast("Student updated successfully");
  } else {
    students.push(student);
    showToast("Student added successfully");
  }

  // Save to localStorage and refresh table
  localStorage.setItem("students", JSON.stringify(students));
  renderStudentTable();
  closeStudentModal();
}

// Edit student
function editStudent(id) {
  const student = students.find((s) => s.id === id);
  if (student) {
    currentStudentId = id;
    openStudentModal(student);
  }
}

// Show confirmation modal for delete
function showConfirmModal(id) {
  currentStudentId = id;
  confirmModal.classList.remove("hidden");
}

// Close confirmation modal
function closeConfirmModal() {
  confirmModal.classList.add("hidden");
}

// Confirm delete
function confirmDelete() {
  students = students.filter((student) => student.id !== currentStudentId);
  localStorage.setItem("students", JSON.stringify(students));
  renderStudentTable();
  closeConfirmModal();
  showToast("Student deleted successfully");
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Show toast notification
function showToast(message, type = "success") {
  toastMessage.textContent = message;
  toast.className = "fixed bottom-4 right-4 flex items-center";

  if (type === "success") {
    toast.firstElementChild.className =
      "bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center";
  } else {
    toast.firstElementChild.className =
      "bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center";
  }

  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
