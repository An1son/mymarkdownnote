// 生产力工具应用 - 主JavaScript文件
// 包含：待办清单 + 番茄钟 + Markdown笔记

// ==================== Storage 模块 ====================
const Storage = {
    // 检查localStorage是否可用
    isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage不可用，将使用内存存储');
            return false;
        }
    },

    // 内存存储降级方案
    memoryStorage: {},

    // 保存数据
    save(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            if (this.isAvailable()) {
                localStorage.setItem(key, jsonData);
            } else {
                this.memoryStorage[key] = jsonData;
            }
            return true;
        } catch (e) {
            console.error('保存数据失败:', e);
            return false;
        }
    },

    // 加载数据
    load(key, defaultValue = null) {
        try {
            let jsonData;
            if (this.isAvailable()) {
                jsonData = localStorage.getItem(key);
            } else {
                jsonData = this.memoryStorage[key];
            }
            
            if (jsonData === null || jsonData === undefined) {
                return defaultValue;
            }
            
            return JSON.parse(jsonData);
        } catch (e) {
            console.error('加载数据失败:', e);
            return defaultValue;
        }
    }
};

// ==================== 工具函数 ====================
const Utils = {
    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    },

    // 转义HTML防止XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ==================== TodoList 模块 ====================
class TodoList {
    constructor() {
        this.todos = [];
        this.elements = {
            input: document.getElementById('todo-input'),
            list: document.getElementById('todo-list'),
            count: document.getElementById('todo-count')
        };
        this.init();
    }

    // 初始化待办清单
    init() {
        this.loadTodos();
        this.setupEventListeners();
        this.render();
        console.log('TodoList模块初始化完成');
    }

    // 设置事件监听器
    setupEventListeners() {
        // 输入框回车事件
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        // 使用事件委托处理列表项的点击事件
        this.elements.list.addEventListener('click', (e) => {
            const todoItem = e.target.closest('.todo-item');
            if (!todoItem) return;

            const todoId = todoItem.dataset.id;

            if (e.target.classList.contains('todo-checkbox')) {
                this.toggleTodo(todoId);
            } else if (e.target.classList.contains('todo-delete')) {
                this.deleteTodo(todoId);
            }
        });
    }

    // 添加新任务
    addTodo() {
        const text = this.elements.input.value.trim();
        
        if (!text) {
            alert('请输入任务内容');
            return;
        }

        // 创建待办事项的数据结构
        const todo = {
            id: Utils.generateId(),
            text: text,
            completed: false,
            createdAt: Date.now()
        };

        this.todos.unshift(todo); // 新任务添加到顶部
        this.elements.input.value = '';
        this.saveTodos();
        this.render();

        console.log('添加新任务:', todo);
    }

