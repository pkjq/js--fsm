import { FSM } from '../fsm';

import assert from 'assert';
import sinon from 'sinon';


describe('FSM', function () {
    describe('incorrect config', function () {
        it('without baseState', function () {
            const fsmConfig = {
                states: {
                    state_1: {},
                    state_2: {},                
                },
                transitions: {
                    tr1: {
                        from: 'state_1',
                        to: 'state_2',
                    },
                    tr2: {
                        from: 'state_2',
                        to: 'state_1',
                    },
                },
            };

            assert.throws(() => new FSM(fsmConfig)); // no bseState
        });

        it('with incorrect baseState', function () {
            const fsmConfig = {
                baseState: 'state_0',

                states: {
                    state_1: {},
                    state_2: {},                
                },
                transitions: {
                    tr1: {
                        from: 'state_1',
                        to: 'state_2',
                    },
                    tr2: {
                        from: 'state_2',
                        to: 'state_1',
                    },
                },
            };

            assert.throws(() => new FSM(fsmConfig)); // doesn't existing bseState
        });        
    });

    const fsmConfig = {
        baseState: 'standby',

        states: {
            standby: {
                onEnter: () => {},
                onLeave: () => {},
            },
            state1: {
                onEnter: () => {},
                onLeave: () => {},
            },
            state2: {
                onEnter: () => {},
                onLeave: () => {},
            },
            state3: {
                onEnter: () => {},
                onLeave: () => {},
            }
        },
        transitions: {
            tr1: [
                {
                    from: 'standby',
                    to: 'state1',
                    condition: (approve) => { return approve; }
                },
                {
                    from: 'standby',
                    to: 'state2',
                    condition: (not_approve) => { return !not_approve; }
                }
            ],
            tr2: {
                from: 'standby',
                to: 'state3'
            },
            tr3: {
                from: 'state2',
                to: 'standby'
            },
            tr4: {
                from: 'state1',
                to: 'standby'
            },
            tr5: {
                from: 'state3',
                to: 'standby'
            }
        },
    };


    it('simple transition', function () {
        const fsm = new FSM(fsmConfig);

        assert(fsm.on('tr2', false));
        assert.equal(fsm.state, 'state3');
        
        assert(fsm.on('tr5', false));
        assert.equal(fsm.state, 'standby');
    });

    it('reset', function () {
        const fsm = new FSM(fsmConfig);

        assert(fsm.on('tr1', false));
        assert.equal(fsm.state, 'state2');

        fsm.reset();
        assert.equal(fsm.state, 'standby');
    });

    it('no way', function () {
        const fsm = new FSM(fsmConfig);

        assert(!fsm.on('tr5', false));
        assert.equal(fsm.state, 'standby');
    });

    it('additional condition transition', function () {
        const fsm = new FSM(fsmConfig);

        assert(fsm.on('tr1', false));
        assert.equal(fsm.state, 'state2');

        assert(fsm.on('tr3'));
        assert.equal(fsm.state, 'standby');

        assert(fsm.on('tr1', true));
        assert.equal(fsm.state, 'state1');

        assert(fsm.on('tr4'));
        assert.equal(fsm.state, 'standby');
    });

    describe('states callback', function () {
        it('on baseState', function () {
            let state1_leave = sinon.fake();
            let state1_enter = sinon.fake();

            let state2_leave = sinon.fake();
            let state2_enter = sinon.fake();

            const fsmConfig = {
                baseState: 'state_1',

                states: {
                    state_1: {
                        onEnter: () => state1_enter(),
                        onLeave: () => state1_leave(),
                    },
                    state_2: {
                        onEnter: () => state2_enter(),
                        onLeave: () => state2_leave(),
                    },                
                },
                transitions: {
                    tr1: {
                        from: 'state_1',
                        to: 'state_2',
                    },
                    tr2: {
                        from: 'state_2',
                        to: 'state_1',
                    },
                },
            };

            const fsm = new FSM(fsmConfig);

            assert.equal(fsm.state, 'state_1');
            assert(state1_enter.calledOnce);
            assert(state1_leave.notCalled);
            assert(state2_enter.notCalled);
            assert(state2_leave.notCalled);
        });

        it('on reset', function () {
            let state1_leave = sinon.fake();
            let state1_enter = sinon.fake();

            let state2_leave = sinon.fake();
            let state2_enter = sinon.fake();

            const fsmConfig = {
                baseState: 'state_1',

                states: {
                    state_1: {
                        onEnter: () => state1_enter(),
                        onLeave: () => state1_leave(),
                    },
                    state_2: {
                        onEnter: () => state2_enter(),
                        onLeave: () => state2_leave(),
                    },                
                },
                transitions: {
                    tr1: {
                        from: 'state_1',
                        to: 'state_2',
                    },
                    tr2: {
                        from: 'state_2',
                        to: 'state_1',
                    },
                },
            };

            const fsm = new FSM(fsmConfig);

            assert.equal(fsm.state, 'state_1');
            assert(state1_enter.calledOnce);
            assert(state1_leave.notCalled);
            assert(state2_enter.notCalled);
            assert(state2_leave.notCalled);

            assert(fsm.on('tr1'));
            assert.equal(fsm.state, 'state_2');
            assert(state1_enter.calledOnce);
            assert(state1_leave.calledOnce);
            assert(state2_enter.calledOnce);
            assert(state2_leave.notCalled);

            fsm.reset();
            assert.equal(fsm.state, 'state_1');
            assert(state1_enter.calledTwice);
            assert(state1_leave.calledOnce);
            assert(state2_enter.calledOnce);
            assert(state2_leave.calledOnce);

            fsm.reset();
            assert.equal(fsm.state, 'state_1');
            assert(state1_enter.calledTwice);
            assert(state1_leave.calledOnce);
            assert(state2_enter.calledOnce);
            assert(state2_leave.calledOnce);            
        });        
    });

    describe('additional data', function () {
        let additionalData = {
            enter: undefined,
            leave: undefined,
        };

        const fsmConfig = {
            baseState: 'state_1',

            states: {
                state_1: {
                    onEnter: data => additionalData.enter = data,
                    onLeave: data => additionalData.leave = data,
                },
                state_2: {
                    onEnter: data => additionalData.enter = data,
                    onLeave: data => additionalData.leave = data,
                },
            },
            transitions: {
                tr1: {
                    from: 'state_1',
                    to: 'state_2',
                    data: { anyData:'any-additional-data' },
                },
                tr2: {
                    from: 'state_2',
                    to: 'state_1',
                },
            },
        };


        it('base transition', function () {
            const fsm = new FSM(fsmConfig);

            assert.equal(fsm.state, 'state_1');
            assert.equal(additionalData.enter, undefined);
            assert.equal(additionalData.leave, undefined);

            assert(fsm.on('tr1'));
            assert.equal(fsm.state, 'state_2');
            assert.deepEqual(additionalData.enter, { anyData: 'any-additional-data'});
            assert.deepEqual(additionalData.leave, { anyData: 'any-additional-data'});

            assert(fsm.on('tr2'));
            assert.equal(fsm.state, 'state_1');
            assert.equal(additionalData.enter, undefined);
            assert.equal(additionalData.leave, undefined);
        });
        it('reset', function () {
            const fsm = new FSM(fsmConfig);

            assert.equal(fsm.state, 'state_1');
            assert.equal(additionalData.enter, undefined);
            assert.equal(additionalData.leave, undefined);

            assert(fsm.on('tr1'));
            assert.equal(fsm.state, 'state_2');
            assert.deepEqual(additionalData.enter, { anyData: 'any-additional-data'});
            assert.deepEqual(additionalData.leave, { anyData: 'any-additional-data'});

            fsm.reset();
            assert.equal(fsm.state, 'state_1');
            assert.equal(additionalData.enter, undefined);
            assert.equal(additionalData.leave, undefined);
        });
    });
});
