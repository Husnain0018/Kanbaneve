// const { todo } = require("node:test");
// const { json } = require("stream/consumers");

// class kanbanBord {
//   constructor() {
//     this.tasks = {
//       todo: [],
//       doing: [],
//       done: []
//     }
//     this.taskIdCounter = 1
//     this.draggedTask = null
//     this.init()

//   }
//   init() {
//     this.loadTasks()
//     this.setupEventListeners()
//     this.setupDragAndDrop()
//     this.updateTaskCounts()
//   }
//   setupEventListeners() {
//     document
//       .getElementById("todo add")
//       .addEventListener("click", () => this.addTask("todo"));
//     document
//       .getElementById("doing-add")
//       .addEventListener("click", () => this.addTask("todo"));
//     document
//       .getElementById("don-add")
//       .addEventListener("click", () => this.addTask("todo"));
//     document
//       .getElementById("todo input")
//       .addEventListener("keypress", (e) => {
//         if (e.key == "Enter") this.addTask("Todo");
//       });
//     document.getElementById("doing-input").addEventListener("keypress", (e) => {
//       if (e.key == "Enter") this.addTask("doing");
//     });
//     document.getElementById("doing-input").addEventListener("krypress", (e) => {
//       if (e.key == "Enter") this.addTask("done")
//     });
//   }
//   loadTasks() {
//     const savedTask = localStorage.getItem("kanban-task")
//     const savedCounter = localStorage.getItem("kanban-counter")

//     if (savedTask) {
//       this.tasks = JSON.parse(savedTask)


//     }
//     if (savedCounter) {
//       this.taskldCounter = Number.parseInt(savedCounter)
//     }
//     this.renderTasks()
//   }
//   savedTasks() {
//     localStorage.setltem("kanban-task", JSON.stringify(this.tasks))
//     localStorage.setltem("kanban-task", this.taskldCounter.toString())

//   }
//   updateTaskCounts(){
//     document.getElementById("todo-counter").textContent = this.tasks.todo.length
//     document.getElementById("doing-counter").textContent = this.tasks.todo.length
//     document.getElementById("done-counter").textContent = this.tasks.todo.length
//   }
//   escapeHtml(text){
//     const div = document.createElement("div")
//     div.textContent= text
//     return div.innerHTML
//   }
// addTask(column){
//   const input
// }

// }
class KanbanBoard {
  constructor() {
    this.tasks = {
      todo: [],
      doing: [],
      done: [],
    }
    this.taskIdCounter = 1
    this.draggedTask = null
    this.init()
  }

  init() {
    this.loadTasks()
    this.setupEventListeners()
    this.setupDragAndDrop()
    this.updateTaskCounts()
  }

