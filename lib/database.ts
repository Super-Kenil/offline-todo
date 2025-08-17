import type { Todo, Reminder, Category, AppSettings } from "./types"

const DB_NAME = "TaskFlowDB"
const DB_VERSION = 1

// Store names
const STORES = {
  TODOS: "todos",
  REMINDERS: "reminders",
  CATEGORIES: "categories",
  SETTINGS: "settings",
} as const

let dbInstance: IDBDatabase | null = null
let dbInitializationPromise: Promise<void> | null = null

function init(): Promise<void> {
  if (dbInitializationPromise) {
    return dbInitializationPromise
  }

  dbInitializationPromise = new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve()
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error("IndexedDB error:", request.error)
      dbInitializationPromise = null // Allow retrying initialization
      reject(request.error)
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve()
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(STORES.TODOS)) {
        const todoStore = db.createObjectStore(STORES.TODOS, { keyPath: "id" })
        todoStore.createIndex("completed", "completed", { unique: false })
        todoStore.createIndex("priority", "priority", { unique: false })
        todoStore.createIndex("dueDate", "dueDate", { unique: false })
        todoStore.createIndex("createdAt", "createdAt", { unique: false })
        todoStore.createIndex("category", "category", { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.REMINDERS)) {
        const reminderStore = db.createObjectStore(STORES.REMINDERS, { keyPath: "id" })
        reminderStore.createIndex("todoId", "todoId", { unique: false })
        reminderStore.createIndex("reminderTime", "reminderTime", { unique: false })
        reminderStore.createIndex("isActive", "isActive", { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
        const categoryStore = db.createObjectStore(STORES.CATEGORIES, { keyPath: "id" })
        categoryStore.createIndex("name", "name", { unique: true })
      }

      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: "id" })
      }
    }
  })

  return dbInitializationPromise
}

async function getStore(storeName: keyof typeof STORES, mode: IDBTransactionMode = "readonly"): Promise<IDBObjectStore> {
  await init()
  if (!dbInstance) {
    throw new Error("Database not initialized")
  }
  const transaction = dbInstance.transaction([STORES[storeName]], mode)
  return transaction.objectStore(STORES[storeName])
}

