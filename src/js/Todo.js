import edit from '../assets/edit.png'
import del from '../assets/delete.png'

import { Element, Image } from "./DOM"

class Todo {
    constructor(title, description, dueDate, priority, taskID, group) {
        this.title = title
        this.description = description
        this.dueDate = dueDate
        this.priority = priority
        this.taskID = taskID
        this.group = group
    }

    newTodo() {
        const cards = document.querySelector('.cards')

        let todoElm = new Element('div', 'todo-elm', null).createElement()
            let todoTop = new Element('div', 'todo-top', null).createElement()
                let cardTitle = new Element('h3', 'card-title', this.title).createElement()
                let todoImages = new Element('div', 'todo-images', null).createElement()
                    let editPic = new Image('img', 'edit', null, edit).createElement()
                    // editPic.src = edit // Ensure src is set
                    let delPic = new Image('img', 'del', null, del).createElement()
                    // delPic.src = del // Ensure src is set
            let details = new Element('div', 'details', null).createElement()
                let dTop = new Element('div', 'd-top', null).createElement()
                    let desc = new Element('p', 'desc', this.description).createElement()
                let dBottom = new Element('div', 'd-bottom', null).createElement()
                    let dDate = new Element('p', 'due-date', `Due:\n${this.dueDate}`).createElement()
                    let prio = new Element('p', 'priority', `Priority: ${this.priority}`).createElement()

        todoElm.dataset.id = this.taskID
        delPic.dataset.id = this.taskID
        editPic.dataset.id = this.taskID

        todoElm.appendChild(todoTop)
        todoTop.appendChild(cardTitle)
        todoTop.appendChild(todoImages)
        todoImages.appendChild(editPic)
        todoImages.appendChild(delPic)

        todoElm.appendChild(details)
        details.appendChild(dTop)
        dTop.appendChild(desc)
        details.appendChild(dBottom)
        dBottom.appendChild(dDate)
        dBottom.appendChild(prio)

        return todoElm
    }


}

export {Todo}