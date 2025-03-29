class ActionListBuilder {
    private actionList: ActionList;

    constructor() {
        this.actionList = [];
    }

    add(action: IAction): ActionListBuilder {
        this.actionList.push(action);
        return this;
    }

    build(): ActionList {
        return this.actionList;
    }
}