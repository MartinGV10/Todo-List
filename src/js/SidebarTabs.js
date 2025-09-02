import delpic from '../assets/delete.png'
import { Element, Image } from "./DOM"

class Tab {
    constructor(name, listId) {
        this.name = name
        this.listId = listId
    }

    createTab() {
        let el = new Element('div', 'list', this.name).createElement()
        let pic = new Image('img', 'delList', null, delpic).createElement()

        el.appendChild(pic)
        return el
    }
}

export {Tab}