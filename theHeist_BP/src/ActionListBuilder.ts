class ActionListBuilder {
    private actionList: ActionList;

    constructor() {
        this.actionList = [];
    }

    add(action: IAction, delay: number = 40): ActionListBuilder {
        action.delay = delay;
        this.actionList.push(action);
        return this;
    }

    build(): ActionList {
        return this.actionList;
    }
}