import { ActionList, IAction } from "../TypeDefinitions";

export default class ActionListBuilder {
    private actionList: ActionList;

    constructor(private defaultDelay: number = 40) {
        this.actionList = [];
    }

    add(action: IAction, delay: number = this.defaultDelay): ActionListBuilder {
        action.delay = delay;
        this.actionList.push(action);
        return this;
    }

    build(): ActionList {
        return this.actionList;
    }
}