    // 切换任务完成状态
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            console.log('切换任务状态:', id, todo.completed);
        }
    }

    // 删除任务
    deleteTodo(id) {
        const index = this.todos.findIndex(t => t.id === id);
        if (index !== -1) {
            const deletedTodo = this.todos.splice(index, 1)[0];
            this.saveTodos();
            this.render();
            console.log('删除任务:', deletedTodo);
        }
    }

    // 渲染待办清单（优化版本，减少DOM操作）
    render() {
        // 使用DocumentFragment减少DOM操作
        const fragment = document.createDocumentFragment();

        // 如果没有任务，显示空状态
        if (this.todos.length === 0) {
            const emptyElement = this.createEmptyState();
            fragment.appendChild(emptyElement);
        } else {
            // 批量创建所有任务元素
            this.todos.forEach(todo => {
                const todoElement = this.createTodoItem(todo);
                fragment.appendChild(todoElement);
            });
        }

        // 一次性更新DOM
        this.elements.list.innerHTML = '';
        this.elements.list.appendChild(fragment);

        // 更新统计信息
        this.updateStats();
    }

    // 创建单个任务项元素（优化版本）
    createTodoItem(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        // 创建复选框
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;

        // 创建文本元素
        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.textContent = todo.text;

        // 创建删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'todo-delete';
        deleteBtn.textContent = '删除';

        // 组装元素
        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(deleteBtn);

        return li;
    }

    // 创建空状态元素（优化版本）
    createEmptyState() {
        const li = document.createElement('li');
        li.className = 'todo-empty';
        
        const container = document.createElement('div');
        container.style.cssText = 'text-align: center; padding: 40px 20px; color: #999;';
        
        const icon = document.createElement('div');
        icon.style.cssText = 'font-size: 48px; margin-bottom: 16px;';
        icon.textContent = '📝';
        
        const title = document.createElement('p');
        title.textContent = '还没有任务';
        
        const subtitle = document.createElement('p');
        subtitle.style.cssText = 'font-size: 14px; margin-top: 8px;';
        subtitle.textContent = '在上方输入框中添加你的第一个任务吧！';
        
        container.appendChild(icon);
        container.appendChild(title);
        container.appendChild(subtitle);
        li.appendChild(container);
        
        return li;
    }

    // 更新统计信息
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;

        let statsText = '';
        if (total === 0) {
            statsText = '0 个任务';
        } else {
            statsText = `${total} 个任务`;
            if (completed > 0) {
                statsText += ` (${completed} 已完成)`;
            }
        }

        this.elements.count.textContent = statsText;
    }

    // 保存待办事项到localStorage
    saveTodos() {
        Storage.save('todos', this.todos);
    }

    // 从localStorage加载待办事项
    loadTodos() {
        const savedTodos = Storage.load('todos', []);
        if (Array.isArray(savedTodos)) {
            this.todos = savedTodos;
            console.log(`加载了${this.todos.length}个待办事项`);
        } else {
            this.todos = [];
        }
    }
}

// ==================== PomodoroTimer 模块 ====================
class PomodoroTimer {
    constructor() {
        // 计时器状态
        this.isRunning = false;
        this.currentMode = 'work'; // 'work' | 'break'
        this.timeLeft = 1500; // 25分钟 = 1500秒
        this.intervalId = null;
        
        // 时长配置（秒）
        this.workDuration = 1500; // 25分钟
        this.breakDuration = 300;  // 5分钟
        
        // 统计数据
        this.completedSessions = 0;
        
        // DOM元素
        this.elements = {
            timeDisplay: document.getElementById('timer-time'),
            modeDisplay: document.getElementById('timer-mode'),
            startBtn: document.getElementById('timer-start'),
            pauseBtn: document.getElementById('timer-pause'),
            resetBtn: document.getElementById('timer-reset'),
            sessionsCount: document.getElementById('completed-sessions')
        };
        
        this.init();
    }
    
    // 初始化番茄钟
    init() {
        this.loadStats();
        this.setupEventListeners();
        this.updateDisplay();
        console.log('PomodoroTimer模块初始化完成');
    }
    