async function createTodo(todo: Omit<Todo, "id" | "createdAt" | "updatedAt">): Promise<Todo> {
  const newTodo: Todo = {
    ...todo,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const store = await getStore("TODOS", "readwrite")
  return new Promise((resolve, reject) => {
    const request = store.add(newTodo)
    request.onsuccess = () => resolve(newTodo)
    request.onerror = () => reject(request.error)
  })
}

async function getTodos(): Promise<Todo[]> {
  const store = await getStore("TODOS")
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getTodoById(id: string): Promise<Todo | null> {
  const store = await getStore("TODOS")
  return new Promise((resolve, reject) => {
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

async function updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
  const store = await getStore("TODOS", "readwrite")
  const existing = await getTodoById(id)

  if (!existing) {
    throw new Error("Todo not found")
  }

  const updatedTodo: Todo = {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date(),
  }

  return new Promise((resolve, reject) => {
    const request = store.put(updatedTodo)
    request.onsuccess = () => resolve(updatedTodo)
    request.onerror = () => reject(request.error)
  })
}

async function deleteTodo(id: string): Promise<void> {
  const store = await getStore("TODOS", "readwrite")
  await new Promise<void>((resolve, reject) => {
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
  await deleteRemindersByTodoId(id)
}

async function getTodosByFilter(filter: "all" | "active" | "completed" | "today" | "overdue"): Promise<Todo[]> {
  const todos = await getTodos()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

  switch (filter) {
    case "active":
      return todos.filter((todo) => !todo.completed)
    case "completed":
      return todos.filter((todo) => todo.completed)
    case "today":
      return todos.filter(
        (todo) => todo.dueDate && new Date(todo.dueDate) >= today && new Date(todo.dueDate) < tomorrow && !todo.completed,
      )
    case "overdue":
      return todos.filter((todo) => todo.dueDate && new Date(todo.dueDate) < now && !todo.completed)
    default:
      return todos
  }
}

async function createReminder(reminder: Omit<Reminder, "id" | "createdAt" | "updatedAt">): Promise<Reminder> {
  const newReminder: Reminder = {
    ...reminder,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const store = await getStore("REMINDERS", "readwrite")
  return new Promise((resolve, reject) => {
    const request = store.add(newReminder)
    request.onsuccess = () => resolve(newReminder)
    request.onerror = () => reject(request.error)
  })
}

async function getRemindersByTodoId(todoId: string): Promise<Reminder[]> {
  const store = await getStore("REMINDERS")
  const index = store.index("todoId")
  return new Promise((resolve, reject) => {
    const request = index.getAll(todoId)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getActiveReminders(): Promise<Reminder[]> {
  const store = await getStore("REMINDERS")
  const index = store.index("isActive")
  return new Promise((resolve, reject) => {
    const request = index.getAll(IDBKeyRange.only(true))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder> {
  const store = await getStore("REMINDERS", "readwrite")
  const existing = await new Promise<Reminder | undefined>((resolve, reject) => {
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  if (!existing) {
    throw new Error("Reminder not found")
  }

  const updatedReminder: Reminder = {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date(),
  }

  return new Promise((resolve, reject) => {
    const request = store.put(updatedReminder)
    request.onsuccess = () => resolve(updatedReminder)
    request.onerror = () => reject(request.error)
  })
}

async function deleteReminder(id: string): Promise<void> {
  const store = await getStore("REMINDERS", "readwrite")
  return new Promise((resolve, reject) => {
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function deleteRemindersByTodoId(todoId: string): Promise<void> {
  const reminders = await getRemindersByTodoId(todoId)
  const store = await getStore("REMINDERS", "readwrite")
  const deletePromises = reminders.map(
    (reminder) =>
      new Promise<void>((resolve, reject) => {
        const request = store.delete(reminder.id)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      }),
  )
  await Promise.all(deletePromises)
}

async function createCategory(category: Omit<Category, "id" | "createdAt">): Promise<Category> {
  const newCategory: Category = {
    ...category,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  }

  const store = await getStore("CATEGORIES", "readwrite")
  return new Promise((resolve, reject) => {
    const request = store.add(newCategory)
    request.onsuccess = () => resolve(newCategory)
    request.onerror = () => reject(request.error)
  })
}

async function getCategories(): Promise<Category[]> {
  const store = await getStore("CATEGORIES")
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getSettings(): Promise<AppSettings> {
  const store = await getStore("SETTINGS")
  const settings = await new Promise<AppSettings | null>((resolve, reject) => {
    const request = store.get("app-settings")
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })

  if (settings) {
    return settings
  }

  const defaultSettings: AppSettings = {
    id: "app-settings",
    theme: "system",
    notificationsEnabled: true,
    defaultReminderMinutes: 15,
    soundEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const writeStore = await getStore("SETTINGS", "readwrite")
  return new Promise((resolve, reject) => {
    const request = writeStore.add(defaultSettings)
    request.onsuccess = () => resolve(defaultSettings)
    request.onerror = () => reject(request.error)
  })
}

async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  const existing = await getSettings()
  const updatedSettings: AppSettings = {
    ...existing,
    ...updates,
    id: "app-settings",
    updatedAt: new Date(),
  }

  const store = await getStore("SETTINGS", "readwrite")
  return new Promise((resolve, reject) => {
    const request = store.put(updatedSettings)
    request.onsuccess = () => resolve(updatedSettings)
    request.onerror = () => reject(request.error)
  })
}

async function clearAllData(): Promise<void> {
  const storeNames = Object.keys(STORES) as (keyof typeof STORES)[]
  const clearPromises = storeNames.map(async (storeName) => {
    const store = await getStore(storeName, "readwrite")
    return new Promise<void>((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  })
  await Promise.all(clearPromises)
}

async function exportData(): Promise<string> {
  const [todos, reminders, categories, settings] = await Promise.all([
    getTodos(),
    getStore("REMINDERS").then(
      (store) =>
        new Promise<Reminder[]>((resolve, reject) => {
          const request = store.getAll()
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        }),
    ),
    getCategories(),
    getSettings(),
  ])

  return JSON.stringify(
    {
      todos,
      reminders,
      categories,
      settings,
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  )
}

export const db = {
  init,
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  getTodosByFilter,
  createReminder,
  getRemindersByTodoId,
  getActiveReminders,
  updateReminder,
  deleteReminder,
  deleteRemindersByTodoId,
  createCategory,
  getCategories,
  getSettings,
  updateSettings,
  clearAllData,
  exportData,
}

if (typeof window !== "undefined") {
  db.init().catch(console.error)
}
