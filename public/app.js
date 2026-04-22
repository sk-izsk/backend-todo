let isLoading = false
let isAuthenticating = false
let isRegistration = false
let selectedTab = 'All'
let todos = []

const apiBase = '/'

// elements
const nav = document.querySelector('nav')
const header = document.querySelector('header')
const main = document.querySelector('main')
const navElements = document.querySelectorAll('.tab-button')
const authContent = document.getElementById('auth')
const textError = document.getElementById('error')
const email = document.getElementById('emailInput')
const password = document.getElementById('passwordInput')
const registerBtn = document.getElementById('registerBtn')
const authBtn = document.getElementById('authBtn')
const addTodoBtn = document.getElementById('addTodoBtn')
// const deleteBtn = document.getElementById('')
// const updateBtn =

class ApiError extends Error {
    constructor(message, status) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

function isUnauthorizedError(err) {
    return err instanceof ApiError && (err.status === 401 || err.status === 403)
}

function showInlineError(message) {
    textError.innerText = message
    textError.style.display = 'block'
}

function showAuthView() {
    nav.style.display = 'none'
    header.style.display = 'none'
    main.style.display = 'none'
    authContent.style.display = 'flex'
}

// PAGE RENDERING LOGIC
async function showDashboard() {
    nav.style.display = 'block'
    header.style.display = 'flex'
    main.style.display = 'flex'
    authContent.style.display = 'none'

    await fetchTodos()
}

async function apiRequest(path, options = {}) {
    const response = await fetch(apiBase + path, {
        credentials: 'include',
        ...options,
        headers: {
            ...options.headers
        }
    })

    const contentType = response.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const data = isJson ? await response.json() : null

    if (!response.ok) {
        const message = data?.message || `Request failed with status ${response.status}`
        throw new ApiError(message, response.status)
    }

    return data
}

function updateHeaderText() {
    const todosLength = todos.length
    const newString = todos.length === 1 ?
        `You have 1 open task.` :
        `You have ${todosLength} open tasks.`
    header.querySelector('h1').innerText = newString
}

function updateNavCount() {
    navElements.forEach(ele => {
        const btnText = ele.innerText.split(' ')[0]

        // filter todos in here
        const count = todos.filter(val => {
            if (btnText === 'All') {
                return true
            }
            return btnText === 'Complete' ?
                val.completed :
                !val.completed
        }).length

        // target inside space and update value
        ele.querySelector('span').innerText = `(${count})`
    })
}

function changeTab(tab) {
    selectedTab = tab
    navElements.forEach(val => {
        if (val.innerText.includes(tab)) {
            val.classList.add('selected-tab')
        } else {
            val.classList.remove('selected-tab')
        }
    })
    renderTodos()
}

function renderTodos() {
    // need to add filtering logic in here

    updateNavCount()
    updateHeaderText()

    let todoList = ``
    todos.filter(val => {
        return selectedTab === 'All' ? true : selectedTab === 'Complete' ? val.completed : !val.completed
    }).forEach((todo, todoIndex) => {
        const taskIndex = todo.id
        todoList += `
            <div class="card todo-item">
                <p>${todo.task}</p>
                <div class="todo-buttons">
                    <button onclick="updateTodo(${taskIndex})" ${todo.completed ? 'disabled' : ''}>
                        <h6>Done</h6>
                    </button>
                    <button onclick="deleteTodo(${taskIndex})">
                        <h6>Delete</h6>
                    </button>
                </div>
            </div>
            `
    })
    todoList += `
        <div class="input-container">
            <input id="todoInput" placeholder="Add task" />
            <button onclick="addTodo()">
                <i class="fa-solid fa-plus"></i>
            </button>
        </div>
        `
    main.innerHTML = todoList
}

// showDashboard()

// AUTH LOGIC

async function toggleIsRegister() {
    isRegistration = !isRegistration
    registerBtn.innerText = isRegistration ? 'Sign in' : 'Sign up'
    document.querySelector('#auth > div h2').innerText = isRegistration ? 'Sign Up' : 'Login'
    document.querySelector('.register-content p').innerText = isRegistration ? 'Already have an account?' : 'Don\'t have an account?'
    document.querySelector('.register-content button').innerText = isRegistration ? 'Sign in' : 'Sign up'
}

async function authenticate() {
    // access email and pass values
    const emailVal = email.value
    const passVal = password.value

    // guard clauses... if authenticating, return
    if (
        isLoading ||
        isAuthenticating ||
        !emailVal ||
        !passVal ||
        passVal.length < 6 ||
        !emailVal.includes('@')
    ) { return }

    // reset error and set isAuthenticating to true
    textError.style.display = 'none'
    isAuthenticating = true
    authBtn.innerText = 'Authenticating...'

    try {
        if (isRegistration) {
            await apiRequest('auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: emailVal, password: passVal })
            })
        } else {
            await apiRequest('auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: emailVal, password: passVal })
            })
        }

        authBtn.innerText = 'Loading...'
        await showDashboard()

    } catch (err) {
        textError.innerText = err instanceof Error ? err.message : 'Failed to authenticate'
        textError.style.display = 'block'
    } finally {
        authBtn.innerText = 'Submit'
        isAuthenticating = false
    }


}

async function logout() {
    try {
        await apiRequest('auth/logout', {
            method: 'POST'
        })
    } catch {
        // Reset UI state even if logout request fails.
    } finally {
        todos = []
        selectedTab = 'All'
        showAuthView()
    }
}

// CRUD LOGIC

async function fetchTodos() {
    isLoading = true
    try {
        todos = await apiRequest('todos')
        textError.style.display = 'none'
        renderTodos()
    } catch (err) {
        if (isUnauthorizedError(err)) {
            showAuthView()
            return
        }

        showInlineError(err instanceof Error ? err.message : 'Failed to fetch todos')
    } finally {
        isLoading = false
    }
}

async function updateTodo(index) {
    try {
        await apiRequest('todos' + '/' + index, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ task: todos.find(val => val.id === index).task, completed: 1 })
        })
        await fetchTodos()
    } catch (err) {
        if (isUnauthorizedError(err)) {
            showAuthView()
            return
        }

        showInlineError(err instanceof Error ? err.message : 'Failed to update todo')
    }
}

async function deleteTodo(index) {
    try {
        await apiRequest('todos' + '/' + index, {
            method: 'DELETE'
        })
        await fetchTodos()
    } catch (err) {
        if (isUnauthorizedError(err)) {
            showAuthView()
            return
        }

        showInlineError(err instanceof Error ? err.message : 'Failed to delete todo')
    }
}

async function addTodo() {
    // have to access this val later as it's rendered with js
    const todoInput = document.getElementById('todoInput')
    const task = todoInput.value

    if (!task) { return }

    try {
        await apiRequest('todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ task })
        })
        todoInput.value = ''
        await fetchTodos()
    } catch (err) {
        if (isUnauthorizedError(err)) {
            showAuthView()
            return
        }

        showInlineError(err instanceof Error ? err.message : 'Failed to add todo')
    }
}

// UTILITY FUNCTIONS


async function initializeApp() {
    try {
        await showDashboard()
    } catch (err) {
        if (isUnauthorizedError(err)) {
            showAuthView()
            return
        }

        showAuthView()
        showInlineError(err instanceof Error ? err.message : 'Failed to initialize app')
    }
}

initializeApp()