    // 设置事件监听器
    setupEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.pauseBtn.addEventListener('click', () => this.pause());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
    }
    
    // 开始计时
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateButtonStates();
        
        // 每秒更新一次
        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);
        
        console.log(`开始${this.currentMode === 'work' ? '工作' : '休息'}计时`);
    }
    
    // 暂停计时
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.updateButtonStates();
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        console.log('计时器已暂停');
    }
    
    // 重置计时器
    reset() {
        this.pause();
        this.currentMode = 'work';
        this.timeLeft = this.workDuration;
        this.updateDisplay();
        this.updateButtonStates();
        
        console.log('计时器已重置');
    }
    
    // 计时器每秒执行
    tick() {
        this.timeLeft--;
        this.updateDisplay();
        
        // 时间到了
        if (this.timeLeft <= 0) {
            this.onTimerComplete();
        }
    }
    
    // 计时完成处理
    onTimerComplete() {
        this.pause();
        
        if (this.currentMode === 'work') {
            // 工作时间结束，切换到休息
            this.completedSessions++;
            this.saveStats();
            this.switchMode('break');
            console.log('工作时间结束，切换到休息时间');
        } else {
            // 休息时间结束，切换到工作
            this.switchMode('work');
            console.log('休息时间结束，准备下一个工作周期');
        }
        
        // 播放提示音
        this.playNotification();
        
        // 更新显示
        this.updateDisplay();
        this.updateButtonStates();
    }
    
    // 切换模式
    switchMode(mode) {
        this.currentMode = mode;
        this.timeLeft = mode === 'work' ? this.workDuration : this.breakDuration;
    }
    
    // 播放提示音
    playNotification() {
        // 使用Web Audio API生成简单的提示音
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContextClass();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // 设置音频参数
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';
            
            // 音量渐变
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
            
            // 播放0.5秒
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            
            console.log('播放提示音');
        } catch (e) {
            console.warn('无法播放提示音:', e);
            // 降级方案：使用系统提示音
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(200);
            }
        }
    }
    
    // 更新显示（优化版本，避免不必要的DOM更新）
    updateDisplay() {
        // 更新时间显示
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // 只在时间变化时更新DOM
        if (this.elements.timeDisplay.textContent !== timeString) {
            this.elements.timeDisplay.textContent = timeString;
        }
        
        // 更新模式显示
        const modeText = this.currentMode === 'work' ? '工作时间' : '休息时间';
        if (this.elements.modeDisplay.textContent !== modeText) {
            this.elements.modeDisplay.textContent = modeText;
        }
        
        // 更新统计显示
        const sessionsText = this.completedSessions.toString();
        if (this.elements.sessionsCount.textContent !== sessionsText) {
            this.elements.sessionsCount.textContent = sessionsText;
        }
        
        // 更新页面标题（仅在运行时更新）
        if (this.isRunning) {
            const newTitle = `${timeString} - ${modeText} - 生产力工具`;
            if (document.title !== newTitle) {
                document.title = newTitle;
            }
        }
    }
    
    // 更新按钮状态
    updateButtonStates() {
        this.elements.startBtn.disabled = this.isRunning;
        this.elements.pauseBtn.disabled = !this.isRunning;
        this.elements.resetBtn.disabled = false;
        
        // 更新按钮文本
        if (this.isRunning) {
            this.elements.startBtn.textContent = '运行中';
        } else {
            this.elements.startBtn.textContent = '开始';
        }
    }
    
    // 保存统计数据
    saveStats() {
        const stats = {
            completedSessions: this.completedSessions,
            totalWorkTime: this.completedSessions * this.workDuration
        };
        Storage.save('pomodoroStats', stats);
    }
    
    // 加载统计数据
    loadStats() {
        const stats = Storage.load('pomodoroStats', {
            completedSessions: 0,
            totalWorkTime: 0
        });
        this.completedSessions = stats.completedSessions || 0;
        console.log(`加载番茄钟统计: ${this.completedSessions} 个已完成会话`);
    }
    
    // 格式化时间（用于调试）
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// ==================== MarkdownNotes 模块 ====================
class MarkdownNotes {
    constructor() {
        this.elements = {
            input: document.getElementById('markdown-input'),
            preview: document.getElementById('markdown-preview')
        };
        this.debounceTimer = null;
        this.init();
    }

    // 初始化Markdown笔记
    init() {
        this.loadNotes();
        this.setupEventListeners();
        this.updatePreview();
        console.log('MarkdownNotes模块初始化完成');
    }

    // 设置事件监听器
    setupEventListeners() {
        // 使用防抖处理实时预览更新
        this.elements.input.addEventListener('input', () => {
            this.debouncedUpdate();
        });

        // 自动保存
        this.elements.input.addEventListener('blur', () => {
            this.saveNotes();
        });
    }

