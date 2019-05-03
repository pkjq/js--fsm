import assert from 'assert'


export class FSM {
    private _currentState:string;

    constructor(private config:any) {
        assert(config.baseState, 'baseState must be defined');
        assert(this.config.states[config.baseState] != undefined, 'incorrect baseState');

        this.reset();
    }


    on(action:string, ...args:any[]):boolean {
        let transition = this.config.transitions[action];

        if (!transition)
            return false;

        const checkCondition = (tr:any) => (tr.from === this._currentState) && (!tr.condition || tr.condition(...args));

        if (Array.isArray(transition)) {
            transition = (transition as []).find((tr:any) => checkCondition(tr));
            if (!transition)
                return false;
        }
        else if (!checkCondition(transition))
            return false;

        this._doTransition(transition.to, transition.data);
        return true;
    }

    reset() {
        this._doTransition(this.config.baseState)
    }

    get state():string {
        return this._currentState;
    }


    private _doTransition(to_state:string, data:any = undefined) {
        if (this._currentState === to_state)
            return;

        {
            const currentStateObj = this._getCurrentStateObj();
            if (currentStateObj && currentStateObj.onLeave)
                currentStateObj.onLeave(data);
        }

        this._currentState = to_state;

        {
            const newStateObj = this._getCurrentStateObj();
            if (newStateObj.onEnter)
                newStateObj.onEnter(data);
        }
    }

    private _getCurrentStateObj() {
        return this.config.states[this._currentState];
    }
};
