import { Todo } from "./todo"
import { Tab } from "./SidebarTabs"

let items = []
let tabs = []
let editingItem = null // Track the item being edited

const STORAGE_KEY = 'todo-app:v1';

function displayContent() {
    const add = document.querySelector('.add')
    const addPic = document.querySelector('.add-pic')

    const itemDialog = document.querySelector('.item-dialog')
    const tabDialog = document.querySelector('.tab-dialog')

    // Open the dialog
    addPic.addEventListener('click', () => itemDialog.showModal())
    add.addEventListener('click', () => tabDialog.showModal())

    // Close dialog
    const close = document.querySelector('.close')
    const close2 = document.querySelector('.two')

    // Variables to handle forms to add elements
    const itemForm = document.querySelector('.item-form')
    const tabForm = document.querySelector('.tab-form')
    const title = document.querySelector('.i-title')
    const desc = document.querySelector('.i-desc')
    const date = document.querySelector('.i-date')
    const priority = document.querySelector('.prio-drop')
    const location = document.querySelector('.drop-down')

    close.addEventListener('click', () => { itemForm.reset(); itemDialog.close() })
    close2.addEventListener('click', () => { tabForm.reset(); tabDialog.close() })

    // --------------- Items --------------------
    const cards = document.querySelector('.cards');
    const projList = document.querySelector('.projects-list')

    // ------- Persistence helpers -------
    function save() {
        const data = {
            tabs: tabs.map(t => ({ id: t.id, name: t.name })),
            items: items.map(i => ({
                id: i.id,
                title: i.title,
                description: i.description,
                dueDate: i.dueDate,
                priority: i.priority,
                group: i.group
            })),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function addDropdownOption(tabName, id) {
        const option = document.createElement('option')
        option.value = id
        option.textContent = tabName
        option.dataset.tabId = id
        location.appendChild(option)
    }
    function removeDropdownOption(id) {
        const option = location.querySelector(`option[data-tab-id="${id}"]`)
        if (option) option.remove()
    }

    function attachCardHandlers(el, id) {
        // Delete
        const delBtn = el.querySelector('.del');
        if (delBtn) {
            delBtn.addEventListener('click', () => {
                const idx = items.findIndex(it => it.id === id);
                if (idx !== -1) items.splice(idx, 1);
                el.remove();
                save();
            });
        }
        // Edit
        const editBtn = el.querySelector('.edit');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                const rec = items.find(it => it.id === id);
                if (!rec) return;
                title.value = rec.title;
                desc.value = rec.description;
                date.value = rec.dueDate;
                priority.value = rec.priority;
                location.value = rec.group || 'home';
                editingItem = rec;
                itemDialog.showModal();
            });
        }
    }

    function applyPriorityStyles(cardEl, val) {
        const prioBox = cardEl.querySelector('.priority');
        const itemBox = cardEl;
        if (!prioBox) return;
        // reset
        prioBox.style.backgroundColor = '';
        prioBox.style.color = '';
        itemBox.style.borderLeft = '';
        itemBox.style.borderRight = '';
        // apply
        if (val === 'Can Wait') {
            prioBox.style.backgroundColor = 'yellow';
            prioBox.style.color = 'rgb(53, 53, 19)';
            itemBox.style.borderLeft = '5px solid yellow';
            itemBox.style.borderRight = '5px solid yellow';
        } else if (val === 'Unimportant') {
            prioBox.style.backgroundColor = 'lightgreen';
            prioBox.style.color = 'rgb(13, 63, 13)';
            itemBox.style.borderLeft = '5px solid lightgreen';
            itemBox.style.borderRight = '5px solid lightgreen';
        }
    }

    // Add a "Home" tab at the start (id = 'home')
    function addHomeTabOnce() {
        if (projList.querySelector('[data-tab-id="home"]')) return;
        const homeTab = document.createElement('div')
        homeTab.classList.add('tab', 'active', 'list')
        homeTab.textContent = 'Home'
        homeTab.dataset.tabId = 'home'
        projList.prepend(homeTab)
        homeTab.addEventListener('click', () => setActiveTab('home'))
        if (!location.querySelector('option[value="home"]')) {
            const homeOption = document.createElement('option')
            homeOption.value = 'home'
            homeOption.textContent = 'Home'
            homeOption.dataset.tabId = 'home'
            location.prepend(homeOption)
        }
    }
    addHomeTabOnce()

    // Helper to show/hide todos based on tab
    function setActiveTab(tabId) {
        projList.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'))
        const activeTab = projList.querySelector(`.tab[data-tab-id="${tabId}"]`)
        if (activeTab) activeTab.classList.add('active')
        items.forEach(item => {
            if (tabId === 'home' || item.group === tabId) {
                item.el.style.display = ''
            } else {
                item.el.style.display = 'none'
            }
        })
    }

    // ------- Hydrate from localStorage -------
    function hydrate() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) { setActiveTab('home'); return; }
        let data;
        try { data = JSON.parse(raw); } catch { return; }

        // tabs
        if (Array.isArray(data.tabs)) {
            data.tabs.forEach(t => {
                const el = new Tab(t.name).createTab()
                el.classList.add('tab')
                el.dataset.tabId = t.id || crypto.randomUUID()
                const tabId = el.dataset.tabId

                el.addEventListener('click', () => setActiveTab(tabId))

                const delBtn = el.querySelector('.delList')
                if (delBtn) {
                    delBtn.addEventListener('click', () => {
                        const idx = tabs.findIndex(it => it.id === tabId);
                        if (idx !== -1) tabs.splice(idx, 1);
                        el.remove();
                        removeDropdownOption(tabId)
                        save();
                        setActiveTab('home')
                    })
                }

                projList.appendChild(el)
                tabs.push({ id: tabId, name: t.name })
                addDropdownOption(t.name, tabId)
            })
        }

        // items
        if (Array.isArray(data.items)) {
            data.items.forEach(rec => {
                const card = new Todo(
                    rec.title,
                    rec.description,
                    rec.dueDate,
                    rec.priority,
                    rec.id,
                    rec.group
                ).newTodo()

                // fix “Due:” formatting + empty dates
                const dateBox = card.querySelector('.due-date')
                if (dateBox) {
                    if (!rec.dueDate) dateBox.textContent = 'No due date'
                    else dateBox.textContent = `Due:\n${rec.dueDate}`
                }
                applyPriorityStyles(card, rec.priority)
                attachCardHandlers(card, rec.id)
                cards.appendChild(card)

                items.push({
                    id: rec.id,
                    el: card,
                    title: rec.title,
                    description: rec.description,
                    dueDate: rec.dueDate,
                    priority: rec.priority,
                    group: rec.group
                })
            })
        }
        setActiveTab('home')
    }

    //Add item (create or update)
    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const vals = {
            title: title.value,
            description: desc.value,
            dueDate: date.value,
            priority: priority.value,
            group: location.value || 'home'
        }

        if (editingItem) {
            // Update existing
            Object.assign(editingItem, vals)
            const el = editingItem.el
            el.querySelector('.card-title').textContent = vals.title
            el.querySelector('.desc').textContent = vals.description
            el.querySelector('.due-date').textContent = vals.dueDate ? `Due:\n${vals.dueDate}` : 'No due date'
            el.querySelector('.priority').textContent = `Priority: ${vals.priority}`
            el.dataset.group = vals.group
            applyPriorityStyles(el, vals.priority)
            editingItem = null
            save()
            itemDialog.close()
            itemForm.reset()
            setActiveTab('home')
            return
        }

        // Create new
        const id = crypto.randomUUID();
        let el;
        try {
            el = new Todo(vals.title, vals.description, vals.dueDate, vals.priority, id, vals.group).newTodo();
        } catch (err) {
            console.error('newTodo() failed:', err);
            return;
        }
        if (!el) return;

        const dateBox = el.querySelector('.due-date')
        if (dateBox && !vals.dueDate) dateBox.textContent = 'No due date'
        applyPriorityStyles(el, vals.priority)
        attachCardHandlers(el, id)

        cards.appendChild(el);
        items.push({ id, el, ...vals })
        save()

        setActiveTab('home')
        itemDialog.close()
        itemForm.reset()
    });

    // ---------- Tabs -------------------
    const tabName = document.querySelector('.tab-name')

    tabForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const el = new Tab(tabName.value).createTab()
        el.classList.add('tab')
        el.dataset.tabId = crypto.randomUUID()
        const tabId = el.dataset.tabId

        el.addEventListener('click', () => setActiveTab(tabId))

        const delBtn = el.querySelector('.delList')
        if (delBtn) {
            delBtn.addEventListener('click', () => {
                const idx = tabs.findIndex(it => it.id === tabId);
                if (idx !== -1) tabs.splice(idx, 1);
                el.remove();
                removeDropdownOption(tabId)
                save()
                setActiveTab('home')
            })
        }

        document.querySelector('.projects-list').appendChild(el)
        tabs.push({ id: tabId, name: tabName.value })
        addDropdownOption(tabName.value, tabId)
        save()

        tabDialog.close()
        tabForm.reset()
    })

    // First load from localStorage
    hydrate()
}

export default displayContent
export { items }