    // 防抖更新预览
    debouncedUpdate() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        this.debounceTimer = setTimeout(() => {
            this.updatePreview();
            this.saveNotes();
        }, 300); // 300ms防抖延迟
    }

    // 更新预览内容
    updatePreview() {
        const markdown = this.elements.input.value;
        
        if (!markdown.trim()) {
            this.elements.preview.innerHTML = '<p class="preview-placeholder">Markdown预览将在这里显示...</p>';
            return;
        }

        const html = this.parseMarkdown(markdown);
        this.elements.preview.innerHTML = html;
    }

    // 解析Markdown语法（重写版本）
    parseMarkdown(text) {
        if (!text.trim()) {
            return '<p class="preview-placeholder">Markdown预览将在这里显示...</p>';
        }

        // 转义HTML防止XSS
        let html = Utils.escapeHtml(text);

        // 标题
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

        // 粗体和斜体
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // 删除线
        html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

        // 行内代码
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // 链接
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

        // 逐行处理列表和段落
        const lines = html.split('\n');
        const result = [];
        let inUL = false;
        let inOL = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (!line) {
                // 空行关闭列表
                if (inUL) {
                    result.push('</ul>');
                    inUL = false;
                }
                if (inOL) {
                    result.push('</ol>');
                    inOL = false;
                }
                continue;
            }

            // 无序列表
            if (line.match(/^- (.+)/)) {
                if (inOL) {
                    result.push('</ol>');
                    inOL = false;
                }
                if (!inUL) {
                    result.push('<ul>');
                    inUL = true;
                }
                result.push('<li>' + line.substring(2) + '</li>');
            }
            // 有序列表
            else if (line.match(/^\d+\. (.+)/)) {
                if (inUL) {
                    result.push('</ul>');
                    inUL = false;
                }
                if (!inOL) {
                    result.push('<ol>');
                    inOL = true;
                }
                result.push('<li>' + line.replace(/^\d+\. /, '') + '</li>');
            }
            // 标题（已经处理过的HTML标签）
            else if (line.startsWith('<h')) {
                if (inUL) {
                    result.push('</ul>');
                    inUL = false;
                }
                if (inOL) {
                    result.push('</ol>');
                    inOL = false;
                }
                result.push(line);
            }
            // 普通段落
            else {
                if (inUL) {
                    result.push('</ul>');
                    inUL = false;
                }
                if (inOL) {
                    result.push('</ol>');
                    inOL = false;
                }
                result.push('<p>' + line + '</p>');
            }
        }

        // 关闭未关闭的列表
        if (inUL) result.push('</ul>');
        if (inOL) result.push('</ol>');

        return result.join('\n');
    }

    // 保存笔记到localStorage
    saveNotes() {
        const content = this.elements.input.value;
        Storage.save('notes', content);
    }

    // 从localStorage加载笔记
    loadNotes() {
        const savedNotes = Storage.load('notes', '');
        this.elements.input.value = savedNotes;
        console.log('加载了Markdown笔记内容');
    }
}

// ==================== 认证模块 ====================
const Auth = {
    sessionKey: 'productivity_tools_session',
    
    // 检查登录状态
    isLoggedIn() {
        const session = localStorage.getItem(this.sessionKey);
        if (!session) return false;
        
        try {
            const sessionData = JSON.parse(session);
            const now = new Date().getTime();
            
            // 检查会话是否过期
            if (sessionData.expires > now) {
                return true;
            } else {
                // 会话过期，清除
                this.logout();
                return false;
            }
        } catch (e) {
            this.logout();
            return false;
        }
    },
    
    // 获取当前用户
    getCurrentUser() {
        const session = localStorage.getItem(this.sessionKey);
        if (!session) return null;
        
        try {
            const sessionData = JSON.parse(session);
            return sessionData.username;
        } catch (e) {
            return null;
        }
    },
    
    // 登出
    logout() {
        console.log('执行登出操作...');
        localStorage.removeItem(this.sessionKey);
        console.log('会话数据已清除');
        console.log('准备跳转到登录页面');
        window.location.href = 'login.html';
    },
    
    // 检查并重定向
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
};

// ==================== 应用初始化 ====================
let todoList;
let pomodoroTimer;
let markdownNotes;

