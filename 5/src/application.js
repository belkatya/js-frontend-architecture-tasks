import uniqueId from 'lodash/uniqueId.js';

// BEGIN
export default () => {
    const listContainer = document.querySelector('[data-container="lists"]');
    const tasksContainer = document.querySelector('[data-container="tasks"]');
    const newListForm = document.querySelector('[data-container="new-list-form"]');
    const newTaskForm = document.querySelector('[data-container="new-task-form"]');
    
    const ul = document.createElement('ul');
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = 'General';
    li.appendChild(b);
    ul.appendChild(li);
    listContainer.appendChild(ul);

    const listsContainer = document.querySelector('[data-container="lists"] ul');
    const state = {
        activeListId: 'general',
        lists: {
            general: { id: 'general', title: 'General', taskIds: [] },
        },
            tasks: {},
    };
    const renderLists = () => {
        listsContainer.innerHTML = '';
        Object.values(state.lists).forEach((list) => {
            const li = document.createElement('li');
            if (list.id === state.activeListId) {
                const b = document.createElement('b');
                b.textContent = list.title;
                li.appendChild(b);
            } else {
                const a = document.createElement('a');
                a.href = `#${list.id}`;
                a.textContent = list.title;
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    state.activeListId = list.id;
                    renderLists();
                    renderTasks();
                });
                li.appendChild(a);
            }
            listsContainer.appendChild(li);
        });
    };
    const renderTasks = () => {
        tasksContainer.innerHTML = '';
        const ul = document.createElement('ul');
        const activeList = state.lists[state.activeListId];
        if (activeList && activeList.taskIds) {
            activeList.taskIds.forEach((taskId) => {
                const task = state.tasks[taskId];
                if (task) {
                    const li = document.createElement('li');
                    li.textContent = task.title;
                    ul.appendChild(li);
                }
            });
            if (ul.children.length > 0)
                {tasksContainer.appendChild(ul);}
        }
    };
    newListForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = newListForm.querySelector('#new-list-name').value.trim();
        if (title && !Object.values(state.lists).some(list => list.title === title)) {
            const id = title.toLowerCase();
            state.lists[id] = { id: id, title: title, taskIds: [] };
            renderLists();
            newListForm.reset();
        }
    });
    newTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = newTaskForm.querySelector('#new-task-name').value.trim();
        if (title) {
            const taskId = uniqueId('task_');
            state.tasks[taskId] = { id: taskId, title: title };
            state.lists[state.activeListId].taskIds.push(taskId);
            renderTasks();
            newTaskForm.reset();
        }
    });
}
// END