  setupEventListeners() {
    // Add task buttons
    document.getElementById("todo-add").addEventListener("click", () => this.addTask("todo"))
    document.getElementById("doing-add").addEventListener("click", () => this.addTask("doing"))
    document.getElementById("done-add").addEventListener("click", () => this.addTask("done"))

    // Enter key for inputs
    document.getElementById("todo-input").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTask("todo")
    })
    document.getElementById("doing-input").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTask("doing")
    })
    document.getElementById("done-input").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTask("done")
    })
  }

  addTask(column) {
    const input = document.getElementById(`${column}-input`)  // Fixed this line
    const text = input.value.trim()

    if (!text) return

    const task = {
      id: this.taskIdCounter++,
      text: text,
      createdAt: new Date().toISOString(),
    }

    this.tasks[column].push(task)
    input.value = ""

    this.renderTasks()
    this.saveTasks()
    this.updateTaskCounts()

    // Add animation
    const taskElement = document.querySelector(`[data-task-id="${task.id}"]`)  // Fixed this line
    if (taskElement) {
      taskElement.classList.add("task-enter")
    }
  }

  deleteTask(taskId, column) {
    this.tasks[column] = this.tasks[column].filter((task) => task.id !== taskId)
    this.renderTasks()
    this.saveTasks()
    this.updateTaskCounts()
  }

  renderTasks() {
    ;["todo", "doing", "done"].forEach((column) => {
      const container = document.getElementById(`${column}-tasks`)  // Fixed this line
      container.innerHTML = ""

      this.tasks[column].forEach((task) => {
        const taskElement = this.createTaskElement(task, column)
        container.appendChild(taskElement)
      })
    })
  }

  createTaskElement(task, column) {
    const taskDiv = document.createElement("div")
    taskDiv.className = "task"
    taskDiv.draggable = true
    taskDiv.dataset.taskId = task.id
    taskDiv.dataset.column = column

    taskDiv.innerHTML = `
      <div class="task-content">
        <p class="text-sm font-medium text-slate-900 mb-2">${this.escapeHtml(task.text)}</p>
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500">
            ${new Date(task.createdAt).toLocaleDateString()}
          </span>
          <button class="delete-task" onclick="kanban.deleteTask(${task.id}, '${column}')">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    `

    return taskDiv
  }

  setupDragAndDrop() {
    // Add drag event listeners to task containers
    ;["todo", "doing", "done"].forEach((column) => {
      const container = document.getElementById(`${column}-tasks`)  // Fixed this line

      container.addEventListener("dragover", (e) => {
        console.log("dragover")
        
        e.preventDefault()
        container.classList.add("drag-over")
      })

      container.addEventListener("dragleave", (e) => {
        console.log("dragleave")
        if (!container.contains(e.relatedTarget)) {
          container.classList.remove("drag-over")
        }
      })

      container.addEventListener("drop", (e) => {
        console.log("drop")
        e.preventDefault()
        container.classList.remove("drag-over")
        this.handleDrop(e, column)
      })
    })

    // Add drag event listeners to tasks (delegated)
    document.addEventListener("dragstart", (e) => {
      console.log("dragstart")
      if (e.target.classList.contains("task")) {
        this.draggedTask = {
          id: Number.parseInt(e.target.dataset.taskId),
          column: e.target.dataset.column,
        }
        e.target.classList.add("dragging")
      }
    })

    document.addEventListener("dragend", (e) => {
      console.log("dragend")
      if (e.target.classList.contains("task")) {
        e.target.classList.remove("dragging")
        this.draggedTask = null
      }
    })
  }

  handleDrop(e, targetColumn) {
    if (!this.draggedTask) return

    const { id, column: sourceColumn } = this.draggedTask
    console.log("source column", sourceColumn, "target column", targetColumn)

    if (sourceColumn === targetColumn) return

    // Find and move the task
    const taskIndex = this.tasks[sourceColumn].findIndex((task) => task.id === id)
    if (taskIndex === -1) return

    const task = this.tasks[sourceColumn].splice(taskIndex, 1)[0]
    this.tasks[targetColumn].push(task)

    this.renderTasks()
    this.saveTasks()
    this.updateTaskCounts()

    // Add pulse animation to target column
    document.getElementById(targetColumn).classList.add("pulse")
    setTimeout(() => {
      document.getElementById(targetColumn).classList.remove("pulse")
    }, 200)
  }

  updateTaskCounts() {
    document.getElementById("todo-count").textContent = this.tasks.todo.length
    document.getElementById("doing-count").textContent = this.tasks.doing.length
    document.getElementById("done-count").textContent = this.tasks.done.length
  }

  saveTasks() {
    localStorage.setItem("kanban-tasks", JSON.stringify(this.tasks))
    localStorage.setItem("kanban-counter", this.taskIdCounter.toString())
  }

  loadTasks() {
    const savedTasks = localStorage.getItem("kanban-tasks")
    const savedCounter = localStorage.getItem("kanban-counter")

    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks)
    }

    if (savedCounter) {
      this.taskIdCounter = Number.parseInt(savedCounter)
    }

    this.renderTasks()
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }
}

// Initialize the Kanban board
const kanban = new KanbanBoard()

// Make kanban globally available for onclick handlers
window.kanban = kanban