// 页面加载完成后初始化所有模块
document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态
    if (!Auth.requireAuth()) {
        return; // 未登录，已重定向
    }
    
    // 显示欢迎信息
    const currentUser = Auth.getCurrentUser();
    if (currentUser) {
        console.log(`欢迎回来，${currentUser}！`);
        
        // 更新页面标题显示用户名
        document.title = `生产力工具 - ${currentUser}的工作空间`;
    }
    
    // 设置用户信息显示
    setupUserInterface();
    
    // 初始化应用模块
    todoList = new TodoList();
    pomodoroTimer = new PomodoroTimer();
    markdownNotes = new MarkdownNotes();
    console.log('应用初始化完成');
});

// 设置用户界面
function setupUserInterface() {
    console.log('开始设置用户界面...');
    const currentUser = Auth.getCurrentUser();
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');
    
    console.log('当前用户:', currentUser);
    console.log('用户名显示元素:', usernameDisplay);
    console.log('登出按钮元素:', logoutBtn);
    
    // 显示用户名
    if (usernameDisplay && currentUser) {
        usernameDisplay.textContent = currentUser;
        console.log('用户名已设置为:', currentUser);
    }
    
    // 设置登出按钮事件
    if (logoutBtn) {
        console.log('登出按钮找到，正在设置事件监听器');
        logoutBtn.addEventListener('click', (e) => {
            console.log('登出按钮被点击');
            e.preventDefault();
            if (confirm('确定要登出吗？')) {
                console.log('用户确认登出，执行登出操作');
                Auth.logout();
            } else {
                console.log('用户取消登出');
            }
        });
    } else {
        console.error('未找到登出按钮元素');
    }
    
    // 设置侧边栏功能
    setupSidebar();
}

// 设置侧边栏功能
function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mainContent = document.getElementById('mainContent');
    
    if (!sidebar || !sidebarToggle || !mainContent) {
        console.error('侧边栏元素未找到');
        return;
    }
    
    // 切换侧边栏状态
    function toggleSidebar() {
        const isExpanded = sidebar.classList.contains('expanded');
        
        if (isExpanded) {
            sidebar.classList.remove('expanded');
            mainContent.classList.remove('sidebar-expanded');
            localStorage.setItem('sidebar_expanded', 'false');
        } else {
            sidebar.classList.add('expanded');
            mainContent.classList.add('sidebar-expanded');
            localStorage.setItem('sidebar_expanded', 'true');
        }
    }
    
    // 侧边栏切换按钮事件
    sidebarToggle.addEventListener('click', toggleSidebar);
    
    // 点击主内容区域时收缩侧边栏（可选）
    mainContent.addEventListener('click', () => {
        if (sidebar.classList.contains('expanded')) {
            sidebar.classList.remove('expanded');
            mainContent.classList.remove('sidebar-expanded');
            localStorage.setItem('sidebar_expanded', 'false');
        }
    });
    
    // 恢复侧边栏状态
    const savedState = localStorage.getItem('sidebar_expanded');
    if (savedState === 'true') {
        sidebar.classList.add('expanded');
        mainContent.classList.add('sidebar-expanded');
    }
    
    // 导航项点击事件
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止触发主内容区域的点击事件
            
            // 移除所有活动状态
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // 添加当前活动状态
            item.classList.add('active');
            
            // 滚动到对应区域（可选功能）
            const sections = document.querySelectorAll('.todo-section, .pomodoro-section, .notes-section');
            if (sections[index]) {
                sections[index].scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    console.log('侧边栏功能已设置完成');
}

// 全局登出函数（备用方案）
window.forceLogout = function() {
    console.log('执行强制登出...');
    localStorage.removeItem('productivity_tools_session');
    window.location.href = 'login.html';
};

// 导出到全局作用域（用于调试）
window.TodoListApp = {
    todoList: () => todoList,
    pomodoroTimer: () => pomodoroTimer,
    markdownNotes: () => markdownNotes,
    Auth,
    Storage,
    Utils
};